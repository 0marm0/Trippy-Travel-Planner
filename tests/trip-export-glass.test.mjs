import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTripHtmlReplica, renderTripHtmlCompact } from '../src/lib/trip-export-html.ts';

const snapshot = {
  title: 'Invented journey', subtitle: 'A safe renderer fixture', start: '2027-05-01', end: '2027-05-04',
  stops: [{ name: 'Invented City', country: 'Invented Country', checkIn: '2027-05-01', checkOut: '2027-05-04', nights: 3, stay: 'Hotel to be selected' }],
  catalogue: [{ city: 'Invented City', title: 'Garden walk', category: 'Outdoors', priority: 'must', details: 'A relaxed walk', image: 'https://example.com/garden.jpg' }],
  days: [{ dayNumber: 1, date: '2027-05-01', city: 'Invented City', theme: 'Arrival and a walk', note: '', anchors: [{ status: 'quoted', label: 'Train to city', detail: 'Schedule to verify' }], activities: [{ title: 'Garden walk', category: 'Outdoors', priority: 'must', details: 'A relaxed walk', image: 'https://example.com/garden.jpg' }] }],
  transport: [{ date: '2027-05-02', from: 'Invented City', to: 'Other City', mode: 'train', name: 'Rail route near airport', ride: '', door: '', note: '' }], hotels: [],
  bookings: [
    { kind: 'flight', date: '2027-05-01', title: 'Flight arrival', status: 'held', detail: 'Train station near destination' },
    { kind: 'car', date: '2027-05-03', title: 'Hotel transfer', status: 'confirmed', detail: 'Pickup near railway' },
  ],
};

test('rich photographic chapters retain reading controls and separate mode from booking state', () => {
  const html = renderTripHtmlReplica(snapshot);
  assert.match(html, /class="route-photo"/);
  assert.match(html, /class="hero-cover"/);
  assert.match(html, /class="timeline-copy"/);
  assert.match(html, /class="logistics-card planned"><span class="logistics-type mode-flight"/);
  assert.match(html, /class="logistics-card confirmed"><span class="logistics-type mode-car"/);
  assert.match(html, /class="logistics-type mode-train"/);
  assert.match(html, /Held/);
  for (const action of ['expand', 'collapse-cities', 'must-focus', 'print']) assert.match(html, new RegExp(`data-action="${action}"`));
  assert.match(html, /beforeprint/);
  assert.match(html, /Photo unavailable/);
  assert.match(html, /prefers-reduced-motion/);
});

test('every HTML presentation retains blue flights, yellow trains and purple car SVGs', () => {
  for (const html of [renderTripHtmlReplica(snapshot), renderTripHtmlCompact(snapshot)]) {
    assert.match(html, /\.mode-flight\{--mode-color:#60a5fa\}/);
    assert.match(html, /\.mode-train\{--mode-color:#facc15\}/);
    assert.match(html, /\.mode-car\{--mode-color:#c084fc\}/);
    for (const mode of ['flight', 'train', 'car']) assert.match(html, new RegExp(`class="travel-glyph mode-${mode}"[^>]*><svg`));
    assert.doesNotMatch(html, /fonts\.google|@import/);
  }
});


test('destination photography takes precedence over individual activity thumbnails', () => {
  const html = renderTripHtmlReplica({ ...snapshot, stops: [{ ...snapshot.stops[0], image: 'https://example.com/city-panorama.jpg' }] });
  assert.match(html, /class="hero-cover" src="https:\/\/example\.com\/city-panorama\.jpg"/);
  assert.match(html, /class="route-photo" src="https:\/\/example\.com\/city-panorama\.jpg"/);
  assert.match(html, /summary class="city-summary"><img src="https:\/\/example\.com\/city-panorama\.jpg"/);
  assert.match(html, /src="https:\/\/example\.com\/garden\.jpg"/);
});


test('remote chapter photography carries a same-city bundled fallback without inventing images', () => {
  const local = { ...snapshot.catalogue[0], image: '/media/invented-garden.webp' };
  const html = renderTripHtmlReplica({ ...snapshot, stops: [{ ...snapshot.stops[0], image: 'https://example.com/city.jpg' }], catalogue: [local] });
  assert.equal((html.match(/data-fallback="\/media\/invented-garden\.webp"/g) || []).length, 3);
  assert.match(html, /delete image\.dataset\.fallback;image\.src=fallback;return/);
  const unknown = renderTripHtmlReplica({ ...snapshot, stops: [{ ...snapshot.stops[0], image: undefined }], catalogue: [], days: [] });
  assert.doesNotMatch(unknown, /<img|data-fallback=/);
});

test('explicit Airbnb and apartment bookings retain stay glyphs and lodging export scopes', async () => {
  const { renderTripHtml, createTripPdf } = await import('../src/lib/trip-exports.ts');
  const { tripPdfIconFor } = await import('../src/lib/trip-export-pdf.ts');
  const { PDFDocument, PDFArray, PDFRawStream, decodePDFRawStream } = await import('pdf-lib');
  const stays = ['airbnb', 'apartment'].map(kind => ({ kind, date: '2027-05-01', title: `${kind} loft`, status: 'held', detail: 'Near airport and railway' }));
  const fixture = { ...snapshot, bookings: [...snapshot.bookings, ...stays] };
  for (const stay of stays) assert.equal(tripPdfIconFor(stay.kind, stay.detail), 'hotel');
  for (const html of [renderTripHtmlReplica(fixture), renderTripHtmlCompact(fixture)]) {
    assert.equal((html.match(/class="travel-glyph mode-stay"/g) || []).length, 2);
    for (const stay of stays) assert.match(html, new RegExp(`class="travel-glyph mode-stay"[^>]*><svg[\\s\\S]*?</svg></span>${stay.kind}</`));
  }
  for (const scope of ['hotels', 'travel', 'transit']) {
    const html = renderTripHtml(fixture, { visual: false, scope });
    const directHtml = renderTripHtmlCompact(fixture, { scope });
    const pdf = await PDFDocument.load(await createTripPdf(fixture, { theme: 'light', scope }));
    const operators = pdf.getPages().flatMap(page => {
      const contents = page.node.Contents();
      const references = contents instanceof PDFArray ? contents.asArray() : [contents];
      return references.map(ref => pdf.context.lookup(ref)).filter(stream => stream instanceof PDFRawStream).map(stream => new TextDecoder().decode(decodePDFRawStream(stream).decode()));
    }).join('\n').toUpperCase();
    for (const stay of stays) {
      const expected = scope !== 'transit';
      assert.equal(html.includes(stay.title), expected, `${scope} HTML ${stay.kind}`);
      assert.equal(directHtml.includes(stay.title), expected, `${scope} direct HTML ${stay.kind}`);
      assert.equal(operators.includes(Buffer.from(stay.title).toString('hex').toUpperCase()), expected, `${scope} PDF ${stay.kind}`);
    }
  }
});
