import { validateWorkspace, workspaceConflicts, type GenericWorkspace, type ItemEvidence } from './generic-trip-workspace.ts';
import type { CanonicalBookingStatus } from './trip-model.ts';

export type CanonicalAtlas = {
  version: 1;
  kind: 'canonical-atlas';
  identity: string;
  workspace: GenericWorkspace;
  places: Array<{ id: string; name: string; coordinates: { lat: number; lng: number } | null; assignedDates: string[]; evidence: ItemEvidence | null }>;
  activities: Array<Omit<GenericWorkspace['activities'][number], 'priority' | 'photo'> & { priority: GenericWorkspace['activities'][number]['priority'] | null; photo: GenericWorkspace['activities'][number]['photo'] | null; status: null; evidence: ItemEvidence | null }>;
  days: Array<{ date: string; placeId: string | null; activityIds: string[]; anchors: GenericWorkspace['trip']['anchors']; conflicts: string[] }>;
  bookings: Array<GenericWorkspace['trip']['bookings'][number] & { status: CanonicalBookingStatus; detail: GenericWorkspace['bookingDetails'][number] | null; evidence: ItemEvidence | null }>;
  unknowns: string[];
};

export function canonicalAtlasIdentity(workspace: GenericWorkspace): string {
  const { trip } = workspace;
  return 'trippy.canonical-atlas.v1:' + encodeURIComponent(JSON.stringify([trip.id, trip.dateWindow, trip.travelers, trip.destinations.map(place => [place.id, place.name])]));
}

/** Lossless, validated adapter. Day assignments do not imply stay dates or booking evidence. */
export function buildCanonicalAtlas(input: GenericWorkspace): CanonicalAtlas {
  if (validateWorkspace(input).length) throw new Error('Invalid generic workspace; detailed preview was not opened.');
  const workspace = structuredClone(input);
  const evidence = (target: ItemEvidence['target'], id: string) => workspace.itemEvidence?.find(item => item.target === target && item.targetId === id) || null;
  const conflicts = workspaceConflicts(workspace);
  const places = workspace.trip.destinations.map(place => {
    const pin = workspace.places.find(item => item.placeId === place.id);
    return { id: place.id, name: place.name, coordinates: pin ? { lat: pin.lat, lng: pin.lng } : null, assignedDates: workspace.days.filter(day => day.placeId === place.id).map(day => day.date), evidence: evidence('destination', place.id) };
  });
  const unknowns = ['Day assignments are planning choices, not inferred hotel check-in/out dates.', 'No transport durations, hotel prices, photos or activity priorities are inferred.'];
  if (places.some(place => !place.coordinates)) unknowns.push('Some destinations have no recorded coordinates; their lists remain available without map pins.');
  if (workspace.days.some(day => !day.placeId)) unknowns.push('Some days have no assigned destination.');
  if (!workspace.trip.bookings.length) unknowns.push('No booking records have been entered.');
  return {
    version: 1, kind: 'canonical-atlas', identity: canonicalAtlasIdentity(workspace), workspace, places,
    activities: workspace.activities.map(activity => ({ ...activity, priority: activity.priority || null, photo: activity.photo || null, status: null, evidence: evidence('activity', activity.id) })),
    days: workspace.days.map(day => ({ date: day.date, placeId: day.placeId || null, activityIds: workspace.activities.filter(item => item.date === day.date).sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id)).map(item => item.id), anchors: workspace.trip.anchors.filter(anchor => anchor.date === day.date), conflicts: conflicts.filter(conflict => conflict.startsWith(day.date)) })),
    bookings: workspace.trip.bookings.map(booking => ({ ...booking, status: booking.status as CanonicalBookingStatus, detail: workspace.bookingDetails.find(item => item.bookingId === booking.id) || null, evidence: evidence('booking', booking.id) })),
    unknowns,
  };
}
