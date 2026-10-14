import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExportPreviewSummary, validateExportPreviewSnapshot, sandboxExportPreviewHtml, EXPORT_PREVIEW_HTML_BUDGET } from '../src/lib/export-preview.ts';
import { renderTripHtml } from '../src/lib/trip-exports.ts';

const activity = { title: 'Gallery walk', description: '', details: '', category: 'Art', priority: 'could', image: 'https://images.unsplash.com/synthetic-gallery.jpg' };
const snapshot = () => ({ schemaVersion: 1, title: 'Synthetic itinerary', subtitle: 'Manual records', start: '2027-04-03', end: '2027-04-05', stops: [{ name: 'London', country: 'United Kingdom', checkIn: '2027-04-03', checkOut: '2027-04-05', nights: 2, stay: 'Centre', image: '/media/synthetic-hero.webp' }], days: [{ date: '2027-04-03', dayNumber: 1, city: 'London', country: 'United Kingdom', theme: 'Arrival', note: '', anchors: [{ status: 'recommended', kind: 'train', label: 'Airport rail', detail: 'Check timetable' }], activities: [activity] }], catalogue: [{ ...activity, city: 'London' }], transport: [{ date: '2027-04-03', from: 'Airport', to: 'London', mode: 'train', name: 'Airport rail', ride: '', door: '', hours: 1, low: 0, high: 0, note: 'Price unknown' }], hotels: [{ city: 'London', name: 'Synthetic lodging', neighborhood: '', tier: '', stars: 3, low: 0, high: 0, why: '', tradeoff: '', image: 'data:image/png;base64,aGVsbG8=' }], bookings: [{ kind: 'hotel', date: '2027-04-03', dateIso: '2027-04-03', endDate: '2027-04-05', title: 'Lodging option', detail: '', status: 'recommended' }] });
const options = { scope: 'all', visual: true, theme: 'light' };

test('scope summaries use the existing renderer projection and preserve route context', () => {
  const source = snapshot();
  assert.deepEqual(validateExportPreviewSnapshot(source), []);
  const all = buildExportPreviewSummary(source, options, renderTripHtml(source, options));
  assert.deepEqual(all.counts, { stops: 1, days: 1, activities: 1, catalogue: 1, transport: 1, hotels: 1, bookings: 1 });
  const transit = buildExportPreviewSummary(source, { ...options, scope: 'transit' }, 'brief');
  assert.equal(transit.counts.transport, 1); assert.equal(transit.counts.hotels, 0); assert.equal(transit.counts.bookings, 0); assert.equal(transit.counts.activities, 0); assert.equal(transit.counts.stops, 1);
  const hotels = buildExportPreviewSummary(source, { ...options, scope: 'hotels' }, 'brief');
  assert.equal(hotels.counts.transport, 0); assert.equal(hotels.counts.hotels, 1); assert.equal(hotels.counts.bookings, 1);
  const travel = buildExportPreviewSummary(source, { ...options, scope: 'travel' }, 'brief');
  assert.equal(travel.counts.transport, 1); assert.equal(travel.counts.hotels, 1); assert.equal(travel.counts.catalogue, 0);
});

test('photo candidates deduplicate assets across daily/catalogue records and compact layout has no photos', () => {
  const source = snapshot();
  assert.deepEqual(buildExportPreviewSummary(source, options, '').photos, { local: 1, external: 1, embedded: 0 });
  assert.deepEqual(buildExportPreviewSummary(source, { ...options, visual: false }, '').photos, { local: 0, external: 0, embedded: 0 });
  assert.equal(buildExportPreviewSummary(source, options, 'é').htmlBytes, 2);
  assert.equal(buildExportPreviewSummary(source, options, 'a'.repeat(EXPORT_PREVIEW_HTML_BUDGET + 1)).overBudget, true);
});

test('invalid and over-limit records block even when the chosen scope would omit them', () => {
  const malformed = snapshot(); malformed.hotels[0].name = '';
  assert.throws(() => buildExportPreviewSummary(malformed, { ...options, scope: 'transit' }, ''));
  const oversized = snapshot(); oversized.catalogue = Array.from({ length: 501 }, () => oversized.catalogue[0]);
  assert.throws(() => buildExportPreviewSummary(oversized, { ...options, scope: 'hotels' }, ''));
  const invalidDate = snapshot(); invalidDate.start = '2027-02-30';
  assert.ok(validateExportPreviewSnapshot(invalidDate).length);
  const invalidActivity = snapshot(); invalidActivity.days[0].activities = [null];
  assert.ok(validateExportPreviewSnapshot(invalidActivity).length);
});

