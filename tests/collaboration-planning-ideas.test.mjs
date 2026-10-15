import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openCollaborationStore } from '../src/lib/collaboration/store.ts';
import { validateCollaborationState } from '../src/lib/collaboration/schema.ts';
import { reviewCollaborationSuggestion, assertSuggestionAppendOnly } from '../src/lib/collaboration/suggestions.ts';
import { reconciliationChanges, resolveReconciliation, serializeRecovery, parseRecovery } from '../src/lib/collaboration/reconciliation.ts';
import { summarizeBoardChanges } from '../src/lib/collaboration/history.ts';
const board = () => ({ title: 'Invented coastal journey', startDate: '2030-05-01', endDate: '2030-05-03', cities: [{ id: 'harbor', name: 'Invented Harbor' }, { id: 'hill', name: 'Invented Hill' }], activities: [], days: {} });
const route = () => ({ id: 'route-proposal', kind: 'route', status: 'pending', idea: { id: 'coastal-route', kind: 'route', title: 'Compare the coastal connection', notes: 'Consider the scenic option', fromCityId: 'harbor', toCityId: 'hill', mode: 'unknown' } });
const stay = () => ({ id: 'stay-proposal', kind: 'stay', status: 'pending', idea: { id: 'harbor-base', kind: 'stay', title: 'Explore a harbor base', notes: 'Prefer a quiet neighborhood', cityId: 'harbor' } });
const fails = status => error => error.status === status;

test('strict route/stay ideas retain unknowns and reject private fields, mismatched kinds and broken references', () => {
  assert.deepEqual(validateCollaborationState(board()), board());
  for (const proposal of [route(), stay()]) {
    const valid = { ...board(), suggestions: [proposal] };
    assert.deepEqual(validateCollaborationState(valid), valid);
    for (const patch of [{ price: 100 }, { status: 'confirmed' }, { confirmationNumber: 'invented' }, { ownerToken: 'invented' }, { title: 'secret' }, { notes: 'booking reference' }, { cityId: 'missing' }, { sourceUrl: 'https://example.test/base' }]) {
      assert.throws(() => validateCollaborationState({ ...board(), suggestions: [{ ...proposal, idea: { ...proposal.idea, ...patch } }] }), fails(400));
    }
    assert.throws(() => validateCollaborationState({ ...board(), suggestions: [{ ...proposal, kind: proposal.kind === 'stay' ? 'route' : 'stay' }] }), fails(400));
    assert.throws(() => validateCollaborationState({ ...board(), suggestions: [{ ...proposal, day: '2030-05-01' }] }), fails(400));
  }
  assert.throws(() => validateCollaborationState({ ...board(), suggestions: [{ ...route(), idea: { ...route().idea, toCityId: 'harbor' } }] }), fails(400));
  assert.throws(() => validateCollaborationState({ ...board(), suggestions: [{ ...route(), idea: { ...route().idea, mode: ['rail'] } }] }), fails(400));
  assert.throws(() => validateCollaborationState({ ...board(), suggestions: [route(), { ...route(), id: 'duplicate-idea' }] }), fails(400));
  assert.throws(() => validateCollaborationState({ ...board(), planningIdeas: Array.from({ length: 101 }, (_, i) => ({ ...stay().idea, id: `base-${i}` })) }), fails(400));
});

test('owner review only appends the selected idea; rejected and applied receipts and discussion stay immutable', () => {
  const source = { ...board(), suggestions: [route(), stay()] };
  const accepted = reviewCollaborationSuggestion(source, 'route-proposal', 'apply');
  assert.deepEqual(accepted.planningIdeas, [route().idea]);
  assert.deepEqual(accepted.activities, source.activities); assert.deepEqual(accepted.days, source.days);
  assert.equal(source.planningIdeas, undefined);
  const rejected = reviewCollaborationSuggestion(accepted, 'stay-proposal', 'reject');
  assert.deepEqual(rejected.planningIdeas, accepted.planningIdeas);
  assert.deepEqual(rejected.suggestions.map(item => item.status), ['applied', 'rejected']);
  assert.throws(() => reviewCollaborationSuggestion(rejected, 'route-proposal', 'apply'), fails(409));
  const edited = structuredClone(rejected); edited.planningIdeas[0].title = 'Changed idea';
  assert.throws(() => assertSuggestionAppendOnly(rejected, edited), fails(403));
  const removed = structuredClone(rejected); delete removed.planningIdeas;
  assert.throws(() => assertSuggestionAppendOnly(rejected, removed), fails(403));
  assert.deepEqual(summarizeBoardChanges(validateCollaborationState(source), accepted), [{ category: 'proposals', added: 1, removed: 0, changed: 1 }]);
});

