import { validateWorkspace, type ActivityCoordinates, type GenericWorkspace, type WorkspaceActivity } from './generic-trip-workspace.ts';

export const DAY_GEOGRAPHY_RADIUS_KM = { min: 0.1, max: 50, default: 1.5 } as const;
type Pin = Pick<ActivityCoordinates, 'lat' | 'lng'>;
export type GeographyActivity = WorkspaceActivity & { coordinates: ActivityCoordinates };
export type DayGeography = {
  placeId: string; date: string; radiusKm: number;
  groups: Array<{ activities: GeographyActivity[]; diameterKm: number }>;
  outliers: Array<{ activity: GeographyActivity; nearestKm: number | null }>;
  missingPins: WorkspaceActivity[];
  current: GeographyActivity[]; suggested: GeographyActivity[];
  currentKm: number | null; suggestedKm: number | null;
  base: { bookingId: string; label: string; coordinates: ActivityCoordinates } | null;
  lockedAnchors: GenericWorkspace['trip']['anchors'];
};

const compareId = (a: { id: string }, b: { id: string }) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
const validPin = (pin: Pin) => pin && Number.isFinite(pin.lat) && Number.isFinite(pin.lng) && Math.abs(pin.lat) <= 90 && Math.abs(pin.lng) <= 180;
/** Spherical great-circle distance, Earth mean radius 6371.0088 km; no routed access inference. */
export function straightLineKm(a: Pin, b: Pin): number {
  if (!validPin(a) || !validPin(b)) throw new Error('Invalid geographic coordinates.');
  const rad = Math.PI / 180, lat = (b.lat - a.lat) * rad, lng = (b.lng - a.lng) * rad;
  const h = Math.sin(lat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(lng / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, h))));
}

/** Read-only, bounded by the workspace's 2,000 activity limit; no provider calls or inferred pins. */
export function buildDayGeography(workspace: GenericWorkspace, options: { placeId: string; date: string; radiusKm?: number; baseBookingId?: string }): DayGeography {
  if (validateWorkspace(workspace).length) throw new Error('Day geography requires a valid, share-safe workspace.');
  const radiusKm = options.radiusKm ?? DAY_GEOGRAPHY_RADIUS_KM.default;
  if (!workspace.trip.destinations.some(place => place.id === options.placeId) || !workspace.days.some(day => day.date === options.date)) throw new Error('Choose a recorded city and planning day.');
  if (!Number.isFinite(radiusKm) || radiusKm < DAY_GEOGRAPHY_RADIUS_KM.min || radiusKm > DAY_GEOGRAPHY_RADIUS_KM.max) throw new Error('Choose a grouping radius from 0.1 to 50 km.');
  const activities = structuredClone(workspace.activities.filter(item => item.placeId === options.placeId && item.date === options.date));
  const pinned = activities.filter((item): item is GeographyActivity => !!item.coordinates).sort(compareId);
  let base: DayGeography['base'] = null;
  if (options.baseBookingId) {
    const plan = workspace.bookingPlans?.items.find(item => item.bookingId === options.baseBookingId);
    if (plan?.kind !== 'stay' || plan.placeId !== options.placeId || !plan.coordinates) throw new Error('Choose a recorded stay pin in this city.');
    const booking = workspace.trip.bookings.find(item => item.id === plan.bookingId)!;
    base = { bookingId: plan.bookingId, label: workspace.bookingDetails.find(item => item.bookingId === plan.bookingId)?.label || booking.provider || 'Recorded stay', coordinates: structuredClone(plan.coordinates) };
  }
  // Greedy complete-link partition: every pair in each group is within the radius.
  // ID ordering makes groups independent of input array order; chained distant points cannot merge.
  const groups: DayGeography['groups'] = [];
  for (const activity of pinned) {
    const group = groups.find(group => group.activities.every(member => straightLineKm(member.coordinates, activity.coordinates) <= radiusKm));
    if (group) {
      group.diameterKm = Math.max(group.diameterKm, ...group.activities.map(member => straightLineKm(member.coordinates, activity.coordinates)));
      group.activities.push(activity);
    } else groups.push({ activities: [activity], diameterKm: 0 });
  }
  const outliers = pinned.flatMap(activity => {
    const others = pinned.filter(other => other.id !== activity.id);
    const nearestKm = others.length ? Math.min(...others.map(other => straightLineKm(activity.coordinates, other.coordinates))) : null;
    return nearestKm === null || nearestKm > radiusKm ? [{ activity, nearestKm }] : [];
  });
  const current = [...pinned].sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : compareId(a, b));
  const distance = (order: GeographyActivity[]) => {
    if (!order.length || order.length === 1 && !base) return null;
    return order.reduce((sum, item, index) => sum + (index ? straightLineKm(order[index - 1].coordinates, item.coordinates) : base ? straightLineKm(base.coordinates, item.coordinates) : 0), 0);
  };
  const remaining = [...pinned], candidate: GeographyActivity[] = [];
  let previous: Pin | undefined = base?.coordinates;
  while (remaining.length) {
    // Without a base, retain the first timed pinned activity as the start.
    let index = previous ? 0 : remaining.findIndex(item => item.id === current[0].id);
    if (previous) {
      let closest = straightLineKm(previous, remaining[index].coordinates);
      for (let i = 1; i < remaining.length; i++) {
        const km = straightLineKm(previous, remaining[i].coordinates);
        if (km < closest - 1e-9) { index = i; closest = km; }
      }
    }
    const [next] = remaining.splice(index, 1); candidate.push(next); previous = next.coordinates;
  }
  const currentKm = distance(current), candidateKm = distance(candidate);
  // A nearest-neighbor heuristic can be worse: retain recorded order on equal/worse results.
  const suggested = candidateKm !== null && currentKm !== null && candidateKm < currentKm - 1e-9 ? candidate : [...current];
  return { placeId: options.placeId, date: options.date, radiusKm, groups, outliers, missingPins: activities.filter(item => !item.coordinates).sort(compareId), current, suggested, currentKm, suggestedKm: distance(suggested), base, lockedAnchors: structuredClone(workspace.trip.anchors.filter(anchor => anchor.locked && anchor.date === options.date)) };
}
