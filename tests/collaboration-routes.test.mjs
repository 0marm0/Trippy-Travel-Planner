import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import * as schema from '../src/lib/collaboration/schema.ts';
import { openCollaborationStore } from '../src/lib/collaboration/store.ts';

// Execute the actual route/helper sources. Resolve Next aliases to a temporary
// real store; isolate HTTP configuration to an empty invented environment.
// No production singleton, .env file, network listener or real room is touched.
async function moduleExports(relative, dependencies) {
  const path = new URL(relative, import.meta.url);
  const source = await readFile(path, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const compiledModule = { exports: {} };
  const context = { module: compiledModule, exports: compiledModule.exports, Request, Response, Headers, URL, TextEncoder, TextDecoder, Uint8Array, process: { env: {} }, require(name) { if (!(name in dependencies)) throw new Error(`Unexpected route dependency: ${name}`); return dependencies[name]; } };
  vm.runInNewContext(compiled, context, { filename: path.pathname });
  return compiledModule.exports;
}
const http = await moduleExports('../src/lib/collaboration/http.ts', { './schema.ts': schema, 'node:crypto': crypto });
const board = () => ({ title: 'Synthetic route contract', startDate: '2030-05-01', endDate: '2030-05-03', cities: [{ id: 'harbor', name: 'Invented Harbor' }], activities: [{ id: 'walk', cityId: 'harbor', title: 'River walk', notes: '' }], days: {}, suggestions: [{ id: 'move-walk', kind: 'day', status: 'pending', activityId: 'walk', day: '2030-05-02' }] });
const vote = { suggestionId: 'move-walk', action: 'vote', value: 'support' };
const apply = { suggestionId: 'move-walk', decision: 'apply' };
async function fixture(run) {
  const directory = await mkdtemp(join(tmpdir(), 'trippy-route-contract-'));
  const store = await openCollaborationStore({ sqlitePath: join(directory, 'rooms.sqlite'), now: () => Date.parse('2030-04-01T12:00:00Z') });
  try {
    const dependencies = { '@/lib/collaboration/store': { getCollaborationStore: async () => store }, '@/lib/collaboration/http': http };
    const review = await moduleExports('../src/app/api/collaboration/rooms/[id]/suggestions/review/route.ts', dependencies);
    const interact = await moduleExports('../src/app/api/collaboration/rooms/[id]/suggestions/interact/route.ts', dependencies);
    const room = await store.create(board());
    const editor = await store.invite(room.roomId, room.ownerToken, 'editor');
    const viewer = await store.invite(room.roomId, room.ownerToken, 'viewer');
    const invoke = (kind, payload, { capability = room.ownerToken, revision = '1', raw, headers = {}, suffix = '' } = {}) => {
      const allHeaders = { 'Content-Type': 'application/json', Origin: 'https://planner.example.test', ...headers };
      if (capability !== null) allHeaders.Authorization = `Bearer ${capability}`;
      if (revision !== null) allHeaders['If-Match'] = revision;
      const request = new Request(`https://planner.example.test/api/collaboration/rooms/${room.roomId}/suggestions/${kind}${suffix}`, { method: 'POST', headers: allHeaders, body: raw ?? JSON.stringify(payload) });
      return (kind === 'review' ? review : interact).POST(request, { params: Promise.resolve({ id: room.roomId }) });
    };
    await run({ store, room, editor, viewer, invoke });
  } finally { await store.close(); await rm(directory, { recursive: true, force: true }); }
}
function privateHeaders(response) {
  assert.match(response.headers.get('cache-control'), /private.*no-store/);
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
}

test('review/interact require valid Authorization and explicit safe If-Match before state changes', async () => fixture(async ({ store, room, invoke }) => {
  for (const [kind, payload] of [['review', apply], ['interact', vote]]) {
    for (const capability of [null, 'malformed']) {
      const response = await invoke(kind, payload, { capability });
      assert.equal(response.status, 401); privateHeaders(response);
    }
    for (const revision of [null, '*', '0', '"1","2"']) assert.equal((await invoke(kind, payload, { revision })).status, 428);
    assert.equal((await invoke(kind, payload, { revision: '9007199254740992' })).status, 400);
    assert.equal((await invoke(kind, payload, { capability: 'A'.repeat(43) })).status, 403);
  }
  assert.equal((await store.read(room.roomId, room.ownerToken)).revision, 1);
}));

test('malformed, extra-field, unsafe and cross-origin requests fail without mutating the room', async () => fixture(async ({ store, room, invoke }) => {
  for (const [kind, payload] of [['review', apply], ['interact', vote]]) {
    for (const raw of ['{', '[]', 'null', '{}']) assert.equal((await invoke(kind, payload, { raw })).status, 400);
    assert.equal((await invoke(kind, { ...payload, actor: { id: 'access-forged', role: 'owner' } })).status, 400);
    assert.equal((await invoke(kind, payload, { headers: { 'Content-Type': 'text/plain' } })).status, 415);
    assert.equal((await invoke(kind, payload, { headers: { Origin: 'https://foreign.example.test' } })).status, 403);
    assert.equal((await invoke(kind, payload, { suffix: '?capability=synthetic' })).status, 400);
    assert.equal((await invoke(kind, payload, { raw: ' '.repeat(512 * 1024 + 1) })).status, 413);
  }
  assert.equal((await invoke('interact', { ...vote, action: 'comment', value: 'person@example.test' })).status, 400);
  assert.equal((await invoke('interact', { ...vote, action: 'vote', value: { choice: 'support', actor: 'forged' } })).status, 400);
  assert.equal((await invoke('review', { ...apply, decision: 'confirm' })).status, 400);
  const retained = await store.read(room.roomId, room.ownerToken);
  assert.equal(retained.revision, 1); assert.deepEqual(retained.state, board());
}));

test('viewers cannot interact or review, and editor capabilities cannot apply owner decisions', async () => fixture(async ({ room, editor, viewer, invoke, store }) => {
  assert.equal((await invoke('interact', vote, { capability: viewer.token })).status, 403);
  assert.equal((await invoke('interact', { ...vote, action: 'comment', value: 'Viewer note' }, { capability: viewer.token })).status, 403);
  assert.equal((await invoke('review', apply, { capability: viewer.token })).status, 403);
  assert.equal((await invoke('review', apply, { capability: editor.token })).status, 403);
  assert.equal((await store.read(room.roomId, room.ownerToken)).revision, 1);
}));

test('editor vote/comment and owner apply produce versioned private responses with server attribution', async () => fixture(async ({ room, editor, viewer, invoke, store }) => {
  const voted = await invoke('interact', vote, { capability: editor.token, revision: '"1"' });
  assert.equal(voted.status, 200); privateHeaders(voted); assert.equal(voted.headers.get('etag'), '"2"');
  const first = await voted.json();
  assert.equal(first.revision, 2); assert.equal(first.role, 'editor');
  assert.equal(first.state.interactions.votes[0].actor.id, `access-${editor.inviteId}`);
  assert.equal(first.state.interactions.votes[0].actor.role, 'editor');
  assert.deepEqual(first.state.days, {});
  const commented = await invoke('interact', { ...vote, action: 'comment', value: 'Prefer a morning walk.\nCheck museum hours.' }, { capability: editor.token, revision: '2' });
  assert.equal(commented.status, 200); assert.equal(commented.headers.get('etag'), '"3"');
  const second = await commented.json();
  assert.equal(second.state.interactions.comments[0].createdAt, '2030-04-01T12:00:00.000Z');
  assert.equal(second.state.interactions.comments[0].actor.id, `access-${editor.inviteId}`);
  const stale = await invoke('review', apply, { revision: '2' });
  assert.equal(stale.status, 412); privateHeaders(stale); assert.equal(stale.headers.get('etag'), '"3"');
  const conflict = await stale.json();
  assert.equal(conflict.revision, 3); assert.equal(conflict.state.interactions.comments.length, 1);
  assert.equal(conflict.state.suggestions[0].status, 'pending');
  const applied = await invoke('review', apply, { revision: '3' });
  assert.equal(applied.status, 200); privateHeaders(applied); assert.equal(applied.headers.get('etag'), '"4"');
  const final = await applied.json();
  assert.equal(final.state.suggestions[0].status, 'applied'); assert.deepEqual(final.state.days['2030-05-02'], ['walk']);
  assert.deepEqual(final.state.interactions, second.state.interactions);
  assert.equal((await invoke('interact', vote, { capability: editor.token, revision: '4' })).status, 409);
  assert.equal((await invoke('review', apply, { revision: '4' })).status, 409);
  assert.equal((await store.read(room.roomId, viewer.token)).revision, 4);
  const exposed = JSON.stringify([first, second, conflict, final]);
  for (const capability of [room.ownerToken, editor.token, viewer.token]) assert.equal(exposed.includes(capability), false);
}));