test('network photos require explicit preview choice while scripts/forms/navigation stay blocked', () => {
  const html = '<!doctype html><html><head><title>Reading copy</title></head><body><img src="https://images.unsplash.com/synthetic.jpg"></body></html>';
  const offline = sandboxExportPreviewHtml(html);
  assert.match(offline, /default-src 'none'; img-src data:;/);
  assert.match(offline, /form-action 'none'/);
  assert.match(offline, /base-uri 'none'/);
  const online = sandboxExportPreviewHtml(html, true);
  assert.match(online, /img-src data: https:;/);
  assert.match(online, /default-src 'none'/);
  assert.ok(online.indexOf('Content-Security-Policy') < online.indexOf('<title>'));
});

test('summary follows current edits and never caches a stale snapshot', () => {
  const source = snapshot();
  const before = buildExportPreviewSummary(source, options, 'before');
  source.transport.push({ ...source.transport[0], name: 'Second train' });
  const after = buildExportPreviewSummary(source, options, 'updated');
  assert.equal(before.counts.transport, 1); assert.equal(after.counts.transport, 2);
});

test('unknown generic destination windows remain explicit without blocking or invented dates', () => {
  const source = snapshot(); source.stops[0].checkIn = ''; source.stops[0].checkOut = ''; source.stops[0].nights = 0;
  assert.deepEqual(validateExportPreviewSnapshot(source), []);
  assert.equal(buildExportPreviewSummary(source, options, '').counts.stops, 1);
  source.stops[0].checkIn = '2027-04-03';
  assert.ok(validateExportPreviewSnapshot(source).length);
});

test('linked preview allows only explicit loopback HTTP app origin, never arbitrary plaintext image hosts', () => {
  assert.match(sandboxExportPreviewHtml('<head></head>', true, 'http://localhost:3000'), /img-src data: https: http:\/\/localhost:3000;/);
  assert.doesNotMatch(sandboxExportPreviewHtml('<head></head>', true, 'http://external.example'), /http:\/\/external/);
});

test('opt-in preview resolves approved bundled photo paths against an explicit trusted app origin only', () => {
  const source = '<html><head><title>Photos</title></head><body><img src="/media/synthetic-hero.webp" data-fallback="/guide-images/abcdef123456.webp"><img src=\'/guide-images/123456abcdef.webp\'><a href="/media/synthetic-hero.webp">Photo link</a></body></html>';
  const local = sandboxExportPreviewHtml(source, true, 'http://127.0.0.1:3000');
  assert.match(local, /src="http:\/\/127\.0\.0\.1:3000\/media\/synthetic-hero\.webp"/);
  assert.match(local, /data-fallback="http:\/\/127\.0\.0\.1:3000\/guide-images\/abcdef123456\.webp"/);
  assert.match(local, /src='http:\/\/127\.0\.0\.1:3000\/guide-images\/123456abcdef\.webp'/);
  assert.match(local, /href="\/media\/synthetic-hero\.webp"/);
  const hosted = sandboxExportPreviewHtml(source, true, 'https://planner.example.test');
  assert.match(hosted, /src="https:\/\/planner\.example\.test\/media\/synthetic-hero\.webp"/);
  const credentialOrigin = new URL('https://planner.example.test');
  credentialOrigin.username = 'synthetic'; credentialOrigin.password = 'not-a-real-secret';
  for (const origin of ['http://untrusted.example.test', 'https://planner.example.test/path', credentialOrigin.href, 'https://planner.example.test?query=unsafe', 'javascript:alert(1)']) {
    const rejected = sandboxExportPreviewHtml(source, true, origin);
    assert.match(rejected, /src="\/media\/synthetic-hero\.webp"/);
  }
  assert.match(sandboxExportPreviewHtml(source, false, 'https://planner.example.test'), /src="\/media\/synthetic-hero\.webp"/);
  assert.ok(!source.includes('Content-Security-Policy'));
  assert.ok(!source.includes('https://planner.example.test'));
});

