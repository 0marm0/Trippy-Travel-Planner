import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, validateWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { readWorkspaceHistory, saveWorkspaceSnapshot, deleteWorkspaceSnapshot, workspaceHistoryKey, workspaceDifferences, previewWorkspaceRestore, acceptWorkspaceRestore, WORKSPACE_HISTORY_BYTES } from '../src/lib/workspace-history.ts';
const make = () => {
  const value = createWorkspace(createNormalizedTrip({ name: 'Coastal weekend', start: '2030-04-01', end: '2030-04-04', cities: ['Lisbon'], origins: ['AAA'], adults: 2, flexDays: 0, pace: 'balanced', themes: [] }));
  value.activities = [{ id: 'walk', placeId: value.trip.destinations[0].id, title: 'Waterfront walk', date: '2030-04-02', time: '10:00', durationMinutes: 45, notes: 'Weather unknown', category: 'Outdoors', priority: 'could' }];
  value.itemEvidence = [{ target: 'activity', targetId: 'walk', basis: 'manual', source: '', sourceUrl: '', checkedAt: '', summary: 'Opening hours unknown', unknowns: 'Check route' }];
  return value;
};
const storage = () => { const data = new Map(); let writes = 0; return { data, get writes() { return writes; }, getItem: key => data.get(key) ?? null, setItem: (key, value) => { writes++; data.set(key, value); }, removeItem: key => data.delete(key) }; };
const save = (store, value, name='First draft', id='snapshot-first') => saveWorkspaceSnapshot(store, value, name, readWorkspaceHistory(store, value).raw, id, '2030-02-01T00:00:00.000Z');
test('explicit snapshot save is isolated from active workspace/library and preserves metadata and receipts', () => {
  const store = storage(), value = make(); assert.equal(readWorkspaceHistory(store, value).history.snapshots.length, 0); assert.equal(store.writes, 0);
  save(store, value); const saved = readWorkspaceHistory(store, value); assert.equal(store.data.size, 1); assert.deepEqual(saved.history.snapshots[0].workspace, value); assert.equal(store.getItem('trippy.workspace.active.v1'), null);
  value.activities[0].notes = 'New local edit'; assert.notEqual(saved.history.snapshots[0].workspace.activities[0].notes, value.activities[0].notes);
});
test('restore previews readable changes and preserves current unsaved copy before returning the complete prior workspace', () => {
  const store = storage(), value = make(); save(store, value); const earlier = structuredClone(value);
  value.activities[0].title = 'Changed walk'; value.days[0].placeId = value.trip.destinations[0].id; value.itemEvidence[0].reviewRequired = true;
  const open = structuredClone(value), preview = previewWorkspaceRestore(store, value, 'snapshot-first');
  assert.ok(preview.differences.some(diff => diff.scope === 'activities')); assert.ok(preview.differences.some(diff => diff.scope === 'days')); assert.ok(preview.differences.some(diff => diff.scope === 'itemEvidence'));
  const result = acceptWorkspaceRestore(store, value, preview, 'preserve-current', 'Before restore'); assert.deepEqual(result, earlier); assert.deepEqual(value, open);
  assert.deepEqual(readWorkspaceHistory(store, value).history.snapshots[0].workspace, open); assert.deepEqual(validateWorkspace(result), []);
});
test('discard-current is explicit and read-only; absent policy, stale workspace and stale storage block restore', () => {
  const store = storage(), value = make(); save(store, value); value.activities[0].notes = 'Changed'; const preview = previewWorkspaceRestore(store, value, 'snapshot-first'), writes = store.writes;
  assert.throws(() => acceptWorkspaceRestore(store, value, preview, ''), /Choose/);
  const result = acceptWorkspaceRestore(store, value, preview, 'discard-current'); assert.equal(store.writes, writes); assert.equal(result.activities[0].notes, 'Weather unknown');
  value.activities[0].notes = 'Changed again'; assert.throws(() => acceptWorkspaceRestore(store, value, preview, 'discard-current'), /open workspace changed/);
  value.activities[0].notes = 'Changed'; save(store, value, 'Second draft', 'snapshot-second'); assert.throws(() => acceptWorkspaceRestore(store, value, preview, 'discard-current'), /saved snapshot changed/);
});
test('storage quota failure stops restore and keeps open copy; bounded counts never silently evict old snapshots', () => {
  const store = storage(), value = make(); save(store, value); value.activities[0].notes = 'Unsaved'; const preview = previewWorkspaceRestore(store, value, 'snapshot-first');
  const broken = {...store, setItem() { throw new Error('Quota'); }}; assert.throws(() => acceptWorkspaceRestore(broken, value, preview, 'preserve-current'), /storage is full/); assert.equal(value.activities[0].notes, 'Unsaved');
  for (let index = 1; index < 8; index++) save(store, value, `Draft ${index}`, `snapshot-${index}`);
  const before = store.getItem(workspaceHistoryKey(value.trip.id)); assert.throws(() => save(store, value, 'Too many', 'snapshot-extra'), /Eight snapshots/); assert.equal(store.getItem(workspaceHistoryKey(value.trip.id)), before);
  const fullPreview = previewWorkspaceRestore(store, value, 'snapshot-first'); assert.throws(() => acceptWorkspaceRestore(store, value, fullPreview, 'preserve-current'), /Eight snapshots/);
  deleteWorkspaceSnapshot(store, value, 'snapshot-1', before); assert.equal(readWorkspaceHistory(store, value).history.snapshots.length, 7);
});
test('malformed, private-field, cross-trip, oversized and stale snapshot storage fail closed without mutation', () => {
  const store = storage(), value = make(); save(store, value); const key = workspaceHistoryKey(value.trip.id), original = store.getItem(key);
  for (const alter of [history => {history.extra = true;}, history => {history.tripId = 'other';}, history => {history.snapshots[0].workspace.trip.id = 'other';}, history => {history.snapshots[0].workspace.token = 'invented';}, history => {history.snapshots[0].name = 'API key: invented';}, history => {history.snapshots.push(history.snapshots[0]);}]) {
    const history = JSON.parse(original); alter(history); store.data.set(key, JSON.stringify(history)); const writes = store.writes; assert.throws(() => readWorkspaceHistory(store, value)); assert.equal(store.writes, writes);
  }
  store.data.set(key, ' '.repeat(WORKSPACE_HISTORY_BYTES + 1)); assert.throws(() => readWorkspaceHistory(store, value), /exceed/);
  store.data.set(key, original); assert.throws(() => saveWorkspaceSnapshot(store, value, 'New draft', null), /changed/); assert.throws(() => deleteWorkspaceSnapshot(store, value, 'snapshot-first', null), /changed/);
});
test('diff identifies booking state transitions and metadata changes without manufacturing additional records', () => {
  const first = make(), next = structuredClone(first); next.activities[0].priority = 'must';
  next.trip.bookings.push({id:'stay', kind:'stay',status:'quoted',startAt:'2030-04-01T15:00:00Z',endAt:'2030-04-04T10:00:00Z'});
  const differences = workspaceDifferences(first, next); assert.equal(differences.find(item => item.scope === 'Booking').kind, 'added'); assert.equal(differences.find(item => item.scope === 'activities').after.priority, 'must');
  const later = structuredClone(next); later.trip.bookings[0].status = 'confirmed'; const changed = workspaceDifferences(next, later).find(item => item.scope === 'Booking'); assert.equal(changed.before.status, 'quoted'); assert.equal(changed.after.status, 'confirmed');
});
