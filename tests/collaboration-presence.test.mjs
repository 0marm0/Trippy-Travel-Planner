import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openCollaborationStore } from '../src/lib/collaboration/store.ts';
import { collaborationEventResponse } from '../src/lib/collaboration/events.ts';
import { consumePresenceStream, validatePresenceSummary } from '../src/lib/collaboration/presence.ts';
const board = () => ({ title: 'Synthetic presence room', startDate: '2030-04-01', endDate: '2030-04-03', cities: [{id:'harbor',name:'Invented Harbor'}], activities:[], days:{} });
const fails = status => error => error.status === status;
async function fixture(run) {
  const directory = await mkdtemp(join(tmpdir(), 'trippy-presence-')); let clock = Date.parse('2030-01-01T00:00:00Z');
  const path = join(directory, 'rooms.sqlite'), store = await openCollaborationStore({sqlitePath:path, now:()=>clock});
  try { const room = await store.create(board()), editor = await store.invite(room.roomId, room.ownerToken, 'editor'), viewer = await store.invite(room.roomId, room.ownerToken, 'viewer'); await run({store, room, editor, viewer, path, advance:milliseconds=>{clock+=milliseconds;}}); }
  finally { await store.close(); await rm(directory, {recursive:true,force:true}); }
}
test('presence is opt-in, role-readable, capability-pseudonymous and expires after at most 30 seconds without changing board revision', async () => fixture(async ({store,room,editor,viewer,advance}) => {
  assert.deepEqual((await store.presence(room.roomId, room.ownerToken)).presence, []);
  const editorActive = await store.presence(room.roomId, editor.token, true); assert.equal(editorActive.presence.length, 1); assert.equal(editorActive.presence[0].role, 'editor'); assert.match(editorActive.presence[0].id, /^access-/);
  assert.equal(JSON.stringify(editorActive).includes(editor.token), false); assert.equal('state' in editorActive, false);
  const viewerRead = await store.presence(room.roomId, viewer.token); assert.equal(viewerRead.presence.length, 1);
  await store.presence(room.roomId, viewer.token, true); assert.equal((await store.presence(room.roomId, room.ownerToken)).presence.length, 2);
  advance(29999); assert.equal((await store.presence(room.roomId, room.ownerToken)).presence.length, 2);
  advance(1); assert.equal((await store.presence(room.roomId, room.ownerToken)).presence.length, 0);
  const after = await store.read(room.roomId, room.ownerToken); assert.equal(after.revision, 1); assert.deepEqual(after.state, board());
}));
test('shared capability renewals collapse to one lease, withdrawal is explicit and storage is shared across server connections', async () => fixture(async ({store,room,editor,path,advance}) => {
  const another = await openCollaborationStore({sqlitePath:path, now:()=>Date.parse('2030-01-01T00:00:10Z')});
  try {
    await store.presence(room.roomId, editor.token, true); await another.presence(room.roomId, editor.token, true);
    assert.equal((await another.presence(room.roomId, room.ownerToken)).presence.length, 1);
    advance(31000); assert.equal((await store.presence(room.roomId, room.ownerToken)).presence.length, 1);
    await another.presence(room.roomId, editor.token, false); assert.equal((await store.presence(room.roomId, room.ownerToken)).presence.length, 0);
  } finally { await another.close(); }
}));
test('revocation, capability expiry, owner rotation and room deletion invalidate both reads and lease renewals', async () => fixture(async ({store,room,editor,viewer,advance}) => {
  await store.presence(room.roomId, editor.token, true); await store.revoke(room.roomId,room.ownerToken,editor.inviteId);
  assert.deepEqual((await store.presence(room.roomId,viewer.token)).presence, []); await assert.rejects(store.presence(room.roomId,editor.token,true),fails(403));
  await store.presence(room.roomId,room.ownerToken,true); const rotated = await store.rotateOwner(room.roomId,room.ownerToken,1);
  await assert.rejects(store.presence(room.roomId,room.ownerToken),fails(403)); assert.deepEqual((await store.presence(room.roomId,rotated.ownerToken)).presence, []);
  const expiring = await store.invite(room.roomId,rotated.ownerToken,'viewer', '2030-01-02T00:00:00.000Z');
  await store.presence(room.roomId,expiring.token,true); advance(24*60*60*1000); await assert.rejects(store.presence(room.roomId,expiring.token,true),fails(403));
  await store.deleteRoom(room.roomId,rotated.ownerToken,2); await assert.rejects(store.presence(room.roomId,rotated.ownerToken),fails(404));
}));
test('revision stream sends only strict summaries, is bounded, and reauthorizes every tick', async () => fixture(async ({store,room,editor}) => {
  await store.presence(room.roomId, editor.token, true); let reads = 0;
  const response = await collaborationEventResponse(new Request('https://planner.example.test/events'), async()=>{ reads++; return store.presence(room.roomId,room.ownerToken); }, {intervalMs:1,checks:3});
  const seen = []; await consumePresenceStream(response, value=>seen.push(value), new AbortController().signal);
  assert.equal(reads, 3); assert.equal(seen.length, 1); assert.equal(response.headers.get('content-type'), 'text/event-stream'); assert.match(response.headers.get('cache-control'), /no-store/);
  const encoded = JSON.stringify(seen); assert.equal(encoded.includes('state'), false); assert.equal(encoded.includes(room.ownerToken), false);
  let revocationReads = 0;
  const revoked = await collaborationEventResponse(new Request('https://planner.example.test/events'),async()=>{ if (++revocationReads === 2) await store.revoke(room.roomId,room.ownerToken,editor.inviteId); return store.presence(room.roomId,editor.token); },{intervalMs:1,checks:5});
  const received = []; await assert.rejects(consumePresenceStream(revoked,value=>received.push(value),new AbortController().signal),/stopped/); assert.equal(received.length,1); assert.equal(revocationReads,2);
}));
test('abort and reader cancellation stop server checks, and reconnect reads the current revision', async () => fixture(async ({store,room}) => {
  const controller = new AbortController(); let reads = 0;
  const response = await collaborationEventResponse(new Request('https://planner.example.test/events',{signal:controller.signal}),async()=>{reads++;return store.presence(room.roomId,room.ownerToken);},{intervalMs:1,checks:25});
  const reader = response.body.getReader(); await reader.read(); controller.abort(); while (!(await reader.read()).done) { /* drain closure */ } assert.equal(reads,1);
  const second = await collaborationEventResponse(new Request('https://planner.example.test/events'),async()=>{reads++;return store.presence(room.roomId,room.ownerToken);},{intervalMs:1,checks:25});
  const secondReader = second.body.getReader(); await secondReader.read(); await secondReader.cancel(); const readsAtCancel = reads;
  await new Promise(resolve=>setTimeout(resolve,10)); assert.equal(reads,readsAtCancel);
  await store.update(room.roomId,room.ownerToken,1,{...board(),title:'New shared title'});
  const resumed = await collaborationEventResponse(new Request('https://planner.example.test/events'),()=>store.presence(room.roomId,room.ownerToken),{checks:1});
  const received=[]; await consumePresenceStream(resumed,value=>received.push(value),new AbortController().signal); assert.equal(received[0].revision,2);
}));
test('client decoder rejects private/extra fields and ignores data after access-switch abort', async () => {
  const value={revision:1,presence:[],leaseSeconds:30}; assert.equal(validatePresenceSummary(value),value);
  for (const bad of [{...value,state:board()},{...value,token:'invented'},{...value,presence:[{id:'access-forged',role:'owner'}]},{...value,presence:[{id:'access-00000000-0000-0000-0000-000000000000',role:'person'}]}]) assert.throws(()=>validatePresenceSummary(bad));
  const controller=new AbortController();controller.abort();let calls=0;
  const response=new Response(`event: update\ndata: ${JSON.stringify(value)}\n\n`,{headers:{'Content-Type':'text/event-stream'}});
  await consumePresenceStream(response,()=>calls++,controller.signal);assert.equal(calls,0);
});

