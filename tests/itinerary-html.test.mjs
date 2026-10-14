import { createQuoteComparison, emptyTripQuote } from '../src/lib/trip-quote-comparison.ts';
import { createResearchLedger } from '../src/lib/research-ledger.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'acorn';
import { renderTripHtml, sanitizeTripExportSnapshot } from '../src/lib/trip-exports.ts';
import { renderTripHtmlCompact } from '../src/lib/trip-export-html.ts';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { renderGenericItineraryHtml, buildGenericTripExportSnapshot } from '../src/lib/generic-itinerary-html.ts';

const workspace = () => createWorkspace(createNormalizedTrip({ name: 'Invented island journey', start: '2030-01-01', end: '2030-01-04', cities: ['Bay City', 'Hill City'], origins: ['AAA'], adults: 2, pace: 'balanced', flexDays: 2, themes: ['art'] }));

test('generic day chapters carry recorded stay ranges and transport kinds without changing held states', () => {
  const value = workspace();
  value.trip.bookings.push({id:'invented-stay',kind:'stay',status:'held',provider:'Invented stay',startAt:'2030-01-01T15:00:00Z',endAt:'2030-01-03T10:00:00Z'});
  value.trip.bookings.push({id:'invented-car',kind:'car',status:'quoted',provider:'Invented airport transfer',startAt:'2030-01-02T10:00:00Z',endAt:'2030-01-02T11:00:00Z'});
  const snapshot=buildGenericTripExportSnapshot(value);
  assert.ok(snapshot.days[1].anchors.some(item=>item.kind==='stay'&&item.status==='held'));
  assert.ok(snapshot.days[1].anchors.some(item=>item.kind==='car'&&item.status==='quoted'));
  assert.equal(snapshot.days[3].anchors.length,0);
  const html=renderGenericItineraryHtml(value);
  assert.match(html,/2030-01-01 15:00:00 UTC/);
  assert.match(html,/travel-glyph mode-car/);
});

test('rich dossier exports assigned day activities, nested keyboard details and offline controls without executing data', () => {
  const attack = '</script><img src=x onerror="alert(1)">';
  const snapshot = sanitizeTripExportSnapshot({ title: attack, start: '2030-01-01', end: '2030-01-03', stops: [{ name: 'Bay City', country: 'Invented country', checkIn: '2030-01-01', checkOut: '2030-01-03', nights: 2 }], days: [{ date: '2030-01-01', dayNumber: 1, city: 'Bay City', theme: 'Art day', note: attack, anchors: [{ status: 'quoted', label: 'Quoted movement confirmed in title', detail: 'Needs verification' }], activities: [{ title: 'Assigned gallery', details: attack, category: 'Art', priority: 'must', image: 'javascript:alert(1)' }] }], catalogue: [{ city: 'Bay City', title: 'Alternative walk', priority: 'could' }] });
  const html = renderTripHtml(snapshot);
  for (const label of ['Assigned gallery', 'Alternative walk', 'Day by day', 'Invented country', 'itinerary-search', 'data-day open', 'Print / save PDF', 'prefers-reduced-motion', 'beforeprint', 'Photo unavailable']) assert.ok(html.includes(label), label);
  assert.equal((html.match(/<script>/g) || []).length, 1);
  assert.doesNotMatch(html, /<img src=x|src="javascript:|<script src=|fetch\(/);
  assert.match(html, /&lt;\/script&gt;&lt;img/);
  assert.match(html, />Quoted<\/span>/);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => parse(script, { ecmaVersion: 'latest' }));
});

test('generic visual export retains every day including unallocated and return days plus six exact booking states', () => {
  const value = workspace();
  value.days[0].placeId = value.trip.destinations[0].id;
  value.activities.push({ id: 'gallery', placeId: value.trip.destinations[0].id, date: '2030-01-01', time: '09:30', durationMinutes: 75, title: 'Invented gallery', notes: 'Opening hours unknown' });
  value.trip.routeCandidates = [{ id: 'route-a', label: 'Coastal route', status: 'recommended', placeOrder: value.trip.destinations.map(place => place.id), score: 0.7, scoreReasons: ['Fewer transfers'] }];
  value.selectedRouteId = 'route-a';
  for (const [index, status] of ['recommended', 'quoted', 'held', 'confirmed', 'missing', 'conflict'].entries()) value.trip.bookings.push({ id: `item-${index}`, kind: 'flight', status, startAt: '2030-01-01T10:00:00Z', endAt: '2030-01-01T12:00:00Z' });
  const html = renderGenericItineraryHtml(value);
  assert.equal((html.match(/class="day-chapter"/g) || []).length, 4);
  for (const label of ['Jan 4', '09:30', '75 minutes', 'Invented gallery', 'Days awaiting a destination', 'Coastal route', 'Fewer transfers']) assert.ok(html.includes(label), label);
  for (const status of ['recommended', 'quoted', 'held', 'confirmed', 'missing', 'conflict']) assert.ok(html.includes(`Recorded state: ${status}`), status);
  assert.doesNotMatch(html, /Berlin|Europe|images\.unsplash|<img/);
  assert.match(html, /No new provider verification was performed/);
});

