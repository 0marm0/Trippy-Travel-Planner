import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
import * as schema from '../src/lib/collaboration/schema.ts';
import {openCollaborationStore} from '../src/lib/collaboration/store.ts';
async function load(relative,dependencies){const source=await readFile(new URL(relative,import.meta.url),'utf8');const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const compiledModule={exports:{}};vm.runInNewContext(compiled,{module:compiledModule,exports:compiledModule.exports,Request,Response,Headers,URL,TextEncoder,TextDecoder,Uint8Array,process:{env:{}},require(name){if(!(name in dependencies))throw new Error(`Unknown test import ${name}`);return dependencies[name];}});return compiledModule.exports;}
const http=await load('../src/lib/collaboration/http.ts',{'./schema.ts':schema,'node:crypto':crypto});
test('history route requires current same-origin Authorization and offers no writable methods',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'trippy-history-route-')),store=await openCollaborationStore({sqlitePath:join(directory,'rooms.sqlite')});
  try{const room=await store.create({title:'Invented history room',startDate:'2030-05-01',endDate:'2030-05-03',cities:[],activities:[],days:{}}),viewer=await store.invite(room.roomId,room.ownerToken,'viewer');
    const route=await load('../src/app/api/collaboration/rooms/[id]/history/route.ts',{'@/lib/collaboration/store':{getCollaborationStore:async()=>store},'@/lib/collaboration/http':http});
    const invoke=({access=viewer.token,origin='https://planner.example.test',suffix=''}={})=>route.GET(new Request(`https://planner.example.test/api/collaboration/rooms/${room.roomId}/history${suffix}`,{headers:{...(access?{Authorization:`Bearer ${access}`} : {}),Origin:origin}}),{params:Promise.resolve({id:room.roomId})});
    assert.equal(route.POST,undefined);assert.equal(route.PATCH,undefined);assert.equal(route.PUT,undefined);assert.equal(route.DELETE,undefined);
    assert.equal((await invoke({access:null})).status,401);assert.equal((await invoke({access:'A'.repeat(43)})).status,403);assert.equal((await invoke({origin:'https://foreign.example.test'})).status,403);assert.equal((await invoke({suffix:'?access=forged'})).status,400);
    const response=await invoke();assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private.*no-store/);assert.equal(response.headers.get('etag'),'"1"');const value=await response.json();assert.equal(value.entries.length,1);assert.equal(value.entries[0].action,'invitation-created');assert.equal('state' in value,false);assert.equal(JSON.stringify(value).includes(viewer.token),false);
    await store.revoke(room.roomId,room.ownerToken,viewer.inviteId);assert.equal((await invoke()).status,403);await store.deleteRoom(room.roomId,room.ownerToken,1);assert.equal((await invoke({access:room.ownerToken})).status,404);
  }finally{await store.close();await rm(directory,{recursive:true,force:true});}
});