test('latest reviewed ideas survive reconciliation, recovery, JSON download and owner roundtrips', () => {
  const base = { ...board(), suggestions: [route()] };
  const latest = reviewCollaborationSuggestion(base, 'route-proposal', 'apply');
  const local = structuredClone(base); local.title = 'Locally changed journey';
  const changes = reconciliationChanges(base, local, latest);
  const choices = Object.fromEntries(changes.map(change => [change.key, change.key.startsWith('suggestions/') ? 'latest' : change.suggested]));
  const merged = resolveReconciliation(base, local, latest, choices);
  assert.deepEqual(merged.planningIdeas, latest.planningIdeas);
  assert.equal(merged.title, local.title);
  assert.deepEqual(parseRecovery(serializeRecovery(merged, null, 0)).state, merged);
  assert.deepEqual(validateCollaborationState(JSON.parse(JSON.stringify(merged))), merged);
  assert.doesNotThrow(() => assertSuggestionAppendOnly(latest, merged));
});

test('durable route/stay review checks role, revision, expiry and preserves interactions on reject/apply', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'trippy-planning-ideas-'));
  let now = Date.parse('2030-04-01T12:00:00Z');
  let store = await openCollaborationStore({ sqlitePath: join(dir, 'rooms.sqlite'), now: () => now });
  try {
    const room = await store.create(board());
    const editor = await store.invite(room.roomId, room.ownerToken, 'editor', new Date(now + 60000).toISOString());
    const viewer = await store.invite(room.roomId, room.ownerToken, 'viewer');
    let saved = await store.update(room.roomId, editor.token, 1, { ...board(), suggestions: [route(), stay()] });
    saved = await store.interactSuggestion(room.roomId, editor.token, saved.revision, 'route-proposal', 'comment', 'Consider a lower walking distance');
    const discussion = structuredClone(saved.state.interactions);
    for (const capability of [editor.token, viewer.token]) await assert.rejects(store.reviewSuggestion(room.roomId, capability, saved.revision, 'route-proposal', 'apply'), fails(403));
    await assert.rejects(store.reviewSuggestion(room.roomId, room.ownerToken, 1, 'route-proposal', 'apply'), fails(412));
    const bypass = { ...saved.state, planningIdeas: [{ ...stay().idea, id: "bypass-idea" }] };
    await assert.rejects(store.update(room.roomId, room.ownerToken, saved.revision, bypass), fails(403));
    now += 60001;
    await assert.rejects(store.update(room.roomId, editor.token, saved.revision, saved.state), fails(403));
    saved = await store.reviewSuggestion(room.roomId, room.ownerToken, saved.revision, 'route-proposal', 'apply');
    saved = await store.reviewSuggestion(room.roomId, room.ownerToken, saved.revision, 'stay-proposal', 'reject');
    assert.deepEqual(saved.state.interactions, discussion);
    const revision = saved.revision;
    const changed = structuredClone(saved.state); changed.title = 'Owner roundtrip title';
    saved = await store.update(room.roomId, room.ownerToken, revision, changed);
    await store.close(); store = await openCollaborationStore({ sqlitePath: join(dir, 'rooms.sqlite'), now: () => now });
    const read = await store.read(room.roomId, viewer.token);
    assert.deepEqual(read.state, saved.state);
    assert.deepEqual(read.state.planningIdeas, [route().idea]);
    assert.equal(read.state.suggestions[1].status, 'rejected');
  } finally { await store.close(); await rm(dir, { recursive: true, force: true }); }
});

test('full accepted idea capacity rejects review without partial state/revision/history writes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'trippy-planning-limit-'));
  const store = await openCollaborationStore({ sqlitePath: join(dir, 'rooms.sqlite') });
  try {
    const source = { ...board(), planningIdeas: Array.from({ length: 100 }, (_, index) => ({ ...stay().idea, id: `base-${index}` })), suggestions: [route()] };
    const room = await store.create(source);
    await assert.rejects(store.reviewSuggestion(room.roomId, room.ownerToken, 1, 'route-proposal', 'apply'), fails(400));
    assert.deepEqual((await store.read(room.roomId, room.ownerToken)).state, source);
    assert.equal((await store.read(room.roomId, room.ownerToken)).revision, 1);
    assert.equal((await store.history(room.roomId, room.ownerToken)).entries.length, 0);
  } finally { await store.close(); await rm(dir, { recursive: true, force: true }); }
});
