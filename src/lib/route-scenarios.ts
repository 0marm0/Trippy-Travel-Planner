import { validateNormalizedTrip, type NormalizedTrip } from './normalized-trip.ts';
import { hasPrivatePlanningText } from './planning-privacy.ts';
import { buildTripBudget } from './trip-budget.ts';
import { createQuoteComparison, quoteTripIdentity } from './trip-quote-comparison.ts';
import type { GenericWorkspace, RouteAllocation } from './generic-trip-workspace.ts';

export const scenarioModes = ['flight','rail','car','ferry','bus','other'] as const;
export type ScenarioLeg = { id: string; from: string; to: string; fromPlaceId: string; toPlaceId: string; date: string; mode: typeof scenarioModes[number]; durationMinutes: number | null; quoteIds: string[] };
export type RouteScenario = {
  id: string; label: string; routeId: string;
  direction: 'outbound' | 'return' | 'round-trip' | 'multi-city';
  startDate: string; endDate: string;
  originGateway: string; arrivalGateway: string; departureGateway: string; returnGateway: string;
  ticketing: 'through' | 'separate' | 'mixed' | 'unknown';
  connectionProtection: 'known' | 'unknown' | 'unsupported'; protectionNotes: string; scopeNotes: string;
  legs: ScenarioLeg[];
};
export type RouteScenarioData = { version: 1; tripIdentity: string; scenarios: RouteScenario[] };
export type RouteProposal = { route: NormalizedTrip['routeCandidates'][number]; allocation: RouteAllocation; conflicts: string[]; strategy: string };
const scenarioKeys = ['id','label','routeId','direction','startDate','endDate','originGateway','arrivalGateway','departureGateway','returnGateway','ticketing','connectionProtection','protectionNotes','scopeNotes','legs'];
function exact(value: unknown, keys: string[]): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value,key)); }
function text(value: unknown, max=160): value is string { return typeof value === 'string' && value.length <= max && !/[\u0000-\u001f\u007f]|@|https?:|www\.|mail[t]o:/i.test(value.normalize('NFKC')) && !hasPrivatePlanningText(value); }
const id = (value:unknown):value is string => typeof value === 'string' && /^[a-z0-9-]{1,64}$/.test(value) && !hasPrivatePlanningText(value);
const date = (value:unknown):value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
export function createRouteScenarios(trip: NormalizedTrip): RouteScenarioData { return {version:1,tripIdentity:quoteTripIdentity(trip),scenarios:[]}; }

/** Missing/deleted references are retained as unresolved receipts; foreign trip identity is rejected. */
export function validateRouteScenarios(input: unknown, trip: NormalizedTrip): RouteScenarioData {
  const fail=():never=>{throw new Error('Invalid route scenarios for this trip; no changes applied.');};
  if (!exact(input,['version','tripIdentity','scenarios']) || input.version !== 1 || input.tripIdentity !== quoteTripIdentity(trip) || !Array.isArray(input.scenarios) || input.scenarios.length > 40) return fail();
  const seen=new Set<string>();
  for (const raw of input.scenarios) {
    if(!exact(raw,scenarioKeys))return fail();
    const item=raw as unknown as RouteScenario;
    if(!id(item.id)||seen.has(item.id)||!id(item.routeId)||!text(item.label)||!item.label.trim()||!['outbound','return','round-trip','multi-city'].includes(item.direction)||!['through','separate','mixed','unknown'].includes(item.ticketing)||!['known','unknown','unsupported'].includes(item.connectionProtection))return fail();
    if(!date(item.startDate)||!date(item.endDate)||item.startDate>item.endDate||item.startDate<trip.dateWindow.earliestDeparture||item.endDate>trip.dateWindow.latestReturn)return fail();
    if(![item.originGateway,item.arrivalGateway,item.departureGateway,item.returnGateway].every(value=>text(value,120))||!text(item.protectionNotes,500)||!text(item.scopeNotes,1000)||(item.connectionProtection==='known'&&!item.protectionNotes.trim())||!Array.isArray(item.legs)||item.legs.length>30)return fail();
    const legIds=new Set<string>();
    for(const leg of item.legs){
      if(!exact(leg,['id','from','to','fromPlaceId','toPlaceId','date','mode','durationMinutes','quoteIds'])||!id(leg.id)||legIds.has(leg.id)||!text(leg.from,120)||!text(leg.to,120)||(leg.fromPlaceId!==''&&!id(leg.fromPlaceId))||(leg.toPlaceId!==''&&!id(leg.toPlaceId))||!date(leg.date)||leg.date<item.startDate||leg.date>item.endDate||!scenarioModes.includes(leg.mode)||!(leg.durationMinutes===null||Number.isInteger(leg.durationMinutes)&&leg.durationMinutes>=1&&leg.durationMinutes<=43200)||!Array.isArray(leg.quoteIds)||leg.quoteIds.length>30||leg.quoteIds.some(value=>!id(value))||new Set(leg.quoteIds).size!==leg.quoteIds.length)return fail();
      legIds.add(leg.id);
    }
    seen.add(item.id);
  }
  return structuredClone(input as unknown as RouteScenarioData);
}

