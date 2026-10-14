import test from 'node:test';
import assert from 'node:assert/strict';
import { createNormalizedTrip } from '../src/lib/normalized-trip.ts';
import { createQuoteComparison, emptyTripQuote, validateQuoteComparison, quoteMath, compareQuotes, quoteStorageKey, quoteFreshness, safeQuoteSourceUrl } from '../src/lib/trip-quote-comparison.ts';
const trip = () => createNormalizedTrip({ name:'Invented coastal break',start:'2030-04-01',end:'2030-04-08',cities:['Invented Harbor','Invented Hill'],origins:['AAA'],adults:2,pace:'balanced',flexDays:1,themes:[] });
const quote = (id='quote-a') => ({...emptyTripQuote(trip(),id),label:'Manual flight estimate',from:'AAA',to:'BBB',cabin:'Economy',baggage:'One checked bag per adult',cancellation:'Refundable until departure',cashAmount:1000,taxesFees:100,source:'Manual estimate',checkedAt:'2030-03-30T10:00:00Z'});
const award = () => ({...quote('quote-award'),kind:'award',sourceProgram:'Invented bank points',destinationProgram:'Invented airline points',transferTerms:'Assumed immediate 1-point increments; verify eligibility',label:'Manual award estimate',cashAmount:0,taxesFees:150,destinationPoints:100000,sourcePoints:null,transferRatio:1.25,transferIncrement:1,minimumTransfer:0,pointValuation:0.01});
const data = quotes => ({...createQuoteComparison(trip()),quotes});

