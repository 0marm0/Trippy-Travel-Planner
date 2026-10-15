import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {openCollaborationStore} from '../src/lib/collaboration/store.ts';
import {validateCollaborationState} from '../src/lib/collaboration/schema.ts';
import {validateHistorySummary,validateHistoryEntry,readHistoryResponse} from '../src/lib/collaboration/history.ts';
const initial=Date.parse('2030-01-01T00:00:00.000Z');
const board=()=>({title:'Invented history board',startDate:'2030-05-01',endDate:'2030-05-03',cities:[{id:'harbor',name:'Invented Harbor'}],activities:[{id:'walk',cityId:'harbor',title:'River walking option',notes:'Distinctive activity prose omitted from history'}],days:{},suggestions:[{id:'move-walk',kind:'day',status:'pending',activityId:'walk',day:'2030-05-02'}]});
const fails=status=>error=>error.status===status;
async function fixture(run,clock=()=>initial){const directory=await mkdtemp(join(tmpdir(),'trippy-history-'));const path=join(directory,'rooms.sqlite'),store=await openCollaborationStore({sqlitePath:path,now:clock});try{const room=await store.create(board());await run({store,room,path});}finally{await store.close();await rm(directory,{recursive:true,force:true});}}

test('only server-attributed bounded summaries are recorded; board content and access values stay out',async()=>fixture(async({store,room})=>{
  assert.deepEqual((await store.history(room.roomId,room.ownerToken)).entries,[]);
  const editor=await store.invite(room.roomId,room.ownerToken,'editor'),viewer=await store.invite(room.roomId,room.ownerToken,'viewer');
  const next={...board(),activities:[...board().activities,{id:'gallery',cityId:'harbor',title:'Distinctive indoor option',notes:'Distinctive private-free notes'}]};
  await store.update(room.roomId,editor.token,1,next);
  const summary=await store.history(room.roomId,viewer.token);assert.equal(summary.revision,2);assert.equal(summary.retainedLimit,100);assert.equal(summary.entries.length,3);
  const event=summary.entries.at(-1);assert.deepEqual(event.actor,{id:`access-${editor.inviteId}`,role:'editor'});assert.equal(event.action,'board-update');assert.deepEqual(event.changes,[{category:'activities',added:1,changed:0,removed:0}]);
  assert.equal(event.at,'2030-01-01T00:00:00.000Z');assert.deepEqual(validateHistorySummary(summary),summary);
  const text=JSON.stringify(summary);for(const excluded of [room.ownerToken,editor.token,viewer.token,board().title,board().activities[0].notes,'Distinctive indoor option','gallery','token_hash','state'])assert.equal(text.includes(excluded),false);
  assert.equal('history' in (await store.read(room.roomId,viewer.token)).state,false);
  assert.throws(()=>validateCollaborationState({...next,history:summary.entries}));
  await assert.rejects(store.update(room.roomId,viewer.token,2,next),fails(403));
  await assert.rejects(store.update(room.roomId,editor.token,2,{...next,title:'person@example.test'}),fails(400));
  assert.equal((await store.history(room.roomId,viewer.token)).entries.length,3);
}));

test('proposal comments and application get category counts without comment text or proposal payload',async()=>fixture(async({store,room})=>{
  const editor=await store.invite(room.roomId,room.ownerToken,'editor');
  await store.interactSuggestion(room.roomId,editor.token,1,'move-walk','comment','Distinctive suggestion discussion');
  await store.reviewSuggestion(room.roomId,room.ownerToken,2,'move-walk','apply');
  const summary=await store.history(room.roomId,editor.token);assert.deepEqual(summary.entries.map(item=>item.action),['invitation-created','proposal-interaction','proposal-review']);
  assert.deepEqual(summary.entries[1].changes,[{category:'interactions',added:1,changed:0,removed:0}]);
  assert.ok(summary.entries[2].changes.some(item=>item.category==='days'&&item.added===1));assert.ok(summary.entries[2].changes.some(item=>item.category==='proposals'&&item.changed===1));
  assert.equal(JSON.stringify(summary).includes('Distinctive suggestion discussion'),false);
}));

test('stale races and duplicate revocations never append duplicate summaries',async()=>fixture(async({store,room})=>{
  const editor=await store.invite(room.roomId,room.ownerToken,'editor');
  const results=await Promise.allSettled([store.update(room.roomId,room.ownerToken,1,{...board(),title:'First option'}),store.update(room.roomId,room.ownerToken,1,{...board(),title:'Second option'})]);
  assert.equal(results.filter(item=>item.status==='fulfilled').length,1);assert.equal(results.filter(item=>item.status==='rejected'&&item.reason.status===412).length,1);
  await store.revoke(room.roomId,room.ownerToken,editor.inviteId);const before=await store.history(room.roomId,room.ownerToken);await store.revoke(room.roomId,room.ownerToken,editor.inviteId);assert.deepEqual(await store.history(room.roomId,room.ownerToken),before);
  assert.deepEqual(before.entries.map(item=>item.action),['invitation-created','board-update','invitation-revoked']);
}));