const plusDays = (start:string,days:number) => new Date(Date.parse(start)+days*86400000).toISOString().slice(0,10);
/** Night allocation is a planning proposal; no schedules, prices or distance feasibility are inferred. */
export function routeAllocationConflicts(trip:NormalizedTrip,allocation:RouteAllocation):string[]{
  const errors:string[]=[];
  const nights=(Date.parse(trip.dateWindow.latestReturn)-Date.parse(trip.dateWindow.earliestDeparture))/86400000;
  const total=allocation.stops.reduce((sum,stop)=>sum+stop.nights,0);
  if(total!==nights)errors.push(`Allocation uses ${total} of ${nights} planning-window nights; actual trip length remains a decision.`);
  let offset=0;
  for(const stop of allocation.stops){
    const place=trip.destinations.find(item=>item.id===stop.placeId);
    if(!place){errors.push('Allocation refers to a missing destination.');continue;}
    if(stop.nights<(place.minimumNights??1))errors.push(`${place.name}: below minimum ${place.minimumNights??1} nights.`);
    if(place.maximumNights!==undefined&&stop.nights>place.maximumNights)errors.push(`${place.name}: above maximum ${place.maximumNights} nights.`);
    const start=plusDays(trip.dateWindow.earliestDeparture,offset),end=plusDays(start,stop.nights);
    for(const anchor of trip.anchors.filter(item=>item.locked&&item.placeId===stop.placeId))if(anchor.date<start||anchor.date>end||anchor.date===end&&end!==trip.dateWindow.latestReturn)errors.push(`${place.name}: locked anchor ${anchor.label} on ${anchor.date} is outside its proposed overnight allocation; transfer-day feasibility needs review.`);
    offset+=stop.nights;
  }
  for(const place of trip.destinations.filter(item=>item.priority==='required'||trip.anchors.some(anchor=>anchor.locked&&anchor.placeId===item.id)))if(!allocation.stops.some(stop=>stop.placeId===place.id))errors.push(`${place.name}: required or anchored destination missing.`);
  return errors;
}

