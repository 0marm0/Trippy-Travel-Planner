import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, validateWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { createQuoteComparison, emptyTripQuote } from '../src/lib/trip-quote-comparison.ts';
import { buildCanonicalAtlas, canonicalAtlasIdentity } from '../src/lib/canonical-atlas.ts';
import { applyAuthoritative2026Corrections } from '../src/lib/authoritative-trip-corrections.ts';

const invented = (name = 'Invented island trip', start = '2030-05-01', end = '2030-05-06', cities = ['Invented Harbor', 'Invented Hill']) => createWorkspace(createNormalizedTrip({ name, start, end, cities, origins: ['AAA'], adults: 2, pace: 'balanced', flexDays: 0, themes: [] }));

test('two unrelated invented trips adapt without sample IDs, dates, cities or photos', () => {
  const first = invented();
  const second = invented('Invented desert break', '2031-11-03', '2031-11-08', ['Invented Oasis']); second.trip.travelers.adults = 4;
  for (const workspace of [first, second]) {
    const atlas = buildCanonicalAtlas(workspace);
    assert.equal(atlas.version, 1);
    assert.equal(atlas.kind, 'canonical-atlas');
    assert.deepEqual(atlas.workspace, workspace);
    assert.deepEqual(atlas.places.map(place => place.name), workspace.trip.destinations.map(place => place.name));
    assert.equal(atlas.days[0].date, workspace.trip.dateWindow.earliestDeparture);
    assert.ok(atlas.places.every(place => place.coordinates === null));
    assert.ok(atlas.days.every(day => day.placeId === null));
    assert.doesNotMatch(JSON.stringify(atlas), /europe-2026|2026-09|Nürburgring|Amsterdam|Berlin|Munich|guide-images/);
  }
  assert.notEqual(first.trip.id, second.trip.id);
  assert.notEqual(buildCanonicalAtlas(first).identity, buildCanonicalAtlas(second).identity);
});

test('empty and partially allocated workspaces retain list days and genuinely unknown stays/geography', () => {
  const workspace = invented();
  const city = workspace.trip.destinations[0].id;
  workspace.days[0].placeId = city;
  workspace.days[2].placeId = city;
  workspace.places = [{ placeId: city, lat: 0, lng: 0 }];
  const atlas = buildCanonicalAtlas(workspace);
  assert.deepEqual(atlas.places[0].coordinates, { lat: 0, lng: 0 }, 'explicit zero coordinates are valid, never treated as false');
  assert.deepEqual(atlas.places[0].assignedDates, ['2030-05-01', '2030-05-03']);
  assert.equal('checkIn' in atlas.places[0], false, 'noncontiguous planning days do not become hotel dates');
  assert.equal('nights' in atlas.places[0], false);
  assert.equal(atlas.places[1].coordinates, null);
  assert.equal(atlas.days[1].placeId, null);
  assert.equal(atlas.activities.length, 0);
  assert.equal(atlas.bookings.length, 0);
  assert.ok(atlas.unknowns.some(line => /no assigned destination/.test(line)));
});

test('canonical booking states, timestamps and receipts survive exactly without inferred confirmation', () => {
  const workspace = invented();
  const city = workspace.trip.destinations[0].id;
  const statuses = ['recommended', 'quoted', 'held', 'confirmed', 'missing', 'conflict'];
  workspace.trip.bookings = statuses.map((status, index) => ({ id: `stay-${index}`, kind: 'stay', status, startAt: '2030-05-01T14:00:00Z', endAt: '2030-05-02T10:00:00Z', provider: 'Invented hotel' }));
  workspace.bookingDetails = [{ bookingId: 'stay-1', placeId: city, label: 'Quoted room', notes: 'Final taxes unknown' }];
  workspace.itemEvidence = [{ target: 'booking', targetId: 'stay-1', basis: 'quote', source: 'Entered comparison', sourceUrl: 'https://www.booking.com/', checkedAt: '2030-04-30T12:00:00Z', summary: 'Recorded room quote', unknowns: 'Final taxes and availability unknown', reviewRequired: true }];
  const atlas = buildCanonicalAtlas(workspace);
  assert.deepEqual(atlas.bookings.map(record => record.status), statuses);
  assert.deepEqual(atlas.bookings[1].evidence, workspace.itemEvidence[0]);
  assert.equal(atlas.bookings[1].detail.notes, 'Final taxes unknown');
  assert.equal(atlas.bookings[0].detail, null);
  assert.equal(atlas.bookings[0].evidence, null);
  assert.equal('price' in atlas.bookings[1], false);
});

