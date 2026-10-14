#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import https from 'node:https';
import sharp from 'sharp';
import { mediaReferences, inventoryDigest, safeSourceUrl, safePublicText, imagePrivacyFacts, sha256, containedPath } from './media-tools.mjs';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_HOSTS = new Set(['upload.wikimedia.org']);
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
      if (response.statusCode !== 200) { response.resume(); return reject(new Error(`http_${response.statusCode}`)); }
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

export async function cacheReviewedActivityMedia(root) {
  const mappingPath = resolve(root, 'src/lib/activity-photo-cache.generated.ts');
  try { await readFile(mappingPath); throw new Error('cache_already_exists'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const manifestPath = resolve(root, 'public/media-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const refs = await mediaReferences(root), digest = inventoryDigest(refs);
  const attestation = manifest.ownerAttestation;
  if (attestation?.scope !== 'existing-trip-photo-set' || attestation?.rightsStatus !== 'owner-attested' || attestation.inventorySha256 !== digest) throw new Error('rights_inventory');
  const allowed = new Set(refs);
  const sample = JSON.parse(await readFile(resolve(root, 'examples/trips/2026-europe-sample.json'), 'utf8'));
  const activities = [...(sample.oi || []), ...(sample.si || []), ...(sample.$r?.activities || []), ...Object.values(sample.ci || {}), ...Object.values(sample.li || {})];
  const jobs = new Map(); let rejected = 0;
  for (const activity of activities) {
    const url = activity.image;
    if (typeof url !== 'string' || !url.startsWith('https:')) continue;
    if (!allowed.has(url) || /\[redacted\]|%5bredacted%5d/i.test(url) || !safeSourceUrl(url)
      || (activity.imageCredit && !safePublicText(activity.imageCredit)) || (activity.imageSource && !safeSourceUrl(activity.imageSource))) { rejected++; continue; }
    if (jobs.size < 100 && !jobs.has(url)) jobs.set(url, activity);
  }
  // Existing stop fallback photos can be cached only when they belong to the exact attested inventory.
  const loader = await readFile(resolve(root, 'src/lib/current-trip.ts'), 'utf8');
  const fallbacks = loader.match(/const cityFallbacks: Record<string, string> = (\{[\s\S]*?\n\});/)?.[1] || '';
  for (const match of fallbacks.matchAll(/"(https:[^"]+)"/g)) {
    const url = match[1];
    if (allowed.has(url) && safeSourceUrl(url) && !/\[redacted\]|%5bredacted%5d/i.test(url) && jobs.size < 100 && !jobs.has(url)) jobs.set(url, {});
  }
  for (const url of jobs.keys()) ALLOWED_HOSTS.add(new URL(url).hostname);
  const entries = [...jobs], prepared = [], failures = {}; let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const [url, activity] = entries[cursor++];
      try {
        const input = await fetchImage(url);
        const bytes = await sharp(input, {limitInputPixels: 40_000_000, animated: false}).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer();
        const facts = await imagePrivacyFacts(bytes, '.webp');
        if (facts.metadata || facts.sensitive) throw new Error('privacy_metadata');
        const path = `public/media/activity-${sha256(url).slice(0,24)}.webp`;
        const credit = activity.imageCredit || `Existing activity photo via ${new URL(url).hostname}`;
        prepared.push({url,path,bytes,record:{path,sha256:sha256(bytes),credit,sourceUrl:url,license:'Owner-attested existing photo license; receipts and per-photo attribution mapping deferred',rightsStatus:'approved',privacyStatus:'approved',reviewedAt:'2026-10-14',rightsEvidence:`owner-attested-existing-trip-photo-set:${digest}`,privacyReview:'Existing approved public activity reference; safe source; metadata-free bounded derivative',originalInventorySha256:digest}});
      } catch (error) {
        const category = /^(http_\d+|unsupported_host|unsafe_destination|unsafe_address|timeout|timeout_or_redirect|not_image|body_limit|privacy_metadata|redirect|network)$/.test(error.message) ? error.message : 'decode_or_transform';
        failures[category] = (failures[category] || 0) + 1;
      }
    }
  }
  await Promise.all(Array.from({length:3}, worker));
  const fresh = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (fresh.ownerAttestation.inventorySha256 !== digest || inventoryDigest(await mediaReferences(root)) !== digest) throw new Error('inventory_changed');
  await containedPath(root, 'public'); await mkdir(resolve(root,'public/media'), {recursive:true}); await containedPath(root,'public/media');
  for (const asset of prepared) await writeFile(resolve(root, asset.path), asset.bytes, {flag:'wx'});
  const paths = new Set(prepared.map(asset=>asset.path));
  fresh.localAssets = [...fresh.localAssets.filter(asset=>!paths.has(asset.path)), ...prepared.map(asset=>asset.record)];
  await writeFile(manifestPath, `${JSON.stringify(fresh,null,2)}\n`);
  const mapping = Object.fromEntries(prepared.sort((a,b)=>a.url.localeCompare(b.url)).map(asset=>[asset.url,asset.path.replace(/^public/,'')]));
  const coverage = {attempted:jobs.size,cached:prepared.length,rejected,failures};
  await writeFile(mappingPath, `// Bounded owner-attested activity-photo derivatives. Original attribution remains on each activity.\n// Existing source inventory SHA-256: ${digest}\nconst activityPhotoCache: Readonly<Record<string, string>> = ${JSON.stringify(mapping,null,2)};\n\nexport function cachedActivityPhoto(original: string): string {\n  return activityPhotoCache[original] || original;\n}\n\nexport const activityPhotoCacheCoverage = ${JSON.stringify(coverage)} as const;\n`);
  return {references:refs.length,inventorySha256:digest,...coverage,bytes:prepared.reduce((n,a)=>n+a.bytes.length,0)};
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  try { console.log(JSON.stringify(await cacheReviewedActivityMedia(resolve('.')))); }
  catch { console.error('NOT_READY: bounded activity cache failed; no source URLs or private values logged.'); process.exitCode=1; }
}
