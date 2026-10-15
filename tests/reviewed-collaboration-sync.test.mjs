import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, validateWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { createResearchLedger } from '../src/lib/research-ledger.ts';
import { createQuoteComparison, emptyTripQuote } from '../src/lib/trip-quote-comparison.ts';
import { genericCollaborationBoard } from '../src/lib/generic-collaboration.ts';
import { createBoardSyncBase, previewBoardSync, applyBoardSync } from '../src/lib/reviewed-collaboration-sync.ts';
const make = () => {
  const value = createWorkspace(createNormalizedTrip({ name: 'Coastal weekend', start: '2030-04-01', end: '2030-04-04', cities: ['Lisbon', 'Porto'], origins: ['AAA'], adults: 2, flexDays: 0, pace: 'balanced', themes: [] }));
  value.activities.push({ id: 'museum', placeId: value.trip.destinations[0].id, title: 'Museum visit', date: '2030-04-02', time: '10:00', durationMinutes: 90, notes: 'Bring water' });
  value.trip.bookings.push({ id: 'stay', kind: 'stay', status: 'recommended', startAt: '2030-04-01T15:00:00Z', endAt: '2030-04-04T10:00:00Z', provider: 'Example lodging' });
  value.bookingDetails = [{ bookingId: 'stay', label: 'Lodging idea', placeId: value.trip.destinations[0].id, notes: 'Review options' }];
  value.itemEvidence = [{ target: 'activity', targetId: 'museum', basis: 'manual', source: '', sourceUrl: '', checkedAt: '', summary: 'Hours unknown', unknowns: 'Check opening times' }];
  return value;
};
const preview = (value, base, incoming) => previewBoardSync(value, JSON.stringify(base), JSON.stringify(incoming));
const choose = review => Object.fromEntries(review.changes.map(change => [change.key, 'latest']));
test('unchanged projection is a lossless workspace round trip and base never contains bookings or evidence', () => {
  const value = make(), base = createBoardSyncBase(value), incoming = genericCollaborationBoard(value);
  assert.equal(JSON.stringify(base).includes('Example lodging'), false); assert.equal(JSON.stringify(base).includes('Hours unknown'), false);
  const review = preview(value, base, incoming); assert.equal(review.changes.length, 0);
  assert.deepEqual(applyBoardSync(value, review, {}), value);
});
test('three-way conflict decisions, moved day and changed notes preserve booking sidecars and stale evidence receipt', () => {
  const value = make(), base = createBoardSyncBase(value), incoming = genericCollaborationBoard(value);
  value.activities[0].title = 'Local title'; incoming.activities[0].title = 'Group title'; incoming.activities[0].notes = 'Check museum hours';
  incoming.days['2030-04-02'] = []; incoming.days['2030-04-03'] = ['museum'];
  const review = preview(value, base, incoming); assert.ok(review.changes.find(change => change.key.endsWith('/title')).conflict);
  assert.throws(() => applyBoardSync(value, review, {}), /Choose/);
  const result = applyBoardSync(value, review, choose(review));
  assert.equal(result.activities[0].title, 'Group title'); assert.equal(result.activities[0].time, '10:00'); assert.equal(result.activities[0].date, '2030-04-03'); assert.equal(result.activities[0].notes, 'Check museum hours');
  assert.deepEqual(result.trip.bookings, value.trip.bookings); assert.deepEqual(result.bookingDetails, value.bookingDetails);
  assert.deepEqual(result.itemEvidence, [{ ...value.itemEvidence[0], reviewRequired: true }]); assert.deepEqual(validateWorkspace(result), []);
});
test('deletion never orphans evidence and stale current workspace cannot accept an old review', () => {
  const value = make(), base = createBoardSyncBase(value), incoming = genericCollaborationBoard(value); incoming.activities = []; incoming.days['2030-04-02'] = [];
  const review = preview(value, base, incoming);
  assert.throws(() => applyBoardSync(value, review, choose(review)), /evidence receipt/);
  value.bookingDetails[0].notes = 'New local note'; assert.throws(() => applyBoardSync(value, review, choose(review)), /changed after preview/);
});
test('new ideas require explicit schedules and duration without assigning fabricated unknowns', () => {
  const value = make(), base = createBoardSyncBase(value), incoming = genericCollaborationBoard(value);
  incoming.activities.push({ id: 'walk', cityId: value.trip.destinations[0].id, title: 'Riverside walk', notes: 'Timing unknown' });
  const review = preview(value, base, incoming); assert.throws(() => applyBoardSync(value, review, choose(review)), /explicit day/);
  const result = applyBoardSync(value, review, choose(review), { walk: { date: '2030-04-03', time: '11:30', durationMinutes: 45 } });
  assert.equal(result.activities[1].time, '11:30'); assert.equal(result.activities[1].notes, 'Timing unknown'); assert.deepEqual(validateWorkspace(result), []);
});
test('incompatible trips, dates and city identities are blocked; capabilities and malicious nested fields rejected', () => {
  const value = make(), base = createBoardSyncBase(value), board = genericCollaborationBoard(value);
  for (const alter of [copy => { copy.bookings = []; }, copy => { copy.token = 'invented'; }, copy => { copy.activities[0].confirmation = 'invented'; }, copy => { copy.activities[0].notes = 'secret: invented'; }, copy => { copy.endDate = '2030-04-05'; }, copy => { copy.cities[0].id = 'other'; copy.activities[0].cityId = 'other'; }]) {
    const incoming = structuredClone(board); alter(incoming); assert.throws(() => preview(value, base, incoming));
  }
  assert.throws(() => preview(value, { ...base, tripId: 'different' }, board));
});
test('valid board proposals and server discussion are excluded from workspace data', () => {
  const value = make(), base = createBoardSyncBase(value), board = genericCollaborationBoard(value);
  board.suggestions = [{ id: 'suggestion', kind: 'day', activityId: 'museum', day: '2030-04-03', status: 'pending' }];
  board.interactions = { votes: [{ suggestionId: 'suggestion', actor: { id: 'access-example', role: 'editor' }, choice: 'support', updatedAt: '2030-01-01T00:00:00.000Z' }], comments: [] };
  const review = preview(value, base, board); assert.equal(review.changes.length, 0); assert.deepEqual(applyBoardSync(value, review, {}), value);
});
test('evidence-free deletions work and a local choice retains the complete local edit', () => {
  const value = make(); delete value.itemEvidence;
  const base = createBoardSyncBase(value), board = genericCollaborationBoard(value); board.activities = []; board.days['2030-04-02'] = [];
  const review = preview(value, base, board), result = applyBoardSync(value, review, choose(review)); assert.equal(result.activities.length, 0);
  assert.deepEqual(applyBoardSync(value, review, Object.fromEntries(review.changes.map(change => [change.key, 'local']))), value);
});

