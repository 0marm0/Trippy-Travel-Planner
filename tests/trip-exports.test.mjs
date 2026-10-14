import { tripPdfIconFor, tripPdfModeColor } from '../src/lib/trip-export-pdf.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFArray, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import {
  buildTripExportSnapshot,
  createTripPdf,
  redactPrivateExportText,
  renderTripCsv,
  renderTripHtml,
  sanitizeTripExportSnapshot,
  tripExportFilename,
  isBundledTripImage,
  filterTripExportSnapshot,
} from '../src/lib/trip-exports.ts';

const trip = {
  id: 'europe-2026', dataMode: 'private', title: 'Edited <Europe> Trip', subtitle: 'A & B', start: '2026-09-22', end: '2026-09-24',
  stops: [{ id: 'berlin', name: 'Berlin', country: 'Germany', flag: 'DE', checkIn: '2026-09-22', checkOut: '2026-09-24', nights: 2, lat: 1, lng: 2, stay: 'Mitte', hero: 'https://images.unsplash.com/photo.jpg' }],
  activities: [
    { id: 'museum', city: 'berlin', title: 'Museum, Island', description: 'Five museums', details: 'Timed entry', url: 'https://example.com', category: 'History', priority: 'should', image: 'https://images.unsplash.com/museum.jpg', status: 'planning' },
    { id: 'gate', city: 'berlin', title: 'Brandenburg Gate', description: 'Walk', details: 'Open plaza', url: '', category: 'Architecture', priority: 'must', image: 'javascript:alert(1)', status: 'planning' },
  ],
  hotels: [{ id: 'hotel-1', city: 'berlin', name: 'Hotel One', tier: 'Best location', neighborhood: 'Mitte', low: 220, high: 270, stars: 4, flags: [], amenities: [], why: 'Walkable', tradeoff: 'Small rooms', images: ['https://images.unsplash.com/hotel.jpg'], offers: [], official: 'https://hotel.example' }],
  transport: [{ id: 'leg-1', from: 'airport', to: 'berlin', date: '2026-09-22', recommend: 'train', options: [
    { id: 'train', mode: 'train', name: 'Airport Express', ride: '30m', door: '50m', hours: 0.8, low: 15, high: 20, note: 'Frequent' },
    { id: 'car', mode: 'car', name: 'Car', ride: '35m', door: '45m', hours: 0.75, low: 50, high: 80, note: 'Traffic varies' },
  ] }],
  cityPlans: { berlin: [{ theme: 'Arrival', note: 'Keep it light', blocks: [] }, { theme: 'Museums', note: '', blocks: [] }] },
  dayAnchors: { '2026-09-22': [{ kind: 'confirmed', label: 'UA109', detail: 'Booking reference ABC123 and seat 12A for person@example.com' }] },
  mapPlaces: {}, clusterGuidance: {},
  bookings: [{ kind: 'Flight', date: '2026-09-22', title: 'UA109 confirmed', detail: 'Confirmation number ABC123; email person@example.com; https://mail.google.com/message', ref: 'ABC123', href: 'https://mail.google.com/message' }],
};

const state = {
  assignments: { '2026-09-22': ['museum'], '2026-09-23': ['gate', 'museum'] },
  activityPriority: { museum: 'must' },
  selectedTransport: { 'leg-1': 'car' },
  selectedHotel: { berlin: 'hotel-1' },
};

test('compact travel, transit and hotel scopes preserve their logistics and exclude unrelated records', async () => {
  const snapshot = buildTripExportSnapshot(trip, state);
  const transit = filterTripExportSnapshot(snapshot, 'transit');
  assert.equal(transit.hotels.length, 0);
  assert.equal(transit.transport.length, snapshot.transport.length);
  assert.equal(transit.days.every(day => day.activities.length === 0), true);
  const hotels = filterTripExportSnapshot(snapshot, 'hotels');
  assert.equal(hotels.transport.length, 0);
  assert.equal(hotels.hotels[0].name, 'Hotel One');
  for (const scope of ['travel', 'transit', 'hotels']) {
    const html = renderTripHtml(snapshot, { visual: false, scope });
    assert.equal(html.includes('ABC123'), false);
    assert.equal(html.includes('person@example.com'), false);
    if (scope === 'transit') { assert.equal(html.includes('Hotel One'), false); assert.match(html, /Car/); }
    if (scope === 'travel') assert.match(html, /Hotel One/);
    if (scope === 'hotels') { assert.match(html, /Hotel One/); assert.equal(html.includes('Museum, Island'), false); }
    const bytes = await createTripPdf(snapshot, { theme: 'light', scope });
    const pdf = await PDFDocument.load(bytes);
    assert.ok(pdf.getPageCount() > 0);
    assert.match(tripExportFilename(scope === 'hotels' ? 'pdf-hotels' : 'pdf-transit'), /brief\.pdf$/);
  }
});

