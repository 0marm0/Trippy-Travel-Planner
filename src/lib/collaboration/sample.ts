import type { Trip2026Payload } from "../trip-model";
import { safeCollaborationImage, safeCollaborationSourceUrl, validateCollaborationState } from "./schema.ts";

// This is an explicit allowlist projection, never a copy of the trip DTO.
export function publicSampleCollaborationState(trip: Trip2026Payload) {
  if (trip.dataMode !== "sample") throw new Error("Only reviewed public sample data can seed collaboration.");
  const cities = trip.stops.map(stop => ({ id: stop.id, name: stop.name, lat: stop.lat, lng: stop.lng }));
  const cityIds = new Set(cities.map(city => city.id));
  const activityIds = new Set<string>();
  const activities = trip.activities.filter(activity => cityIds.has(activity.city)).flatMap(activity => {
    if (activityIds.has(activity.id)) return [];
    const image = safeCollaborationImage(activity.image), sourceUrl = safeCollaborationSourceUrl(activity.url);
    const projected = { id: activity.id, cityId: activity.city, title: activity.title, notes: activity.description.slice(0, 1000), ...(Number.isFinite(activity.lat) && Number.isFinite(activity.lng) ? { lat: activity.lat, lng: activity.lng } : {}), ...(image ? { image } : {}), ...(sourceUrl ? { sourceUrl } : {}) };
    // Omit an unsafe catalogue item instead of promoting private strings to shared state.
    try { validateCollaborationState({ title: trip.title, startDate: trip.start, endDate: trip.end, cities, activities: [projected], days: {} }); }
    catch { return []; }
    activityIds.add(activity.id);
    return [projected];
  }).slice(0, 500);
  const retained = new Set(activities.map(activity => activity.id));
  const assigned = new Set<string>();
  const days: Record<string, string[]> = {};
  for (const stop of trip.stops) {
    for (let index = 0; index < Math.min(stop.nights, 367); index++) {
      const start = Date.parse(`${stop.checkIn}T00:00:00Z`);
      if (!Number.isFinite(start)) continue;
      const date = new Date(start + index * 86400000).toISOString().slice(0, 10);
      if (date < trip.start || date > trip.end) continue;
      const ids = (trip.cityPlans?.[stop.id]?.[index]?.blocks ?? []).flatMap(block => {
        if (!block.id || !retained.has(block.id) || assigned.has(block.id)) return [];
        assigned.add(block.id); return [block.id];
      }).slice(0, 50);
      if (ids.length) days[date] = ids;
    }
  }
  return validateCollaborationState({ title: trip.title, startDate: trip.start, endDate: trip.end, cities, activities, days });
}
