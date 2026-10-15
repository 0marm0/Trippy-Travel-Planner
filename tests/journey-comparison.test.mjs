import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { createQuoteComparison, emptyTripQuote } from '../src/lib/trip-quote-comparison.ts';
import { createRouteScenarios, emptyRouteScenario } from '../src/lib/route-scenarios.ts';
import { buildJourneyComparison, straightLineKilometers } from '../src/lib/journey-comparison.ts';
const checkedAt='2030-04-01T12:00:00Z',now=Date.parse(checkedAt);
function fixture(){
  const w=createWorkspace(createNormalizedTrip({name:'Invented journey',start:'2030-05-01',end:'2030-05-05',cities:['Invented Harbor','Invented Hill'],origins:['AAA'],adults:2,pace:'balanced',flexDays:0,themes:[]}));
  const[a,b]=w.trip.destinations.map(p=>p.id);
  w.trip.routeCandidates=[{id:'route-one',label:'Invented route',status:'recommended',placeOrder:[a,b]}];
  w.routeAllocations=[{routeId:'route-one',stops:[{placeId:a,nights:2},{placeId:b,nights:2}]}];
  const s={...emptyRouteScenario(w.trip,'candidate-one','route-one'),label:'Invented candidate',originGateway:'AAA',arrivalGateway:'Harbor',departureGateway:'Hill',returnGateway:'AAA',ticketing:'through',connectionProtection:'known',protectionNotes:'Recorded protection terms',scopeNotes:'Whole-party transport only',legs:[{id:'first',from:'AAA',to:'Harbor',fromPlaceId:'',toPlaceId:a,date:'2030-05-01',mode:'flight',durationMinutes:120,quoteIds:['quote-one']},{id:'next',from:'Harbor',to:'Hill',fromPlaceId:a,toPlaceId:b,date:'2030-05-03',mode:'flight',durationMinutes:60,quoteIds:['quote-one']},{id:'last',from:'Hill',to:'AAA',fromPlaceId:b,toPlaceId:'',date:'2030-05-05',mode:'flight',durationMinutes:120,quoteIds:['quote-one']}]};
  w.routeScenarios={...createRouteScenarios(w.trip),scenarios:[s,{...structuredClone(s),id:'candidate-two'}]};
  w.quoteEvidence={...createQuoteComparison(w.trip),quotes:[{...emptyTripQuote(w.trip,'quote-one'),label:'Invented fare',from:'AAA',to:'AAA',startDate:'2030-05-01',endDate:'2030-05-05',cashAmount:100,taxesFees:10,source:'Manual evidence',checkedAt,cabin:'Economy',baggage:'Cabin bag',cancellation:'Entered flexible terms'}]};
  return w;
}
test('known leg subtotal is not a door-to-door total and booking metadata is never added',()=>{
  const w=fixture();w.trip.bookings=[{id:'transport-one',kind:'flight',status:'recommended',startAt:'2030-05-01T10:00:00Z',endAt:'2030-05-01T12:00:00Z'}];
  w.bookingPlans={version:1,items:[{kind:'transport',bookingId:'transport-one',mode:'flight',fromPlaceId:'',toPlaceId:'',from:'AAA',to:'Harbor',elapsedMinutes:120,transferMinutes:45,notes:'Invented manual transfer basis'}]};
  const before=structuredClone(w),model=buildJourneyComparison(w,now);
  assert.equal(model.candidates[0].recordedLegMinutes,300);assert.equal(model.candidates[0].doorToDoorMinutes,null);
  assert.equal(model.transport[0].elapsedMinutes,120);assert.equal(model.transport[0].transferMinutes,45);
  assert.equal(model.candidates[0].summary.budget.selected.length,1);assert.equal(model.candidates[0].summary.budget.currencies[0].knownCashOutlay,110);
  assert.equal(model.comparisons[0].comparable,true);assert.deepEqual(w,before);
});
test('deleted quotes, missing transfers, costs and duration remain explicitly unresolved',()=>{
  const w=fixture();const s=w.routeScenarios.scenarios[0];s.legs[0].durationMinutes=null;s.legs[1].from='Other airport';s.legs[1].quoteIds=[];s.legs[2].quoteIds=['deleted'];w.quoteEvidence.quotes[0].taxesFees=null;
  const model=buildJourneyComparison(w,now),candidate=model.candidates[0];
  assert.equal(candidate.recordedLegMinutes,null);assert.equal(candidate.legs[1].unquoted,true);assert.equal(candidate.legs[1].connectionGap,true);assert.deepEqual(candidate.legs[2].missingQuoteIds,['deleted']);assert.equal(candidate.summary.unknownCash,true);assert.equal(model.comparisons[0].comparable,false);assert.equal(model.comparisons[0].difference,null);
});
test('different currencies, scope, party and protection block equivalent comparisons',()=>{
  for(const change of ['currency','party','scope','protection']){
    const w=fixture(),second=w.routeScenarios.scenarios[1];
    if(change==='scope')second.scopeNotes='Different inclusions';
    if(change==='protection')second.connectionProtection='unknown';
    if(change==='currency'||change==='party'){
      const other={...w.quoteEvidence.quotes[0],id:'quote-other',...(change==='currency'?{currency:'EUR'}:{occupants:1})};w.quoteEvidence.quotes.push(other);second.legs.forEach(leg=>leg.quoteIds=['quote-other']);
    }
    const result=buildJourneyComparison(w,now).comparisons[0];assert.equal(result.comparable,false,change);assert.equal(result.difference,null,change);
  }
});
test('sourced hotel geometry discloses missing pins and groups all city days without travel estimates',()=>{
  const w=fixture(),placeId=w.trip.destinations[0].id,pin={lat:0,lng:0,source:'Invented map receipt',checkedAt};
  w.trip.bookings=[{id:'stay-one',kind:'stay',status:'recommended',startAt:'2030-05-01T15:00:00Z',endAt:'2030-05-03T11:00:00Z'}];w.bookingPlans={version:1,items:[{kind:'stay',bookingId:'stay-one',placeId,notes:'',coordinates:pin}]};
  w.activities=[{id:'activity-one',placeId,title:'Invented museum',date:'2030-05-01',time:'10:00',durationMinutes:60,notes:'',coordinates:{...pin,lng:1}},{id:'activity-two',placeId,title:'Unpinned idea',date:'2030-05-04',time:'11:00',durationMinutes:60,notes:''}];
  const model=buildJourneyComparison(w,now),stay=model.stays[0];assert.equal(stay.distances.length,1);assert.ok(Math.abs(stay.distances[0].kilometers-111.195)<0.01);assert.equal(stay.unmeasuredCount,1);assert.equal(stay.days[1].meanStraightLineKm,null);assert.equal(stay.distances[0].coordinates.source,pin.source);assert.match(model.limits.join(' '),/not an assigned stay itinerary/);assert.match(model.limits.join(' '),/travel-time|walking/);assert.equal('durationMinutes' in stay.distances[0],false);
  delete w.bookingPlans.items[0].coordinates;assert.equal(buildJourneyComparison(w,now).stays[0].unmeasuredCount,2);
});
test('unsafe workspace text and malformed coordinate receipts are rejected before projection',()=>{
  const w=fixture();w.routeScenarios.scenarios[0].label='person@example.test';assert.throws(()=>buildJourneyComparison(w,now),/share-safe/);
  const safe=fixture();safe.activities=[{id:'activity-one',placeId:safe.trip.destinations[0].id,title:'Invented venue',date:'2030-05-01',time:'10:00',durationMinutes:60,notes:'',coordinates:{lat:0,lng:0,source:'',checkedAt}}];assert.throws(()=>buildJourneyComparison(safe,now),/share-safe/);
});
test('antimeridian and identical pins have bounded straight-line context',()=>{
  const pin={lat:0,lng:179,source:'Invented',checkedAt};assert.equal(straightLineKilometers(pin,pin),0);assert.ok(straightLineKilometers(pin,{...pin,lng:-179})<225);
});
