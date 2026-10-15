"use client";

import { useState } from 'react';
import type { GenericWorkspace } from '../lib/generic-trip-workspace';
import { applyBookingPlanPreview, bookingTransportModes, emptyBookingPlan, previewBookingPlan, previewBookingPlanRemoval, type BookingPlan, type BookingPlanPreview } from '../lib/booking-planning';
import DetailDrawer from './detail-drawer';
import GlassSelect from './glass-select';
import './booking-planning-workbench.css';

type MediaDraft = { url:string; credit:string; sourceUrl:string; photoChecked:string; lat:string; lng:string; pinSource:string; pinChecked:string };
const blankMedia:MediaDraft = {url:'',credit:'',sourceUrl:'',photoChecked:'',lat:'',lng:'',pinSource:'',pinChecked:''};
export default function BookingPlanningWorkbench({workspace,onChange}:{workspace:GenericWorkspace;onChange:(next:GenericWorkspace)=>boolean|void}) {
  const [draft,setDraft] = useState<BookingPlan|null>(null);
  const [media,setMedia] = useState<MediaDraft>(blankMedia);
  const [preview,setPreview] = useState<BookingPlanPreview|null>(null);
  const [error,setError] = useState('');
  const eligible = workspace.trip.bookings.filter(item=>['stay','flight','rail','car','ferry','bus','other'].includes(item.kind));
  const placeName = (id:string) => workspace.trip.destinations.find(place=>place.id===id)?.name || 'Unmapped / unknown';
  function edit(booking:typeof eligible[number]) {
    const item = workspace.bookingPlans?.items.find(plan=>plan.bookingId===booking.id) ?? emptyBookingPlan(booking);
    setDraft(structuredClone(item)); setPreview(null); setError('');
    setMedia(item.kind==='stay'?{url:item.photo?.url??'',credit:item.photo?.credit??'',sourceUrl:item.photo?.sourceUrl??'',photoChecked:item.photo?.checkedAt??'',lat:item.coordinates?.lat.toString()??'',lng:item.coordinates?.lng.toString()??'',pinSource:item.coordinates?.source??'',pinChecked:item.coordinates?.checkedAt??''}:blankMedia);
  }
  function patch(value:Partial<BookingPlan>) { if(draft) {setDraft({...draft,...value} as BookingPlan);setPreview(null);} }
  function patchMedia(value:Partial<MediaDraft>) {setMedia({...media,...value});setPreview(null);}
  function prepare() {
    if(!draft) return;
    try {
      const item = structuredClone(draft);
      if(item.kind==='stay') {
        delete item.photo; delete item.coordinates;
        if([media.url,media.credit,media.sourceUrl,media.photoChecked].some(Boolean)) item.photo={url:media.url.trim(),credit:media.credit.trim(),sourceUrl:media.sourceUrl.trim(),checkedAt:media.photoChecked.trim()};
        if([media.lat,media.lng,media.pinSource,media.pinChecked].some(Boolean)) item.coordinates={lat:media.lat.trim()===''?NaN:Number(media.lat),lng:media.lng.trim()===''?NaN:Number(media.lng),source:media.pinSource.trim(),checkedAt:media.pinChecked.trim()};
      }
      setPreview(previewBookingPlan(workspace,item));setError('');
    } catch {setPreview(null);setError('Use safe planning details only. Complete any photo attribution or coordinate source and ISO checked time; leave unknown fields blank.');}
  }
  const close = () => {setDraft(null);setPreview(null);setError('');};
  const currentBooking = workspace.trip.bookings.find(item=>item.id===draft?.bookingId);
  const quoteContext = draft ? workspace.quoteEvidence?.quotes.filter(quote=>draft.kind==='stay'?quote.mode==='stay' && !!draft.placeId && quote.cityId===draft.placeId:quote.mode!=='stay' && draft.mode!=='unknown' && quote.mode===draft.mode).filter(quote=>!!currentBooking && quote.startDate<=currentBooking.endAt.slice(0,10) && quote.endDate>=currentBooking.startAt.slice(0,10)) ?? [] : [];
  function links(value:string,change:(value:string)=>void,label:string) {
    return <GlassSelect aria-label={label} value={value} onChange={event=>change(event.target.value)}><option value="">Unmapped / unknown</option>{workspace.trip.destinations.map(place=><option value={place.id} key={place.id}>{place.name}</option>)}</GlassSelect>;
  }
  return <section className="booking-planning" aria-label="Lodging and transport planning details">
    <div className="booking-planning-heading"><div><span className="eyebrow">Manual planning · reviewed changes</span><h3>Stay & transport details</h3></div><span>{workspace.bookingPlans?.items.length??0} planned / {eligible.length} records</span></div>
    <p className="booking-planning-muted">Link existing booking records to destinations, record sourced stay photos and pins, or enter transport endpoints and travel time. Prices, schedules and booking states stay in their separate records.</p>
    {!eligible.length&&<p className="booking-planning-empty">Add a stay or transport booking record in the manual booking tools first. Nothing is inferred from a route or quote.</p>}
    <div className="booking-planning-grid">{eligible.map(booking=>{
      const plan=workspace.bookingPlans?.items.find(item=>item.bookingId===booking.id);
      const detail=workspace.bookingDetails.find(item=>item.bookingId===booking.id);
      return <article className="glass booking-planning-card" key={booking.id}>
        {/* Public allowlisted images keep their attribution next to the image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {plan?.kind==='stay'&&plan.photo&&<figure><img src={plan.photo.url} alt={`Recorded stay: ${detail?.label||booking.provider||'lodging'}`} loading="lazy" referrerPolicy="no-referrer"/><figcaption>{plan.photo.credit} · <a href={plan.photo.sourceUrl} target="_blank" rel="noreferrer">Photo source</a> · checked {plan.photo.checkedAt}</figcaption></figure>}
        <div className="booking-planning-card-body"><div className="booking-planning-badges"><span>{booking.kind}</span><span>{booking.status}</span></div><h4>{detail?.label||booking.provider||'Untitled booking record'}</h4><p>{booking.startAt} → {booking.endAt}</p>
          {!plan?<p className="booking-planning-muted">Planning metadata not recorded.</p>:plan.kind==='stay'?<><p>{placeName(plan.placeId)}</p><p>{plan.coordinates?`${plan.coordinates.lat}, ${plan.coordinates.lng} · ${plan.coordinates.source} · checked ${plan.coordinates.checkedAt}`:'Stay coordinates unknown; no map location inferred.'}</p></>:<><p>{plan.from||'Origin unknown'} → {plan.to||'Destination unknown'}</p><p>{placeName(plan.fromPlaceId)} → {placeName(plan.toPlaceId)}</p><p>{plan.mode} · elapsed {plan.elapsedMinutes===null?'unknown':`${plan.elapsedMinutes} min`} · transfers {plan.transferMinutes===null?'unknown':`${plan.transferMinutes} min`}</p></>}
          {plan?.notes&&<p>{plan.notes}</p>}<button type="button" onClick={()=>edit(booking)}>{plan?'Edit planning details':'Plan details'}</button>
        </div></article>;
    })}</div>
    {draft&&<DetailDrawer title={draft.kind==='stay'?'Stay planning details':'Transport planning details'} close={close} wide><div className="booking-planning booking-planning-editor"><p>Manual metadata for {currentBooking?.provider||'this booking'} · state {currentBooking?.status||'unavailable'}. Applying metadata does not establish availability or change booking status.</p><form onSubmit={event=>{event.preventDefault();prepare();}}>
      {draft.kind==='stay'?<><label>Destination link{links(draft.placeId,value=>patch({placeId:value}),'Stay destination link')}</label><details><summary>Attributed photo · optional</summary><p>Use a bundled image or supported public Wikimedia / Unsplash image. All attribution fields are required when adding a photo. Clear all four fields to remove it.</p><div className="booking-planning-fields">{([['url','Photo URL'],['credit','Photo credit'],['sourceUrl','Public photo source URL'],['photoChecked','Photo checked at (ISO timestamp)']] as const).map(([key,label])=><label key={key}>{label}<input value={media[key]} maxLength={key==='url'||key==='sourceUrl'?1500:160} onChange={event=>patchMedia({[key]:event.target.value})} placeholder={key==='photoChecked'?'2030-04-01T12:00:00Z':undefined}/></label>)}</div></details><details><summary>Sourced coordinates · optional</summary><p>Enter the stay’s actual coordinates manually. City pins are never substituted. Coordinates are also shown as text, with no map required. Clear all four fields to remove.</p><div className="booking-planning-fields">{([['lat','Latitude'],['lng','Longitude'],['pinSource','Coordinate source'],['pinChecked','Coordinates checked at (ISO timestamp)']] as const).map(([key,label])=><label key={key}>{label}<input value={media[key]} maxLength={160} onChange={event=>patchMedia({[key]:event.target.value})} placeholder={key==='pinChecked'?'2030-04-01T12:00:00Z':undefined}/></label>)}</div></details></>:<><div className="booking-planning-fields"><label>Transport mode<GlassSelect aria-label="Transport planning mode" value={draft.mode} onChange={event=>patch({mode:event.target.value as typeof draft.mode})}>{bookingTransportModes.filter(mode=>mode==='unknown'||mode===currentBooking?.kind).map(mode=><option key={mode} value={mode}>{mode}</option>)}</GlassSelect></label>{([['from','Origin endpoint'],['to','Destination endpoint']] as const).map(([key,label])=><label key={key}>{label}<input value={draft[key]} maxLength={120} onChange={event=>patch({[key]:event.target.value})}/></label>)}<label>Origin destination link{links(draft.fromPlaceId,value=>patch({fromPlaceId:value}),'Origin destination link')}</label><label>Arrival destination link{links(draft.toPlaceId,value=>patch({toPlaceId:value}),'Arrival destination link')}</label>{([['elapsedMinutes','Entered elapsed minutes'],['transferMinutes','Entered transfer minutes']] as const).map(([key,label])=><label key={key}>{label}<input type="number" min={0} max={43200} step={1} value={draft[key]??''} placeholder="Unknown" onChange={event=>patch({[key]:event.target.value===''?null:Number(event.target.value)})}/></label>)}</div><p>Elapsed and transfer minutes are separate entered values. No total, connection protection, airport mapping or schedule feasibility is inferred.</p></>}
      <label>Planning notes<textarea rows={3} maxLength={1000} value={draft.notes} onChange={event=>patch({notes:event.target.value})} placeholder="Location, luggage, accessibility or planning gaps; no private identifiers"/></label>
      <details><summary>Recorded comparison context · {quoteContext.length} candidates</summary><p>Filtered by overlapping dates and {draft.kind==='stay'?'explicit destination link':'entered mode'}. These are possible comparisons, not matched purchases, current inventory or selected rates. Party, endpoints and scope still require review. All other quotes remain in the comparison tools.</p>{quoteContext.map(quote=><article className="booking-planning-context" key={quote.id}><b>{quote.label}</b><p>{quote.from||'Origin unknown'} → {quote.to||'Destination unknown'} · {quote.startDate} → {quote.endDate}</p><p>{quote.occupants} travelers · {quote.rooms} rooms · {quote.currency} · recorded base {quote.cashAmount??'unknown'} · fees {quote.taxesFees??'unknown'}</p><p>{quote.source||'Source unknown'} · checked {quote.checkedAt||'unknown'} · {quote.unknowns||'No unknowns entered; completeness unverified'}</p></article>)}{!quoteContext.length&&<p>No matching recorded context under this filter. Coverage and rates remain unknown.</p>}</details>
      <div className="booking-planning-heading"><button type="submit">Preview planning details</button>{workspace.bookingPlans?.items.some(item=>item.bookingId===draft.bookingId)&&<button type="button" onClick={()=>{try {setPreview(previewBookingPlanRemoval(workspace,draft.bookingId));setError('');}catch {setError('Planning metadata changed. Reopen this record before removing details.');}}}>Preview removing planning metadata</button>}</div></form>
      {error&&<p role="alert">{error}</p>}
      {preview&&<section className="booking-planning-preview" aria-label="Booking planning acceptance preview"><h3>{preview.remove?'Review metadata removal':'Review planning metadata'}</h3>{preview.remove&&<p>The following planning metadata will be removed. The booking record itself is preserved.</p>}<p>{preview.item.kind==='stay'?`Stay destination: ${placeName(preview.item.placeId)}. Photo: ${preview.item.photo?'attributed image entered':'none'}. Coordinates: ${preview.item.coordinates?`${preview.item.coordinates.lat}, ${preview.item.coordinates.lng}`:'unknown'}.`:`${preview.item.from||'Origin unknown'} → ${preview.item.to||'Destination unknown'} · ${preview.item.mode} · elapsed ${preview.item.elapsedMinutes??'unknown'} min · transfers ${preview.item.transferMinutes??'unknown'} min.`}</p>{preview.item.kind==='stay'?<>{preview.item.photo&&<p>Photo: {preview.item.photo.url} · {preview.item.photo.credit} · {preview.item.photo.sourceUrl} · checked {preview.item.photo.checkedAt}</p>}{preview.item.coordinates&&<p>Coordinate source: {preview.item.coordinates.source} · checked {preview.item.coordinates.checkedAt}</p>}</>:<p>Destination links: {placeName(preview.item.fromPlaceId)} → {placeName(preview.item.toPlaceId)}</p>}<p>{preview.item.notes||'No planning notes entered.'}</p><p>Existing dates, prices, evidence and booking states are preserved.</p><button type="button" onClick={()=>{try {const next=applyBookingPlanPreview(workspace,preview);if(onChange(next)!==false)close();else setError('The workspace could not accept this change. Review the current record and preview again.');}catch(cause){setPreview(null);setError(cause instanceof Error?cause.message:'Details could not be applied.');}}}>{preview.remove?'Remove reviewed planning metadata':'Apply reviewed planning details'}</button></section>}
    </div></DetailDrawer>}
  </section>;
}