test('generic export rejects private identifiers and unknown schema fields before rendering', () => {
  const value = workspace(); value.trip.name = 'person@example.test';
  assert.throws(() => renderGenericItineraryHtml(value), /blocked/);
  const other = workspace(); other.bookingDetails.push({ bookingId: 'unknown', label: 'Reservation', placeId: '', notes: 'PNR ABC123' });
  assert.throws(() => renderGenericItineraryHtml(other), /blocked/);
});

test('generic dossier conserves long planning windows rather than silently truncating at 62 days', () => {
  const trip = createNormalizedTrip({ name: 'Invented long journey', start: '2030-01-01', end: '2030-04-01', cities: ['Bay City'], origins: ['AAA'], adults: 1, pace: 'relaxed', flexDays: 0, themes: [] });
  const value = createWorkspace(trip), html = renderGenericItineraryHtml(value);
  assert.equal((html.match(/class="day-chapter"/g) || []).length, value.days.length);
  assert.ok(html.includes('Apr 1'));
});

test('compact companions preserve dates, full travel details, icons and booking states with scoped rows', () => {
  const snapshot = sanitizeTripExportSnapshot({ title: 'Invented journey', start: '2030-01-01', end: '2030-01-04', transport: [{ mode: 'train', date: '2030-01-02', from: 'Bay City', to: 'Hill City', name: 'Regional rail', ride: '2 hours', door: '3 hours', note: 'Transfer allowance unknown' }], bookings: [{ kind: 'Flight', dateIso: '2030-01-01', title: 'Airline route', status: 'quoted', detail: 'Cash quote requires recheck' }, { kind: 'Car rental', dateIso: '2030-01-03', title: 'Rental collection', status: 'held', detail: 'Expiry requires recheck' }], hotels: [{ city: 'Bay City', name: 'Invented stay', why: 'Central', tradeoff: 'Noise possible' }] });
  const all = renderTripHtmlCompact(snapshot);
  for (const mode of ['flight', 'train', 'car', 'stay']) assert.match(all, new RegExp(`class="travel-glyph mode-${mode}" aria-hidden="true"><svg`));
  for (const label of ['Jan 2', '3 hours', 'Transfer allowance unknown', 'Quoted', 'Held', 'Noise possible']) assert.ok(all.includes(label), label);
  const transit = renderTripHtmlCompact(snapshot, { scope: 'transit' });
  assert.ok(transit.includes('Regional rail')); assert.ok(transit.includes('Rental collection')); assert.ok(!transit.includes('Airline route')); assert.ok(!transit.includes('Invented stay'));
  const hotels = renderTripHtmlCompact(snapshot, { scope: 'hotels' });
  assert.ok(hotels.includes('Invented stay')); assert.ok(!hotels.includes('Regional rail'));
});

test('rich dossier keeps catalogue alternatives beyond selected route cities', () => {
  const snapshot = sanitizeTripExportSnapshot({ title:'Example route', start:'2030-01-01', end:'2030-01-03', stops:[{name:'Bay City',country:'',checkIn:'2030-01-01',checkOut:'2030-01-03',nights:2}], catalogue:[{city:'Bay City',title:'On-route gallery',priority:'must'},{city:'Side City',title:'Optional side trip',priority:'could'}] });
  const html = renderTripHtml(snapshot);
  assert.match(html, /Optional side trip/);
  assert.match(html, /Beyond the selected city stops/);
  assert.match(html, /<b>2<\/b> guide options/);
});


test('generic visual dossier includes validated quote and research sidecars', () => {
  const w = workspace(), quotes = createQuoteComparison(w.trip), research = createResearchLedger(w.trip);
  const quote = emptyTripQuote(w.trip, 'quote-example');
  Object.assign(quote, { label:'Recorded cash lead', cashAmount:150, taxesFees:25, source:'Invented manual estimate', unknowns:'Availability unverified', checkedAt:'2026-10-14T05:00:00.000Z' });
  quotes.quotes.push(quote);
  const html = renderGenericItineraryHtml(w, { quotes, research });
  assert.match(html, /Recorded cash lead/);
  assert.match(html, /Cash outlay: 175 USD/);
  assert.match(html, /Research ledger/);
  assert.match(html, /Availability unverified/);
  assert.match(html, /Travel mode: flight/);
  assert.match(html, /checked 2026-10-14 05:00:00.000 UTC/);
  Object.assign(quote, {kind:'hotel',mode:'stay',cityId:w.trip.destinations[0].id,rooms:2});
  const hotelHtml=renderGenericItineraryHtml(w,{quotes,research});
  assert.match(hotelHtml,/City: Bay City · Room scope: 2/);
  quote.label = 'API key: inventedExampleValue';
  assert.throws(() => renderGenericItineraryHtml(w, { quotes, research }));
});