test('activities retain exact schedule, unknown priority/photo/location and conflicts; adapter is lossless and detached', () => {
  const workspace = invented();
  const city = workspace.trip.destinations[0].id;
  workspace.days[0].placeId = city;
  workspace.activities = [{ id: 'museum', placeId: city, title: 'Museum visit', date: '2030-05-01', time: '09:00', durationMinutes: 120, notes: 'Check opening hours' }, { id: 'walk', placeId: city, title: 'River walk', date: '2030-05-01', time: '10:00', durationMinutes: 60, notes: '' }];
  const before = structuredClone(workspace);
  const atlas = buildCanonicalAtlas(workspace);
  assert.deepEqual(atlas.days[0].activityIds, ['museum', 'walk']);
  assert.equal(atlas.days[0].conflicts.length, 1);
  assert.equal(atlas.activities[0].durationMinutes, 120);
  assert.equal(atlas.activities[0].priority, null);
  assert.equal(atlas.activities[0].photo, null);
  assert.equal(atlas.activities[0].status, null);
  assert.equal('lat' in atlas.activities[0], false);
  assert.deepEqual(workspace, before);
  atlas.workspace.activities[0].title = 'Changed detached preview';
  assert.equal(workspace.activities[0].title, 'Museum visit');
});

test('quote unknowns and full research sidecars remain source data, never implicit bookings', () => {
  const workspace = invented();
  workspace.quoteEvidence = { ...createQuoteComparison(workspace.trip), quotes: [{ ...emptyTripQuote(workspace.trip, 'hotel-quote'), label: 'Hotel estimate', kind: 'hotel', mode: 'stay', cityId: workspace.trip.destinations[0].id, source: 'Manual estimate', cashAmount: null, taxesFees: null, unknowns: 'Availability and full price not recorded' }] };
  const atlas = buildCanonicalAtlas(workspace);
  assert.deepEqual(atlas.workspace.quoteEvidence, workspace.quoteEvidence);
  assert.equal(atlas.workspace.quoteEvidence.quotes[0].cashAmount, null);
  assert.equal(atlas.bookings.length, 0);
});

test('identity includes trip/date frame and traveler basis without using the sample storage key', () => {
  const first = invented();
  const dateVersion = invented(); dateVersion.trip.dateWindow.flexDays = 3;
  const partyVersion = invented(); partyVersion.trip.travelers.childrenAges = [8];
  assert.notEqual(canonicalAtlasIdentity(first), canonicalAtlasIdentity(dateVersion));
  assert.notEqual(canonicalAtlasIdentity(first), canonicalAtlasIdentity(partyVersion));
  assert.match(canonicalAtlasIdentity(first), /^trippy\.canonical-atlas\.v1:/);
  assert.doesNotMatch(canonicalAtlasIdentity(first), /trippy\.europe-2026/);
});

test('invalid/private-shaped workspace fails before a canonical preview can be constructed', () => {
  const workspace = invented(); workspace.activities = [{ id: 'invalid', placeId: 'absent', title: 'Unknown place', date: '2030-05-01', time: '09:00', durationMinutes: 30, notes: '' }];
  assert.ok(validateWorkspace(workspace).length);
  assert.throws(() => buildCanonicalAtlas(workspace));
  const privateShaped = invented(); privateShaped.trip.name = 'Traveler person@example.test';
  assert.throws(() => buildCanonicalAtlas(privateShaped), error => !error.message.includes('person@example.test'));
});

test('reviewed public sample remains unchanged and its historical correction path stays independent', async () => {
  const file = new URL('../examples/trips/2026-europe-sample.json', import.meta.url);
  const bytes = await readFile(file, 'utf8');
  const sample = JSON.parse(bytes);
  const sampleBefore = structuredClone(sample);
  const correctedBefore = applyAuthoritative2026Corrections(sample);
  buildCanonicalAtlas(invented());
  const correctedAfter = applyAuthoritative2026Corrections(sample);
  assert.deepEqual(sample, sampleBefore);
  assert.deepEqual(correctedAfter, correctedBefore);
  assert.equal(await readFile(file, 'utf8'), bytes);
});