test('PDF icons use explicit booking kind and selected mode before hotel or transport prose', () => {
  assert.equal(tripPdfIconFor('Car', 'Airport to Invented Hotel transfer'), 'car');
  assert.equal(tripPdfIconFor('Car', 'Invented Hotel to airport'), 'car');
  assert.equal(tripPdfIconFor('Hotel', 'Airport Hotel near train station'), 'hotel');
  assert.equal(tripPdfIconFor('Flight', 'Airport express train connection after arrival'), 'flight');
  assert.equal(tripPdfIconFor('train', 'Hotel shuttle rental car alternative'), 'train');
  assert.equal(tripPdfIconFor('activity', 'Hotel architecture tour'), 'activity');
  assert.equal(tripPdfIconFor('', 'Hotel to station transfer'), 'car');
});

test('hotel scope excludes hotel-named car transfers using booking kind before destination words', () => {
  const date = '2030-01-02';
  const transfers = [
    { kind: 'Car', title: 'Airport to Invented Hotel transfer' },
    { kind: 'Car', title: 'Invented Hotel to airport' },
    { kind: 'Hotel transfer', title: 'Hotel pickup' },
  ];
  const snapshot = sanitizeTripExportSnapshot({ title: 'Invented trip', start: date, end: '2030-01-03',
    bookings: [...transfers.map(item => ({ ...item, dateIso: date, status: 'confirmed', detail: 'Reviewed transfer' })), { kind: 'Hotel', title: 'Airport Hotel stay', dateIso: date, status: 'confirmed', detail: 'Reviewed accommodation' }, { kind: 'Activity', title: 'Hotel architecture tour', dateIso: date, status: 'recommended' }],
    days: [{ date, city: 'Invented City', anchors: [...transfers.map(item => ({ label: item.title, status: 'confirmed', detail: 'Transfer context' })), { label: 'Airport Hotel stay', status: 'confirmed' }, { label: 'Hotel architecture tour', status: 'recommended' }, { label: 'Hotel to station transfer', status: 'recommended' }, { label: 'Hotel check-in', status: 'recommended' }] }],
  });
  const hotels = filterTripExportSnapshot(snapshot, 'hotels');
  assert.deepEqual(hotels.bookings.map(item => item.title), ['Airport Hotel stay']);
  assert.deepEqual(hotels.days[0].anchors.map(item => item.label), ['Airport Hotel stay', 'Hotel check-in']);
  for (const scope of ['travel', 'transit']) {
    const scoped = filterTripExportSnapshot(snapshot, scope);
    for (const transfer of transfers) {
      assert.ok(scoped.bookings.some(item => item.title === transfer.title));
      assert.ok(scoped.days[0].anchors.some(item => item.label === transfer.title));
    }
    assert.ok(scoped.days[0].anchors.some(item => item.label === 'Hotel to station transfer'));
    assert.ok(!scoped.bookings.some(item => item.title === 'Hotel architecture tour'));
  }
  assert.doesNotMatch(renderTripHtml(snapshot, { scope: 'hotels' }), /Airport to Invented Hotel transfer|Invented Hotel to airport|Hotel pickup|Hotel to station transfer/);
});

test('snapshot reflects edited assignments and selections without exporting private identifiers', () => {
  const snapshot = buildTripExportSnapshot(trip, state);
  assert.deepEqual(snapshot.days.map((day) => day.activities.map((activity) => activity.title)), [['Museum, Island'], ['Brandenburg Gate', 'Museum, Island'], []]);
  assert.equal(snapshot.days[0].activities[0].priority, 'must');
  assert.equal(snapshot.transport[0].name, 'Car');
  assert.equal(snapshot.hotels[0].name, 'Hotel One');
  assert.equal(snapshot.hotels[0].city, 'Berlin');
  assert.equal(snapshot.days[1].activities[0].image, '');
  assert.equal(snapshot.catalogue.length, 2);
  assert.equal(snapshot.catalogue[0].city, 'Berlin');
  assert.equal(snapshot.catalogue[0].priority, 'must');
  const serialized = JSON.stringify(snapshot);
  for (const privateValue of ['ABC123', 'person@example.com', 'mail.google.com', 'ref', 'href']) assert.equal(serialized.includes(privateValue), false, privateValue);
  assert.match(snapshot.bookings[0].title, /UA109/);
  assert.match(snapshot.bookings[0].detail, /private detail removed/);
});