/** Deterministic, bounded alternatives. Two-city constraints may yield fewer than three distinct proposals. */
export function generateRouteProposals(trip:NormalizedTrip):{proposals:RouteProposal[];limitations:string[]}{
  if(validateNormalizedTrip(trip).length)throw new Error('Valid trip required for proposals.');
  const places=trip.destinations.map(place=>place.id);
  const nights=(Date.parse(trip.dateWindow.latestReturn)-Date.parse(trip.dateWindow.earliestDeparture))/86400000;
  const orders=[places,[...places].reverse(),...places.slice(1).map((_,index)=>[...places.slice(index+1),...places.slice(0,index+1)])];
  const proposals:RouteProposal[]=[];const seen=new Set<string>();
  for(const order of orders){for(const allocationBias of ['balanced','first','last'] as const){
    const stops=order.map(placeId=>({placeId,nights:Math.max(1,trip.destinations.find(place=>place.id===placeId)?.minimumNights??1)}));
    let remainder=nights-stops.reduce((sum,stop)=>sum+stop.nights,0);
    while(remainder>0){const eligible=stops.filter(stop=>stop.nights<(trip.destinations.find(place=>place.id===stop.placeId)?.maximumNights??365));if(!eligible.length)break;const target=allocationBias==='first'?eligible[0]:allocationBias==='last'?eligible.at(-1)!:eligible.toSorted((a,b)=>a.nights-b.nights||order.indexOf(a.placeId)-order.indexOf(b.placeId))[0];target.nights++;remainder--;}
    const signature=JSON.stringify(stops);if(seen.has(signature))continue;seen.add(signature);
    let suffix=proposals.length+1;
    while(trip.routeCandidates.some(route=>route.id===`route-proposal-${suffix}`)||proposals.some(proposal=>proposal.route.id===`route-proposal-${suffix}`))suffix++;
    const proposalId=`route-proposal-${suffix}`;
    const strategy=allocationBias==='first'?'Longer first base, then onward travel':allocationBias==='last'?'Longer final base with an open-jaw return review':'Balanced nights with an open-jaw gateway review';
    const route={id:proposalId,label:`${allocationBias==='first'?'First-base focus':allocationBias==='last'?'Final-base focus':'Balanced route'} ${proposals.length+1}`,status:'recommended',placeOrder:order,scoreReasons:[strategy,'Manual proposal only; gateway access, transport schedules and prices unverified.']};
    const allocation={routeId:proposalId,stops};proposals.push({route,allocation,strategy,conflicts:routeAllocationConflicts(trip,allocation)});
    if(proposals.length===6)break;
  }if(proposals.length===6)break;}
  const feasible=proposals.filter(proposal=>proposal.conflicts.length===0).length;
  return {proposals,limitations:[...(feasible<3?[`Only ${feasible} of ${proposals.length} distinct order/night proposals fit the recorded constraints. Do not fabricate a third feasible route; revisit cities, night bounds or anchors.`]:[]),'The entire date window is used for proposal nights; it is not a confirmed trip length. Flight gateways, through tickets, surface positioning and connections require explicit scenario entry. No geographic or transport feasibility is inferred.']};
}

export function emptyRouteScenario(trip:NormalizedTrip,idValue:string,routeId:string):RouteScenario{return {id:idValue,label:'',routeId,direction:'multi-city',startDate:trip.dateWindow.earliestDeparture,endDate:trip.dateWindow.latestReturn,originGateway:'',arrivalGateway:'',departureGateway:'',returnGateway:'',ticketing:'unknown',connectionProtection:'unknown',protectionNotes:'',scopeNotes:'',legs:[]};}

