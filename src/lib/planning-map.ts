import {validateWorkspace,type GenericWorkspace} from './generic-trip-workspace.ts';
export function buildPlanningMap(workspace:GenericWorkspace,placeId?:string){
 if(validateWorkspace(workspace).length)throw new Error('Validate the workspace before mapping records.');
 const city=workspace.trip.destinations.filter(item=>!placeId||item.id===placeId).flatMap(item=>{const pin=workspace.places.find(pin=>pin.placeId===item.id);return pin?[{id:`city:${item.id}`,targetId:item.id,kind:'destination' as const,name:item.name,lat:pin.lat,lng:pin.lng,category:'city',source:'Manual destination pin',checkedAt:''}]:[];});
 const activities=workspace.activities.filter(item=>!placeId||item.placeId===placeId).flatMap(item=>item.coordinates?[{id:`activity:${item.id}`,targetId:item.id,kind:'activity' as const,name:item.title,lat:item.coordinates.lat,lng:item.coordinates.lng,category:'activity',source:item.coordinates.source,checkedAt:item.coordinates.checkedAt}]:[]);
 const stays=(workspace.bookingPlans?.items||[]).flatMap(item=>item.kind==='stay'&&item.coordinates&&(!placeId||item.placeId===placeId)?[{id:`stay:${item.bookingId}`,targetId:item.bookingId,kind:'stay' as const,name:workspace.bookingDetails.find(detail=>detail.bookingId===item.bookingId)?.label||workspace.trip.bookings.find(booking=>booking.id===item.bookingId)?.provider||'Recorded stay',lat:item.coordinates.lat,lng:item.coordinates.lng,category:'hotel',source:item.coordinates.source,checkedAt:item.coordinates.checkedAt}]:[]);
 return [...city,...activities,...stays];
}
/** Entered mode links join recorded city pins, not physical roads, tracks or airport paths. */
export function buildPlanningSegments(workspace:GenericWorkspace){
 if(validateWorkspace(workspace).length)throw new Error('Validate the workspace before mapping travel links.');
 const pinned=new Set(workspace.places.map(pin=>pin.placeId));
 return(workspace.bookingPlans?.items||[]).flatMap(plan=>{
  if(plan.kind!=='transport'||!plan.fromPlaceId||!plan.toPlaceId||plan.fromPlaceId===plan.toPlaceId||!pinned.has(plan.fromPlaceId)||!pinned.has(plan.toPlaceId))return[];
  const booking=workspace.trip.bookings.find(item=>item.id===plan.bookingId)!;
  const kind=plan.mode==='flight'?'flight' as const:plan.mode==='rail'?'train' as const:plan.mode==='car'?'drive' as const:'other' as const;
  const status=booking.status==='confirmed'?'confirmed' as const:booking.status==='missing'?'missing' as const:booking.status==='conflict'?'conflict' as const:'tbc' as const;
  return[{from:`city:${plan.fromPlaceId}`,to:`city:${plan.toPlaceId}`,kind,status}];
 });
}