test('activity edits conserve route allocations, selected quotes, research, booking and evidence sidecars', () => {
  const value = make();
  value.researchEvidence = createResearchLedger(value.trip);
  value.researchEvidence.rows[0].notes = 'Award alternatives remain unsearched';
  value.quoteEvidence = createQuoteComparison(value.trip);
  const quote = emptyTripQuote(value.trip, 'option'); quote.label = 'Recorded flight option'; quote.source = 'Manual estimate'; quote.checkedAt = '2030-01-01T00:00:00Z';
  value.quoteEvidence.quotes.push(quote); value.budgetQuoteIds = ['option']; value.routeAllocations = [];
  assert.deepEqual(validateWorkspace(value), []);
  const base = createBoardSyncBase(value), board = genericCollaborationBoard(value); board.activities[0].durationMinutes = 100;
  const review = preview(value, base, board), result = applyBoardSync(value, review, choose(review));
  for (const key of ['researchEvidence', 'quoteEvidence', 'budgetQuoteIds', 'routeAllocations', 'bookingDetails']) assert.deepEqual(result[key], value[key]);
  assert.deepEqual(result.trip, value.trip); assert.deepEqual(validateWorkspace(result), []);
});

test('reviewed board edits preserve owner activity metadata outside the board projection', () => {
  const value = make(); value.activities[0].category = 'Culture'; value.activities[0].priority = 'must'; value.activities[0].coordinates = { lat: 38.7, lng: -9.1, source: 'Manual pin', checkedAt: '2030-01-01T00:00:00Z' };
  const base = createBoardSyncBase(value), board = genericCollaborationBoard(value); board.activities[0].title = 'Group museum idea';
  const review = preview(value, base, board), result = applyBoardSync(value, review, choose(review));
  assert.equal(result.activities[0].category, 'Culture'); assert.equal(result.activities[0].priority, 'must'); assert.deepEqual(result.activities[0].coordinates, value.activities[0].coordinates);
});