export function summarizeRouteScenario(workspace:GenericWorkspace,scenario:RouteScenario,now=Date.now()){
  const data=workspace.quoteEvidence||createQuoteComparison(workspace.trip);
  const quoteIds=[...new Set(scenario.legs.flatMap(leg=>leg.quoteIds))];
  const budget=buildTripBudget(workspace.trip,data,quoteIds,now);
  const warnings:string[]=[];
  const route=workspace.trip.routeCandidates.find(item=>item.id===scenario.routeId);
  const allocation=workspace.routeAllocations?.find(item=>item.routeId===scenario.routeId);
  if(!route)warnings.push('Referenced route option was deleted or is unavailable.');
  if(!allocation)warnings.push('Route night allocation is unknown.');else warnings.push(...routeAllocationConflicts(workspace.trip,allocation));
  if(!scenario.legs.length)warnings.push('No transport legs recorded; coverage is unknown.');
  if(budget.unknownSelectionCount)warnings.push(`${budget.unknownSelectionCount} referenced quotes were deleted or are unavailable.`);
  if(budget.partyMismatchCount)warnings.push('One or more quotes do not cover the recorded whole party.');
  if(budget.staleOrUndatedCount)warnings.push('Selected quote check times are stale, future or missing; refresh before comparison.');
  if(budget.unresolvedTermsCount)warnings.push('Selected quotes contain unresolved scope or terms.');
  if(budget.currencies.some(item=>!Intl.supportedValuesOf('currency').includes(item.currency)))warnings.push('One or more currency codes are not recognized; treat their amounts as unknown-value units.');
  if(budget.currencies.length>1)warnings.push('Mixed currencies are kept separate; no FX total is calculated.');
  if(scenario.connectionProtection!=='known')warnings.push(`Connection protection is ${scenario.connectionProtection}; verify missed-connection, baggage and disruption terms.`);
  if(scenario.ticketing==='unknown')warnings.push('Ticketing relationship is unknown.');
  if(!scenario.scopeNotes.trim())warnings.push('Whole-route scope and exclusions are not recorded.');
  if(!scenario.originGateway||!scenario.arrivalGateway||!scenario.departureGateway||!scenario.returnGateway)warnings.push('One or more gateways are unknown.');
  const selectedById=new Map(budget.selected.map(item=>[item.quote.id,item.quote]));
  const assignments=new Map<string,ScenarioLeg[]>();
  for(const leg of scenario.legs){
    if(!leg.from||!leg.to)warnings.push(`${leg.id}: direction endpoints are unknown.`);
    if(!leg.quoteIds.length)warnings.push(`${leg.id}: no quote attached; cost is unknown.`);
    if(leg.durationMinutes===null)warnings.push(`${leg.id}: elapsed time unknown.`);
    for(const quoteId of leg.quoteIds){const list=assignments.get(quoteId)||[];list.push(leg);assignments.set(quoteId,list);const quote=selectedById.get(quoteId);if(quote&&(quote.mode!==leg.mode||quote.startDate>leg.date||quote.endDate<leg.date))warnings.push(`${leg.id}: attached quote has a different date or mode scope.`);}
  }
  // A through quote may intentionally cover multiple legs. Alternatives on a leg cannot be summed as purchases.
  for(const leg of scenario.legs)if(leg.quoteIds.length>1)warnings.push(`${leg.id}: multiple quote references may be alternatives; keep one purchase quote per leg for comparable totals.`);
  for(const [quoteId,legs] of assignments){const quote=selectedById.get(quoteId);if(!quote)continue;const first=legs[0],last=legs.at(-1)!;if(quote.from.trim().toLowerCase()!==first.from.trim().toLowerCase()||quote.to.trim().toLowerCase()!==last.to.trim().toLowerCase())warnings.push(`${quoteId}: quote endpoints differ from assigned leg/group scope.`);if(legs.length>1&&scenario.ticketing==='separate')warnings.push(`${quoteId}: one quote covers multiple legs while separate tickets are recorded; review scope.`);}
  for(let index=1;index<scenario.legs.length;index++){const previous=scenario.legs[index-1],leg=scenario.legs[index];if(previous.to.trim().toLowerCase()!==leg.from.trim().toLowerCase())warnings.push(`${leg.id}: missing transfer or positioning leg between recorded endpoints.`);if(previous.date>leg.date)warnings.push(`${leg.id}: legs are out of date order.`);}
  if(route){
    const visits=scenario.legs.flatMap(leg=>[leg.fromPlaceId,leg.toPlaceId]).filter(Boolean).filter((place,index,all)=>index===0||place!==all[index-1]);
    let position=-1;
    for(const placeId of route.placeOrder){const next=visits.indexOf(placeId,position+1);if(next<0)warnings.push('Missing or out-of-order destination leg links; explicitly map gateway/leg labels to each route city.');else position=next;}
  }
  if(scenario.legs.some(leg=>[leg.fromPlaceId,leg.toPlaceId].some(placeId=>placeId&&!workspace.trip.destinations.some(place=>place.id===placeId))))warnings.push('A leg destination reference is missing from this trip.');
  if(scenario.legs.length){if(!scenario.legs.some(leg=>leg.to.trim().toLowerCase()===scenario.arrivalGateway.trim().toLowerCase())||!scenario.legs.some(leg=>leg.from.trim().toLowerCase()===scenario.departureGateway.trim().toLowerCase()))warnings.push('Arrival or departure gateway has no matching leg endpoint; gateway coverage is unresolved.');const first=scenario.legs[0],last=scenario.legs.at(-1)!;if(first.from.trim().toLowerCase()!==scenario.originGateway.trim().toLowerCase()||last.to.trim().toLowerCase()!==scenario.returnGateway.trim().toLowerCase())warnings.push('Recorded legs do not cover the stated origin/return gateway span.');}
  const unknownCash=budget.currencies.some(currency=>currency.unknownCashCount>0)||!quoteIds.length||budget.unknownSelectionCount>0||scenario.legs.some(leg=>!leg.quoteIds.length);
  if(unknownCash)warnings.push('Complete route cash outlay is unknown; known subtotals are partial.');
  return {budget,warnings:[...new Set(warnings)],quoteIds,elapsedMinutes:scenario.legs.length&&scenario.legs.every(leg=>leg.durationMinutes!==null)?scenario.legs.reduce((sum,leg)=>sum+leg.durationMinutes!,0):null,unknownCash,route,allocation};
}

