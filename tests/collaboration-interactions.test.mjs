import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openCollaborationStore } from '../src/lib/collaboration/store.ts';
import { validateCollaborationState } from '../src/lib/collaboration/schema.ts';
import { body } from '../src/lib/collaboration/http.ts';
import { reconciliationChanges, resolveReconciliation } from '../src/lib/collaboration/reconciliation.ts';

const now = Date.parse('2030-04-01T12:00:00Z');
const board = () => ({ title: 'Invented shared weekend', startDate: '2030-05-01', endDate: '2030-05-03', cities: [{ id: 'harbor', name: 'Invented Harbor' }], activities: [{ id: 'walk', cityId: 'harbor', title: 'River walk', notes: '' }], days: {}, suggestions: [{ id: 'move-walk', kind: 'day', status: 'pending', activityId: 'walk', day: '2030-05-02' }] });
const fails = status => error => error.status === status;
async function withStore(run) { const directory = await mkdtemp(join(tmpdir(), 'trippy-interactions-')); const store = await openCollaborationStore({ sqlitePath: join(directory, 'rooms.sqlite'), now: () => now }); try { await run(store); } finally { await store.close(); await rm(directory, { recursive: true, force: true }); } }

test('one vote per capability replaces only its own choice, with stable server attribution and no board mutation', async () => withStore(async store => {
  const room = await store.create(board());
  const first = await store.invite(room.roomId, room.ownerToken, 'editor');
  const second = await store.invite(room.roomId, room.ownerToken, 'editor');
  let saved = await store.interactSuggestion(room.roomId, first.token, 1, 'move-walk', 'vote', 'support');
  const actor = saved.state.interactions.votes[0].actor;
  assert.equal(actor.id, `access-${first.inviteId}`);
  assert.equal(actor.role, 'editor');
  saved = await store.interactSuggestion(room.roomId, second.token, 2, 'move-walk', 'vote', 'support');
  saved = await store.interactSuggestion(room.roomId, first.token, 3, 'move-walk', 'vote', 'concern');
  assert.equal(saved.state.interactions.votes.length, 2);
  assert.equal(saved.state.interactions.votes.find(vote => vote.actor.id === actor.id).choice, 'concern');
  assert.equal(saved.state.interactions.votes.find(vote => vote.actor.id !== actor.id).choice, 'support');
  assert.deepEqual(saved.state.days, {});
  assert.deepEqual(saved.state.activities, board().activities);
  assert.equal(saved.state.suggestions[0].status, 'pending');
  await assert.rejects(store.interactSuggestion(room.roomId, first.token, 4, 'move-walk', 'vote', { choice: 'concern', actor: { id: `access-${second.inviteId}`, role: 'owner' } }), fails(400));
  const response = JSON.stringify((await store.read(room.roomId, first.token)).state);
  assert.equal(response.includes(first.token), false); assert.equal(response.includes(second.token), false); assert.equal(response.includes(room.ownerToken), false);
  assert.doesNotMatch(response, /token_hash|ownerToken|bearer|email/i);
}));

test('comments append server-attributed safe text, reject malformed/private data and preserve immutable history', async () => withStore(async store => {
  const room = await store.create(board());
  const editor = await store.invite(room.roomId, room.ownerToken, 'editor');
  const viewer = await store.invite(room.roomId, room.ownerToken, 'viewer');
  const posted = await store.interactSuggestion(room.roomId, editor.token, 1, 'move-walk', 'comment', 'Prefer a morning walk.\nCheck museum hours first.');
  assert.equal(posted.state.interactions.comments[0].actor.id, `access-${editor.inviteId}`);
  assert.equal(posted.state.interactions.comments[0].createdAt, '2030-04-01T12:00:00.000Z');
  assert.match(posted.state.interactions.comments[0].text, /\n/);
  assert.deepEqual((await store.read(room.roomId, viewer.token)).state.interactions, posted.state.interactions);
  for (const unsafe of ['person@example.test', 'booking reference FAKEAB', 'A'.repeat(501), '   ', 'https://mail.google.com/', { text: 'Safe', actor: { id: 'access-other', role: 'owner' } }]) await assert.rejects(store.interactSuggestion(room.roomId, editor.token, 2, 'move-walk', 'comment', unsafe), fails(400));
  for (const capability of [editor.token, room.ownerToken]) {
    const changed = structuredClone(posted.state); changed.interactions.comments[0].text = 'Changed previous comment';
    await assert.rejects(store.update(room.roomId, capability, 2, changed), fails(403));
    const removed = structuredClone(posted.state); delete removed.interactions;
    await assert.rejects(store.update(room.roomId, capability, 2, removed), fails(403));
  }
  await assert.rejects(store.create(posted.state), fails(403));
  assert.equal((await store.read(room.roomId, viewer.token)).revision, 2);
}));

