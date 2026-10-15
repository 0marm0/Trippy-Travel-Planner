import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
import * as schema from '../src/lib/collaboration/schema.ts';
import { openCollaborationStore } from '../src/lib/collaboration/store.ts';
import { collaborationEventResponse } from '../src/lib/collaboration/events.ts';
async function load(relative, dependencies) {
  const source = await readFile(new URL(relative, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  const compiledModule = {exports:{}}; vm.runInNewContext(compiled,{module:compiledModule,exports:compiledModule.exports,Request,Response,Headers,URL,TextEncoder,TextDecoder,Uint8Array,process:{env:{}},require(name){if(!(name in dependencies)) throw new Error(`Unknown test import ${name}`);return dependencies[name];}}); return compiledModule.exports;
}
const http = await load('../src/lib/collaboration/http.ts',{'./schema.ts':schema,'node:crypto':crypto});
async function fixture(run) {
  const directory=await mkdtemp(join(tmpdir(),'trippy-presence-routes-')), store=await openCollaborationStore({sqlitePath:join(directory,'rooms.sqlite')});
  try {
    const room=await store.create({title:'Synthetic route room',startDate:'2030-04-01',endDate:'2030-04-03',cities:[{id:'harbor',name:'Invented Harbor'}],activities:[],days:{}}), viewer=await store.invite(room.roomId,room.ownerToken,'viewer');
    const dependencies={'@/lib/collaboration/store':{getCollaborationStore:async()=>store},'@/lib/collaboration/http':http,'@/lib/collaboration/schema':schema,'@/lib/collaboration/events':{collaborationEventResponse}};
    const presence=await load('../src/app/api/collaboration/rooms/[id]/presence/route.ts',dependencies), events=await load('../src/app/api/collaboration/rooms/[id]/events/route.ts',dependencies);
    const invoke=(kind,method='GET',payload,{access=viewer.token,headers={},suffix=''}={})=>{
      const request=new Request(`https://planner.example.test/api/collaboration/rooms/${room.roomId}/${kind}${suffix}`,{method,headers:{...(access!==null?{Authorization:`Bearer ${access}`} : {}),Origin:'https://planner.example.test',...(method==='POST'?{'Content-Type':'application/json'}:{}),...headers},...(method==='POST'?{body:JSON.stringify(payload)}:{})});
      return (kind==='presence'?presence:events)[method](request,{params:Promise.resolve({id:room.roomId})});
    };
    await run({store,room,viewer,invoke});
  } finally {await store.close();await rm(directory,{recursive:true,force:true});}
}
test('presence endpoints require Authorization, same origin and exact opt-in boolean without caller-supplied identities',async()=>fixture(async({store,room,viewer,invoke})=>{
  for(const kind of ['presence','events']) {
    assert.equal((await invoke(kind,'GET',null,{access:null})).status,401);
    assert.equal((await invoke(kind,'GET',null,{access:'A'.repeat(43)})).status,403);
    assert.equal((await invoke(kind,'GET',null,{headers:{Origin:'https://foreign.example.test'}})).status,403);
    assert.equal((await invoke(kind,'GET',null,{suffix:'?capability=invented'})).status,400);
  }
  for(const payload of [{},{present:'true'},{present:true,id:'forged'},{present:true,notes:'draft'}]) assert.equal((await invoke('presence','POST',payload)).status,400);
  assert.equal((await invoke('presence','POST',{present:true},{headers:{'Content-Type':'text/plain'}})).status,415);
  const active=await invoke('presence','POST',{present:true});assert.equal(active.status,200);assert.match(active.headers.get('cache-control'),/private.*no-store/);
  const summary=await active.json();assert.equal(summary.presence[0].role,'viewer');assert.equal(summary.revision,1);assert.equal(JSON.stringify(summary).includes(viewer.token),false);assert.equal('state' in summary,false);
  assert.equal((await store.read(room.roomId,room.ownerToken)).revision,1);
  await invoke('presence','POST',{present:false});assert.equal((await (await invoke('presence')).json()).presence.length,0);
}));
test('actual events route streams only summaries, cancels cleanly and rejects revoked access before streaming',async()=>fixture(async({store,room,viewer,invoke})=>{
  const response=await invoke('events');assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'text/event-stream');
  const reader=response.body.getReader(), first=await reader.read(), text=new TextDecoder().decode(first.value);assert.match(text,/event: update/);assert.equal(text.includes('state'),false);assert.equal(text.includes(viewer.token),false);await reader.cancel();
  await store.revoke(room.roomId,room.ownerToken,viewer.inviteId);assert.equal((await invoke('events')).status,403);assert.equal((await invoke('presence','POST',{present:true})).status,403);
}));
