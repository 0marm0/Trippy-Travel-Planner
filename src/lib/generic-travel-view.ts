import { buildPlanningView } from './planning-view.ts';
import { validateWorkspace, type GenericWorkspace } from './generic-trip-workspace.ts';

export type TravelViewOpenTarget = { kind: 'activity' | 'booking'; id: string; date?: string };
const sourceDate = (timestamp: string) => timestamp.slice(0, 10);
/** Calendar arithmetic on entered planning times only; never a timezone conversion. */
function activityEnd(activity: GenericWorkspace['activities'][number]) {
  const [hour, minute] = activity.time.split(':').map(Number);
  const total = hour * 60 + minute + activity.durationMinutes;
  const date = new Date(Date.parse(`${activity.date}T00:00:00Z`) + Math.floor(total / 1440) * 86400000).toISOString().slice(0, 10);
  return { date, time: `${String(Math.floor(total % 1440 / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}` };
}

/** Detached, validated reading model. Selecting a day cannot write to its source. */
export function buildGenericTravelView(input: GenericWorkspace) {
  if (validateWorkspace(input).length) throw new Error('Validate the workspace before opening the travel view.');
  const workspace = structuredClone(input);
  const planning = buildPlanningView(workspace);
  const evidence = (kind: 'activity' | 'booking' | 'destination', id: string) => workspace.itemEvidence?.find(item => item.target === kind && item.targetId === id) ?? null;
  const cityName = (id: string) => workspace.trip.destinations.find(place => place.id === id)?.name || 'City unknown';
  const bookings = workspace.trip.bookings.map(booking => {
    const detail = workspace.bookingDetails.find(item => item.bookingId === booking.id);
    const plan = workspace.bookingPlans?.items.find(item => item.bookingId === booking.id) ?? null;
    const startDate = sourceDate(booking.startAt), endDate = sourceDate(booking.endAt);
    const recordType = booking.kind === 'stay' ? 'stay' : (plan?.kind === 'transport' || ['flight','rail','car','ferry','bus'].includes(booking.kind)) ? 'transport' : 'context';
    return { ...booking, recordType, label: detail?.label || booking.provider || booking.kind, detail: detail ?? null, plan, evidence: evidence('booking',booking.id), startDate, endDate,
      firstDate: startDate < endDate ? startDate : endDate, lastDate: startDate > endDate ? startDate : endDate,
      city: cityName(plan?.kind === 'stay' ? plan.placeId : detail?.placeId ?? ''),
      from: recordType === 'transport' ? plan?.kind === 'transport' ? plan.from || cityName(plan.fromPlaceId) : 'Origin unknown' : null,
      to: recordType === 'transport' ? plan?.kind === 'transport' ? plan.to || cityName(plan.toPlaceId) : 'Destination unknown' : null };
  });
  return { title: planning.title, tripId: planning.tripId,
    outsideWindowBookings: bookings.filter(item => item.firstDate < workspace.trip.dateWindow.earliestDeparture || item.lastDate > workspace.trip.dateWindow.latestReturn).length,
    days: [...planning.days].sort((a,b) => a.date.localeCompare(b.date)).map((day, index) => ({ ...day, number: index + 1,
      city: day.placeId ? cityName(day.placeId) : 'City unassigned',
      pin: workspace.places.find(item => item.placeId === day.placeId) ?? null,
      evidence: evidence('destination',day.placeId),
      activities: workspace.activities.flatMap(activity => {
        const end = activityEnd(activity);
        // End is exclusive: an activity ending exactly at midnight does not occupy the next day.
        if (activity.date !== day.date && !(activity.date < day.date && end.date === day.date && end.time !== '00:00')) return [];
        return [{ ...activity, end, continued: activity.date !== day.date, city: cityName(activity.placeId), evidence: evidence('activity',activity.id) }];
      }).sort((a,b) => Number(b.continued) - Number(a.continued) || a.time.localeCompare(b.time) || a.id.localeCompare(b.id)),
      bookings: bookings.filter(item => item.firstDate <= day.date && item.lastDate >= day.date),
      tasks: (workspace.preparation?.tasks ?? []).filter(item => item.dueDate === day.date),
    })) };
}
export type GenericTravelDay = ReturnType<typeof buildGenericTravelView>['days'][number];
