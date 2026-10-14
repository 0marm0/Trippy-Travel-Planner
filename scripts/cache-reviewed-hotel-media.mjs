#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import https from 'node:https';
import sharp from 'sharp';
import { mediaReferences, inventoryDigest, safeSourceUrl, safePublicText, imagePrivacyFacts, sha256, containedPath } from './media-tools.mjs';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_HOSTS = new Set(['img.fih.io', 'imgcy.trivago.com', 'images.trvl-media.com', 'assets.pclncdn.com', 'entrehotel.pl']);
function publicAddress(address) {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return !([0, 10, 127].includes(a) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 100 && b >= 64 && b <= 127) || a >= 224 || (a === 198 && [18,19,51].includes(b)) || (a === 203 && b === 0));
  }
  // Prefer globally routed IPv4 for this bounded download job; no mapped IPv6 bypass.
  return false;
}
function safeDestination(value) {
  if (!safeSourceUrl(value)) throw new Error('unsafe_destination');
  try { if (!safePublicText(decodeURIComponent(value))) throw new Error('unsafe_destination'); }
  catch { throw new Error('unsafe_destination'); }
  const url = new URL(value);
  if (!ALLOWED_HOSTS.has(url.hostname) || (url.port && url.port !== '443')) throw new Error('unsupported_host');
  return url;
}
async function fetchImage(value, deadline = Date.now() + 8000, redirects = 0) {
  const url = safeDestination(value);
  if (redirects > 3 || deadline <= Date.now()) throw new Error('timeout_or_redirect');
  const addresses = await Promise.race([lookup(url.hostname, { all: true, family: 4 }), new Promise((_, reject) => { const t = setTimeout(() => reject(new Error('timeout')), Math.max(1, deadline - Date.now())); t.unref(); })]);
  if (!addresses.length || addresses.some(({address}) => !publicAddress(address))) throw new Error('unsafe_address');
  return new Promise((resolveFetch, reject) => {
    const request = https.get(url, { lookup: (_host, options, callback) => options.all ? callback(null, [addresses[0]]) : callback(null, addresses[0].address, 4), headers: { Accept: 'image/*', 'User-Agent': 'Trippy-Reviewed-Media-Preparation/1.0' } }, (response) => {
      if ([301,302,303,307,308].includes(response.statusCode)) {
        response.resume();
        if (!response.headers.location) return reject(new Error('redirect'));
        try { resolveFetch(fetchImage(new URL(response.headers.location, url).href, deadline, redirects + 1)); } catch { reject(new Error('redirect')); }
        return;
      }
      if (response.statusCode !== 200) { response.resume(); return reject(new Error('http_status')); }
      if (!/^image\/(jpeg|png|webp|avif)(?:;|$)/i.test(response.headers['content-type'] || '')) { response.resume(); return reject(new Error('not_image')); }
      if (Number(response.headers['content-length'] || 0) > MAX_BYTES) { response.destroy(); return reject(new Error('body_limit')); }
      const chunks = []; let size = 0;
      response.on('data', chunk => { size += chunk.length; if (size > MAX_BYTES) { response.destroy(); reject(new Error('body_limit')); } else chunks.push(chunk); });
      response.on('end', () => resolveFetch(Buffer.concat(chunks)));
      response.on('error', () => reject(new Error('network')));
    });
    const timer = setTimeout(() => { request.destroy(); reject(new Error('timeout')); }, Math.max(1, deadline - Date.now()));
    request.on('close', () => clearTimeout(timer));
    request.on('error', () => reject(new Error('network')));
  });
}
function readRecords(source, name) {
  const match = source.match(new RegExp(`const ${name}: Record<string, HotelProviderMedia> = (\\{[\\s\\S]*?\\n\\});`));
  if (!match) throw new Error('provider_shape');
  return JSON.parse(match[1]);
}
export async function cacheReviewedHotelMedia(root, { completeBlockedPass = false } = {}) {
  // One bounded pass only: reviewing/removing the old cache is a separate action.
  let existingMapping = {};
  try {
    const existingSource = await readFile(resolve(root, 'src/lib/hotel-photo-cache.generated.ts'), 'utf8');
    if (!completeBlockedPass || existingSource.includes('// Completion pass used: true')) throw new Error('cache_already_exists');
    existingMapping = JSON.parse(existingSource.match(/const hotelPhotoCache: Readonly<Record<string, string>> = (\{[\s\S]*?\n\});/)[1]);
  }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const manifestPath = resolve(root, 'public/media-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const refs = await mediaReferences(root); const attestation = manifest.ownerAttestation;
  const digest = inventoryDigest(refs);
  if (attestation?.scope !== 'existing-trip-photo-set' || attestation?.rightsStatus !== 'owner-attested' || attestation?.attestedAt !== '2026-10-13' || attestation.inventorySha256 !== digest) throw new Error('rights_inventory');
  const allowed = new Set(refs);
  const source = await readFile(resolve(root, 'src/lib/hotel-provider-media.generated.ts'), 'utf8');
  const records = readRecords(source, 'records'), supplemental = readRecords(source, 'supplementalRecords');
  const sample = JSON.parse(await readFile(resolve(root, 'examples/trips/2026-europe-sample.json'), 'utf8'));
  const jobs = new Map(); let missing = 0;
  for (const hotel of sample.yi) {
    const media = supplemental[hotel.name] || records[hotel.name];
    const photo = media?.photos.find(photo => allowed.has(photo.src) && safeSourceUrl(photo.src) && safePublicText(photo.credit || photo.source || '') && safePublicText(photo.alt || '') && photo.verified === true);
    if (!photo) { missing++; continue; }
    if (!existingMapping[photo.src] && !jobs.has(photo.src) && jobs.size < 200) jobs.set(photo.src, photo);
  }
  const failures = {}; const prepared = []; const entries = [...jobs]; let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const [url, photo] = entries[cursor++];
      try {
        const input = await fetchImage(url);
        const bytes = await sharp(input, { limitInputPixels: 40_000_000, animated: false }).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
        const facts = await imagePrivacyFacts(bytes, '.webp');
        if (facts.metadata || facts.sensitive) throw new Error('privacy_metadata');
        const path = `public/media/hotel-${sha256(url).slice(0, 24)}.webp`;
        prepared.push({url, path, bytes, record: {path, sha256: sha256(bytes), credit: photo.credit || `Property gallery via ${photo.source}`, sourceUrl: url, license: 'Owner-attested existing photo license; receipts and per-photo attribution mapping deferred', rightsStatus: 'approved', privacyStatus: 'approved', reviewedAt: '2026-10-13', rightsEvidence: `owner-attested-existing-trip-photo-set:${digest}`, privacyReview: 'Existing property-specific public marketing gallery; safe source; metadata-free bounded derivative', originalInventorySha256: digest }});
      } catch (error) {
        const category = ['unsupported_host','unsafe_destination','unsafe_address','timeout','timeout_or_redirect','http_status','not_image','body_limit','privacy_metadata','redirect','network'].includes(error.message) ? error.message : 'decode_or_transform';
        failures[category] = (failures[category] || 0) + 1;
      }
    }
  }
  await Promise.all(Array.from({length: 3}, worker));
  const fresh = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (fresh.ownerAttestation.inventorySha256 !== digest || inventoryDigest(await mediaReferences(root)) !== digest) throw new Error('inventory_changed');
  await containedPath(root, 'public'); await mkdir(resolve(root, 'public/media'), {recursive: true}); await containedPath(root, 'public/media');
  for (const asset of prepared) await writeFile(resolve(root, asset.path), asset.bytes, {flag: 'wx'});
  const paths = new Set(prepared.map(asset => asset.path));
  fresh.localAssets = [...fresh.localAssets.filter(asset => !paths.has(asset.path)), ...prepared.map(asset => asset.record)];
  await writeFile(manifestPath, `${JSON.stringify(fresh, null, 2)}\n`);
  const mapping = { ...existingMapping, ...Object.fromEntries(prepared.sort((a,b) => a.url.localeCompare(b.url)).map(asset => [asset.url, asset.path.replace(/^public/, '')])) };
  await writeFile(resolve(root, 'src/lib/hotel-photo-cache.generated.ts'), `// Bounded owner-attested property-photo derivatives. Original provider attribution remains on each photo.\n// Existing source inventory SHA-256: ${digest}\n// Completion pass used: ${completeBlockedPass}\nconst hotelPhotoCache: Readonly<Record<string, string>> = ${JSON.stringify(mapping, null, 2)};\n\nexport function cachedHotelPhoto(original: string): string {\n  return hotelPhotoCache[original] || original;\n}\n\nexport const hotelPhotoCacheCoverage = ${JSON.stringify({attempted: jobs.size + Object.keys(existingMapping).length, cached: Object.keys(mapping).length, missing, failures})} as const;\n`);
  return {references: refs.length, inventorySha256: digest, catalogueHotels: sample.yi.length, attempted: jobs.size, cached: prepared.length, bytes: prepared.reduce((n,a)=>n+a.bytes.length,0), missing, failures};
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  try { console.log(JSON.stringify(await cacheReviewedHotelMedia(resolve('.'), { completeBlockedPass: process.argv.includes('--complete-blocked-pass') }))); }
  catch { console.error('NOT_READY: bounded cache preparation failed; no source URLs or private values logged.'); process.exitCode = 1; }
}