/** Conservative comparison gate: same whole-route scope, party, currency and resolved quote terms. */
export function compareRouteScenarios(workspace:GenericWorkspace,left:RouteScenario,right:RouteScenario,now=Date.now()){
  const a=summarizeRouteScenario(workspace,left,now),b=summarizeRouteScenario(workspace,right,now);const reasons:string[]=[];
  for(const [label,summary] of [['First',a],['Second',b]] as const)if(summary.warnings.length)reasons.push(`${label} scenario has unresolved coverage, sources or planning facts.`);
  const normalize=(value:string)=>value.trim().toLowerCase();
  for(const key of ['direction','startDate','endDate','originGateway','arrivalGateway','departureGateway','returnGateway','scopeNotes'] as const)if(normalize(left[key])!==normalize(right[key]))reasons.push(`Different ${key} scope.`);
  if(JSON.stringify(a.route?.placeOrder)!==JSON.stringify(b.route?.placeOrder)||JSON.stringify(a.allocation?.stops)!==JSON.stringify(b.allocation?.stops))reasons.push('Different city order or night allocation; treat as a planning tradeoff, not equivalent totals.');
  const currenciesA=a.budget.currencies.map(item=>item.currency),currenciesB=b.budget.currencies.map(item=>item.currency);
  if(currenciesA.length!==1||currenciesB.length!==1||currenciesA[0]!==currenciesB[0])reasons.push('A single common currency is required; no FX conversion is assumed.');
  const terms=(summary:typeof a)=>[...new Set(summary.budget.selected.map(({quote})=>JSON.stringify([quote.occupants,quote.rooms,quote.cabin,quote.baggage,quote.cancellation])))].sort();
  if(JSON.stringify(terms(a))!==JSON.stringify(terms(b)))reasons.push('Different party, cabin, baggage, room or cancellation terms.');
  const equivalentKnown=[a,b].every(summary=>summary.budget.currencies.length===1&&summary.budget.currencies[0].unknownEquivalentCount===0&&summary.budget.unknownPointsProgramCount===0);
  if(!equivalentKnown)reasons.push('Cash equivalent or award program assumptions are incomplete.');
  return {comparable:reasons.length===0,reasons,difference:reasons.length?null:a.budget.currencies[0].knownCashEquivalent-b.budget.currencies[0].knownCashEquivalent,currency:reasons.length?null:currenciesA[0]};
}
