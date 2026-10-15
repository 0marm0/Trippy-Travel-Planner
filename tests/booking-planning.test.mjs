import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, validateWorkspace, exportWorkspace, parseWorkspaceImport } from '../src/lib/generic-trip-workspace.ts';
import { validateBookingPlans, emptyBookingPlan, previewBookingPlan, previewBookingPlanRemoval, applyBookingPlanPreview } from '../src/lib/booking-planning.ts';

function workspace() {
  const result=createWorkspace(createNormalizedTrip({name:'Invented planning study',start:'2030-05-01',end:'2030-05-05',cities:['Invented Harbor','Invented Hill'],origins:['AAA'],adults:2,pace:'balanced',flexDays:0,themes:[]}));
  result.trip.bookings=[{id:'stay-one',kind:'stay',status:'missing',startAt:'2030-05-01T15:00:00Z',endAt:'2030-05-03T11:00:00Z',provider:'Invented lodge'},{id:'rail-one',kind:'rail',status:'quoted',startAt:'2030-05-03T12:00:00Z',endAt:'2030-05-03T15:00:00Z',provider:'Invented rail'}];
  return result;
}
const data=item=>({version:1,items:[item]});

test('unknown planning values stay unknown; explicit zero transfers survives',()=>{
  const w=workspace(),stay=emptyBookingPlan(w.trip.bookings[0]),transport=emptyBookingPlan(w.trip.bookings[1]);
  assert.equal(stay.placeId,'');assert.equal(Object.hasOwn(stay,'coordinates'),false);
  assert.equal(transport.mode,'unknown');assert.equal(transport.elapsedMinutes,null);assert.equal(transport.transferMinutes,null);
  transport.transferMinutes=0;
  assert.deepEqual(validateBookingPlans(data(transport),w.trip),data(transport));
  for(const bad of [-1,Infinity,1.5,'10',undefined]) assert.throws(()=>validateBookingPlans(data({...transport,elapsedMinutes:bad}),w.trip));
});

test('booking links, destination links and discriminated metadata reject mismatches',()=>{
  const w=workspace(),stay=emptyBookingPlan(w.trip.bookings[0]),transport=emptyBookingPlan(w.trip.bookings[1]);
  for(const item of [{...stay,bookingId:'unknown'},{...stay,bookingId:'rail-one'},{...stay,placeId:'unknown'},{...transport,toPlaceId:'unknown'},{...transport,fromPlaceId:'unknown'},{...stay,mode:'rail'},{...transport,placeId:''},{...transport,mode:'flight'}]) assert.throws(()=>validateBookingPlans(data(item),w.trip));
  assert.throws(()=>validateBookingPlans({version:1,items:[stay,stay]},w.trip));
  assert.throws(()=>validateBookingPlans({version:1,items:[],extra:'invented'},w.trip));
});

test('public attribution and manual coordinate custody are required and bounded',()=>{
  const w=workspace(),stay={...emptyBookingPlan(w.trip.bookings[0]),placeId:w.trip.destinations[0].id,photo:{url:'/media/invented-place.webp',credit:'Invented photographer',sourceUrl:'https://commons.wikimedia.org/wiki/Invented',checkedAt:'2030-04-01T12:00:00Z'},coordinates:{lat:0,lng:0,source:'Entered public map',checkedAt:'2030-04-01T12:00:00Z'}};
  assert.deepEqual(validateBookingPlans(data(stay),w.trip),data(stay));
  for(const photo of [{...stay.photo,url:'https://example.com/photo.webp'},{...stay.photo,url:'https://images.unsplash.com/photo?private=abc'},{...stay.photo,credit:''},{...stay.photo,sourceUrl:'https://mail.google.com/mail/u/0/'},{...stay.photo,checkedAt:'2030-02-30T12:00:00Z'}]) assert.throws(()=>validateBookingPlans(data({...stay,photo}),w.trip));
  for(const coordinates of [{...stay.coordinates,lat:91},{...stay.coordinates,lng:-181},{...stay.coordinates,lat:NaN},{...stay.coordinates,source:''},{...stay.coordinates,checkedAt:''}]) assert.throws(()=>validateBookingPlans(data({...stay,coordinates}),w.trip));
});

test('private content is rejected without echoing rejected values',()=>{
  const w=workspace(),stay=emptyBookingPlan(w.trip.bookings[0]);
  for(const notes of ['traveler@example.test','+1 555 010 0200','confirmation TESTONLY','booking reference TESTONLY','seat assignment TESTONLY','loyalty id TESTONLY','https://mail.google.com/mail/','access token TESTONLY']) assert.throws(()=>validateBookingPlans(data({...stay,notes}),w.trip),error=>error.message==='Invalid or unsafe booking planning details; no changes applied.');
  assert.throws(()=>validateBookingPlans(data({...stay,confirmation:'TESTONLY'}),w.trip));
});

