import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { buildGenericTravelView } from '../src/lib/generic-travel-view.ts';
function workspace() {
  return createWorkspace(createNormalizedTrip({name:'Invented day study',start:'2030-05-01',end:'2030-05-04',cities:['Invented Harbor'],origins:['AAA'],adults:1,pace:'balanced',flexDays:0,themes:[]}));
}
const activity = (w, extra={})=>({id:'night-walk',placeId:w.trip.destinations[0].id,title:'Invented evening walk',date:'2030-05-01',time:'23:30',durationMinutes:90,notes:'',...extra});
test('activity midnight continuation uses entered planning arithmetic; exact midnight end is exclusive',()=>{
  const w=workspace();w.activities=[activity(w)];
  const view=buildGenericTravelView(w);
  assert.equal(view.days[0].activities[0].continued,false);
  assert.deepEqual(view.days[0].activities[0].end,{date:'2030-05-02',time:'01:00'});
  assert.equal(view.days[1].activities[0].continued,true);
  w.activities[0].durationMinutes=30;
  assert.equal(buildGenericTravelView(w).days[1].activities.length,0);
});
test('source-date membership retains offsets, intervening dates and reverse calendar dates across offsets',()=>{
  const w=workspace();w.trip.bookings=[{id:'flight',kind:'flight',status:'held',startAt:'2030-05-01T23:00:00-07:00',endAt:'2030-05-03T09:00:00+09:00'}, {id:'dateline',kind:'flight',status:'quoted',startAt:'2030-05-02T01:00:00+14:00',endAt:'2030-05-01T23:00:00-10:00'}];
  const view=buildGenericTravelView(w);
  assert.equal(view.days[0].bookings[0].startAt,w.trip.bookings[0].startAt);
  assert.equal(view.days[0].bookings[0].endAt,w.trip.bookings[0].endAt);
  assert.equal(view.days[1].bookings.length,2);
  assert.equal(view.days[2].bookings.length,1);
  assert.equal(view.days[3].bookings.length,0);
  assert.deepEqual(view.days[0].bookings.map(b=>b.status),['held','quoted']);
});
test('every booking state survives unchanged, and stay checkout source day is visible',()=>{
  const w=workspace();const states=['recommended','quoted','held','confirmed','missing','conflict'];
  w.trip.bookings=states.map((status,i)=>({id:`stay-${i}`,kind:'stay',status,startAt:'2030-04-30T15:00:00+02:00',endAt:'2030-05-02T11:00:00+02:00'}));
  const view=buildGenericTravelView(w);
  assert.deepEqual(view.days[1].bookings.map(b=>b.status),states);
  assert.equal(view.days[2].bookings.length,0);assert.equal(view.outsideWindowBookings,6);
});
test('unknown geography, sources and transfers remain unknown; required timing is validated',()=>{
  const w=workspace();w.activities=[activity(w)];w.trip.bookings=[{id:'rail',kind:'rail',status:'missing',startAt:'2030-05-01T08:00:00Z',endAt:'2030-05-01T10:00:00Z'}];
  const day=buildGenericTravelView(w).days[0];assert.equal(day.city,'City unassigned');assert.equal(day.pin,null);assert.equal(day.activities[0].coordinates,undefined);assert.equal(day.activities[0].evidence,null);assert.equal(day.bookings[0].plan,null);assert.equal(day.bookings[0].from,'Origin unknown');
  for(const change of [copy=>copy.activities[0].time='',copy=>copy.trip.bookings[0].startAt='']) {const bad=structuredClone(w);change(bad);assert.throws(()=>buildGenericTravelView(bad),/Validate the workspace/);}
});
test('due tasks and stale evidence are carried without mutating or sharing source objects',()=>{
  const w=workspace();w.activities=[activity(w)];w.itemEvidence=[{target:'activity',targetId:'night-walk',basis:'manual',source:'Entered study',sourceUrl:'',checkedAt:'',summary:'Review hours',unknowns:'Access unknown',reviewRequired:true}];
  w.preparation={version:1,tasks:[{id:'task',title:'Pack a layer',category:'packing',assignee:'Navigator',done:false,dueDate:'2030-05-02'},{id:'undated',title:'Review shoes',category:'task',assignee:'',done:true}],alternatives:[]};
  const before=structuredClone(w),view=buildGenericTravelView(w);assert.deepEqual(w,before);assert.equal(view.days[0].tasks.length,0);assert.equal(view.days[1].tasks.length,1);assert.equal(view.days[1].activities[0].evidence.reviewRequired,true);
  view.days[1].tasks[0].done=true;view.days[0].activities[0].title='Changed view';assert.deepEqual(w,before);
});
test('unsafe records and incomplete attribution are rejected with a value-free error',()=>{
  for(const change of [w=>w.activities.push(activity(w,{notes:'traveler@example.test'})),w=>w.trip.bookings.push({id:'stay',kind:'stay',status:'confirmed',startAt:'2030-05-01T15:00:00Z',endAt:'2030-05-02T11:00:00Z',provider:'confirmation TESTONLY'}),w=>w.activities.push(activity(w,{photo:{url:'/media/invented.webp',credit:'',sourceUrl:'https://commons.wikimedia.org/wiki/Invented',checkedAt:'2030-04-01T12:00:00Z'}}))]) {const w=workspace();change(w);assert.throws(()=>buildGenericTravelView(w),error=>error.message==='Validate the workspace before opening the travel view.');}
});
test('activity and other booking records retain context without transport endpoints',()=>{
  const w=workspace();w.trip.bookings=['activity','other','rail'].map(kind=>({id:`record-${kind}`,kind,status:'quoted',startAt:'2030-05-01T10:00:00+02:00',endAt:'2030-05-01T12:00:00+02:00'}));
  w.bookingDetails=[{bookingId:'record-activity',label:'Invented admission',placeId:w.trip.destinations[0].id,notes:''}];
  const [activity,other,rail]=buildGenericTravelView(w).days[0].bookings;
  assert.equal(activity.recordType,'context');assert.equal(activity.city,'Invented Harbor');assert.equal(activity.from,null);assert.equal(activity.to,null);
  assert.equal(other.recordType,'context');assert.equal(other.city,'City unknown');assert.equal(other.from,null);assert.equal(other.to,null);
  assert.equal(rail.recordType,'transport');assert.equal(rail.from,'Origin unknown');assert.equal(rail.to,'Destination unknown');
});
test('unsorted imported days project in chronological order without changing the workspace',()=>{
  const w=workspace();w.days.reverse();const before=structuredClone(w),view=buildGenericTravelView(w);
  assert.deepEqual(view.days.map(day=>day.date),['2030-05-01','2030-05-02','2030-05-03','2030-05-04']);
  assert.deepEqual(view.days.map(day=>day.number),[1,2,3,4]);assert.deepEqual(w,before);
});
test('other booking with explicit validated transport metadata retains endpoints and entered durations',()=>{
  const w=workspace();w.trip.bookings=[{id:'other-transport',kind:'other',status:'held',startAt:'2030-05-01T10:00:00+02:00',endAt:'2030-05-01T12:00:00+02:00'}];
  w.bookingPlans={version:1,items:[{kind:'transport',bookingId:'other-transport',mode:'other',fromPlaceId:'',toPlaceId:'',from:'Invented terminal',to:'Invented harbor',elapsedMinutes:120,transferMinutes:0,notes:''}]};
  const before=structuredClone(w),record=buildGenericTravelView(w).days[0].bookings[0];
  assert.equal(record.recordType,'transport');assert.equal(record.from,'Invented terminal');assert.equal(record.to,'Invented harbor');assert.equal(record.plan.elapsedMinutes,120);assert.equal(record.plan.transferMinutes,0);assert.equal(record.status,'held');assert.deepEqual(w,before);
});
