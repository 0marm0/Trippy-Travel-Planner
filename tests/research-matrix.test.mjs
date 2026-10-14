import test from 'node:test';import assert from 'node:assert/strict';
import{createNormalizedTrip}from'../src/lib/normalized-trip.ts';
import{prepareResearchMatrix,reduceResearchMatrix,parseMatrixOutcome,matrixCoverageReceipt,runResearchMatrix}from'../src/lib/research-matrix.ts';
const trip=()=>createNormalizedTrip({name:'Synthetic matrix',start:'2030-04-01',end:'2030-04-06',cities:['Osaka'],origins:['AAA'],adults:3,pace:'balanced',flexDays:2,themes:[]});
const input={origins:'AAA, BBB',destinations:'CCC',dates:'2030-04-02,2030-04-01',adults:'3',cabin:'business',currency:'GBP'};
const result=price=>({id:'synthetic',title:'Synthetic flight',kind:'cash-flight',price});
const body=results=>({providers:[{provider:'serpapi',mode:'live',status:'ok',freshness:{basis:'provider-cache',checkedAt:'2030-04-01T12:00:00Z'},limitations:['Cached evidence may be stale'],results}]});
test('preparation deduplicates routes/dates deterministically and preserves explicit request basis',()=>{
 const prepared=prepareResearchMatrix(trip(),{...input,origins:'aaa,AAA BBB',dates:'2030-04-02 2030-04-01 2030-04-02'});
 assert.equal(prepared.rows.length,4);assert.equal(prepared.rows[0].id,'AAA-CCC-2030-04-01');assert.equal(prepared.rows[0].request.adults,3);assert.equal(prepared.rows[0].request.cabin,'business');assert.equal(prepared.rows[0].request.currency,'GBP');assert.deepEqual(prepared.rows[0].request.providers,['serpapi']);
 assert.equal(prepareResearchMatrix(trip(),{...input,origins:'AAA',destinations:'AAA CCC'}).rows.length,2);
});
test('caps and invalid/unknown/outside-window inputs fail before querying',()=>{
 for(const change of [{dates:'2030-03-31'},{dates:'2030-02-30'},{origins:'long-city-name'},{adults:''},{cabin:''},{currency:''},{origins:'X'.repeat(1001)}])assert.throws(()=>prepareResearchMatrix(trip(),{...input,...change}));
 assert.throws(()=>prepareResearchMatrix(trip(),{...input,origins:'AAA BBB CCC DDD EEE',destinations:'FFF GGG HHH',dates:'2030-04-01 2030-04-02'}),/24/);
});
test('outcomes distinguish searched empty, found, failures, unconfigured and locked',()=>{
 assert.equal(parseMatrixOutcome(body([]),200,'GBP').status,'searched-empty');
 const found=parseMatrixOutcome(body([result({amount:40,currency:'GBP',unit:'ticket'}),result({amount:1,currency:'USD',unit:'ticket'})]),200,'GBP');assert.equal(found.status,'found');assert.equal(found.lowest.amount,40);assert.equal(found.freshness,'provider-cache');
 assert.equal(parseMatrixOutcome(body([result({amount:40,currency:'GBP',unit:'ticket'}),result({amount:1,currency:'GBP',unit:'total'})]),200,'GBP').lowest,undefined);
 assert.equal(parseMatrixOutcome(body([null]),200,'GBP').status,'failed');assert.equal(parseMatrixOutcome({},500,'GBP').status,'failed');assert.equal(parseMatrixOutcome({},403,'GBP').status,'locked');
 assert.equal(parseMatrixOutcome({providers:[{provider:'serpapi',status:'unconfigured'}]},200,'GBP').status,'unconfigured');
 assert.ok(!parseMatrixOutcome({...body([]),providers:[{...body([]).providers[0],limitations:['HTTPS://example.test/private','email person@example.test']}]},200,'GBP').limitations.join(' ').includes('example'));
});
test('cancellation generation and trip identity reject stale completion updates',()=>{
 let state=prepareResearchMatrix(trip(),input);const id=state.rows[0].id;const action={type:'update',generation:0,identity:state.identity,id,outcome:parseMatrixOutcome(body([]),200,'GBP')};
 const changed=reduceResearchMatrix(state,action);assert.equal(changed.rows[0].outcome.status,'searched-empty');
 state=reduceResearchMatrix(state,{type:'cancel'});assert.equal(state.rows[0].outcome.status,'cancelled');assert.equal(reduceResearchMatrix(state,action),state);
 assert.equal(reduceResearchMatrix(state,{...action,generation:state.generation,identity:'other-trip'}),state);
});
test('receipt conserves every query status and discloses unsearched families without inventing inventory',()=>{
 const current=trip();let state=prepareResearchMatrix(current,input);
 const statuses=['searched-empty','failed','unconfigured','locked'];state.rows=state.rows.map((row,index)=>({...row,outcome:{...row.outcome,status:statuses[index]}}));
 const receipt=matrixCoverageReceipt(current,state,'2030-04-01T13:00:00Z');assert.equal(receipt.id,'cash-0');assert.equal(receipt.state,'failed');
 for(const row of state.rows)assert.ok(receipt.scope.includes(`${row.request.origin}-${row.request.destination}/${row.request.departureDate}:${row.outcome.status}`));
 assert.match(receipt.nextAction,/Unsearched: awards/);assert.match(receipt.notes,/failures, locked, unconfigured and cancelled scopes remain unknown/);
 const empty={...state,rows:state.rows.map(row=>({...row,outcome:{...row.outcome,status:'searched-empty'}}))};assert.equal(matrixCoverageReceipt(current,empty).state,'researched');
 assert.throws(()=>matrixCoverageReceipt(current,{...state,identity:'other'}));assert.throws(()=>matrixCoverageReceipt(current,prepareResearchMatrix(current,input)));
 const capped=prepareResearchMatrix(current,{...input,origins:'AAA BBB CCC DDD',destinations:'EEE FFF',dates:'2030-04-01 2030-04-02 2030-04-03'});capped.rows=capped.rows.map(row=>({...row,outcome:{...row.outcome,status:'searched-empty'}}));assert.ok(matrixCoverageReceipt(current,capped).scope.length<=1000);assert.equal(capped.rows.length,24);
});
test('mocked runner honors max concurrency two and emits current generation outcomes only',async()=>{
 const state=prepareResearchMatrix(trip(),input);state.generation=7;let active=0,max=0,calls=0;const actions=[];
 await runResearchMatrix(state,async(url,options)=>{assert.equal(url,'/api/providers/search');const request=JSON.parse(options.body);assert.equal(request.adults,3);assert.deepEqual(request.providers,['serpapi']);calls++;active++;max=Math.max(max,active);await new Promise(resolve=>setTimeout(resolve,2));active--;return{status:200,json:async()=>body([])};},action=>actions.push(action),new AbortController().signal);
 assert.equal(calls,4);assert.equal(max,2);assert.ok(actions.every(action=>action.generation===7));assert.equal(actions.filter(action=>action.outcome.status==='searched-empty').length,4);
});
test('aborted mock requests do not publish errors or dispatch later queries',async()=>{
 const state=prepareResearchMatrix(trip(),input),controller=new AbortController();let calls=0;const actions=[];
 await runResearchMatrix(state,async()=>{calls++;controller.abort();throw new DOMException('Aborted','AbortError');},action=>actions.push(action),controller.signal);
 assert.equal(calls,1);assert.ok(actions.every(action=>action.outcome.status==='running'));assert.equal(reduceResearchMatrix(state,{type:'cancel'}).rows.every(row=>row.outcome.status==='cancelled'),true);
});
