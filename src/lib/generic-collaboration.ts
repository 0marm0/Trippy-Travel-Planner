import { validateWorkspace, type GenericWorkspace } from "./generic-trip-workspace.ts";
import { validateCollaborationState, type CollaborationState } from "./collaboration/schema.ts";

/** Explicit share-safe projection. Hotels, transport, bookings and account data are omitted. */
export function genericCollaborationBoard(workspace: GenericWorkspace): CollaborationState {
  if (validateWorkspace(workspace).length) throw new Error("Validate the planning workspace before preparing a shared board.");
  const state: CollaborationState = {
    title: workspace.trip.name, startDate: workspace.trip.dateWindow.earliestDeparture, endDate: workspace.trip.dateWindow.latestReturn,
    cities: workspace.trip.destinations.map(city => {
      const pin = workspace.places.find(value => value.placeId === city.id);
      return { id: city.id, name: city.name, ...(pin ? { lat: pin.lat, lng: pin.lng } : {}) };
    }),
    activities: workspace.activities.map(activity => ({ id: activity.id, cityId: activity.placeId, title: activity.title, notes: `${activity.time} · ${activity.notes}`.trim(), durationMinutes: activity.durationMinutes })),
    days: Object.fromEntries(workspace.days.map(day => [day.date, workspace.activities.filter(activity => activity.date === day.date).sort((a, b) => a.time.localeCompare(b.time)).map(activity => activity.id)])),
  };
  return validateCollaborationState(state);
}
