import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoomAccessFragment } from '../src/lib/collaboration/access-fragment.ts';

const invented = 'a'.repeat(43);

test('room access fragments accept one complete capability, including URL encoding', () => {
  assert.equal(parseRoomAccessFragment(`#token=${invented}`).present, true);
  assert.equal(parseRoomAccessFragment(`#token=${invented}`).capability === invented, true);
  assert.equal(parseRoomAccessFragment(`#token=${'%61'.repeat(43)}`).capability === invented, true);
  assert.equal(parseRoomAccessFragment('#board').present, false);
});

test('ambiguous, short and unsupported access fragments are rejected', () => {
  for (const hash of [`#token=${invented}&token=${invented}`, '#token=', '#token=short', `#token=${'a'.repeat(44)}`, `#token=${'a'.repeat(42)}%2B`, '#token=person%40example.test']) {
    const result = parseRoomAccessFragment(hash);
    assert.equal(result.present, true);
    assert.equal(result.capability === null, true);
  }
  assert.equal(parseRoomAccessFragment('#section=token').present, false);
});

// Run the actual access effect in an isolated browser harness. This exercises
// delayed completions/hash events without mounting unrelated room UI or a server.
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const workspaceSource = await readFile(new URL('../src/components/collaboration-workspace.tsx', import.meta.url), 'utf8');
const parsedWorkspace = ts.createSourceFile('collaboration-workspace.tsx', workspaceSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let effectSource;
function findAccessEffect(node) {
  if (ts.isCallExpression(node) && node.expression.getText(parsedWorkspace) === 'useEffect' && node.arguments[0]?.getText(parsedWorkspace).includes('function consumeFragment(')) effectSource = node.arguments[0].getText(parsedWorkspace);
  ts.forEachChild(node, findAccessEffect);
}
findAccessEffect(parsedWorkspace);
assert.ok(effectSource, 'the collaboration access effect must be exercised');
const compiledEffect = ts.transpileModule(`const effect = ${effectSource}; effect();`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
function accessHarness() {
  const listeners = new Map(), pending = [], storage = new Map();
  const state = { connected: false, snapshot: null, plan: null, latest: null, connectionError: '' };
  const refreshRoomRef = { current: null };
  const token = { current: '' }, busyRef = { current: false }, dirtyRef = { current: false }, activityDraftRef = { current: false }, commentDraftRef = { current: '' }, closedRef = { current: false }, revisionRef = { current: 0 };
  let poll;
  const window = { location: { hash: `#token=${'a'.repeat(43)}`, pathname: '/collaborate/synthetic-room', search: '' }, history: { state: null, replaceState() { window.location.hash = ''; } }, sessionStorage: { setItem: (key, value) => storage.set(key, value), getItem: key => storage.get(key) || null }, addEventListener: (name, handler) => listeners.set(name, handler), removeEventListener: name => listeners.delete(name), setInterval: handler => { poll = handler; return 1; }, clearInterval() {} };
  const set = field => value => { state[field] = typeof value === 'function' ? value(state[field]) : value; };
  const context = { roomId: 'synthetic-room', window, token, busyRef, dirtyRef, activityDraftRef, commentDraftRef, closedRef, revisionRef, refreshRoomRef, parseRoomAccessFragment, sessionKey: id => `synthetic:${id}`, AbortController, AbortSignal,
    fetch: (url, options) => new Promise((resolve, reject) => pending.push({ url, options, resolve, reject })), responseBody: async response => response,
    setConnected: set('connected'), setAccessToken: set('accessToken'), setInvites: set('invites'), setInviteReview: set('inviteReview'), setReconciliation: set('reconciliation'), setNotice: set('notice'), setConnectionError: set('connectionError'), setLatest: set('latest'), setSnapshot: set('snapshot'), setPlan: set('plan') };
  const cleanup = vm.runInNewContext(compiledEffect, context);
  return { state, pending, token, busyRef, dirtyRef, refreshRoomRef, activityDraftRef, commentDraftRef, cleanup, poll: () => poll(), change: capability => { window.location.hash = `#token=${capability}`; listeners.get('hashchange')(); } };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
const snapshot = (role, revision = 1, title = 'Synthetic board') => ({ roomId: 'synthetic-room', role, revision, state: { title }, invites: role === 'owner' ? [{ inviteId: 'synthetic-invite', role: 'editor' }] : undefined });

test('access switches ignore stale reads, refresh same-revision roles and preserve dirty boards', async () => {
  const harness = accessHarness();
  harness.pending[0].resolve(snapshot('owner')); await settle();
  harness.state.plan = { title: 'Unsaved local board' }; harness.dirtyRef.current = true;
  harness.poll(); const oldRead = harness.pending[1];
  harness.change('b'.repeat(43));
  assert.equal(oldRead.options.signal.aborted, true);
  oldRead.resolve(snapshot('owner', 99, 'Stale read')); await settle();
  harness.pending[2].resolve(snapshot('viewer')); await settle();
  assert.equal(harness.state.snapshot.role, 'viewer');
  assert.equal(harness.state.plan.title, 'Unsaved local board');
  assert.equal(harness.state.latest.revision, 1);
  assert.equal(harness.state.invites.length, 0);
  assert.equal(harness.state.accessToken, 'b'.repeat(43));
  harness.cleanup();
});

test('switches during mutations wait for polling and do not deadlock after busy clears', async () => {
  const harness = accessHarness(); harness.pending[0].resolve(snapshot('owner')); await settle();
  harness.busyRef.current = true; harness.change('b'.repeat(43));
  assert.equal(harness.pending.length, 1); assert.equal(harness.token.current, 'a'.repeat(43));
  harness.poll(); assert.equal(harness.pending.length, 1);
  harness.busyRef.current = false; harness.poll();
  assert.equal(harness.pending.length, 2); assert.equal(harness.pending[1].options.headers.Authorization, `Bearer ${'b'.repeat(43)}`);
  harness.pending[1].resolve(snapshot('editor')); await settle();
  assert.equal(harness.state.connected, true); assert.equal(harness.state.snapshot.role, 'editor');
  harness.cleanup();
});

test('a failed pre-rotation read cannot disconnect newly rotated room access', async () => {
  const harness = accessHarness(); harness.pending[0].resolve(snapshot('owner')); await settle();
  harness.poll(); const oldRead = harness.pending[1];
  // RoomLifecycle replaces the owner capability after its server mutation.
  harness.busyRef.current = true; harness.token.current = 'b'.repeat(43); harness.busyRef.current = false;
  oldRead.reject(new Error('Old owner capability was revoked')); await settle();
  assert.equal(harness.state.connected, true);
  assert.equal(harness.state.connectionError, '');
  harness.poll(); harness.pending[2].resolve(snapshot('owner', 2)); await settle();
  assert.equal(harness.state.accessToken, 'b'.repeat(43)); assert.equal(harness.state.connected, true);
  harness.cleanup();
});

test('stream-triggered refresh uses the same dirty-form, busy and access-generation guards as polling', async () => {
  const harness = accessHarness(); harness.pending[0].resolve(snapshot('editor')); await settle();
  harness.state.plan = {title:'Unsaved board'}; harness.activityDraftRef.current = true;
  harness.refreshRoomRef.current(); harness.pending[1].resolve(snapshot('editor',2,'Incoming group board')); await settle();
  assert.equal(harness.state.plan.title,'Unsaved board'); assert.equal(harness.state.latest.revision,2);
  harness.activityDraftRef.current = false; harness.commentDraftRef.current = 'Unfinished discussion';
  harness.refreshRoomRef.current(); const oldRead = harness.pending[2]; harness.change('b'.repeat(43));
  assert.equal(oldRead.options.signal.aborted,true); oldRead.resolve(snapshot('owner',99)); await settle();
  harness.pending[3].resolve(snapshot('viewer',2)); await settle(); assert.equal(harness.state.plan.title,'Unsaved board'); assert.equal(harness.state.snapshot.role,'viewer');
  harness.busyRef.current = true; const count = harness.pending.length; harness.refreshRoomRef.current(); assert.equal(harness.pending.length,count);
  harness.cleanup(); assert.equal(harness.refreshRoomRef.current,null);
});