test('cash totals use full party amounts without hidden multiplication, and unknown fees remain unknown',()=>{
 const value=quote();assert.equal(quoteMath(value).cashEquivalent,1100);assert.equal(quoteMath(value).cashOutlay,1100);value.taxesFees=null;assert.equal(quoteMath(value).cashEquivalent,null);assert.match(quoteMath(value).explanation[0],/unknown/);
});
test('transfer ratio uses source-points denominator and explainable cash-equivalent opportunity cost',()=>{
 const value=award(),math=quoteMath(value);assert.equal(math.sourcePoints,80000);assert.equal(math.pointsValue,800);assert.equal(math.cashEquivalent,950);assert.ok(math.explanation.some(line=>line.includes('destination points ÷ 1.25')));
 const comparison=compareQuotes(quote(),value);assert.equal(comparison.comparable,true);assert.equal(comparison.difference,150);assert.equal(comparison.valuePerSourcePoint,950/80000);
 assert.deepEqual(validateQuoteComparison(data([quote(),value]),trip()),data([quote(),value]));
});
test('unknown valuation prevents ranking but equivalent cash savings per source point remain useful',()=>{
 const value=award();value.pointValuation=null;const comparison=compareQuotes(quote(),value);assert.equal(comparison.comparable,false);assert.equal(comparison.difference,null);assert.equal(comparison.valuePerSourcePoint,950/80000);
 value.sourcePoints=null;value.transferRatio=null;assert.equal(quoteMath(value).sourcePoints,null);assert.equal(compareQuotes(quote(),value).valuePerSourcePoint,null);
});
test('insufficient entered source points cannot produce a ranking or value-per-point claim',()=>{
 const value=award();value.sourcePoints=70000;assert.throws(()=>validateQuoteComparison(data([value]),trip()));assert.equal(quoteMath(value).cashEquivalent,null);assert.equal(quoteMath(value).sourcePoints,null);assert.equal(compareQuotes(quote(),value).comparable,false);assert.equal(compareQuotes(quote(),value).valuePerSourcePoint,null);
});
test('cross-currency and differing scope or terms never rank as equivalent',()=>{
 for(const mutate of [value=>{value.currency='EUR';},value=>{value.startDate='2030-04-02';},value=>{value.occupants=3;},value=>{value.rooms=2;},value=>{value.cabin='Business';},value=>{value.baggage='No checked bag';},value=>{value.cancellation='Nonrefundable';},value=>{value.unknowns='Transfer timing unknown';},value=>{value.checkedAt='';},value=>{value.transferTerms='';}]){
  const value=award();mutate(value);const result=compareQuotes(quote(),value);assert.equal(result.comparable,false);assert.equal(result.difference,null);assert.equal(result.valuePerSourcePoint,null);
 }
});
test('hotel comparisons require matching city, dates, room type, room count and included terms',()=>{
 const base={...quote(),kind:'hotel',mode:'stay',cityId:trip().destinations[0].id,from:'',to:'',cabin:'Double room',baggage:'Breakfast included',cashAmount:600,taxesFees:75};assert.equal(validateQuoteComparison(data([base]),trip()).quotes[0].cashAmount,600);
 const alternative={...base,id:'hotel-b',cashAmount:700};assert.equal(compareQuotes(base,alternative).difference,-100);
 alternative.rooms=2;assert.equal(compareQuotes(base,alternative).comparable,false);alternative.rooms=1;alternative.cityId=trip().destinations[1].id;assert.equal(compareQuotes(base,alternative).comparable,false);
});
test('strict imports reject unknown fields, invalid amounts, dates, duplicate IDs and private text without echoing values',()=>{
 for(const mutate of [value=>{value.bookingReference='private';},value=>{value.cashAmount=-1;},value=>{value.cashAmount=NaN;},value=>{value.destinationPoints=12.5;value.kind='award';},value=>{value.startDate='2030-02-30';},value=>{value.checkedAt='2030-02-30T10:00:00Z';},value=>{value.source='person@example.test';},value=>{value.unknowns='PNR: FAKEAB';},value=>{value.id='123456789';},value=>{value.sourceUrl='https://booking.com/private?ref=FAKEAB';},value=>{value.sourceUrl=null;}]){
 const value=quote();mutate(value);assert.throws(()=>validateQuoteComparison(data([value]),trip()),error=>!error.message.includes('person@example.test')&&!error.message.includes('FAKEAB'));
 }
 assert.throws(()=>validateQuoteComparison(data([quote(),quote()]),trip()));
});
test('public source allowlist blocks arbitrary, disguised, private and token-bearing links',()=>{
 assert.equal(safeQuoteSourceUrl('https://www.booking.com/'), 'https://www.booking.com/');assert.equal(safeQuoteSourceUrl('https://www.united.com/en/us'), 'https://www.united.com/en/us');
 for(const url of ['https://booking.com.evil.test/','https://localhost/','https://mail.google.com/mail/u/0/','https://accounts.google.com/','https://www.booking.com/#private','https://person@example.com/','http://www.booking.com/','https://www.booking.com/%70%6e%72/FAKEAB','https://www.united.com/?token=FAKEAB']) assert.throws(()=>safeQuoteSourceUrl(url));
});
test('storage and import identity isolate date windows, cities and traveler party even with same human trip ID',()=>{
 const first=trip(),second=trip();second.dateWindow.earliestDeparture='2030-04-02';assert.notEqual(quoteStorageKey(first),quoteStorageKey(second));assert.throws(()=>validateQuoteComparison(data([quote()]),second));
 const third=trip();third.destinations[0].name='Different Harbor';assert.notEqual(quoteStorageKey(first),quoteStorageKey(third));const fourth=trip();fourth.travelers.adults=3;assert.notEqual(quoteStorageKey(first),quoteStorageKey(fourth));
 const memory=new Map([[quoteStorageKey(first),JSON.stringify(data([quote()]))]]);assert.equal(memory.get(quoteStorageKey(second)),undefined);assert.equal(validateQuoteComparison(JSON.parse(memory.get(quoteStorageKey(first))),first).quotes.length,1);
});
test('freshness labels disclose entered timestamps without claiming verified inventory',()=>{
 const value=quote();assert.match(quoteFreshness(value,Date.parse('2030-03-30T11:00:00Z')),/availability unverified/);assert.match(quoteFreshness(value,Date.parse('2030-04-02T10:00:00Z')),/older than 24 hours/);assert.match(quoteFreshness(value,Date.parse('2030-03-29T10:00:00Z')),/Future/);value.checkedAt='';assert.match(quoteFreshness(value),/No checked time/);
});

