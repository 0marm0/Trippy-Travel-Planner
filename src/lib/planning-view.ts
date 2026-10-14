import { validateWorkspace, workspaceDates, workspaceConflicts, type GenericWorkspace, type RouteAllocation } from './generic-trip-workspace.ts';

const addDays = (date: string, nights: number) => new Date(Date.parse(date) + nights * 86400000).toISOString().slice(0, 10);

/** Versioned, sample-free reading model. Unknown geography and timing stay unknown. */
export function buildPlanningView(workspace: GenericWorkspace) {
  if (validateWorkspace(workspace).length) throw new Error('Validate the workspace before opening detailed views.');
  const { trip } = workspace;
  const conflicts = workspaceConflicts(workspace);
  const name = (id: string) => trip.destinations.find(place => place.id === id)?.name || 'Unassigned';
  return {
    version: 1 as const, tripId: trip.id, title: trip.name,
    destinations: trip.destinations.map(place => ({ ...place, coordinates: workspace.places.find(pin => pin.placeId === place.id) || null, evidence: workspace.itemEvidence?.find(item => item.target === 'destination' && item.targetId === place.id) || null })),
    days: workspace.days.map((day, index) => ({ ...day, number: index + 1, city: name(day.placeId), activities: workspace.activities.filter(item => item.date === day.date).sort((a,b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id)), anchors: trip.anchors.filter(item => item.date === day.date), conflicts: conflicts.filter(issue => issue.startsWith(day.date)) })),
    routes: trip.routeCandidates.map(route => {
      let current = trip.dateWindow.earliestDeparture;
      const allocation = workspace.routeAllocations?.find(item => item.routeId === route.id);
      const stops = allocation?.stops.map(stop => { const checkIn = current; current = addDays(current,stop.nights); return { ...stop, name: name(stop.placeId), checkIn, checkOut: current }; }) || [];
      return { ...route, stops, allocatedNights: stops.reduce((sum, stop) => sum + stop.nights,0), complete: Boolean(stops.length && current === trip.dateWindow.latestReturn), issues: allocation ? allocationIssues(workspace,allocation) : ['Night allocations not recorded.'] };
    }),
  };
}

export function allocationIssues(workspace: GenericWorkspace, allocation: RouteAllocation): string[] {
  const issues: string[] = [];
  let current = workspace.trip.dateWindow.earliestDeparture;
  for (const stop of allocation.stops) {
    const end = addDays(current,stop.nights), place = workspace.trip.destinations.find(item => item.id === stop.placeId);
    if (place?.minimumNights !== undefined && stop.nights < place.minimumNights) issues.push(`${place.name}: below the requested minimum nights.`);
    if (place?.maximumNights !== undefined && stop.nights > place.maximumNights) issues.push(`${place.name}: above the requested maximum nights.`);
    for (const anchor of workspace.trip.anchors.filter(item => item.locked && item.placeId === stop.placeId)) {
      const finalStop = stop === allocation.stops.at(-1);
      if (anchor.date < current || anchor.date > end || (!finalStop && anchor.date === end)) issues.push(`${anchor.date}: fixed anchor falls outside ${place?.name || 'destination'} allocation; transfer-day timing needs review.`);
    }
    current = end;
  }
  if (current !== workspace.trip.dateWindow.latestReturn) issues.push('Allocate every night in the planning window before applying dates.');
  return issues;
}

/** Date allocation is an explicit preview; never moves activities or confirmations. */
export function previewRouteAllocation(workspace: GenericWorkspace, routeId: string): GenericWorkspace {
  if (validateWorkspace(workspace).length) throw new Error('Invalid workspace.');
  const allocation = workspace.routeAllocations?.find(item => item.routeId === routeId);
  if (!allocation || allocationIssues(workspace,allocation).length) throw new Error('Resolve incomplete nights or fixed-anchor conflicts before applying this allocation.');
  let current = workspace.trip.dateWindow.earliestDeparture;
  const destinations = new Map<string,string>();
  for (const stop of allocation.stops) {
    for (let index = 0; index < stop.nights; index++) destinations.set(addDays(current,index),stop.placeId);
    current = addDays(current,stop.nights);
  }
  destinations.set(workspace.trip.dateWindow.latestReturn,allocation.stops.at(-1)!.placeId);
  const next = { ...structuredClone(workspace), selectedRouteId: routeId, days: workspaceDates(workspace.trip).map(date => ({date,placeId:destinations.get(date) || ''})) };
  if (validateWorkspace(next).length) throw new Error('Allocation could not be validated.');
  return next;
}

