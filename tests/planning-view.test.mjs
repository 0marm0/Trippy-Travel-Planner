import test from 'node:test';
import assert from 'node:assert/strict';
import {createNormalizedTrip} from '../src/lib/normalized-trip.ts';
import {createWorkspace,validateWorkspace,saveWorkspace,loadWorkspace,exportWorkspace} from '../src/lib/generic-trip-workspace.ts';
import {buildPlanningView,previewRouteAllocation,agentPlanningPacket,planningReadiness} from '../src/lib/planning-view.ts';
import {createResearchLedger} from '../src/lib/research-ledger.ts';
import {createQuoteComparison} from '../src/lib/trip-quote-comparison.ts';
const fixture=()=>{
 const trip=createNormalizedTrip({name:'Invented Pacific route',start:'2030-04-01',end:'2030-04-06',cities:['Tokyo','Kyoto'],origins:['AAA'],adults:3,pace:'balanced',flexDays:2,themes:[]});
 trip.routeCandidates.push({id:'route-one',label:'East then west',status:'recommended',placeOrder:trip.destinations.map(item=>item.id)});
 const workspace=createWorkspace(trip);
 workspace.routeAllocations=[{routeId:'route-one',stops:trip.destinations.map((place,index)=>({placeId:place.id,nights:index===0?2:3}))}];
 return workspace;
};
test('dated allocations use arbitrary destinations and never move activity or booking dates',()=>{
 const workspace=fixture();workspace.activities=[{id:'walk',placeId:workspace.trip.destinations[0].id,title:'Invented walk',date:'2030-04-05',time:'09:00',durationMinutes:60,notes:''}];
 const view=buildPlanningView(workspace);assert.equal(view.routes[0].stops[1].checkIn,'2030-04-03');assert.equal(view.routes[0].complete,true);
 const next=previewRouteAllocation(workspace,'route-one');assert.equal(next.days[2].placeId,workspace.trip.destinations[1].id);assert.equal(next.activities[0].date,'2030-04-05');assert.equal(next.trip.bookings.length,0);assert.equal(next.days.at(-1).placeId,workspace.trip.destinations[1].id);
 assert.equal(workspace.days[0].placeId,'');assert.ok(planningReadiness(next).some(item=>item.id==='conflict-0'));
 assert.doesNotMatch(JSON.stringify(view),/europe-2026|Nürburgring/);
});
test('route allocations reject incomplete nights, extra fields, unknown routes and fixed-anchor conflicts',()=>{
 const workspace=fixture();workspace.routeAllocations[0].stops[1].nights=2;assert.equal(validateWorkspace(workspace).length,0);assert.throws(()=>previewRouteAllocation(workspace,'route-one'));
 workspace.routeAllocations[0].stops[1].nights=3;workspace.trip.anchors=[{id:'event',date:'2030-04-05',label:'Fixed museum day',locked:true,placeId:workspace.trip.destinations[0].id}];assert.throws(()=>previewRouteAllocation(workspace,'route-one'));
 workspace.routeAllocations[0].unknown=true;assert.ok(validateWorkspace(workspace).length);
 workspace.routeAllocations=[{routeId:'missing',stops:[]}];assert.ok(validateWorkspace(workspace).length);
});
test('item evidence is bounded, linked, public-safe and persists with validated research and quotes',()=>{
 const workspace=fixture();workspace.itemEvidence=[{target:'destination',targetId:workspace.trip.destinations[0].id,basis:'fact',source:'Official visitor guide',sourceUrl:'',checkedAt:'2030-04-01T09:00:00Z',summary:'Invented public planning fact',unknowns:'Opening times need review'}];workspace.researchEvidence=createResearchLedger(workspace.trip);workspace.quoteEvidence=createQuoteComparison(workspace.trip);
 assert.deepEqual(validateWorkspace(workspace),[]);const storage=new Map();const store={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};saveWorkspace(store,workspace);const restored=loadWorkspace(store);assert.deepEqual(restored,workspace);assert.equal(JSON.parse(exportWorkspace(restored).itinerary).itemEvidence[0].source,'Official visitor guide');assert.equal(agentPlanningPacket(restored).workspace.researchEvidence.rows.length,9);
 for(const bad of [{targetId:'missing'},{checkedAt:''},{checkedAt:'2030-02-30T09:00:00Z'},{sourceUrl:'https://example.test/path?token=hidden'},{summary:'booking reference EXAMPLE123'}])assert.ok(validateWorkspace({...workspace,itemEvidence:[{...workspace.itemEvidence[0],...bad}]}).length);
 assert.ok(validateWorkspace({...workspace,quoteEvidence:{...workspace.quoteEvidence,tripIdentity:'another-trip'}}).length);
});
test('legacy workspaces and one-city plans remain valid without optional evidence or allocations',()=>{
 const trip=createNormalizedTrip({name:'Invented solo city',start:'2030-05-01',end:'2030-05-03',cities:['Osaka'],origins:['AAA'],adults:1,pace:'relaxed',flexDays:0,themes:[]});const workspace=createWorkspace(trip);assert.deepEqual(validateWorkspace(workspace),[]);assert.equal(buildPlanningView(workspace).days.length,3);assert.equal(buildPlanningView(workspace).destinations[0].coordinates,null);
});

