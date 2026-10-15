import{validateWorkspace,type GenericWorkspace}from'./generic-trip-workspace.ts';
import{hasPrivatePlanningText}from'./planning-privacy.ts';
export type WorkspaceSearchHit={id:string;targetId:string;kind:'activity'|'destination'|'day'|'booking'|'route'|'quote'|'preparation';label:string;detail:string;tab:'route'|'days'|'bookings'|'research'|'preparation';date?:string};
export function searchWorkspace(workspace:GenericWorkspace,query:string):WorkspaceSearchHit[]{
 if(validateWorkspace(workspace).length)throw new Error('Validate the workspace before searching.');
 if(typeof query!=='string'||query.length>120||hasPrivatePlanningText(query)||/@|https?:|www\.|mail[t]o:/i.test(query.normalize('NFKC')))return[];
 const terms=query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);if(!terms.length)return[];
 const city=(id:string)=>workspace.trip.destinations.find(item=>item.id===id)?.name||'Destination unknown';
 const entries:WorkspaceSearchHit[]=[
 ...workspace.trip.destinations.map(item=>({id:`destination:${item.id}`,targetId:item.id,kind:'destination' as const,label:item.name,detail:'Destination · recorded geography',tab:'route' as const})),
 ...workspace.days.map(item=>({id:`day:${item.date}`,targetId:item.date,kind:'day' as const,label:item.date,detail:`Day plan · ${city(item.placeId)}`,tab:'days' as const,date:item.date})),
 ...workspace.activities.map(item=>({id:`activity:${item.id}`,targetId:item.id,kind:'activity' as const,label:item.title,detail:`${item.date} · ${item.time} · ${city(item.placeId)} · ${item.category||'Category unknown'}`,tab:'days' as const,date:item.date})),
 ...workspace.trip.bookings.map(item=>({id:`booking:${item.id}`,targetId:item.id,kind:'booking' as const,label:workspace.bookingDetails.find(detail=>detail.bookingId===item.id)?.label||item.provider||item.kind,detail:`${item.kind} · ${item.status} · ${item.startAt} → ${item.endAt}`,tab:'bookings' as const,date:item.startAt.slice(0,10)})),
 ...workspace.trip.routeCandidates.map(item=>({id:`route:${item.id}`,targetId:item.id,kind:'route' as const,label:item.label,detail:item.placeOrder.map(city).join(' → '),tab:'route' as const})),
 ...(workspace.quoteEvidence?.quotes||[]).map(item=>({id:`quote:${item.id}`,targetId:item.id,kind:'quote' as const,label:item.label,detail:`${item.kind} · ${item.startDate} → ${item.endDate} · ${item.source||'Source unknown'}`,tab:'research' as const})),
 ...(workspace.preparation?.tasks||[]).map(item=>({id:`preparation:${item.id}`,targetId:item.id,kind:'preparation' as const,label:item.title,detail:`${item.category} · ${item.done?'Done':'Open'} · ${item.assignee||'Unassigned'}`,tab:'preparation' as const})),
 ];
 return entries.filter(item=>{const text=`${item.label} ${item.detail}`.normalize('NFKC').toLocaleLowerCase();return terms.every(term=>text.includes(term));}).slice(0,30);
}
/** Resolve the exact current record, without changing any selection or completion state. */
export function workspaceSearchContext(workspace:GenericWorkspace,hit:WorkspaceSearchHit):{label:string;rows:string[]}|null{
 if(validateWorkspace(workspace).length)throw new Error('Validate the workspace before inspecting records.');
 const city=(id:string)=>workspace.trip.destinations.find(item=>item.id===id)?.name||'Destination unknown';
 if(hit.kind==='quote'){const q=workspace.quoteEvidence?.quotes.find(item=>item.id===hit.targetId);return q?{label:q.label,rows:[`${q.kind} · ${q.mode} · ${q.startDate} → ${q.endDate}`,`${q.occupants} occupants · ${q.rooms} rooms · ${q.currency}`,`Recorded base ${q.cashAmount??'unknown'} · taxes/fees ${q.taxesFees??'unknown'} · destination points ${q.destinationPoints??'unknown'}`,`${q.source||'Source unknown'} · checked ${q.checkedAt||'Unknown'}`,`Unknowns: ${q.unknowns||'Not recorded; completeness unverified'}`]}:null;}
 if(hit.kind==='route'){const r=workspace.trip.routeCandidates.find(item=>item.id===hit.targetId);return r?{label:r.label,rows:[r.placeOrder.map(city).join(' → '),`Recorded status: ${r.status}`,...(r.scoreReasons||[]),'Inspecting does not select this route or allocate days.']}:null;}
 if(hit.kind==='preparation'){const task=workspace.preparation?.tasks.find(item=>item.id===hit.targetId);return task?{label:task.title,rows:[`${task.category} · ${task.done?'Marked done':'Open'}`,`Responsibility alias: ${task.assignee||'Unassigned'} · due ${task.dueDate||'Unknown'}`,task.placeId?city(task.placeId):'No destination reference','Inspecting does not mark the task complete or verify readiness.']}:null;}
 if(hit.kind==='activity'){const a=workspace.activities.find(item=>item.id===hit.targetId);return a?{label:a.title,rows:[`${a.date} · ${a.time} · ${a.durationMinutes} minutes`,city(a.placeId),a.notes||'No notes recorded']}:null;}
 if(hit.kind==='booking'){const b=workspace.trip.bookings.find(item=>item.id===hit.targetId);return b?{label:workspace.bookingDetails.find(item=>item.bookingId===b.id)?.label||b.provider||b.kind,rows:[`${b.kind} · ${b.status}`,`${b.startAt} → ${b.endAt}`,'Inspecting never changes booking state.']}:null;}
 if(hit.kind==='destination'){const p=workspace.trip.destinations.find(item=>item.id===hit.targetId);const pin=workspace.places.find(item=>item.placeId===hit.targetId);return p?{label:p.name,rows:[pin?`Manual coordinates: ${pin.lat}, ${pin.lng}`:'Coordinates unknown','No travel route or duration is inferred.']}:null;}
 const day=workspace.days.find(item=>item.date===hit.targetId);return day?{label:day.date,rows:[city(day.placeId),`${workspace.activities.filter(item=>item.date===day.date).length} activities recorded`]}:null;
}