test('capability expiry crossed inside presence transaction denies read/renew/withdraw and rolls back lease changes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'trippy-presence-expiry-crossing-'));
  const path = join(directory, 'rooms.sqlite'), initial = Date.parse('2030-01-01T00:00:00Z');
  let crossing = false, clockReads = 0;
  const store = await openCollaborationStore({ sqlitePath: path, now: () => crossing ? initial + (++clockReads === 1 ? 9999 : 10000) : initial });
  const { DatabaseSync } = await import('node:sqlite');
  const inspect = new DatabaseSync(path);
  try {
    const room = await store.create(board());
    const viewer = await store.invite(room.roomId, room.ownerToken, 'viewer', '2030-01-01T00:00:10.000Z');
    await store.presence(room.roomId, room.ownerToken, true);
    await store.presence(room.roomId, viewer.token, true);
    const leases = () => inspect.prepare('SELECT capability_id, lease_until FROM collaboration_presence ORDER BY capability_id').all();
    const before = leases(); assert.equal(before.length, 2);
    for (const present of [undefined, true, false]) {
      crossing = true; clockReads = 0;
      await assert.rejects(store.presence(room.roomId, viewer.token, present), fails(403));
      assert.ok(clockReads >= 5, 'authorization must be repeated after the summary SELECT');
      crossing = false;
      assert.deepEqual(leases(), before, 'expiry denial must roll back cleanup and renewal/withdrawal');
    }
    assert.equal((await store.read(room.roomId, room.ownerToken)).revision, 1);
  } finally { inspect.close(); await store.close(); await rm(directory, {recursive:true,force:true}); }
});
