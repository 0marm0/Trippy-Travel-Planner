import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createQuoteComparison, emptyTripQuote } from '../src/lib/trip-quote-comparison.ts';
import { buildTripBudget } from '../src/lib/trip-budget.ts';

const now = Date.parse('2030-03-30T12:00:00Z');
const trip = () => createNormalizedTrip({ name: 'Invented budget trip', start: '2030-04-01', end: '2030-04-08', cities: ['Invented Harbor'], origins: ['AAA'], adults: 2, pace: 'balanced', flexDays: 0, themes: [] });
const quote = (id, overrides = {}) => ({ ...emptyTripQuote(trip(), id), label: `Recorded option ${id}`, from: 'AAA', to: 'BBB', startDate: '2030-04-01', endDate: '2030-04-01', cabin: 'Economy', baggage: 'One bag per traveler', cancellation: 'Refundable', cashAmount: 100, taxesFees: 20, source: 'Manual estimate', checkedAt: '2030-03-30T10:00:00Z', ...overrides });
const data = quotes => ({ ...createQuoteComparison(trip()), quotes });
const summary = (quotes, selectedIds) => buildTripBudget(trip(), data(quotes), selectedIds, now);
const hotel = (id, overrides = {}) => quote(id, { kind: 'hotel', mode: 'stay', cityId: trip().destinations[0].id, startDate: '2030-04-01', endDate: '2030-04-04', cabin: 'Double room', baggage: 'Breakfast included', ...overrides });
const award = (id, overrides = {}) => quote(id, { kind: 'award', sourceProgram: 'Invented bank points', destinationProgram: 'Invented airline points', transferTerms: 'Entered transfer basis; verify timing', sourcePoints: 10000, destinationPoints: 10000, transferRatio: 1, minimumTransfer: 0, transferIncrement: 1, pointValuation: 0.01, cashAmount: 0, taxesFees: 30, ...overrides });

test('only explicitly selected quotes count; whole-party and room totals are never multiplied', () => {
  const quotes = [quote('flight'), hotel('stay', { rooms: 2, cashAmount: 600, taxesFees: 60 }), quote('alternative', { cashAmount: 999 })];
  const result = summary(quotes, ['flight', 'stay']);
  assert.equal(result.selected.length, 2);
  assert.equal(result.currencies[0].knownCashOutlay, 780);
  assert.equal(result.currencies[0].knownCashEquivalent, 780);
  assert.equal(summary(quotes, []).currencies.length, 0);
});

test('mixed currencies remain independent and no FX or grand total is inferred', () => {
  const result = summary([quote('dollar'), quote('euro', { currency: 'EUR', cashAmount: 200 })], ['dollar', 'euro']);
  assert.deepEqual(result.currencies.map(row => [row.currency, row.knownCashOutlay]), [['EUR', 220], ['USD', 120]]);
  assert.equal('total' in result, false);
});

test('unknown taxes exclude incomplete outlays and equivalents while retaining their unknown counts', () => {
  const result = summary([quote('known'), quote('unknown-tax', { cashAmount: 300, taxesFees: null })], ['known', 'unknown-tax']);
  assert.equal(result.currencies[0].knownCashOutlay, 120);
  assert.equal(result.currencies[0].unknownCashCount, 1);
  assert.equal(result.currencies[0].knownCashEquivalent, 120);
  assert.equal(result.currencies[0].unknownEquivalentCount, 1);
  assert.equal(result.selected[1].quote.cashAmount, 300, 'known base remains visible in the row');
});

test('duplicate IDs count once and unavailable selections stay disclosed', () => {
  const result = summary([quote('flight')], ['flight', 'flight', 'removed-quote']);
  assert.equal(result.currencies[0].knownCashOutlay, 120);
  assert.equal(result.duplicateSelectionCount, 1);
  assert.equal(result.unknownSelectionCount, 1);
  assert.equal(result.selected.length, 1);
});

test('overlapping alternatives warn without silently choosing or removing a quote', () => {
  const result = summary([hotel('stay-a'), hotel('stay-b', { startDate: '2030-04-03', endDate: '2030-04-05' }), quote('flight-a'), quote('flight-b', { mode: 'rail' })], ['stay-a', 'stay-b', 'flight-a', 'flight-b']);
  assert.deepEqual(result.overlaps.map(item => item.kind).sort(), ['stay', 'transport']);
  assert.equal(result.selected.length, 4);
  assert.equal(result.currencies[0].knownCashOutlay, 480, 'explicit selections remain arithmetic, pending overlap review');
  const checkout = summary([hotel('first'), hotel('second', { startDate: '2030-04-04', endDate: '2030-04-07' })], ['first', 'second']);
  assert.equal(checkout.overlaps.length, 0, 'a checkout and next check-in share no stay night');
});

test('award cash, points valuation and unknown equivalents remain separate', () => {
  const result = summary([award('valued'), award('unvalued', { pointValuation: null }), award('unknown-spend', { sourcePoints: null, destinationPoints: null, transferRatio: null })], ['valued', 'unvalued', 'unknown-spend']);
  assert.equal(result.currencies[0].knownCashOutlay, 90);
  assert.equal(result.currencies[0].knownPointsValue, 100);
  assert.equal(result.currencies[0].unknownPointsValueCount, 2);
  assert.equal(result.currencies[0].knownCashEquivalent, 130);
  assert.equal(result.currencies[0].unknownEquivalentCount, 2);
  assert.equal(result.pointsPrograms[0].points, 20000);
  assert.equal(result.unknownPointsCount, 1);
});

test('point programs are not merged and unknown program spend is excluded from program subtotals', () => {
  const result = summary([award('bank-a'), award('bank-b', { sourceProgram: 'Different bank points', sourcePoints: 12000 }), award('unassigned', { sourceProgram: '' })], ['bank-a', 'bank-b', 'unassigned']);
  assert.equal(result.pointsPrograms.length, 2);
  assert.equal(result.pointsPrograms.reduce((sum, row) => sum + row.points, 0), 22000);
  assert.equal(result.unknownPointsProgramCount, 1);
});

test('source freshness, unresolved terms and party mismatches are review requirements', () => {
  const result = summary([quote('stale', { checkedAt: '2030-03-28T10:00:00Z', occupants: 1 }), quote('undated', { checkedAt: '', cancellation: '' }), quote('future', { checkedAt: '2030-03-31T10:00:00Z' })], ['stale', 'undated', 'future']);
  assert.equal(result.staleOrUndatedCount, 3);
  assert.equal(result.unresolvedTermsCount, 1);
  assert.equal(result.partyMismatchCount, 1);
  assert.match(result.selected[0].freshness, /older than 24 hours/);
  assert.equal(result.currencies[0].knownCashOutlay, 360, 'recorded arithmetic does not invent availability or multiply a mismatched party');
});

test('foreign-trip, private-shaped and duplicate quote evidence fails closed before budgeting', () => {
  const other = trip(); other.travelers.adults = 3;
  assert.throws(() => buildTripBudget(other, data([quote('flight')]), ['flight'], now));
  assert.throws(() => summary([quote('flight', { source: 'person@example.test' })], ['flight']));
  assert.throws(() => summary([quote('flight'), quote('flight')], ['flight']));
  assert.throws(() => summary([quote('flight')], ['invalid selection']));
});