test('CSV and HTML render the same complete sanitized snapshot', () => {
  const snapshot = buildTripExportSnapshot(trip, state);
  const csv = renderTripCsv(snapshot);
  assert.match(csv, /^\uFEFF"row_type"/);
  assert.match(csv, /"Museum, Island"/);
  assert.match(csv, /"Selected planning option"/);
  assert.match(csv, /"booking","2026-09-22","Flight","tbc"/);
  const dossier = renderTripHtml(snapshot);
  assert.match(dossier, /Edited &lt;Europe&gt; Trip/);
  assert.match(dossier, /Brandenburg Gate/);
  assert.match(dossier, /Hotel One/);
  assert.doesNotMatch(dossier, /ABC123|person@example\.com|mail\.google\.com/);
  assert.match(dossier, /script-src 'unsafe-inline'/);
  assert.match(dossier, /data-action="expand"/);
  assert.match(dossier, /data-action="collapse-cities"/);
  assert.match(dossier, /data-action="must-focus"/);
  assert.match(dossier, /<details class="city-chapter" data-city/);
  assert.match(dossier, /data-tier="must" open/);
  assert.match(dossier, /class="activity-card must"/);
  assert.match(dossier, /Route overview/);
  assert.match(dossier, /At a glance/);
  assert.match(dossier, /Movement and stays/);
  assert.match(dossier, /Book \/ verify/);
  assert.match(dossier, /selected planning option/i);
  const lightDossier = renderTripHtml(snapshot, { theme: 'light', visual: true });
  assert.match(lightDossier, /<html lang="en" data-theme="light">/);
  assert.match(lightDossier, /html\[data-theme="light"\]/);
});

test('legacy private operational exports also remove booking identifiers', () => {
  const privateSnapshot = buildTripExportSnapshot(trip, state, 'private-operational');
  assert.doesNotMatch(privateSnapshot.bookings[0].detail, /ABC123/);
  assert.doesNotMatch(privateSnapshot.bookings[0].detail, /person@example\.com/);
  const privateHtml = renderTripHtml(privateSnapshot, { privacy: 'private-operational' });
  assert.doesNotMatch(privateHtml, /ABC123/);
  assert.doesNotMatch(privateHtml, /person@example\.com/);

  const publicData = { ...trip, dataMode: 'sample' };
  const forcedPrivate = buildTripExportSnapshot(publicData, state, 'private-operational');
  assert.doesNotMatch(JSON.stringify(forcedPrivate), /ABC123|person@example\.com/);
});

test('untrusted export snapshots are bounded and sanitized again at the PDF boundary', () => {
  const snapshot = sanitizeTripExportSnapshot({ title: 'Trip', start: '2026-01-01', end: '2026-01-02', bookings: [{ title: 'PNR Z9X8Q7', detail: 'person@example.com' }], days: [{ activities: [{ priority: 'admin', image: 'https://tracker.example/private/asset' }, { priority: 'must', image: 'https://images.unsplash.com/photo.jpg?token=secret' }] }], catalogue: [{ city: 'Berlin', title: 'Guide card', priority: 'must', image: 'https://tracker.example/private/asset' }] });
  assert.equal(snapshot.bookings[0].title.includes('Z9X8Q7'), false);
  assert.equal(snapshot.bookings[0].detail.includes('@'), false);
  assert.equal(snapshot.days[0].activities[0].priority, 'could');
  assert.equal(snapshot.days[0].activities[0].image, '');
  assert.equal(snapshot.days[0].activities[1].image, '');
  assert.equal(snapshot.catalogue[0].image, '');
});