test('optional arbitrary-trip metadata survives canonical adaptation and complete editable records', async () => {
  const { exportWorkspace, parseWorkspaceImport, saveWorkspace, loadWorkspace } = await import('../src/lib/generic-trip-workspace.ts');
  const workspace = invented();
  workspace.activities = [{ id:'harbor-walk',placeId:workspace.trip.destinations[0].id,title:'Harbor walk',date:'2030-05-01',time:'10:30',durationMinutes:45,notes:'Check accessible route',category:'Walk',priority:'could',coordinates:{lat:0,lng:0,source:'Manual entry',checkedAt:'2030-04-01T12:00:00Z'},photo:{url:'/media/synthetic-harbor.webp',credit:'Invented artist',sourceUrl:'https://example.com/harbor',checkedAt:'2030-04-01T12:00:00Z'}}];
  assert.deepEqual(validateWorkspace(workspace),[]);
  const atlas=buildCanonicalAtlas(workspace);
  assert.deepEqual(atlas.activities[0].photo,workspace.activities[0].photo);
  assert.deepEqual(atlas.activities[0].coordinates,workspace.activities[0].coordinates);
  assert.equal(atlas.activities[0].priority,'could');
  assert.equal(atlas.activities[0].category,'Walk');
  assert.equal(atlas.activities[0].status,null);
  assert.deepEqual(JSON.parse(exportWorkspace(workspace).itinerary).activities,workspace.activities);
  assert.deepEqual(parseWorkspaceImport(JSON.stringify(workspace)),workspace);
  const values=new Map();const store={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  saveWorkspace(store,workspace);assert.deepEqual(loadWorkspace(store,workspace.trip),workspace);
});

test('metadata rejects unknown fields, private text, incomplete pins and unsafe photos without echoing values', () => {
  const base=invented();base.activities=[{id:'walk',placeId:base.trip.destinations[0].id,title:'Walk',date:'2030-05-01',time:'09:00',durationMinutes:45,notes:''}];
  const validPhoto={url:'https://images.unsplash.com/photo-invented',credit:'Invented artist',sourceUrl:'https://example.com/photo',checkedAt:'2030-04-01T12:00:00Z'};
  const cases=[{priority:'unknown'},{priority:null},{category:''},{category:'person@example.test'},{coordinates:{lat:0,lng:0}},{coordinates:{lat:91,lng:0,source:'Manual entry',checkedAt:'2030-04-01T12:00:00Z'}},{coordinates:{lat:0,lng:0,source:'',checkedAt:'2030-04-01T12:00:00Z'}},{coordinates:{lat:0,lng:0,source:'Manual entry',checkedAt:'2030-02-30T12:00:00Z'}},{photo:{...validPhoto,url:'https://images.unsplash.com/photo?token=hidden'}},{photo:{...validPhoto,url:'https://other.example/photo'}},{photo:{...validPhoto,credit:'person@example.test'}},{photo:{...validPhoto,url:['https://','user:pass','@','images.unsplash.com/photo'].join('')}},{photo:{...validPhoto,sourceUrl:'https://mail.google.com/mail/'}},{photo:{...validPhoto,url:'/media/../private.webp'}},{photo:{...validPhoto,checkedAt:''}},{photo:{...validPhoto,license:'invented'}},{unsupported:'field'}];
  for(const metadata of cases){const workspace=structuredClone(base);Object.assign(workspace.activities[0],metadata);assert.ok(validateWorkspace(workspace).length,JSON.stringify(Object.keys(metadata)));assert.throws(()=>buildCanonicalAtlas(workspace));}
  const safe=structuredClone(base);safe.activities[0].photo=validPhoto;assert.deepEqual(validateWorkspace(safe),[]);
});

test('editing a sourced activity marks its receipt stale and deleting activity plus receipt remains valid', async () => {
  const {reconcileItemEvidence}=await import('../src/lib/generic-trip-workspace.ts');
  const workspace=invented();workspace.activities=[{id:'walk',placeId:workspace.trip.destinations[0].id,title:'Walk',date:'2030-05-01',time:'09:00',durationMinutes:45,notes:''}];
  workspace.itemEvidence=[{target:'activity',targetId:'walk',basis:'manual',source:'Manual notes',sourceUrl:'',checkedAt:'',summary:'Planning choice',unknowns:'Opening hours unknown'}];
  const next=structuredClone(workspace);next.activities[0].date='2030-05-02';
  const reviewed=reconcileItemEvidence(workspace,next);assert.equal(reviewed.itemEvidence[0].reviewRequired,true);assert.equal(reviewed.itemEvidence[0].summary,'Planning choice');assert.deepEqual(validateWorkspace(reviewed),[]);
  const removed={...reviewed,activities:[],itemEvidence:[]};assert.deepEqual(validateWorkspace(removed),[]);assert.equal(workspace.activities.length,1);
});
