import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, validateWorkspace, workspaceKey } from '../src/lib/generic-trip-workspace.ts';
import { createResearchLedger, researchTripIdentity } from '../src/lib/research-ledger.ts';
import { createQuoteComparison, emptyTripQuote, quoteTripIdentity } from '../src/lib/trip-quote-comparison.ts';
import { previewWorkspaceScenario, acceptWorkspaceScenario } from '../src/lib/workspace-scenarios.ts';
const make = () => {
  const value = createWorkspace(createNormalizedTrip({ name: 'Coastal weekend', start: '2030-04-01', end: '2030-04-04', cities: ['Lisbon', 'Porto'], origins: ['AAA'], adults: 2, flexDays: 0, pace: 'balanced', themes: [] }));
  value.activities.push({ id: 'museum', placeId: value.trip.destinations[0].id, title: 'Museum visit', date: '2030-04-02', time: '10:00', durationMinutes: 90, notes: 'Hours unknown', category: 'Culture', priority: 'must', coordinates: {lat: 38.7, lng: -9.1, source: 'Manual pin', checkedAt: '2030-01-01T00:00:00Z'}, photo: {url: '/media/lisbon.webp', credit: 'Example photographer', sourceUrl: 'https://example.com/museum', checkedAt: '2030-01-01T00:00:00Z'} });
  value.trip.bookings.push({ id: 'stay', kind: 'stay', status: 'confirmed', startAt: '2030-04-01T15:00:00Z', endAt: '2030-04-04T10:00:00Z', provider: 'Invented lodging' });
  value.bookingDetails = [{ bookingId: 'stay', label: 'Recorded stay', placeId: value.trip.destinations[0].id, notes: '' }];
  value.bookingPlans = { version: 1, items: [{ kind: 'stay', bookingId: 'stay', placeId: value.trip.destinations[0].id, notes: 'Location remains a manual plan' }] };
  value.preparation = { version: 1, tasks: [{ id: 'packing', title: 'Pack walking shoes', category: 'packing', assignee: 'Navigator', done: false }], alternatives: [] };
  value.itemEvidence = [{ target: 'booking', targetId: 'stay', basis: 'manual', source: '', sourceUrl: '', checkedAt: '', summary: 'Original recorded state', unknowns: '' }, { target: 'activity', targetId: 'museum', basis: 'manual', source: '', sourceUrl: '', checkedAt: '', summary: 'Opening hours unknown', unknowns: 'Check hours' }];
  value.researchEvidence = createResearchLedger(value.trip); value.researchEvidence.rows[0].notes = 'No live provider query';
  value.quoteEvidence = createQuoteComparison(value.trip); const quote = emptyTripQuote(value.trip, 'quote'); quote.label = 'Manual flight estimate'; quote.source = 'Manual planning'; quote.checkedAt = '2030-01-01T00:00:00Z'; value.quoteEvidence.quotes.push(quote); value.budgetQuoteIds = ['quote']; value.routeAllocations = []; value.routeScenarios = {version:1,tripIdentity:quoteTripIdentity(value.trip),scenarios:[{id:'route-alternative',label:'Unresolved route option',routeId:'missing-route',direction:'round-trip',startDate:'2030-04-01',endDate:'2030-04-04',originGateway:'AAA',arrivalGateway:'',departureGateway:'',returnGateway:'AAA',ticketing:'unknown',connectionProtection:'unknown',protectionNotes:'',scopeNotes:'Schedule remains unknown',legs:[]}]};
  assert.deepEqual(validateWorkspace(value), []); return value;
};
test('scenario defaults to booking exclusion with visible omissions; all other fields and unknown metadata survive', () => {
  const value = make(), before = structuredClone(value), preview = previewWorkspaceScenario(value, 'Slower weekend', 'exclude', 'scenario-slower', '2030-02-01T00:00:00.000Z');
  const { workspace: next, receipt } = acceptWorkspaceScenario(value, preview);
  assert.notEqual(next.trip.id, value.trip.id); assert.notEqual(workspaceKey(next.trip), workspaceKey(value.trip)); assert.equal(next.trip.name, 'Slower weekend');
  assert.deepEqual(next.trip.bookings, []); assert.deepEqual(next.bookingDetails, []); assert.deepEqual(next.bookingPlans, { version: 1, items: [] }); assert.equal(next.itemEvidence.length, 1); assert.equal(next.itemEvidence[0].target, 'activity');
  assert.equal(receipt.omittedBookingCount, 1); assert.equal(receipt.omittedBookingDetailCount, 1); assert.equal(receipt.omittedBookingEvidenceCount, 1); assert.deepEqual(receipt.retainedBookingStates, []);
  for (const key of ['activities', 'days', 'places', 'routeAllocations', 'budgetQuoteIds', 'preparation']) assert.deepEqual(next[key], value[key]);
  assert.deepEqual(next.researchEvidence.rows, value.researchEvidence.rows); assert.deepEqual(next.quoteEvidence.quotes, value.quoteEvidence.quotes);
  assert.equal(next.researchEvidence.tripIdentity, researchTripIdentity(next.trip)); assert.equal(next.quoteEvidence.tripIdentity, quoteTripIdentity(next.trip)); assert.equal(next.routeScenarios.tripIdentity, quoteTripIdentity(next.trip)); assert.deepEqual(next.routeScenarios.scenarios, value.routeScenarios.scenarios);
  assert.deepEqual(value, before); assert.deepEqual(validateWorkspace(next), []); next.activities[0].notes = 'Edited copy'; assert.equal(value.activities[0].notes, 'Hours unknown');
});
test('retaining bookings is an explicit choice preserving exact original states without inventing confirmations', () => {
  const value = make(), preview = previewWorkspaceScenario(value, 'Alternative weekend', 'retain-existing', 'scenario-alternative');
  const next = acceptWorkspaceScenario(value, preview).workspace;
  assert.deepEqual(next.trip.bookings, value.trip.bookings); assert.deepEqual(next.bookingDetails, value.bookingDetails); assert.deepEqual(next.bookingPlans, value.bookingPlans); assert.deepEqual(next.preparation, value.preparation); assert.deepEqual(next.itemEvidence, value.itemEvidence);
  assert.deepEqual(preview.receipt.retainedBookingStates, [{id: 'stay', state: 'confirmed'}]); assert.equal(preview.receipt.kind, 'local-scenario-copy');
});
test('stale, forged and unsafe scenario previews cannot be accepted', () => {
  const value = make(), preview = previewWorkspaceScenario(value, 'Alternative weekend', 'exclude', 'scenario-alternative');
  const changed = structuredClone(value); changed.activities[0].title = 'New edit'; assert.throws(() => acceptWorkspaceScenario(changed, preview), /changed after preview/);
  const forged = structuredClone(preview); forged.workspace.trip.bookings = value.trip.bookings; assert.throws(() => acceptWorkspaceScenario(value, forged), /preview changed/);
  for (const name of ['', value.trip.name, 'API key: invented', 'Contact traveler@example.test']) assert.throws(() => previewWorkspaceScenario(value, name));
  const wrong = structuredClone(value); wrong.quoteEvidence.tripIdentity = 'other'; assert.throws(() => previewWorkspaceScenario(wrong, 'New scenario'));
  assert.throws(() => previewWorkspaceScenario(value, 'New scenario', 'exclude', value.trip.id));
});
