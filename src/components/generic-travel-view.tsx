'use client';

import { useId, useMemo, useState } from 'react';
import type { ActivityPhoto, GenericWorkspace, ItemEvidence } from '@/lib/generic-trip-workspace';
import { buildGenericTravelView, type TravelViewOpenTarget } from '@/lib/generic-travel-view';
import './generic-travel-view.css';

function Receipt({ evidence }: { evidence: ItemEvidence | null }) {
  if (!evidence) return <p className="travel-unknown">Source and checked time unrecorded.</p>;
  return <details className="travel-receipt"><summary>{evidence.reviewRequired ? 'Review required · ' : ''}{evidence.basis} · {evidence.source || 'Source unknown'}</summary>
    <p>Checked: {evidence.checkedAt || 'Unknown'}</p><p>{evidence.summary}</p><p>Unknowns: {evidence.unknowns || 'Not recorded'}</p>
    {evidence.sourceUrl && <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">Open recorded source ↗</a>}
  </details>;
}
function Photo({ photo }: { photo?: ActivityPhoto }) {
  const [failed,setFailed] = useState(false);
  if (!photo || failed) return null;
  return <figure className="travel-photo">{/* Validated public media retains its source attribution. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={photo.url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>
    <figcaption><a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.credit} ↗</a> · checked {photo.checkedAt}</figcaption>
  </figure>;
}

export default function GenericTravelView({ workspace, onOpen }: { workspace: GenericWorkspace; onOpen?: (target: TravelViewOpenTarget) => void }) {
  const headingId = useId(), selectId = useId();
  const [selection,setSelection] = useState<{tripId:string;date:string} | null>(null);
  const result = useMemo(()=>{try {return {view:buildGenericTravelView(workspace)};} catch {return {view:null};}},[workspace]);
  const view = result.view;
  if (!view) return <section className="generic-travel-view"><h2>Travel view unavailable</h2><p role="alert">Validate the workspace before opening this view. No changes were made.</p></section>;
  const day = view.days.find(item=>selection?.tripId===view.tripId && item.date===selection.date) ?? view.days[0];
  if (!day) return <section className="generic-travel-view"><h2>No planning dates recorded</h2></section>;
  const index = view.days.findIndex(item=>item.date===day.date);
  const choose = (date:string) => setSelection({tripId:view.tripId,date});
  return <section className="generic-travel-view" aria-labelledby={headingId}>
    <header className="travel-header"><div><p className="travel-eyebrow">Day of travel · manual plan</p><h2 id={headingId}>{day.city}</h2><p>{view.title} · <time dateTime={day.date}>{day.date}</time></p></div>
      <div className="travel-day-control"><label htmlFor={selectId}>Choose a planning day</label><div><button type="button" aria-label="Previous planning day" disabled={index===0} onClick={()=>choose(view.days[index-1].date)}>←</button><select id={selectId} value={day.date} onChange={event=>choose(event.target.value)}>{view.days.map(item=><option key={item.date} value={item.date}>{item.date} · {item.city}</option>)}</select><button type="button" aria-label="Next planning day" disabled={index===view.days.length-1} onClick={()=>choose(view.days[index+1].date)}>→</button></div></div>
    </header>
    <p className="travel-boundary">Entered dates and times, with source offsets retained. Time zones, opening hours, transfers and schedule feasibility need separate verification. No live tracking, offline availability or emergency assistance is provided.</p>
    <div className="travel-context"><span>{day.activities.length} activities</span><span>{day.bookings.length} booking records</span><span>{day.tasks.filter(item=>!item.done).length} open tasks due</span><span>{day.pin ? `City pin ${day.pin.lat}, ${day.pin.lng} · source unrecorded on pin` : 'City pin unknown'}</span></div>
    {day.evidence && <Receipt evidence={day.evidence}/>}
    {day.anchors.length>0 && <div className="travel-anchors">{day.anchors.map(anchor=><p key={anchor.id}>{anchor.locked?'Fixed anchor':'Planning anchor'} · {anchor.label}</p>)}</div>}
    {day.conflicts.length>0 && <div className="travel-warning"><strong>Planning conflicts to review</strong><ul>{day.conflicts.map(item=><li key={item}>{item}</li>)}</ul></div>}
    <div className="travel-columns"><section aria-label="Activity agenda"><div className="travel-section-heading"><h3>Your day, in order</h3><span>Entered planning times</span></div>
      {day.activities.length ? <ol className="travel-agenda">{day.activities.map(activity=><li key={activity.id}><div className="travel-time"><strong>{activity.continued?'Continuing':activity.time}</strong><small>{activity.durationMinutes} min total</small></div><article className="travel-card"><p className="travel-eyebrow">{activity.city}{activity.category?` · ${activity.category}`:''}</p><h4>{activity.title}</h4><p>{activity.continued?`Started ${activity.date} at ${activity.time}. `:''}Entered duration ends {activity.end.date} at {activity.end.time}; time zone unknown.</p>
        <Photo key={activity.photo?.url || 'none'} photo={activity.photo}/>
        <details className="travel-details"><summary>Details & sources{activity.evidence?.reviewRequired?' · review required':''}</summary>{activity.notes&&<p>{activity.notes}</p>}
        {activity.coordinates?<p className="travel-pin">Pin {activity.coordinates.lat}, {activity.coordinates.lng} · {activity.coordinates.source} · checked {activity.coordinates.checkedAt}</p>:<p className="travel-unknown">Activity pin unknown. City pins are not venue locations.</p>}
        <Receipt evidence={activity.evidence}/></details>{onOpen&&<button type="button" onClick={()=>onOpen({kind:'activity',id:activity.id,date:activity.date})}>Open activity →</button>}
      </article></li>)}</ol>:<p className="travel-empty">An open day. No activities recorded for this date.</p>}
    </section><aside><section aria-label="Booking records"><div className="travel-section-heading"><h3>Booking records</h3><span>Exact recorded states</span></div><p className="travel-hint">Includes start, end and intervening source-calendar dates. These dates can differ across offsets; inclusion does not prove occupancy or local presence.</p>
      {day.bookings.length ? day.bookings.map(booking=><article className="travel-card travel-booking" key={booking.id}><div className="travel-card-top"><span>{booking.kind}</span><span className={`travel-state travel-state-${booking.status}`}>{booking.status}</span></div><h4>{booking.label}</h4><p>{booking.recordType==='transport'?`${booking.from} → ${booking.to}`:`Recorded city: ${booking.city}`}</p><dl className="travel-timestamps"><div><dt>{booking.kind==='stay'?'Check-in record':'Start record'}</dt><dd>{booking.startAt}</dd></div><div><dt>{booking.kind==='stay'?'Check-out record':'End record'}</dt><dd>{booking.endAt}</dd></div></dl>
        {booking.recordType==='transport'&&booking.plan?.kind==='transport'&&<p>Elapsed: {booking.plan.elapsedMinutes===null?'Unknown':`${booking.plan.elapsedMinutes} min`} · transfers: {booking.plan.transferMinutes===null?'Unknown':`${booking.plan.transferMinutes} min`}</p>}
        {booking.plan?.kind==='stay'&&<Photo key={booking.plan.photo?.url || 'none'} photo={booking.plan.photo}/>}
        <details className="travel-details"><summary>Details & sources{booking.evidence?.reviewRequired?' · review required':''}</summary>
        {booking.recordType==='stay' ? <>{booking.plan?.kind==='stay'&&booking.plan.coordinates?<p className="travel-pin">Stay pin {booking.plan.coordinates.lat}, {booking.plan.coordinates.lng} · {booking.plan.coordinates.source} · checked {booking.plan.coordinates.checkedAt}</p>:<p className="travel-unknown">Stay pin unknown.</p>}</>:<p className="travel-unknown">{booking.recordType==='transport'?'Endpoint pins and local time zones unverified.':'Venue pin and local time zone unknown.'}</p>}
        {(booking.detail?.notes||booking.plan?.notes)&&<p>{[booking.detail?.notes,booking.plan?.notes].filter(Boolean).join(' · ')}</p>}<Receipt evidence={booking.evidence}/></details>{onOpen&&<button type="button" onClick={()=>onOpen({kind:'booking',id:booking.id,date:day.date})}>Open booking record →</button>}
      </article>):<p className="travel-empty">No booking records touch this source date. Coverage remains unknown.</p>}
    </section><section className="travel-tasks" aria-label="Preparation due"><div className="travel-section-heading"><h3>Before you head out</h3><span>Due this date</span></div>{day.tasks.length?<ul>{day.tasks.map(task=><li key={task.id}><span className="travel-task-state">{task.done?'Marked done':'Open'}</span><strong>{task.title}</strong><small>{task.category} · {task.assignee?`Role alias: ${task.assignee}`:'Unassigned'}{task.activityId?' · Linked activity':''}</small></li>)}</ul>:<p className="travel-empty">No preparation items have this due date. Undated tasks remain in preparation.</p>}<p className="travel-hint">Read-only task status. No reminders or readiness certification.</p></section></aside></div>
    {view.outsideWindowBookings>0&&<p className="travel-hint">{view.outsideWindowBookings} booking record(s) extend outside the selectable planning window. Review their full dates in stays & transport.</p>}
  </section>;
}
