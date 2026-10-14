import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, saveWorkspace, workspaceKey } from '../src/lib/generic-trip-workspace.ts';
import { WORKSPACE_LIBRARY_KEY, WORKSPACE_LIBRARY_LIMIT, indexWorkspaceLibrary, listWorkspaceLibrary, readWorkspaceLibraryEntry } from '../src/lib/workspace-library.ts';
const workspace = (start = '2030-04-01', end = '2030-04-03', name = 'Synthetic city break') => createWorkspace(createNormalizedTrip({ name, start, end, cities: ['Osaka'], origins: ['AAA'], adults: 2, pace: 'balanced', flexDays: 0, themes: [] }));
function storage() {
  const values = new Map(); let writes = 0;
  return { values, get writes() { return writes; }, getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes++; values.set(key, value); }, removeItem: key => { writes++; values.delete(key); } };
}
function save(store, value) { saveWorkspace(store, value); indexWorkspaceLibrary(store, value); }

test('same-name trips on different dates retain distinct keys and full isolated planning records', () => {
  const store = storage(), first = workspace(), second = workspace('2030-05-01', '2030-05-03');
  first.activities = [{ id: 'walk', placeId: first.trip.destinations[0].id, title: 'First trip walk', date: '2030-04-01', time: '09:00', durationMinutes: 60, notes: '' }];
  save(store, first); save(store, second);
  const listing = listWorkspaceLibrary(store);
  assert.equal(listing.entries.length, 2); assert.notEqual(listing.entries[0].key, listing.entries[1].key);
  assert.equal(listing.entries[0].start, '2030-05-01');
  assert.equal(readWorkspaceLibraryEntry(store, workspaceKey(first.trip)).activities[0].title, 'First trip walk');
  assert.equal(readWorkspaceLibraryEntry(store, workspaceKey(second.trip)).activities.length, 0);
  const index = JSON.parse(store.values.get(WORKSPACE_LIBRARY_KEY));
  assert.deepEqual(Object.keys(index).sort(), ['keys', 'version']);
  assert.ok(index.keys.every(key => typeof key === 'string'));
  assert.ok(!store.values.get(WORKSPACE_LIBRARY_KEY).includes('First trip walk'));
});

test('legacy active trip is discoverable without any storage mutations or index migration', () => {
  const store = storage(), value = workspace(); saveWorkspace(store, value);
  const writes = store.writes;
  assert.equal(listWorkspaceLibrary(store).entries[0].key, workspaceKey(value.trip));
  assert.equal(store.writes, writes); assert.equal(store.getItem(WORKSPACE_LIBRARY_KEY), null);
});

test('tampered keys, cross-identity payloads, malformed and oversized records are skipped safely', () => {
  const store = storage(), value = workspace(), key = workspaceKey(value.trip), other = workspace('2030-05-01', '2030-05-03'), otherKey = workspaceKey(other.trip);
  save(store, value);
  store.values.set('trippy.workspace.active.v1', 'unrelated-secret-setting');
  store.values.set(otherKey, JSON.stringify(value)); // Valid record under the wrong identity.
  store.values.set('trippy.workspace.v1:broken', '{');
  store.values.set('trippy.workspace.v1:oversized', ' '.repeat(2_000_001));
  store.values.set(WORKSPACE_LIBRARY_KEY, JSON.stringify({ version: 1, keys: [key, key, otherKey, 'unrelated-secret-setting', 'trippy.workspace.v1:broken', 'trippy.workspace.v1:oversized'] }));
  assert.deepEqual(listWorkspaceLibrary(store).entries.map(entry => entry.key), [key]);
  assert.ok(listWorkspaceLibrary(store).skipped >= 4);
  assert.equal(readWorkspaceLibraryEntry(store, otherKey), null);
  assert.equal(readWorkspaceLibraryEntry(store, 'unrelated-secret-setting'), null);
});

test('malformed or oversized index preserves read-only legacy fallback', () => {
  const store = storage(), value = workspace(); saveWorkspace(store, value);
  for (const raw of ['{', JSON.stringify({ version: 2, keys: [] }), ' '.repeat(900_000), JSON.stringify({ version: 1, keys: [], plan: value })]) {
    store.values.set(WORKSPACE_LIBRARY_KEY, raw);
    const before = store.writes, result = listWorkspaceLibrary(store);
    assert.equal(result.entries.length, 1); assert.equal(result.skipped, 1); assert.equal(store.writes, before);
  }
});

test('storage failures surface safe status and do not claim indexing succeeded', () => {
  const unavailable = { getItem() { throw new Error('Unavailable'); }, setItem() { throw new Error('Unavailable'); }, removeItem() {} };
  assert.equal(listWorkspaceLibrary(unavailable).unavailable, true);
  assert.equal(readWorkspaceLibraryEntry(unavailable, workspaceKey(workspace().trip)), null);
  assert.throws(() => indexWorkspaceLibrary(unavailable, workspace()), /unavailable/);
  const store = storage(), value = workspace(); saveWorkspace(store, value);
  assert.throws(() => indexWorkspaceLibrary({ ...store, setItem() { throw new Error('Quota'); } }, value), /remains saved/);
});

test('indexing requires an already saved matching current record', () => {
  const store = storage(), value = workspace();
  assert.throws(() => indexWorkspaceLibrary(store, value), /Save the current workspace/);
  saveWorkspace(store, value); value.selectedRouteId = 'missing';
  assert.throws(() => indexWorkspaceLibrary(store, value), /Invalid workspace/);
  const validChanged = workspace(); validChanged.trip.preferences.pace = 'relaxed';
  assert.throws(() => indexWorkspaceLibrary(store, validChanged), /Save the current workspace/);
});

test('record limit bounds discoverability without deleting retained plan data', () => {
  const store = storage();
  const values = Array.from({ length: WORKSPACE_LIBRARY_LIMIT + 1 }, (_, index) => workspace('2030-04-01', '2030-04-03', `Synthetic trip ${index}`));
  for (const value of values) save(store, value);
  const index = JSON.parse(store.getItem(WORKSPACE_LIBRARY_KEY));
  assert.equal(index.keys.length, WORKSPACE_LIBRARY_LIMIT);
  assert.equal(listWorkspaceLibrary(store).entries.length, WORKSPACE_LIBRARY_LIMIT);
  assert.equal(index.keys[0], workspaceKey(values.at(-1).trip));
  assert.ok(store.getItem(workspaceKey(values[0].trip)));
  assert.equal(readWorkspaceLibraryEntry(store, workspaceKey(values[0].trip)).trip.name, values[0].trip.name);
});

test('preview rereads current content and cannot introduce cross-trip state from a cached object', () => {
  const store = storage(), value = workspace(); save(store, value);
  const preview = readWorkspaceLibraryEntry(store, workspaceKey(value.trip));
  preview.trip.name = 'Changed only in caller';
  assert.equal(readWorkspaceLibraryEntry(store, workspaceKey(value.trip)).trip.name, value.trip.name);
  store.values.set(workspaceKey(value.trip), 'not JSON');
  assert.equal(readWorkspaceLibraryEntry(store, workspaceKey(value.trip)), null);
});
