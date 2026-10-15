import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { buildDayGeography, straightLineKm } from '../src/lib/day-geography.ts';

const checkedAt = '2030-04-01T12:00:00Z';
function fixture() {
  const w = createWorkspace(createNormalizedTrip({ name:'Invented geography study', start:'2030-05-01', end:'2030-05-03', cities:['Invented Harbor','Invented Hill'], origins:['AAA'], adults:2, pace:'balanced', flexDays:0, themes:[] }));
  const placeId = w.trip.destinations[0].id;
  const add = (id, lng, time='09:00', extras={}) => w.activities.push({ id, placeId, title:`Invented ${id}`, date:'2030-05-01', time, durationMinutes:30, notes:'', ...(lng === null ? {} : { coordinates:{ lat:0, lng, source:'Entered public map', checkedAt } }), ...extras });
  const options = { placeId, date:'2030-05-01', radiusKm:1.5 };
  return { w, add, options };
}

test('zero, antimeridian and antipodal distances remain finite and symmetric', () => {
  assert.equal(straightLineKm({lat:0,lng:0},{lat:0,lng:0}),0);
  const a={lat:0,lng:179.999}, b={lat:0,lng:-179.999};
  assert.ok(straightLineKm(a,b)<0.23); assert.ok(straightLineKm(a,b)>0.22);
  assert.equal(straightLineKm(a,b),straightLineKm(b,a));
  assert.ok(Math.abs(straightLineKm({lat:0,lng:0},{lat:0,lng:180})-20015.114442)<0.001);
  for(const pin of [{lat:91,lng:0},{lat:0,lng:181},{lat:NaN,lng:0},{lat:0,lng:Infinity}]) assert.throws(()=>straightLineKm(pin,a));
});

test('group diameter respects radius and chained neighbors cannot bridge it', () => {
  const {w,add,options}=fixture(); add('a',0);add('b',0.01);add('c',0.02);add('far',1);
  const result=buildDayGeography(w,options);
  assert.deepEqual(result.groups.map(group=>group.activities.map(item=>item.id)),[['a','b'],['c'],['far']]);
  assert.ok(result.groups.every(group=>group.diameterKm<=options.radiusKm));
  assert.deepEqual(result.outliers.map(item=>item.activity.id),['far']);
  assert.ok(result.outliers[0].nearestKm>100);
  const shuffled=structuredClone(w);shuffled.activities.reverse();
  assert.deepEqual(buildDayGeography(shuffled,options),result);
  assert.equal(buildDayGeography(w,{...options,radiusKm:3}).groups[0].activities.length,3);
});

test('each selected activity is conserved exactly once across groups and missing pins', () => {
  const {w,add,options}=fixture(); add('a',0);add('missing',null);add('other-day',1,'09:00',{date:'2030-05-02'});add('other-city',1,'09:00',{placeId:w.trip.destinations[1].id});
  const result=buildDayGeography(w,options);
  assert.deepEqual([...result.groups.flatMap(group=>group.activities.map(item=>item.id)),...result.missingPins.map(item=>item.id)].sort(),['a','missing']);
  assert.deepEqual(result.current.map(item=>item.id),['a']);
  assert.equal(result.currentKm,null);assert.equal(result.outliers[0].nearestKm,null);
  assert.equal(result.missingPins[0].coordinates,undefined);
  const empty=buildDayGeography(w,{...options,date:'2030-05-03'});
  assert.deepEqual(empty.groups,[]);assert.equal(empty.suggestedKm,null);
});

test('order comparison is deterministic, shorter when possible and never alters records', () => {
  const {w,add,options}=fixture();add('a',0,'08:00');add('c',0.03,'09:00');add('b',0.01,'10:00');
  w.trip.anchors=[{id:'fixed',label:'Invented fixed event',date:options.date,placeId:options.placeId,locked:true}];
  const before=structuredClone(w),result=buildDayGeography(w,options);
  assert.deepEqual(result.current.map(item=>item.id),['a','c','b']);
  assert.deepEqual(result.suggested.map(item=>item.id),['a','b','c']);
  assert.ok(result.suggestedKm<result.currentKm);
  assert.deepEqual(result.suggested.map(item=>item.time),['08:00','10:00','09:00']);
  assert.deepEqual(w,before);assert.deepEqual(result.lockedAnchors,w.trip.anchors);
  result.current[0].coordinates.lat=20;result.lockedAnchors[0].label='Different';
  assert.deepEqual(w,before);
});

test('stay base is explicitly selected sourced context and does not change booking states', () => {
  const {w,add,options}=fixture();add('a',0);add('b',0.01);
  w.trip.bookings=[{id:'stay',kind:'stay',status:'missing',startAt:'2030-05-02T15:00:00Z',endAt:'2030-05-03T11:00:00Z',provider:'Invented lodge'}];
  w.bookingPlans={version:1,items:[{kind:'stay',bookingId:'stay',placeId:options.placeId,notes:'',coordinates:{lat:0,lng:0.02,source:'Entered stay map',checkedAt}}]};
  const before=structuredClone(w);
  assert.equal(buildDayGeography(w,options).base,null);
  const result=buildDayGeography(w,{...options,baseBookingId:'stay'});
  assert.equal(result.base.coordinates.source,'Entered stay map');
  assert.deepEqual(result.suggested.map(item=>item.id),['b','a']);
  assert.ok(result.currentKm>result.suggestedKm);assert.deepEqual(w,before);
  assert.throws(()=>buildDayGeography(w,{...options,baseBookingId:'absent'}));
});

test('recorded order wins equal or worse heuristic; time and distance ties use IDs', () => {
  const {w,add,options}=fixture();add('z',0.01,'09:00');add('b',-0.01,'09:00');add('a',0,'08:00');
  const result=buildDayGeography(w,options);
  assert.deepEqual(result.current.map(item=>item.id),['a','b','z']);
  assert.deepEqual(result.suggested.map(item=>item.id),['a','b','z']);
  assert.equal(result.suggestedKm,result.currentKm);
  const worse=fixture();worse.add('a',0,'08:00');worse.add('b',-0.02,'09:00');worse.add('c',0.01,'10:00');worse.add('d',0.05,'11:00');
  const retained=buildDayGeography(worse.w,worse.options);
  assert.deepEqual(retained.suggested.map(item=>item.id),retained.current.map(item=>item.id));
});

test('invalid or unsafe workspace and invalid bounds fail closed without echoing data', () => {
  const {w,add,options}=fixture();add('a',0);
  for(const mutate of [x=>x.activities[0].notes='confirmation TESTONLY',x=>x.activities[0].coordinates.source='',x=>x.activities[0].coordinates.checkedAt='',x=>x.activities[0].coordinates.lat=NaN,x=>x.extra='invented']) {
    const invalid=structuredClone(w);mutate(invalid);
    assert.throws(()=>buildDayGeography(invalid,options),error=>error.message==='Day geography requires a valid, share-safe workspace.');
  }
  for(const radiusKm of [0,0.09,50.1,NaN,Infinity]) assert.throws(()=>buildDayGeography(w,{...options,radiusKm}));
  assert.throws(()=>buildDayGeography(w,{...options,date:'2031-01-01'}));
  assert.throws(()=>buildDayGeography(w,{...options,placeId:'unknown'}));
});
