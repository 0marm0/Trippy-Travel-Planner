import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFArray, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createWorkspace, validateWorkspace } from '../src/lib/generic-trip-workspace.ts';
import { buildGenericTripExportSnapshot, renderGenericItineraryHtml } from '../src/lib/generic-itinerary-html.ts';
import { createTripPdf, filterTripExportSnapshot, renderTripCsv, sanitizeTripExportSnapshot } from '../src/lib/trip-exports.ts';
import { buildExportPreviewSummary } from '../src/lib/export-preview.ts';

function invented() {
  const w=createWorkspace(createNormalizedTrip({name:'Invented export study',start:'2030-05-01',end:'2030-05-05',cities:['Invented Harbor','Invented Hill'],origins:['AAA'],adults:2,pace:'balanced',flexDays:0,themes:[]}));
  const [harbor,hill]=w.trip.destinations.map(item=>item.id);w.days.forEach(day=>day.placeId=harbor);
  w.trip.bookings=[{id:'stay-one',kind:'stay',status:'held',startAt:'2030-05-01T15:00:00+02:00',endAt:'2030-05-03T11:00:00+02:00',provider:'Invented lodge'},{id:'rail-one',kind:'rail',status:'quoted',startAt:'2030-05-03T12:00:00Z',endAt:'2030-05-03T15:00:00Z',provider:'Invented rail'}];
  w.bookingPlans={version:1,items:[{kind:'stay',bookingId:'stay-one',placeId:harbor,notes:'Review luggage storage',photo:{url:'/media/invented-stay.webp',credit:'Invented photographer',sourceUrl:'https://commons.wikimedia.org/wiki/Invented_stay',checkedAt:'2030-04-01T12:00:00Z'},coordinates:{lat:0,lng:12.5,source:'Entered public map',checkedAt:'2030-04-01T12:00:00Z'}},{kind:'transport',bookingId:'rail-one',mode:'rail',fromPlaceId:harbor,toPlaceId:hill,from:'Harbor station',to:'Hill station',elapsedMinutes:180,transferMinutes:null,notes:'Review luggage allowance'}]};
  w.activities=[{id:'walk',placeId:harbor,title:'Invented harbor walk',date:'2030-05-01',time:'10:00',durationMinutes:60,notes:''},{id:'gallery',placeId:harbor,title:'Invented indoor gallery',date:'2030-05-02',time:'11:00',durationMinutes:60,notes:''}];
  w.preparation={version:1,tasks:[{id:'pack-layer',title:'Pack rain layer',category:'packing',assignee:'Navigator',done:false}],alternatives:[{id:'rainy',activityId:'walk',fallbackActivityId:'gallery',reason:'rainy-day',source:'Public gallery guide',checkedAt:'2030-04-01T12:00:00Z',unknowns:'Hours and access need review'}]};
  assert.deepEqual(validateWorkspace(w),[]);return w;
}
function operators(document) {
  return document.getPages().flatMap(page=>{const contents=page.node.Contents();const refs=contents instanceof PDFArray?contents.asArray():[contents];return refs.map(ref=>document.context.lookup(ref)).filter(stream=>stream instanceof PDFRawStream).map(stream=>Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1'));}).join('');
}
const hex=text=>Buffer.from(text).toString('hex').toUpperCase();

test('reading snapshot and day anchors preserve planning metadata, times, states and unknowns without invented rates',()=>{
  const w=invented(),before=structuredClone(w),s=buildGenericTripExportSnapshot(w);
  assert.deepEqual(w,before);assert.equal(s.bookings[0].status,'held');assert.equal(s.bookings[1].status,'quoted');assert.equal(s.bookings[0].dateIso,'2030-05-01');
  assert.match(s.bookings[0].detail,/15:00:00\+02:00/);assert.match(s.bookings[0].detail,/Recorded stay pin: 0, 12.5/);assert.match(s.bookings[0].detail,/Entered public map/);
  assert.match(s.bookings[1].detail,/Harbor station → Hill station/);assert.match(s.bookings[1].detail,/Elapsed minutes: 180/);assert.match(s.bookings[1].detail,/Transfer minutes: unknown/);
  assert.equal(s.bookings[0].image,'/media/invented-stay.webp');assert.equal(s.bookings[0].imageCredit,'Invented photographer');assert.equal(s.bookings[0].imageSourceUrl,w.bookingPlans.items[0].photo.sourceUrl);
  assert.equal(s.hotels.length,0);assert.equal(s.transport.length,0);assert.equal(Object.hasOwn(s.bookings[0],'low'),false);
  assert.ok(s.days.find(day=>day.date==='2030-05-03').anchors.some(item=>item.detail.includes('Transfer minutes: unknown')));
  assert.match(renderTripCsv(s),/Transfer minutes: unknown/);
});

test('rich photos/preparation preserve source and unknowns while compact and narrow briefs keep scope',()=>{
  const w=invented(),rich=renderGenericItineraryHtml(w,{visual:true});
  assert.match(rich,/logistics-photo/);assert.match(rich,/<img src="\/media\/invented-stay.webp"/);assert.match(rich,/Invented photographer/);assert.match(rich,/https:\/\/commons.wikimedia.org\/wiki\/Invented_stay/);
  assert.match(rich,/Pack rain layer/);assert.match(rich,/Public gallery guide/);assert.match(rich,/Hours and access need review/);assert.match(rich,/not verified people/);
  const hotel=renderGenericItineraryHtml(w,{visual:true,scope:'hotels'});assert.match(hotel,/Invented lodge/);assert.doesNotMatch(hotel,/Invented rail|Pack rain layer|Public gallery guide/);
  const transit=renderGenericItineraryHtml(w,{visual:true,scope:'transit'});assert.match(transit,/Harbor station/);assert.doesNotMatch(transit,/Invented lodge|invented-stay.webp|Pack rain layer/);
  const compact=renderGenericItineraryHtml(w,{visual:false});assert.doesNotMatch(compact,/<img|Pack rain layer/);assert.match(compact,/Transfer minutes: unknown/);
  const s=buildGenericTripExportSnapshot(w);assert.equal(filterTripExportSnapshot(s,'hotels').bookings.length,1);assert.equal(filterTripExportSnapshot(s,'transit').bookings.length,1);
  const hotelDays=filterTripExportSnapshot(s,'hotels').days;
  for(const date of ['2030-05-01','2030-05-02','2030-05-03']) assert.ok(hotelDays.find(day=>day.date===date).anchors.some(anchor=>anchor.kind==='stay'&&anchor.detail.includes('Recorded stay pin')));
  assert.equal(filterTripExportSnapshot(s,'transit').days.some(day=>day.anchors.some(anchor=>anchor.kind==='stay')),false);
  const unsupported=structuredClone(s);unsupported.days[0].anchors=[{kind:'activity',status:'recommended',label:'Hotel architecture walk',detail:'Not a stay'}];
  assert.equal(filterTripExportSnapshot(unsupported,'hotels').days[0].anchors.length,0);
  assert.deepEqual(buildExportPreviewSummary(s,{visual:true,scope:'all',theme:'light'},rich).photos,{local:1,external:0,embedded:0});
  assert.deepEqual(buildExportPreviewSummary(s,{visual:true,scope:'transit',theme:'light'},transit).photos,{local:0,external:0,embedded:0});
});

test('metadata text stays lossless under the bounded larger booking/anchor ceiling',()=>{
  const w=invented();w.bookingDetails=[{bookingId:'rail-one',label:'Invented rail',placeId:'',notes:'Entered details. '.repeat(55)}];w.bookingPlans.items[1].notes='Planning uncertainty. '.repeat(45);w.itemEvidence=[{target:'booking',targetId:'rail-one',basis:'manual',source:'Entered source',sourceUrl:'',checkedAt:'',summary:'Evidence summary. '.repeat(25),unknowns:'Review final baggage rules'}];
  assert.deepEqual(validateWorkspace(w),[]);const s=buildGenericTripExportSnapshot(w);assert.ok(s.bookings[1].detail.length>2000);assert.match(s.bookings[1].detail,/Review final baggage rules/);assert.match(s.bookings[1].detail,/Recorded state: quoted/);
  assert.match(s.days.find(day=>day.date==='2030-05-03').anchors.find(anchor=>anchor.kind==='rail').detail,/Recorded state: quoted/);
});

test('unsafe new metadata blocks generic export and untrusted image fields sanitize at shared boundary',()=>{
  for(const mutate of [w=>w.bookingPlans.items[0].notes='confirmation TESTONLY',w=>w.bookingPlans.items[0].photo.sourceUrl='https://mail.google.com/mail/',w=>w.preparation.tasks[0].assignee='person@example.test',w=>w.preparation.alternatives[0].fallbackActivityId='missing']) {const w=invented();mutate(w);assert.throws(()=>buildGenericTripExportSnapshot(w));}
  const s=buildGenericTripExportSnapshot(invented());s.bookings[0].image='https://images.unsplash.com/invented?access_token=TESTONLY';s.bookings[0].imageCredit='confirmation TESTONLY';s.bookings[0].imageSourceUrl='https://mail.google.com/mail/';s.bookings[0].privateField='TESTONLY';
  const safe=sanitizeTripExportSnapshot(s);assert.equal(safe.bookings[0].image,undefined);assert.equal(Object.hasOwn(safe.bookings[0],'privateField'),false);
  s.bookings[0].image='/media/invented-stay.webp';const safeCredit=sanitizeTripExportSnapshot(s);assert.equal(safeCredit.bookings[0].imageCredit,'');assert.equal(safeCredit.bookings[0].imageSourceUrl,'');
  for(const credit of ['traveler＠example.invalid','+1 555 010 0200']) {s.bookings[0].imageCredit=credit;assert.equal(sanitizeTripExportSnapshot(s).bookings[0].imageCredit,'');}
  s.bookings[0].image='/media/confirmation-testonly.webp';assert.equal(sanitizeTripExportSnapshot(s).bookings[0].image,undefined);
});

test('visual PDF loads safe stay photo in shared budget and compact PDF keeps text without image loads',async()=>{
  const s=buildGenericTripExportSnapshot(invented()),png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6L8AAAAASUVORK5CYII=','base64'));
  const loads=[];const visual=await PDFDocument.load(await createTripPdf(s,{theme:'light',visual:true,imageLoader:async url=>{loads.push(url);return png;}}));
  assert.deepEqual(loads,['/media/invented-stay.webp']);assert.ok(operators(visual).includes(hex('RECORDED STAY PHOTOGRAPHS')));assert.ok(operators(visual).includes(hex('Transfer minutes: unknown')));
  loads.length=0;const compact=await PDFDocument.load(await createTripPdf(s,{theme:'light',visual:false,imageLoader:async url=>{loads.push(url);return png;}}));assert.equal(loads.length,0);assert.ok(operators(compact).includes(hex('Transfer minutes: unknown')));assert.equal(operators(compact).includes(hex('RECORDED STAY PHOTOGRAPHS')),false);
  const crowded=structuredClone(s);crowded.days[0].activities=Array.from({length:50},(_,i)=>({title:`Idea ${i}`,description:'',details:'',category:'',priority:'unknown',image:`/media/invented-activity-${i}.webp`}));crowded.days[1].activities=Array.from({length:15},(_,i)=>({...crowded.days[0].activities[0],image:`/media/invented-more-${i}.webp`}));loads.length=0;
  await createTripPdf(crowded,{theme:'light',visual:true,imageLoader:async url=>{loads.push(url);return null;}});assert.equal(loads.length,60);assert.equal(new Set(loads).size,60);
  const longSource='https://commons.wikimedia.org/wiki/'+'Long'.repeat(90);s.bookings[0].imageSourceUrl=longSource;
  assert.equal(sanitizeTripExportSnapshot(s).bookings[0].imageSourceUrl,longSource);
  const longPdf=await PDFDocument.load(await createTripPdf(s,{theme:'light',visual:true,imageLoader:async()=>png})),longOps=operators(longPdf);
  assert.ok(longOps.includes(hex('https://commons.wikimedia.org/wiki/')));assert.equal(longOps.includes(hex(longSource)),false,'long source must wrap, never render as one overflowing text operator');
});
