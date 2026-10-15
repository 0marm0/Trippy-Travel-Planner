'use client';

import { useId, useMemo, useState } from 'react';
import { buildDayGeography, DAY_GEOGRAPHY_RADIUS_KM } from '@/lib/day-geography';
import { validateWorkspace, type GenericWorkspace, type WorkspaceActivity } from '@/lib/generic-trip-workspace';
import PlanningPhoto from './planning-photo';
import './day-geography.css';

const km = (value: number | null) => value === null ? 'Unknown / no comparable legs' : `${value.toFixed(2)} km`;

export default function DayGeography({ workspace, onOpenActivity }: { workspace: GenericWorkspace; onOpenActivity?: (id: string, date: string) => void }) {
  const prefix = useId();
  const [city, setCity] = useState(''), [day, setDay] = useState(''), [radius, setRadius] = useState<number>(DAY_GEOGRAPHY_RADIUS_KM.default), [baseId, setBaseId] = useState('');
  const valid = useMemo(() => !validateWorkspace(workspace).length, [workspace]);
  const placeId = valid && workspace.trip.destinations.some(place => place.id === city) ? city : valid ? workspace.trip.destinations[0]?.id ?? '' : '';
  const date = valid && workspace.days.some(item => item.date === day) ? day : valid ? workspace.days[0]?.date ?? '' : '';
  const stays = valid ? workspace.bookingPlans?.items.filter(item => item.kind === 'stay' && item.placeId === placeId && item.coordinates) ?? [] : [];
  const baseBookingId = stays.some(item => item.bookingId === baseId) ? baseId : '';
  const result = useMemo(() => {
    if (!valid || !placeId || !date) return null;
    return buildDayGeography(workspace, { placeId, date, radiusKm: radius, baseBookingId });
  }, [workspace, valid, placeId, date, radius, baseBookingId]);
  if (!valid) return <section className="day-geography"><p role="alert">Day geography is unavailable: the workspace failed validation.</p></section>;
  const activityLink = (activity: WorkspaceActivity) => onOpenActivity ? <button type="button" className="dg-activity-link" onClick={() => onOpenActivity(activity.id, activity.date)}>{activity.title}<span className="dg-sr"> · open activity editor</span></button> : <span>{activity.title}</span>;
  const activityRow = (activity: WorkspaceActivity, context?: string) => <>
    <div className="dg-thumbnail">{activity.photo ? <PlanningPhoto key={`${activity.id}:${activity.photo.url}`} photo={activity.photo} title={activity.title}/> : <span className="dg-photo-empty">No photo</span>}</div>
    <div className="dg-row-copy">{activityLink(activity)}<small>{activity.time}{activity.category ? ` · ${activity.category}` : ''}</small>{context && <span className="dg-row-context">{context}</span>}</div>
  </>;
  const order = (items: WorkspaceActivity[]) => items.length ? <ol className="dg-order-list">{items.map(item => <li key={item.id}>{activityLink(item)} <small>recorded {item.time}</small></li>)}</ol> : <p>No sourced activity pins on this city/day.</p>;
  return <section className="day-geography" aria-labelledby={`${prefix}-title`}>
    <header><div><span className="dg-eyebrow">Recorded pins · read-only preview</span><h3 id={`${prefix}-title`}>Shape your day geographically</h3></div><span className="dg-pill">No itinerary changes</span></header>
    <p className="dg-muted">See nearby groups and compare visit orders using sourced activity coordinates. City-center pins are never substituted.</p>
    <div className="dg-controls">
      <label>City<select value={placeId} onChange={event => { setCity(event.target.value); setBaseId(''); }}>{workspace.trip.destinations.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}</select></label>
      <label>Planning day<select value={date} onChange={event => setDay(event.target.value)}>{workspace.days.map(item => <option key={item.date} value={item.date}>{item.date}{item.placeId === placeId ? ' · assigned here' : item.placeId ? ' · assigned elsewhere' : ' · unassigned'}</option>)}</select></label>
      <label>Grouping radius<select value={radius} onChange={event => setRadius(Number(event.target.value))}>{[0.1,0.5,1,1.5,3,5,10,25,50].map(value => <option key={value} value={value}>{value} km</option>)}</select></label>
      <label>Optional starting stay<select value={baseBookingId} onChange={event => setBaseId(event.target.value)}><option value="">No stay base</option>{stays.map(item => <option key={item.bookingId} value={item.bookingId}>{workspace.bookingDetails.find(detail => detail.bookingId === item.bookingId)?.label || workspace.trip.bookings.find(booking => booking.id === item.bookingId)?.provider || item.bookingId}</option>)}</select></label>
    </div>
    {result && <>
      <p className="dg-muted" role="status">{result.current.length} sourced pins · {result.missingPins.length} missing pins · {result.groups.filter(group => group.activities.length > 1).length} nearby groups · {result.outliers.length} isolated pins</p>
      {workspace.days.find(item => item.date === date)?.placeId !== placeId && <p className="dg-notice">This city is not the recorded day assignment. Showing only activities explicitly recorded in this city on this date.</p>}
      {result.base && <p className="dg-muted">Starting context: {result.base.label} · {result.base.coordinates.lat}, {result.base.coordinates.lng} · {result.base.coordinates.source} · checked {result.base.coordinates.checkedAt}. This selection does not verify a stay on this date.</p>}
      <div className="dg-groups">{result.groups.map((group, index) => <article key={group.activities[0].id} className="dg-card"><h4>{group.activities.length > 1 ? `Nearby group ${index + 1}` : 'Single pin'} <span>{group.activities.length} {group.activities.length === 1 ? 'activity' : 'activities'}</span></h4><p className="dg-muted">Widest separation {km(group.diameterKm)} · every pair ≤ {radius} km</p><ul className="dg-activity-list">{group.activities.map(item => <li className="dg-activity-row" key={item.id}>{activityRow(item)}</li>)}</ul></article>)}</div>
      {!!result.outliers.length && <div className="dg-notice"><h4>Isolated pins</h4><ul className="dg-activity-list">{result.outliers.map(({ activity, nearestKm }) => <li className="dg-activity-row" key={activity.id}>{activityRow(activity, nearestKm === null ? 'No other pinned activity to compare' : `Nearest activity ${km(nearestKm)} away, beyond ${radius} km`)}</li>)}</ul></div>}
      {!!result.missingPins.length && <div className="dg-notice"><h4>Missing sourced coordinates</h4><p>Excluded from geographic groups and distance comparisons; their recorded times are retained.</p><ul className="dg-activity-list">{result.missingPins.map(item => <li className="dg-activity-row" key={item.id}>{activityRow(item, 'Coordinates unrecorded')}</li>)}</ul></div>}
      <div className="dg-order-grid"><article className="dg-card"><h4>Recorded time order · pins only</h4><p className="dg-distance">{km(result.currentKm)}</p>{order(result.current)}</article><article className="dg-card"><h4>Shorter-distance preview</h4><p className="dg-distance">{km(result.suggestedKm)}</p>{order(result.suggested)}<p className="dg-muted">{result.current.map(item => item.id).join('|') === result.suggested.map(item => item.id).join('|') ? 'Recorded order retained; this heuristic found no shorter order.' : 'A geographic idea for review; recorded times shown above have not moved.'}</p></article></div>
      <p className="dg-muted">Open pin-to-pin totals{result.base ? ' include the selected stay as the start' : ' start at the first timed pinned activity'}, with no return leg. {result.missingPins.length ? 'Partial comparison: missing-pin activities and their detours are unknown.' : 'Only the displayed city/day activity pins are compared.'} No walking or travel times, routed access, opening hours, schedule feasibility or accessibility are verified.</p>
      {!!result.lockedAnchors.length && <div className="dg-notice"><h4>Locked anchors on this date</h4><ul>{result.lockedAnchors.map(anchor => <li key={anchor.id}>{anchor.label}{anchor.placeId && anchor.placeId !== placeId ? ' · another city' : ''}</li>)}</ul><p>Anchors remain fixed. This geographic preview does not model or verify them.</p></div>}
      <details><summary>Method, limits & recorded sources</summary><p>Great-circle distances use a spherical Earth radius of 6371.0088 km. Grouping radius range: 0.1–50 km. Groups are built in activity-ID order; every pair must fit the radius, so groups are bounded by that maximum separation. An isolated pin has no neighbor within the radius; a single group member may have a neighbor in a different group.</p><p>Visit ordering uses nearest neighbor from the chosen stay, or the first timed pinned activity. Ties within one millionth of a meter use activity ID. Recorded time ties use activity ID. The recorded order wins equal or longer comparisons. This bounded heuristic is not an optimal-route claim. At most 2,000 workspace activities. Geographic calculations make no provider requests; recorded external photos may contact image hosts. Dates, times, bookings and locked anchors are never reassigned.</p><ul className="dg-sources">{result.current.map(item => <li key={item.id}><strong>{item.title}</strong> · {item.coordinates.lat}, {item.coordinates.lng} · {item.coordinates.source} · checked {item.coordinates.checkedAt}</li>)}</ul>{[...result.current,...result.missingPins].some(item=>item.photo) && <><h4>Recorded photo attribution</h4><ul className="dg-sources">{[...result.current,...result.missingPins].filter(item=>item.photo).map(item=><li key={item.id}><strong>{item.title}</strong> · <a href={item.photo!.sourceUrl} target="_blank" rel="noopener noreferrer">{item.photo!.credit} · source ↗</a> · checked {item.photo!.checkedAt}</li>)}</ul></>}</details>
    </>}
  </section>;
}