test('viewer, expired and revoked access cannot write; stale writes retain latest safe interaction state', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'trippy-expiring-interactions-'));
  let current = now;
  const store = await openCollaborationStore({ sqlitePath: join(directory, 'rooms.sqlite'), now: () => current });
  try {
    const room = await store.create(board());
    const viewer = await store.invite(room.roomId, room.ownerToken, 'viewer');
    const editor = await store.invite(room.roomId, room.ownerToken, 'editor', new Date(now + 60000).toISOString());
    await assert.rejects(store.interactSuggestion(room.roomId, viewer.token, 1, 'move-walk', 'comment', 'Viewer comment'), fails(403));
    const saved = await store.interactSuggestion(room.roomId, room.ownerToken, 1, 'move-walk', 'comment', 'Owner planning note');
    await assert.rejects(store.interactSuggestion(room.roomId, editor.token, 1, 'move-walk', 'vote', 'support'), error => error.status === 412 && error.latest.state.interactions.comments.length === 1);
    current += 60001;
    await assert.rejects(store.interactSuggestion(room.roomId, editor.token, 2, 'move-walk', 'vote', 'support'), fails(403));
    const revoked = await store.invite(room.roomId, room.ownerToken, 'editor');
    await store.revoke(room.roomId, room.ownerToken, revoked.inviteId);
    await assert.rejects(store.interactSuggestion(room.roomId, revoked.token, 2, 'move-walk', 'comment', 'Revoked comment'), fails(403));
    const rejected = await store.reviewSuggestion(room.roomId, room.ownerToken, saved.revision, 'move-walk', 'reject');
    await assert.rejects(store.interactSuggestion(room.roomId, room.ownerToken, rejected.revision, 'move-walk', 'vote', 'support'), fails(409));
    assert.equal((await store.read(room.roomId, viewer.token)).state.interactions.comments.length, 1);
  } finally { await store.close(); await rm(directory, { recursive: true, force: true }); }
});

test('interaction fields are strict and legacy rooms remain unchanged', async () => {
  const legacy = board(); delete legacy.suggestions;
  assert.deepEqual(validateCollaborationState(legacy), legacy);
  const actor = { id: 'access-invented', role: 'editor' };
  const vote = { suggestionId: 'move-walk', actor, choice: 'support', updatedAt: '2030-04-01T12:00:00.000Z' };
  assert.throws(() => validateCollaborationState({ ...board(), interactions: { votes: [vote, vote], comments: [] } }), fails(400));
  assert.throws(() => validateCollaborationState({ ...board(), interactions: { votes: [{ ...vote, actor: { ...actor, role: 'viewer' } }], comments: [] } }), fails(400));
  assert.throws(() => validateCollaborationState({ ...board(), interactions: { votes: [{ ...vote, suggestionId: 'absent' }], comments: [] } }), fails(400));
  const request = new Request('https://example.test/api/collaboration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suggestionId: 'move-walk', action: 'vote', value: 'support', actor }) });
  await assert.rejects(body(request, ['suggestionId', 'action', 'value']), fails(400));
});

test('reconciliation preserves current server discussion while retaining independent pending board choices', async () => withStore(async store => {
  const base = board();
  const room = await store.create(base);
  const latest = (await store.interactSuggestion(room.roomId, room.ownerToken, 1, 'move-walk', 'comment', 'Compare a quieter morning')).state;
  const local = structuredClone(base); local.activities[0].notes = 'Local activity note';
  const changes = reconciliationChanges(base, local, latest);
  assert.equal(changes.some(change => change.key.startsWith('interactions')), false, 'server-attributed fields are never a client choice');
  const result = resolveReconciliation(base, local, latest, Object.fromEntries(changes.map(change => [change.key, change.suggested])));
  assert.equal(result.activities[0].notes, 'Local activity note');
  assert.deepEqual(result.interactions, latest.interactions);
  assert.equal(result.suggestions[0].status, 'pending');
  const saved = await store.update(room.roomId, room.ownerToken, 2, result);
  assert.equal(saved.state.interactions.comments.length, 1);
}));


test('owner review cannot expand a room beyond the normal writable body limit and rolls back atomically', async () => withStore(async store => {
  const state = board();
  state.activities = [];
  state.suggestions = [{ id: 'large-activity', kind: 'activity', status: 'pending', activity: { id: 'proposed', cityId: 'harbor', title: 'New activity', notes: 'n'.repeat(1000) } }];
  const bytes = value => new TextEncoder().encode(JSON.stringify({ state: value })).length;
  for (let index = 0; index < 499; index++) {
    state.activities.push({ id: `activity-${index}`, cityId: 'harbor', title: 't'.repeat(160), notes: 'n'.repeat(1000) });
    if (bytes(state) > 512 * 1024 - 600) { state.activities.pop(); break; }
  }
  const remaining = 512 * 1024 - 600 - bytes(state);
  if (remaining > 100) state.activities.push({ id: 'padding', cityId: 'harbor', title: 'Padding', notes: 'n'.repeat(Math.min(1000, remaining - 100)) });
  assert.ok(bytes(state) < 512 * 1024);
  const expanded = structuredClone(state); expanded.activities.push(state.suggestions[0].activity);
  assert.ok(bytes(expanded) > 512 * 1024);
  const room = await store.create(state);
  await assert.rejects(store.reviewSuggestion(room.roomId, room.ownerToken, 1, 'large-activity', 'apply'), fails(413));
  const retained = await store.read(room.roomId, room.ownerToken);
  assert.equal(retained.revision, 1);
  assert.deepEqual(retained.state, state);
  const rejected = await store.reviewSuggestion(room.roomId, room.ownerToken, 1, 'large-activity', 'reject');
  assert.equal(rejected.state.suggestions[0].status, 'rejected');
  assert.ok(bytes(rejected.state) <= 512 * 1024);
}));