test('all export text boundaries reject credentials and CSV formula injection', () => {
  const credential = ['Bearer', 'x'.repeat(32)].join(' ');
  const snapshot = sanitizeTripExportSnapshot({ title: credential, days: [{ date: 'person@example.com', theme: '=1+1', anchors: [{ status: 'person@example.com', label: credential, detail: credential }], activities: [] }] });
  assert.doesNotMatch(JSON.stringify(snapshot), /person@example|inventedtestcredential/);
  assert.doesNotMatch(renderTripHtml(snapshot, { privacy: 'private-operational' }), /person@example|inventedtestcredential/);
  assert.match(renderTripCsv(snapshot), /'\=1\+1/);
});

test('bundled photos survive export sanitization while traversal and private paths fail', () => {
  const path = '/guide-images/123456abcdef.webp';
  assert.equal(isBundledTripImage(path), true);
  for (const rejected of ['/guide-images/../../.private/photo.webp', '/media/photo.webp?token=secret', '/.private/photo.webp', '//example.com/photo.webp']) assert.equal(isBundledTripImage(rejected), false);
  const snapshot = sanitizeTripExportSnapshot({ title: 'Trip', catalogue: [{ title: 'Photo', city: 'Kyoto', image: path }] });
  assert.equal(snapshot.catalogue[0].image, path);
});

test('light, dark and visual PDF generators return real PDF bytes', async () => {
  const snapshot = buildTripExportSnapshot(trip, state);
  let imageLoads = 0;
  const samplePng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+3MxZ5wAAAABJRU5ErkJggg==', 'base64');
  for (const options of [{ theme: 'light' }, { theme: 'dark' }, { theme: 'dark', visual: true, imageLoader: async () => { imageLoads += 1; return samplePng; } }]) {
    const bytes = await createTripPdf(snapshot, options);
    assert.equal(Buffer.from(bytes.subarray(0, 5)).toString('ascii'), '%PDF-');
    assert.ok(bytes.byteLength > 2_000);
    const document = await PDFDocument.load(bytes);
    assert.ok(document.getPageCount() >= 3);
    const size = document.getPage(0).getSize();
    assert.ok(Math.abs(size.width - 595.28) < 0.1);
    assert.ok(Math.abs(size.height - 841.89) < 0.1);
  }
  assert.equal(imageLoads, 1);
  assert.equal(tripExportFilename('pdf-light'), 'trippy-2026-itinerary-light.pdf');
  assert.equal(tripExportFilename('pdf-visual'), 'trippy-2026-visual-dossier.pdf');
});

test('crowded ledgers continue onto extra pages without dropping dated, pre-trip or TBC logistics', async () => {
  const snapshot = buildTripExportSnapshot(trip, state);
  const longDetail = 'Full schedule text keeps every flight number, departure time, arrival time, and verification note visible in the logistics appendix.';
  const crowded = {
    ...snapshot,
    bookings: [
      ...Array.from({ length: 35 }, (_, index) => ({ kind: 'Train', date: '2026-09-22', title: `Logistics item ${index}`, detail: `Public schedule row ${index}` })),
      { kind: 'Flight', date: '2026-09-21', title: 'Pre-trip departure', detail: longDetail },
      { kind: 'Train', date: 'TBC', title: 'Sleeper schedule TBC', detail: longDetail },
    ],
  };
  const html = renderTripHtml(crowded);
  for (let index = 0; index < 35; index += 1) assert.match(html, new RegExp(`Logistics item ${index}(?!\\d)`));
  assert.match(html, /Pre-trip departure/);
  assert.match(html, /Sleeper schedule TBC/);
  assert.match(html, /class="logistics-card/);
  assert.match(html, new RegExp(longDetail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const baseline = await PDFDocument.load(await createTripPdf(snapshot, { theme: 'light' }));
  const expanded = await PDFDocument.load(await createTripPdf(crowded, { theme: 'light' }));
  assert.ok(expanded.getPageCount() > baseline.getPageCount());
});

test('private-text redaction preserves flight numbers but removes booking references', () => {
  assert.match(redactPrivateExportText('UA109 on 12 Oct'), /UA109/);
  assert.match(redactPrivateExportText('B61254, U21234 and 6E123'), /B61254, U21234 and 6E123/);
  assert.equal(redactPrivateExportText('Booking reference ABC123').includes('ABC123'), false);
  assert.equal(redactPrivateExportText('Seat 12A').includes('12A'), false);
});


test('image privacy inspects harmless query values and nested encoded paths', () => {
  const snapshot = buildTripExportSnapshot(trip, state);
  for (const image of [
    'https://images.unsplash.com/photo.jpg?note=booking-reference-invented',
    'https://images.unsplash.com/booking-reference-invented/photo.jpg',
    'https://images.unsplash.com/photo.jpg?note='+encodeURIComponent(encodeURIComponent('access-token-invented')),
    'https://images.unsplash.com/photo.jpg?note='+encodeURIComponent('sk-'+'invented'.repeat(5)),
  ]) { snapshot.hotels[0].image = image; assert.equal(sanitizeTripExportSnapshot(snapshot).hotels[0].image, ''); }
  snapshot.hotels[0].image = 'https://images.unsplash.com/photo.jpg?w=960&q=80';
  assert.equal(sanitizeTripExportSnapshot(snapshot).hotels[0].image, snapshot.hotels[0].image);
});

test('a short logistics ledger adds an appendix for overflowing detail', async () => {
  const snapshot = buildTripExportSnapshot(trip, state);
  const normal = await PDFDocument.load(await createTripPdf(snapshot, { theme: 'light', scope: 'hotels' }));
  snapshot.bookings.push({kind:'stay',date:'2026-09-22',dateIso:'2026-09-22',endDate:'2026-09-24',title:'Lodging context',status:'recommended',detail:'Invented stay planning details '.repeat(50)+'TAILMARKER'});
  const expanded = await PDFDocument.load(await createTripPdf(snapshot, { theme: 'light', scope: 'hotels' }));
  assert.ok(expanded.getPageCount() > normal.getPageCount());
});


test('PDF preserves quotes and holds without inferring confirmation from prose', async () => {
  const snapshot = sanitizeTripExportSnapshot({title:'State audit',start:'2030-01-01',end:'2030-01-03',stops:[{name:'Example City',checkIn:'2030-01-01',checkOut:'2030-01-03',nights:2}],bookings:['recommended','quoted','held'].map(status=>({kind:'stay',date:'2030-01-01',dateIso:'2030-01-01',endDate:'2030-01-03',status,title:'Title says confirmed',detail:'Prose is not confirmation authority'}))});
  const doc=await PDFDocument.load(await createTripPdf(snapshot,{theme:'light'}));
  let operators='';
  for(const page of doc.getPages()){const contents=page.node.Contents();const refs=contents instanceof PDFArray?contents.asArray():[contents];for(const ref of refs){const stream=doc.context.lookup(ref);if(stream instanceof PDFRawStream)operators+=Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1');}}
  for(const status of ['RECOMMENDED','QUOTED','HELD'])assert.ok(operators.toUpperCase().includes('<'+Buffer.from(status).toString('hex').toUpperCase()+'>'),status);
  assert.equal(operators.toUpperCase().includes('<'+Buffer.from('CONFIRMED').toString('hex').toUpperCase()+'>'),false);
});


test('PDF mode colors remain distinct from booking status and always draw colored travel glyphs', async () => {
  const expected = { flight: [96, 165, 250], train: [250, 204, 21], car: [192, 132, 252] };
  for (const [mode, values] of Object.entries(expected)) {
    const color = tripPdfModeColor(mode);
    assert.deepEqual([color.red, color.green, color.blue], values.map(value => value / 255));
  }
  assert.equal(tripPdfModeColor('hotel'), undefined);
  const snapshot = sanitizeTripExportSnapshot({ title: 'Invented mode colors', start: '2030-01-01', end: '2030-01-02',
    bookings: ['Flight', 'Train', 'Car'].map(kind => ({ kind, dateIso: '2030-01-01', title: `${kind} journey`, status: 'missing', detail: 'Needs review' })) });
  for (const scope of ['all', 'travel', 'transit']) {
    const pdf = await PDFDocument.load(await createTripPdf(snapshot, { theme: 'dark', scope }));
    const decoded = pdf.getPages().flatMap(page => {
      const contents = page.node.Contents();
      const refs = contents instanceof PDFArray ? contents.asArray() : [contents];
      return refs.map(ref => pdf.context.lookup(ref)).filter(stream => stream instanceof PDFRawStream).map(stream => new TextDecoder().decode(decodePDFRawStream(stream).decode()));
    }).join('\n');
    for (const mode of Object.keys(expected)) {
      const color = tripPdfModeColor(mode);
      assert.ok(decoded.includes(`${color.red} ${color.green} ${color.blue} RG`), `${scope} includes ${mode} glyph color even when missing`);
    }
  }
});
