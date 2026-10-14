import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeProviderControls, buildProviderSearchRequest, sortProviderResults } from '../src/lib/provider-search-controls.ts';

const controls = () => initializeProviderControls({ origin: 'JFK', destination: 'LHR', date: '2027-04-03', endDate: '2027-04-08', profile: { adults: 3, rooms: 2, cabin: 'business', currency: 'GBP', childrenAges: [] } });

test('profile initializes supported facts and preserves unknown seat/program/cabin fields', () => {
  const seeded = controls();
  assert.equal(seeded.adults, '3'); assert.equal(seeded.rooms, '2'); assert.equal(seeded.currency, 'GBP');
  assert.equal(seeded.seats, ''); assert.equal(seeded.program, '');
  const unknown = initializeProviderControls();
  for (const field of ['origin', 'destination', 'date', 'endDate', 'adults', 'rooms', 'cabin', 'currency', 'seats', 'program']) assert.equal(unknown[field], '');
  assert.throws(() => buildProviderSearchRequest('cash-flights', unknown));
});

test('cash flight request preserves explicit party cabin date currency with no implicit return trip', () => {
  assert.deepEqual(buildProviderSearchRequest('cash-flights', controls()), { kind: 'cash-flight', origin: 'JFK', destination: 'LHR', departureDate: '2027-04-03', adults: 3, cabin: 'business', currency: 'GBP' });
});

test('cash stays preserve actual stay range and property query occupancy and room basis', () => {
  assert.deepEqual(buildProviderSearchRequest('hotels', { ...controls(), query: 'London West End' }), { kind: 'hotel', destination: 'London West End', checkIn: '2027-04-03', checkOut: '2027-04-08', adults: 3, rooms: 2, currency: 'GBP' });
  assert.throws(() => buildProviderSearchRequest('hotels', { ...controls(), endDate: '' }));
  assert.throws(() => buildProviderSearchRequest('hotels', { ...controls(), endDate: '2027-04-02' }));
});

test('award flight requires independent explicit seats and program instead of any or assumed adult seat count', () => {
  assert.throws(() => buildProviderSearchRequest('award-seats', controls()));
  assert.deepEqual(buildProviderSearchRequest('award-seats', { ...controls(), seats: '4', program: 'aeroplan' }), { kind: 'award-flight', origin: 'JFK', destination: 'LHR', departureDate: '2027-04-03', seats: 4, program: 'aeroplan' });
});

test('award hotel search preserves arrival window and requested nights without sending unsupported guests or currency', () => {
  assert.deepEqual(buildProviderSearchRequest('award-hotels', { ...controls(), query: 'London', nights: '3', program: 'hyatt' }), { kind: 'award-hotel', location: 'London', startDate: '2027-04-03', endDate: '2027-04-08', nights: 3, program: 'hyatt' });
  assert.throws(() => buildProviderSearchRequest('award-hotels', { ...controls(), nights: '6' }));
});

const row = (id, amount, durationMinutes, currency = 'GBP', unit = 'total') => ({ id, ...(amount === undefined ? {} : { price: { amount, currency, unit } }), ...(durationMinutes === undefined ? {} : { durationMinutes }) });
const ids = rows => rows.map(row => row.id);
test('price sorts comparable returned evidence and leaves unknown or other currency after it', () => {
  const rows = [row('unknown'), row('usd', 1, 5, 'USD'), row('costly', 300, 60), row('cheap', 100, 120), row('unknown-unit', 0, 3, 'GBP', 'unknown')];
  assert.deepEqual(ids(sortProviderResults(rows, 'price', 'GBP')), ['cheap', 'costly', 'unknown', 'usd', 'unknown-unit']);
  assert.equal(rows[0].id, 'unknown');
});

test('mixed known units cannot silently rank nightly prices against full totals', () => {
  const rows = [row('total', 400, undefined), row('night', 50, undefined, 'GBP', 'night')];
  assert.deepEqual(ids(sortProviderResults(rows, 'price', 'GBP')), ['total', 'night']);
});

test('time and balanced ordering use actual available fields; missing values are never zero cost/time', () => {
  const rows = [row('unknown'), row('slow', 100, 300), row('fast', 110, 60), row('middle', 105, 120)];
  assert.deepEqual(ids(sortProviderResults(rows, 'time', 'GBP')), ['fast', 'middle', 'slow', 'unknown']);
  assert.deepEqual(ids(sortProviderResults(rows, 'balanced', 'GBP')), ['middle', 'slow', 'fast', 'unknown']);
  const noTimes = [row('unknown'), row('expensive', 200), row('cheap', 100)];
  assert.deepEqual(ids(sortProviderResults(noTimes, 'balanced', 'GBP')), ['cheap', 'expensive', 'unknown']);
  assert.deepEqual(ids(sortProviderResults([{ id: 'points-one', points: 10000 }, { id: 'points-two', points: 100 }], 'price', 'GBP')), ['points-one', 'points-two']);
});