test('changing a supported record retains its receipt with a required-review flag',async()=>{
 const {reconcileItemEvidence}=await import('../src/lib/generic-trip-workspace.ts');const {renderGenericItineraryHtml}=await import('../src/lib/generic-itinerary-html.ts');const workspace=fixture();workspace.activities=[{id:'museum',placeId:workspace.trip.destinations[0].id,title:'Invented museum',date:'2030-04-01',time:'09:00',durationMinutes:60,notes:''}];workspace.itemEvidence=[{target:'activity',targetId:'museum',basis:'fact',source:'Visitor guide',sourceUrl:'',checkedAt:'2030-04-01T09:00:00Z',summary:'Original opening hours',unknowns:''}];
 const next=structuredClone(workspace);next.activities[0].title='Different venue';const reviewed=reconcileItemEvidence(workspace,next);assert.equal(reviewed.itemEvidence[0].reviewRequired,true);assert.equal(reviewed.itemEvidence[0].summary,'Original opening hours');assert.equal(workspace.itemEvidence[0].reviewRequired,undefined);assert.ok(planningReadiness(reviewed).some(row=>row.id==='evidence-review-activity-museum'));
 for(const visual of [true,false])assert.match(renderGenericItineraryHtml(reviewed,{visual}),/REVIEW REQUIRED/);
});

test('complete editable imports retain optional evidence without applying mutations during preview',async()=>{
 const {parseWorkspaceImport}=await import('../src/lib/generic-trip-workspace.ts');const workspace=fixture();workspace.researchEvidence=createResearchLedger(workspace.trip);workspace.quoteEvidence=createQuoteComparison(workspace.trip);workspace.budgetQuoteIds=[];
 const preview=parseWorkspaceImport(JSON.stringify(workspace));assert.deepEqual(preview,workspace);preview.days[0].placeId=workspace.trip.destinations[0].id;assert.equal(workspace.days[0].placeId,'');assert.throws(()=>parseWorkspaceImport(JSON.stringify({...workspace,unknownField:'no'})));assert.throws(()=>parseWorkspaceImport('not JSON'));assert.throws(()=>parseWorkspaceImport(' '.repeat(2_000_001)));
});

test('explicit time shifts preserve neighbors, flag overlaps and refuse midnight rollover',async()=>{
 const {shiftActivityTime}=await import('../src/lib/planning-view.ts');const workspace=fixture();workspace.activities=[{id:'first',placeId:workspace.trip.destinations[0].id,title:'First walk',date:'2030-04-01',time:'09:00',durationMinutes:60,notes:''},{id:'second',placeId:workspace.trip.destinations[0].id,title:'Second walk',date:'2030-04-01',time:'10:00',durationMinutes:60,notes:''}];
 const next=shiftActivityTime(workspace,'second',-15);assert.equal(next.activities[1].time,'09:45');assert.equal(next.activities[0].time,'09:00');assert.ok(planningReadiness(next).some(row=>row.label.includes('overlap')));assert.throws(()=>shiftActivityTime(workspace,'first',-600));assert.equal(workspace.activities[1].time,'10:00');
});