test('preview applies only metadata and conserves original records, sidecars and unknowns',()=>{
  const w=workspace();w.budgetQuoteIds=['unresolved-quote'];w.routeAllocations=[];
  const before=structuredClone(w),stay={...emptyBookingPlan(w.trip.bookings[0]),notes:'Review walking access'};
  const preview=previewBookingPlan(w,stay);
  const next=applyBookingPlanPreview(w,preview);
  assert.deepEqual(w,before);assert.deepEqual(next.trip,before.trip);assert.deepEqual(next.budgetQuoteIds,before.budgetQuoteIds);assert.deepEqual(next.routeAllocations,[]);
  assert.equal(next.trip.bookings[0].status,'missing');assert.equal(next.trip.bookings[1].status,'quoted');
  const transport={...emptyBookingPlan(w.trip.bookings[1]),elapsedMinutes:180};
  const final=applyBookingPlanPreview(next,previewBookingPlan(next,transport));
  assert.deepEqual(final.bookingPlans.items[0],stay);assert.equal(final.bookingPlans.items[1].transferMinutes,null);
});

test('changed booking, destination, sidecar or plan blocks stale application',()=>{
  const w=workspace(),preview=previewBookingPlan(w,emptyBookingPlan(w.trip.bookings[0]));
  for(const change of [next=>next.trip.bookings[0].status='conflict',next=>next.trip.destinations[0].name='Changed invented city',next=>next.selectedRouteId='another-route',next=>next.bookingPlans={version:1,items:[]}]) {
    const next=structuredClone(w);change(next);
    assert.throws(()=>applyBookingPlanPreview(next,preview),/changed since preview/);
  }
  preview.item.notes='confirmation TESTONLY';
  assert.throws(()=>applyBookingPlanPreview(w,preview),/changed since preview/);
});

test('reviewed removal preserves booking and other metadata; complete JSON roundtrip conserves details',()=>{
  const w=workspace();
  w.bookingPlans={version:1,items:w.trip.bookings.map(emptyBookingPlan)};
  assert.deepEqual(validateWorkspace(w),[]);
  const exported=JSON.parse(exportWorkspace(w).itinerary);
  assert.deepEqual(exported.bookingPlans,w.bookingPlans);
  assert.deepEqual(parseWorkspaceImport(JSON.stringify(w)).bookingPlans,w.bookingPlans);
  const preview=previewBookingPlanRemoval(w,'stay-one'),next=applyBookingPlanPreview(w,preview);
  assert.equal(w.bookingPlans.items.length,2);assert.deepEqual(next.trip,w.trip);
  assert.deepEqual(next.bookingPlans.items,[w.bookingPlans.items[1]]);assert.deepEqual(validateWorkspace(next),[]);
  next.trip.bookings[0].kind='flight';assert.deepEqual(validateWorkspace(next),[]);
  assert.throws(()=>applyBookingPlanPreview(next,preview),/changed since preview/);
  assert.throws(()=>previewBookingPlanRemoval(next,'stay-one'),/no longer exists/);
});

test('metadata changes and reviewed removal retain booking evidence with review required',()=>{
  const w=workspace();w.itemEvidence=[{target:'booking',targetId:'stay-one',basis:'manual',source:'Entered stay review',sourceUrl:'',checkedAt:'',summary:'Location reviewed',unknowns:'Availability unknown'},{target:'booking',targetId:'rail-one',basis:'manual',source:'Entered rail review',sourceUrl:'',checkedAt:'',summary:'Route reviewed',unknowns:'Schedule unknown'}];
  const next=applyBookingPlanPreview(w,previewBookingPlan(w,emptyBookingPlan(w.trip.bookings[0])));
  assert.equal(next.itemEvidence[0].reviewRequired,true);assert.deepEqual(next.itemEvidence[1],w.itemEvidence[1]);assert.equal(w.itemEvidence[0].reviewRequired,undefined);
  next.itemEvidence[0].reviewRequired=false;
  const same=applyBookingPlanPreview(next,previewBookingPlan(next,next.bookingPlans.items[0]));assert.equal(same.itemEvidence[0].reviewRequired,false);
  const removed=applyBookingPlanPreview(next,previewBookingPlanRemoval(next,'stay-one'));assert.equal(removed.itemEvidence[0].reviewRequired,true);assert.equal(removed.itemEvidence[0].summary,'Location reviewed');
});