export function planningReadiness(workspace: GenericWorkspace) {
  if (validateWorkspace(workspace).length) throw new Error('Invalid workspace.');
  const rows: Array<{ id: string; label: string; tab: 'route' | 'days' | 'bookings' | 'research'; severity: 'review' | 'missing' }> = [];
  if (!workspace.selectedRouteId) rows.push({id:'route',label:'Choose a planning route',tab:'route',severity:'missing'});
  if (workspace.days.some(day => !day.placeId)) rows.push({id:'days',label:'Some days have no destination',tab:'days',severity:'missing'});
  for (const place of workspace.trip.destinations) if (!workspace.places.some(pin => pin.placeId === place.id)) rows.push({id:`pin-${place.id}`,label:`${place.name}: coordinates unknown`,tab:'route',severity:'missing'});
  for (const booking of workspace.trip.bookings) if (booking.status !== 'confirmed') rows.push({id:`booking-${booking.id}`,label:`${workspace.bookingDetails.find(item => item.bookingId === booking.id)?.label || booking.kind}: ${booking.status}`,tab:'bookings',severity:'review'});
  if (!workspace.trip.bookings.length) rows.push({id:'bookings',label:'Stays and transport have not been recorded',tab:'bookings',severity:'missing'});
  for (const [index,conflict] of workspaceConflicts(workspace).entries()) rows.push({id:`conflict-${index}`,label:conflict,tab:'days',severity:'review'});
  for (const item of workspace.itemEvidence || []) if (item.reviewRequired) rows.push({id:`evidence-review-${item.target}-${item.targetId}`,label:'Review evidence after its underlying record changed',tab:'research',severity:'review'});
  const targets = [...workspace.activities.map(item => `activity:${item.id}`), ...workspace.trip.bookings.map(item => `booking:${item.id}`)];
  const count = targets.filter(key => !workspace.itemEvidence?.some(item => `${item.target}:${item.targetId}` === key)).length;
  if (count) rows.push({id:'evidence',label:`${count} activity or booking records lack item evidence`,tab:'research',severity:'missing'});
  return rows;
}

export function agentPlanningPacket(workspace: GenericWorkspace) {
  const view = buildPlanningView(workspace);
  return { version: 1, purpose: 'Reviewed planning handoff; no provider access or booking authorization', workspace, routes: view.routes, readiness: planningReadiness(workspace), requiredResearch: ['dates and airports','cash and award scope','all plausible city connections','hotel locations and full stay terms','each city catalogue and feasible days'], nextAction: 'Review constraints, recorded coverage, unknowns and alternatives before proposing changes. Preserve canonical booking states; preview every import or state change.' };
}

/** Explicit local-time adjustment; conflicts remain visible rather than auto-rescheduling neighbors. */
export function shiftActivityTime(workspace: GenericWorkspace, activityId: string, minutes: number): GenericWorkspace {
  if(validateWorkspace(workspace).length || !Number.isInteger(minutes) || Math.abs(minutes)>720)throw new Error('Invalid time adjustment.');
  const current=workspace.activities.find(item=>item.id===activityId);
  if(!current)throw new Error('Activity is no longer available.');
  const [hours,minute]=current.time.split(':').map(Number), nextTime=hours*60+minute+minutes;
  if(nextTime<0 || nextTime>=1440)throw new Error('Choose another day explicitly before moving an activity across midnight.');
  const next=structuredClone(workspace);next.activities=next.activities.map(item=>item.id===activityId?{...item,time:`${String(Math.floor(nextTime/60)).padStart(2,'0')}:${String(nextTime%60).padStart(2,'0')}`}:item);
  return next;
}
