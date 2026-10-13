import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdtemp, mkdir, symlink, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createNormalizedTrip, validateNormalizedTrip, agentTripBrief } from '../src/lib/normalized-trip.ts';

const create = () => createNormalizedTrip({ name: 'Japan spring', start: '2027-04-01', end: '2027-04-12', cities: ['Tokyo', 'Kyoto'], origins: ['IAD', 'DCA'], adults: 2, pace: 'balanced', flexDays: 2, themes: ['food', 'art'] });
test('arbitrary cities/dates validate against the actual shared schema', async () => {
  assert.deepEqual(validateNormalizedTrip(create()), []);
  assert.deepEqual(validateNormalizedTrip(JSON.parse(await readFile('examples/trips/sample-city-break.json', 'utf8'))), []);
});
test('invalid dates, unknown keys and relational contradictions fail without leaking values', () => {
  for (const change of [
    (trip) => { trip.dateWindow.earliestDeparture = '2027-02-30'; },
    (trip) => { trip.dateWindow.latestReturn = '2027-03-01'; },
    (trip) => { trip.secret = 'not-a-real-secret'; },
    (trip) => { trip.destinations[1].id = trip.destinations[0].id; },
    (trip) => { trip.anchors.push({ id: 'event', date: '2027-04-02', label: 'Event', placeId: 'unknown', locked: true }); },
    (trip) => { trip.destinations[0].minimumNights = 30; },
    (trip) => { trip.routeCandidates.push({ id: 'route-a', label: 'A', status: 'recommended', placeOrder: ['unknown'] }); },
  ]) { const trip = create(); change(trip); assert.ok(validateNormalizedTrip(trip).length); }
  const trip = create(); trip.name = 'person@example.com';
  const errors = validateNormalizedTrip(trip);
  assert.ok(errors.length); assert.ok(errors.every((error) => !error.includes('person@example.com')));
});
test('booking states do not infer confirmation and private references are rejected', () => {
  const trip = create();
  trip.bookings.push({ id: 'stay', kind: 'stay', status: 'quoted', startAt: '2027-04-01T15:00:00+09:00', endAt: '2027-04-03T11:00:00+09:00' });
  assert.deepEqual(validateNormalizedTrip(trip), []);
  trip.bookings[0].status = 'booked'; assert.ok(validateNormalizedTrip(trip).length);
  trip.bookings[0].status = 'quoted'; trip.bookings[0].confirmationRef = 'FAKE123'; assert.ok(validateNormalizedTrip(trip).length);
});
test('agent brief carries constraints, reactive questions and consent boundary', () => {
  const brief = agentTripBrief(create());
  for (const value of ['Tokyo', 'Kyoto', '2027-04-01', 'three materially different', 'BEFORE price research', 'budget/cabin', 'passport', '.env.local', 'not authorized']) assert.ok(brief.includes(value));
});

test('private trip initializer rejects symlink escapes and never overwrites', async () => {
  const root = await mkdtemp(join(tmpdir(), 'trippy-init-test-'));
  try {
    await mkdir(join(root, '.private/trips'), { recursive: true });
    await mkdir(join(root, 'public'));
    await symlink(join(root, 'public'), join(root, '.private/trips/escape'));
    const args = ['--experimental-strip-types', resolve('scripts/init-trip.mjs'), '--name', 'Test', '--start', '2027-04-01', '--end', '2027-04-10', '--cities', 'Tokyo,Kyoto', '--origins', 'IAD'];
    const escape = spawnSync(process.execPath, [...args, '--output', '.private/trips/escape/trip.json'], { cwd: root });
    assert.notEqual(escape.status, 0);
    await assert.rejects(access(join(root, 'public/trip.json')));
    assert.equal(spawnSync(process.execPath, args, { cwd: root }).status, 0);
    assert.notEqual(spawnSync(process.execPath, args, { cwd: root }).status, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('private dictionary keys and Bearer-shaped text fail without leaking keys', () => {
  const trip = create(); trip.preferences.pointValuations = {'traveler@example.test': 0.02};
  let errors = validateNormalizedTrip(trip);
  assert.ok(errors.length); assert.ok(errors.every((value) => !value.includes('traveler@example.test')));
  trip.preferences.pointValuations = {'traveler@example.test': 'not-a-number'};
  errors = validateNormalizedTrip(trip);
  assert.ok(errors.length); assert.ok(errors.every((value) => !value.includes('traveler@example.test')));
  trip.preferences.pointValuations = {}; trip.name = ['Bearer', 'x'.repeat(32)].join(' ');
  assert.ok(validateNormalizedTrip(trip).length);
});

test('routes retain a locked anchor even when its city is optional', () => {
  const trip = create(); trip.destinations[1].priority = 'optional';
  trip.anchors.push({ id: 'event', date: '2027-04-04', label: 'Fixed event', locked: true, placeId: trip.destinations[1].id });
  trip.routeCandidates.push({ id: 'candidate', label: 'Candidate', status: 'recommended', placeOrder: [trip.destinations[0].id] });
  assert.ok(validateNormalizedTrip(trip).some((error) => error.includes('locked anchor')));
  trip.routeCandidates[0].placeOrder.push(trip.destinations[1].id);
  assert.deepEqual(validateNormalizedTrip(trip), []);
});