test('minimum and increment rules round destination requirements to actual transferable source points',()=>{
 const value={...award(),destinationPoints:10001,transferRatio:1,transferIncrement:1000,minimumTransfer:1000};
 const math=quoteMath(value);assert.equal(math.sourcePointsLowerBound,10001);assert.equal(math.sourcePoints,11000);assert.equal(math.pointsValue,110);assert.equal(math.cashEquivalent,260);assert.equal(math.unusedDestinationPoints,999);
 assert.ok(math.explanation.some(line=>line.includes('blocks of 1000')));assert.ok(math.explanation.some(line=>line.includes('no leftover credit')));
 assert.equal(validateQuoteComparison(data([value]),trip()).quotes[0].transferIncrement,1000);
 value.minimumTransfer=20000;assert.equal(quoteMath(value).sourcePoints,20000);assert.equal(quoteMath(value).cashEquivalent,350);
 value.minimumTransfer=20500;assert.equal(quoteMath(value).sourcePoints,21000);
});
test('valid entered overtransfer uses actual source spend while insufficient or invalid blocks are rejected',()=>{
 const value={...award(),destinationPoints:10001,transferRatio:1,transferIncrement:1000,minimumTransfer:1000,sourcePoints:11000};
 assert.equal(validateQuoteComparison(data([value]),trip()).quotes[0].sourcePoints,11000);assert.equal(quoteMath(value).cashEquivalent,260);
 value.sourcePoints=12000;assert.equal(quoteMath(value).cashEquivalent,270);assert.equal(quoteMath(value).unusedDestinationPoints,1999);assert.doesNotThrow(()=>validateQuoteComparison(data([value]),trip()));
 for(const spent of [9000,10500]){value.sourcePoints=spent;assert.throws(()=>validateQuoteComparison(data([value]),trip()));assert.equal(quoteMath(value).cashEquivalent,null);assert.equal(compareQuotes(quote(),value).valuePerSourcePoint,null);}
 value.sourcePoints=11000;value.minimumTransfer=12000;assert.throws(()=>validateQuoteComparison(data([value]),trip()));
});
test('ratio-only lower bounds never fabricate transferable totals when minimum or increment is unknown',()=>{
 for(const change of [value=>{value.transferIncrement=null;},value=>{value.minimumTransfer=null;},value=>{value.transferIncrement=null;value.minimumTransfer=null;}]){
 const value={...award(),destinationPoints:10001,transferRatio:1,transferIncrement:1000,minimumTransfer:1000};change(value);
 assert.doesNotThrow(()=>validateQuoteComparison(data([value]),trip()));const math=quoteMath(value);assert.equal(math.sourcePointsLowerBound,10001);assert.equal(math.sourcePoints,null);assert.equal(math.cashEquivalent,null);assert.equal(compareQuotes(quote(),value).comparable,false);assert.equal(compareQuotes(quote(),value).valuePerSourcePoint,null);
 value.sourcePoints=11000;assert.equal(quoteMath(value).cashEquivalent,260);assert.doesNotThrow(()=>validateQuoteComparison(data([value]),trip()));
 }
});
test('structured transfer rules reject zero increments, fractional blocks and negative minimums',()=>{
 for(const change of [value=>{value.transferIncrement=0;},value=>{value.transferIncrement=1.5;},value=>{value.minimumTransfer=-1;},value=>{value.minimumTransfer=10.5;}]){const value=award();change(value);assert.throws(()=>validateQuoteComparison(data([value]),trip()));}
});
