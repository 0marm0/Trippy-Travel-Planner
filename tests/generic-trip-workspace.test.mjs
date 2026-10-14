import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip, validateNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, workspaceKey, saveWorkspace, loadWorkspace, removeWorkspace, validateWorkspace, exportWorkspace, workspaceConflicts } from '../src/lib/generic-trip-workspace.ts';

const makeTrip = (name, start, end, cities) => createNormalizedTrip({ name, start, end, cities, origins: ['AAA'], adults: 2, pace: 'balanced', flexDays: 0, themes: ['art'] });
const a = () => makeTrip('Invented coastal journey', '2030-04-02', '2030-04-05', ['Harbor City', 'Hill City']);
const b = () => makeTrip('Invented winter journey', '2031-12-11', '2031-12-14', ['Snow City', 'Lake City']);
const store = () => { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key) }; };

test('two arbitrary trips create empty independent manual days with no sample geography or inherited bookings', () => {
  for (const trip of [a(), b()]) {
    const workspace = createWorkspace(trip);
    assert.deepEqual(validateWorkspace(workspace), []);
    assert.equal(workspace.days.length, 4);
    assert.equal(workspace.days[0].date, trip.dateWindow.earliestDeparture);
    assert.ok(workspace.days.every(day => day.placeId === ''));
    assert.deepEqual(workspace.places, []); assert.deepEqual(workspace.activities, []); assert.deepEqual(workspace.trip.bookings, []);
    workspace.trip.name = 'changed'; assert.notEqual(trip.name, 'changed');
  }
});
test('browser persistence isolates same named trips by dates and destinations and refuses mismatched payloads', () => {
  const memory = store(), first = createWorkspace(a()), secondTrip = b(); secondTrip.id = first.trip.id;
  const second = createWorkspace(secondTrip);
  first.activities.push({ id: 'activity-a', title: 'Invented gallery', placeId: first.trip.destinations[0].id, date: first.days[0].date, time: '09:00', durationMinutes: 60, notes: 'Manual idea; hours unknown' });
  saveWorkspace(memory, first); saveWorkspace(memory, second);
  assert.notEqual(workspaceKey(first.trip), workspaceKey(second.trip));
  assert.equal(loadWorkspace(memory, first.trip).activities.length, 1); assert.equal(loadWorkspace(memory, second.trip).activities.length, 0);
  assert.equal(loadWorkspace(memory).trip.dateWindow.earliestDeparture, second.trip.dateWindow.earliestDeparture);
  const third = structuredClone(first.trip); third.destinations[0].name = 'Different city'; assert.equal(loadWorkspace(memory, third), null);
  memory.setItem(workspaceKey(second.trip), JSON.stringify(first)); assert.equal(loadWorkspace(memory, second.trip), null);
  removeWorkspace(memory, second.trip); assert.ok(loadWorkspace(memory, first.trip)); assert.equal(loadWorkspace(memory), null);
});
test('current route selection, booking state, day, activity and pins survive a save and schema-valid separate exports', () => {
  const workspace = createWorkspace(b()), memory = store();
  workspace.trip.routeCandidates.push({ id: 'route-one', label: 'Lake first', status: 'recommended', placeOrder: workspace.trip.destinations.map(place => place.id).reverse() });
  workspace.selectedRouteId = 'route-one';
  workspace.places.push({ placeId: workspace.trip.destinations[0].id, lat: 45, lng: -75 });
  workspace.days[0].placeId = workspace.trip.destinations[0].id;
  workspace.activities.push({ id: 'gallery', title: 'Invented gallery', placeId: workspace.days[0].placeId, date: workspace.days[0].date, time: '10:30', durationMinutes: 90, notes: 'Fallback: local park' });
  workspace.trip.bookings.push({ id: 'stay-one', kind: 'stay', status: 'missing', startAt: '2031-12-11T15:00:00-05:00', endAt: '2031-12-12T11:00:00-05:00', provider: 'Invented lodge' });
  workspace.bookingDetails.push({ bookingId: 'stay-one', label: 'Central base', placeId: workspace.days[0].placeId, notes: 'Cancellation terms unknown' });
  saveWorkspace(memory, workspace); assert.deepEqual(loadWorkspace(memory, workspace.trip), workspace);
  const output = exportWorkspace(workspace); const normalized = JSON.parse(output.trip), itinerary = JSON.parse(output.itinerary);
  assert.deepEqual(validateNormalizedTrip(normalized), []); assert.equal(normalized.bookings[0].status, 'missing');
  assert.equal(itinerary.activities[0].title, 'Invented gallery'); assert.equal(itinerary.selectedRouteId, 'route-one'); assert.equal(normalized.activities, undefined);
});
test('unknown fields, out-of-trip day references, impossible coordinates and secret-shaped notes cannot save or export', () => {
  const changes = [
    value => { value.privateData = 'forbidden'; },
    value => { value.days[0].placeId = 'foreign-city'; },
    value => { value.places.push({ placeId: value.trip.destinations[0].id, lat: 91, lng: 0 }); },
    value => { value.selectedRouteId = 'unknown'; },
    value => { value.activities.push({ id: 'activity', title: 'Invented event', date: value.days[0].date, placeId: value.trip.destinations[0].id, time: '09:00', durationMinutes: 60, notes: 'person@example.test' }); },
    value => { value.activities.push({ id: 'activity', title: 'Invented event', date: value.days[0].date, placeId: value.trip.destinations[0].id, time: '25:00', durationMinutes: 60, notes: '' }); },
  ];
  for (const change of changes) { const value = createWorkspace(a()); change(value); assert.ok(validateWorkspace(value).length); assert.throws(() => saveWorkspace(store(), value)); assert.throws(() => exportWorkspace(value)); }
});
test('feasibility flags overlaps, midnight spill, destination mismatch and locked anchors without silently moving anything', () => {
  const value = createWorkspace(a()), date = value.days[0].date, [city, other] = value.trip.destinations;
  value.days[0].placeId = city.id;
  value.trip.anchors.push({ id: 'anchor', date, label: 'Fixed event', locked: true, placeId: other.id });
  value.activities.push({ id: 'one', title: 'First', date, placeId: city.id, time: '09:00', durationMinutes: 120, notes: '' }, { id: 'two', title: 'Second', date, placeId: other.id, time: '10:00', durationMinutes: 60, notes: '' }, { id: 'three', title: 'Late', date, placeId: city.id, time: '23:30', durationMinutes: 60, notes: '' });
  const before = JSON.stringify(value), conflicts = workspaceConflicts(value);
  for (const text of ['overlap', 'midnight', 'assigned destination', 'locked anchor']) assert.ok(conflicts.some(message => message.includes(text)));
  assert.equal(JSON.stringify(value), before);
});
test('corrupt and unknown saved workspace versions fail closed without replacing caller data', () => {
  const memory = store(), trip = a();
  memory.setItem(workspaceKey(trip), '{'); assert.equal(loadWorkspace(memory, trip), null);
  const value = createWorkspace(trip); value.version = 2; memory.setItem(workspaceKey(trip), JSON.stringify(value)); assert.equal(loadWorkspace(memory, trip), null);
});

test('explicit credential labels cannot enter canonical trips or workspace exports', () => {
  for (const label of ['API key: inventedExampleValue', 'Access token: inventedExampleValue', 'Client secret: inventedExampleValue']) {
    const trip = a(); trip.preferences.activityThemes = [label];
    assert.notEqual(validateNormalizedTrip(trip).length, 0);
    const workspace = createWorkspace(a());
    workspace.activities.push({ id: 'invented-activity', placeId: workspace.trip.destinations[0].id, title: 'Museum visit', date: workspace.trip.dateWindow.earliestDeparture, time: '10:00', durationMinutes: 60, notes: label });
    assert.notEqual(validateWorkspace(workspace).length, 0);
    assert.throws(() => exportWorkspace(workspace));
  }
});