test('photo resolution does not broaden path approval, add a base tag or enable active iframe behavior', () => {
  const source = '<head></head><img src="/media/../private.webp"><img src="//outside.example.test/photo.webp"><img src="/media/photo.webp?private=value"><img src="https://images.unsplash.com/synthetic.jpg">';
  const preview = sandboxExportPreviewHtml(source, true, 'http://localhost:3000');
  assert.match(preview, /src="\/media\/\.\.\/private\.webp"/);
  assert.match(preview, /src="\/\/outside\.example\.test\/photo\.webp"/);
  assert.match(preview, /src="\/media\/photo\.webp\?private=value"/);
  assert.match(preview, /src="https:\/\/images\.unsplash\.com\/synthetic\.jpg"/);
  assert.doesNotMatch(preview, /<base\b/i);
  assert.match(preview, /default-src 'none'/);
  assert.match(preview, /base-uri 'none'; form-action 'none'/);
  assert.match(preview, /img-src data: https: http:\/\/localhost:3000;/);
});

const previewPhotos = count => `<head></head><img class="hero-cover" src="/media/photo-0.webp">${Array.from({length:count-1},(_,index)=>`<img src="/media/photo-${index+1}.webp">`).join('')}`;
test('explicit parent-origin photo loading embeds only approved local paths with bounded concurrency and count', async () => {
  const {embedSandboxPreviewPhotos}=await import('../src/lib/export-preview.ts');
  const source=previewPhotos(42)+'<img src="https://outside.example.test/photo.webp"><img src="/private/not-a-photo">';
  let active=0,maximum=0,calls=0;
  const result=await embedSandboxPreviewPhotos(source,'http://127.0.0.1:3000',async(url,options)=>{
    assert.match(url,/^http:\/\/127\.0\.0\.1:3000\/media\/photo-\d+\.webp$/);
    assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');
    calls++;active++;maximum=Math.max(maximum,active);await new Promise(resolve=>setTimeout(resolve,1));active--;
    return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'image/webp'}});
  },new AbortController().signal);
  assert.equal(calls,40);assert.ok(maximum<=3);assert.equal(result.embedded,40);assert.equal(result.omitted,2);assert.equal(result.failed,0);
  assert.match(result.html,/src="data:image\/webp;base64,/);assert.ok(!result.html.includes('src="/media/photo-40.webp"'));
  assert.ok(source.includes('src="/media/photo-0.webp"'));assert.ok(!source.includes('data:image/'));
});

test('local-photo failures and individual oversize produce neutral fallbacks instead of broken image tags', async()=>{
 const {embedSandboxPreviewPhotos}=await import('../src/lib/export-preview.ts');
 const result=await embedSandboxPreviewPhotos(previewPhotos(3),'https://planner.example.test',async url=>url.includes('photo-0')?new Response('',{status:404}):url.includes('photo-1')?new Response(new Uint8Array([1]),{headers:{'Content-Type':'image/webp','Content-Length':'1000001'}}):new Response(new Uint8Array([1]),{headers:{'Content-Type':'text/html'}}),new AbortController().signal);
 assert.equal(result.failed,3);assert.equal(result.embedded,0);assert.equal(result.omitted,0);
 assert.ok(!result.html.includes('<img'));assert.match(result.html,/Photo unavailable in preview/);
});

test('total accepted photo budget stays within eight MB and accounts for every omitted asset', async()=>{
 const {embedSandboxPreviewPhotos}=await import('../src/lib/export-preview.ts');
 const result=await embedSandboxPreviewPhotos(previewPhotos(10),'http://localhost:3000',async()=>new Response(new Uint8Array(1_000_000),{headers:{'Content-Type':'image/webp'}}),new AbortController().signal);
 assert.ok(result.bytesRead<=8_000_000);assert.ok(result.embeddedBytes<=8_000_000);assert.ok(result.embedded<=8);
 assert.equal(result.embedded+result.failed+result.omitted,10);assert.ok(result.omitted>=2);
});

test('aborted parent-origin loading publishes no preview and never dispatches a subsequent photo', async()=>{
 const {embedSandboxPreviewPhotos}=await import('../src/lib/export-preview.ts');
 const controller=new AbortController();let calls=0;
 await assert.rejects(embedSandboxPreviewPhotos(previewPhotos(10),'http://localhost:3000',async()=>{calls++;controller.abort();return new Response(new Uint8Array([1]),{headers:{'Content-Type':'image/webp'}});},controller.signal),error=>error.name==='AbortError');
 assert.equal(calls,1);
});