test('summary insertion failure rolls back board, revision and all history changes',async()=>fixture(async({store,room,path})=>{
  const inspect=new DatabaseSync(path);try{
    inspect.exec("CREATE TRIGGER fail_history BEFORE INSERT ON collaboration_history BEGIN SELECT RAISE(ABORT,'synthetic history failure'); END;");
    await assert.rejects(store.update(room.roomId,room.ownerToken,1,{...board(),title:'Uncommitted changed title'}));
    assert.equal((await store.read(room.roomId,room.ownerToken)).revision,1);assert.deepEqual((await store.history(room.roomId,room.ownerToken)).entries,[]);assert.equal((await store.read(room.roomId,room.ownerToken)).state.title,board().title);
    await assert.rejects(store.invite(room.roomId,room.ownerToken,'editor'));assert.equal(inspect.prepare('SELECT COUNT(*) AS count FROM collaboration_capabilities').get().count,1);
    inspect.exec('DROP TRIGGER fail_history');await store.update(room.roomId,room.ownerToken,1,{...board(),title:'Committed change'});assert.equal((await store.history(room.roomId,room.ownerToken)).entries[0].sequence,1);
  }finally{inspect.close();}
}));

test('history read expiry crossing denies response; post-append expiry rolls back state and summary',async()=>{
  let crossing=false,reads=0,threshold=2;
  await fixture(async({store,room,path})=>{
    const editor=await store.invite(room.roomId,room.ownerToken,'editor','2030-01-01T00:00:10.000Z');
    crossing=true;reads=0;await assert.rejects(store.history(room.roomId,editor.token),fails(403));assert.equal(reads,2);
    crossing=false;const before=await store.history(room.roomId,room.ownerToken);threshold=5;crossing=true;reads=0;
    await assert.rejects(store.update(room.roomId,editor.token,1,{...board(),activities:board().activities.map(item=>({...item,notes:'Edited planning note'}))}),fails(403));assert.ok(reads>=5);
    crossing=false;assert.deepEqual(await store.history(room.roomId,room.ownerToken),before);assert.equal((await store.read(room.roomId,room.ownerToken)).revision,1);
    const inspect=new DatabaseSync(path);try{assert.equal(inspect.prepare('SELECT COUNT(*) AS count FROM collaboration_history').get().count,1);}finally{inspect.close();}
  },()=>crossing?initial+(++reads>=threshold?10000:9999):initial);
});

test('revoked, expired and replaced owner access cannot read; deletion clears history',async()=>{
  let time=initial;await fixture(async({store,room,path})=>{
    const editor=await store.invite(room.roomId,room.ownerToken,'editor'),viewer=await store.invite(room.roomId,room.ownerToken,'viewer','2030-01-01T00:00:10.000Z');
    await store.revoke(room.roomId,room.ownerToken,editor.inviteId);await assert.rejects(store.history(room.roomId,editor.token),fails(403));
    time+=10000;await assert.rejects(store.history(room.roomId,viewer.token),fails(403));
    const rotated=await store.rotateOwner(room.roomId,room.ownerToken,1);await assert.rejects(store.history(room.roomId,room.ownerToken),fails(403));
    assert.equal((await store.history(room.roomId,rotated.ownerToken)).entries.at(-1).action,'owner-rotated');
    await store.deleteRoom(room.roomId,rotated.ownerToken,2);await assert.rejects(store.history(room.roomId,rotated.ownerToken),fails(404));
    const inspect=new DatabaseSync(path);try{assert.equal(inspect.prepare('SELECT COUNT(*) AS count FROM collaboration_history').get().count,0);}finally{inspect.close();}
  },()=>time);
});

test('retention keeps exactly latest100 with monotonic sequence; old rooms fabricate no past',async()=>fixture(async({store,room,path})=>{
  for(let revision=1;revision<=105;revision++)await store.update(room.roomId,room.ownerToken,revision,{...board(),title:`Invented revision ${revision}`});
  const summary=await store.history(room.roomId,room.ownerToken);assert.equal(summary.entries.length,100);assert.equal(summary.entries[0].sequence,6);assert.equal(summary.entries.at(-1).sequence,105);assert.equal(summary.startsAtRevision,7);
  const inspect=new DatabaseSync(path);try{assert.equal(inspect.prepare('SELECT COUNT(*) AS count FROM collaboration_history').get().count,100);inspect.prepare('DELETE FROM collaboration_history').run();}finally{inspect.close();}
  const legacy=await store.history(room.roomId,room.ownerToken);assert.equal(legacy.revision,106);assert.deepEqual(legacy.entries,[]);assert.equal(legacy.startsAtRevision,null);
}));

test('strict decoder refuses extra fields, raw data, forged actor IDs, unsorted history and unbounded response',async()=>fixture(async({store,room})=>{
  await store.update(room.roomId,room.ownerToken,1,{...board(),title:'Updated invented board'});const summary=await store.history(room.roomId,room.ownerToken),entry=summary.entries[0];
  for(const bad of [{...entry,notes:'Extra'}, {...entry,actor:{...entry.actor,id:'forged'}},{...entry,changes:[{category:'email',added:1,changed:0,removed:0}]},{...entry,changes:[{category:'trip',added:2001,changed:0,removed:0}]},{...entry,at:'2030-02-30T00:00:00.000Z'}])assert.throws(()=>validateHistoryEntry(bad));
  for(const bad of [{...summary,entries:Array(101).fill(entry)},{...summary,entries:[entry,entry]},{...summary,startsAtRevision:1},{...summary,state:board()}])assert.throws(()=>validateHistorySummary(bad));
  assert.deepEqual(await readHistoryResponse(Response.json(summary)),summary);await assert.rejects(readHistoryResponse(new Response(' '.repeat(260001),{headers:{'Content-Type':'application/json'}})),/exceeds limits/);
  await assert.rejects(readHistoryResponse(Response.json({error:'No access'},{status:403})),/unavailable/);
}));
