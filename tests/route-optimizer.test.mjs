import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizeRoutes } from '../src/lib/optimization/route-optimizer.ts';

const input = {
  stops: [
    { id: 'a', name: 'Alpha', lat: 50, lng: 4, minNights: 2, maxNights: 2 },
    { id: 'b', name: 'Bravo', lat: 51, lng: 7, minNights: 2, maxNights: 4 },
    { id: 'c', name: 'Charlie', lat: 52, lng: 13, minNights: 3, maxNights: 3 },
  ],
  startId: 'a',
  endId: 'c',
  legs: [
    { id: 'ab-train', from: 'a', to: 'b', mode: 'train', cash: 50, durationHours: 2, transfers: 0, reliability: .9, carbonKg: 8, checkedAt: '2026-09-14T00:00:00Z' },
    { id: 'bc-train', from: 'b', to: 'c', mode: 'train', cash: 80, durationHours: 4, transfers: 0, reliability: .88, carbonKg: 14, checkedAt: '2026-09-14T00:00:00Z' },
    { id: 'ac-flight', from: 'a', to: 'c', mode: 'flight', cash: 180, durationHours: 1.5, transfers: 0, reliability: .75, carbonKg: 140, checkedAt: '2026-09-14T00:00:00Z' },
  ],
};

test('route optimization respects fixed endpoints and returns explainable totals', () => {
  const [route] = optimizeRoutes(input);
  assert.deepEqual(route.orderedStops.map((stop) => stop.id), ['a', 'b', 'c']);
  assert.equal(route.totals.cash, 130);
  assert.equal(route.totals.nights, 8);
  assert.equal(route.missingLegs.length, 0);
  assert.equal(route.confidence, 'high');
  assert.ok(route.explanation.every(Boolean));
});

test('route optimization marks incomplete provider coverage instead of inventing a fare', () => {
  const [route] = optimizeRoutes({ ...input, legs: input.legs.filter((leg) => leg.id !== 'bc-train') });
  assert.equal(route.missingLegs.length, 1);
  assert.match(route.explanation.join(' '), /needs live or manual pricing/i);
  assert.notEqual(route.confidence, 'high');
});

test('route optimization rejects malformed or oversized inputs', () => {
  assert.throws(() => optimizeRoutes({ stops: [{ id: 'x', name: 'X', lat: 0, lng: 0 }], legs: [] }), /between 2 and 9/);
  assert.throws(() => optimizeRoutes({ ...input, stops: [...input.stops, { ...input.stops[0] }] }), /unique/);
  assert.throws(() => optimizeRoutes({ ...input, legs: [{ ...input.legs[0], cash: -1 }] }), /invalid/);
});

test('mode filtering is explicit and does not claim hidden coverage', () => {
  const [route] = optimizeRoutes({ ...input, allowedModes: ['flight'] });
  assert.ok(route.missingLegs.length >= 1);
  assert.ok(route.selectedLegs.every((leg) => leg.mode === 'flight'));
});
