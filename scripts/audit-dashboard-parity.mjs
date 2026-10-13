#!/usr/bin/env node
// Read-only audit of reviewed public dashboard payloads; never reads private files or credentials.
import { readFile, access, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const deployedOrigin = 'https://trippy-travel-optimizer.vercel.app';
function scan(value) {
  let findings = 0;
  function walk(item) {
    if (Array.isArray(item)) return item.forEach(walk);
    if (item && typeof item === 'object') return Object.entries(item).forEach(([key, child]) => {
      if (/^(email|confirmation(Number|Code)?|bookingReference|recordLocator|loyalty(Id|Identifier)?|seat(Assignment)?|apiKey|accessToken|refreshToken)$/i.test(key) && child) findings++;
      walk(child);
    });
    if (typeof item === 'string' && /mail\.google\.com|mailto:|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:[?&])(token|key|signature|credential)=|AIza[\w-]{24,}|(?:^|[\s"'])sk-[a-z0-9]{20,}|ya29\.[\w-]{20,}/i.test(item)) findings++;
  }
  walk(value); return findings;
}
function references(value, field = '', result = new Set()) {
  if (typeof value === 'string' && /^(image|images|hero|src|thumbnail|thumbnailUrl)$/i.test(field) && value) result.add(value);
  else if (Array.isArray(value)) value.forEach(item => references(item, field, result));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => references(item, key, result));
  return result;
}
async function payload(origin) {
  const response = await fetch(`${origin}/api/trips/2026`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Public payload HTTP ${response.status}`);
  const raw = await response.text(), data = JSON.parse(raw);
  if (scan(data) || data.dataMode !== 'sample') throw new Error('Public sample/privacy boundary failed; no values retained');
  return { data, bytes: Buffer.byteLength(raw), sha256: createHash('sha256').update(raw).digest('hex') };
}
async function summarize(p) {
  const refs = [...references(p.data)];
  const hosts = {}, missingGuidePaths = [], missingLocalPaths = [];
  for (const ref of refs) {
    const url = ref.startsWith('/') ? undefined : new URL(ref);
    const host = url?.hostname || 'local'; hosts[host] = (hosts[host] || 0) + 1;
    const path = url?.pathname || ref;
    if (path.startsWith('/guide-images/') && /^\/guide-images\/[a-f0-9]{16}\.webp$/.test(path)) {
      try { await access(resolve(root, `public${path}`)); } catch { missingGuidePaths.push(path); }
    }
    if (!url) {
      if (!/^\/[a-z0-9/._-]+$/i.test(path) || path.includes('..')) throw new Error('Unsafe local media path');
      try { await access(resolve(root, `public${path}`)); } catch { missingLocalPaths.push(path); }
    }
  }
  return { bytes: p.bytes, sha256: p.sha256, activities: p.data.activities.length, hotels: p.data.hotels.length, stops: p.data.stops.length,
    uniqueImageReferences: refs.length, guideReferences: refs.filter(r => r.includes('/guide-images/')).length, imageHosts: hosts,
    placeholderActivities: p.data.activities.filter(a => a.image === '/photo-placeholder.svg').map(a => ({ id: a.id, city: a.city })),
    missingGuidePaths, missingLocalPaths };
}
try {
  const deployed = await payload(deployedOrigin);
  const summary = { checkedAt: new Date().toISOString(), deployedOrigin, deployed: await summarize(deployed) };
  if (process.argv[2]) {
    const local = new URL(process.argv[2]);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(local.hostname) || !['http:', 'https:'].includes(local.protocol) || local.username || local.password || local.search || local.hash) throw new Error('Optional comparison must be a bare localhost origin');
    const p = await payload(local.origin);
    summary.local = await summarize(p);
    summary.activityImageChanges = p.data.activities.flatMap(a => {
      const before = deployed.data.activities.find(b => b.id === a.id);
      return before && before.image !== a.image ? [{ id: a.id, city: a.city, localImageKind: a.image === '/photo-placeholder.svg' ? 'placeholder' : a.image.startsWith('/') ? 'bundled' : 'remote' }] : [];
    });
  }
  const sample = JSON.parse(await readFile(resolve(root, 'examples/trips/2026-europe-sample.json'), 'utf8'));
  if (scan(sample)) throw new Error('Tracked sample/privacy boundary failed');
  summary.rawSample = { uniqueImageReferences: references(sample).size, placeholderOccurrences: JSON.stringify(sample).match(/\/photo-placeholder\.svg/g)?.length || 0 };
  await mkdir(resolve(root, 'output/parity'), { recursive: true });
  await writeFile(resolve(root, 'output/parity/summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
} catch (error) { console.error(`NOT_READY: ${error.message}`); process.exitCode = 1; }
