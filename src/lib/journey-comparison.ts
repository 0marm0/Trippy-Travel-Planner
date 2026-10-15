import { validateWorkspace } from './generic-trip-workspace.ts';
import type { ActivityCoordinates, GenericWorkspace } from './generic-trip-workspace.ts';
import { compareRouteScenarios, summarizeRouteScenario } from './route-scenarios.ts';

const normalize = (value: string) => value.trim().toLocaleLowerCase();
/** Geographic context only. This is never a routed distance or a travel-time estimate. */
export function straightLineKilometers(a: ActivityCoordinates, b: ActivityCoordinates): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLat = radians(b.lat - a.lat), deltaLng = radians(b.lng - a.lng);
  const arc = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(deltaLng / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, arc))));
}

/** Read-only projection of validated, recorded evidence; no searches, matches or writes. */
export function buildJourneyComparison(workspace: GenericWorkspace, now = Date.now(), pair?: { leftId: string; rightId: string }) {
  if (validateWorkspace(workspace).length || !Number.isFinite(now)) throw new Error('A valid, share-safe workspace and check time are required for journey comparison.');
  const scenarios = workspace.routeScenarios?.scenarios ?? [];
  const candidates = scenarios.map(scenario => {
    const summary = summarizeRouteScenario(workspace, scenario, now);
    return {
      id: scenario.id, label: scenario.label, scenario, summary,
      // Recorded durations may include waits; adding unlinked metadata would double count.
      recordedLegMinutes: summary.elapsedMinutes,
      doorToDoorMinutes: null,
      timingUnknowns: ['Access, waiting, interchange, check-in and final onward travel are not independently accounted for. Recorded leg elapsed times may already include some of them.'],
      legs: scenario.legs.map((leg, index) => {
        const previous = scenario.legs[index - 1];
        const missingQuoteIds = leg.quoteIds.filter(id => !summary.budget.selected.some(item => item.quote.id === id));
        return { ...leg, missingQuoteIds,
          unquoted: leg.quoteIds.length === 0,
          connectionGap: Boolean(previous && normalize(previous.to) !== normalize(leg.from)),
          quotes: summary.budget.selected.filter(item => leg.quoteIds.includes(item.quote.id)),
        };
      }),
    };
  });
  // Only the displayed pair is compared, avoiding quadratic validation for 40 candidates.
  const left = candidates.find(item => item.id === pair?.leftId) ?? candidates[0];
  const right = candidates.find(item => item.id === pair?.rightId) ?? candidates.find(item => item.id !== left?.id);
  const comparisons = left && right && left.id !== right.id ? [{
    leftId: left.id, rightId: right.id, ...compareRouteScenarios(workspace, left.scenario, right.scenario, now),
  }] : [];
  const transport = (workspace.bookingPlans?.items ?? []).flatMap(plan => {
    if (plan.kind !== 'transport') return [];
    const booking = workspace.trip.bookings.find(item => item.id === plan.bookingId)!;
    return [{ ...plan, status: booking.status, startAt: booking.startAt, endAt: booking.endAt }];
  });
  const stays = (workspace.bookingPlans?.items ?? []).flatMap(plan => {
    if (plan.kind !== 'stay') return [];
    const booking = workspace.trip.bookings.find(item => item.id === plan.bookingId)!;
    const place = workspace.trip.destinations.find(item => item.id === plan.placeId);
    const activities = workspace.activities.filter(item => item.placeId === plan.placeId);
    const distances = activities.flatMap(activity => plan.coordinates && activity.coordinates ? [{
      activityId: activity.id, title: activity.title, date: activity.date,
      kilometers: straightLineKilometers(plan.coordinates, activity.coordinates),
      coordinates: activity.coordinates,
    }] : []);
    const dates = [...new Set(activities.map(item => item.date))].sort();
    return [{ bookingId: booking.id, status: booking.status, startAt: booking.startAt, endAt: booking.endAt,
      label: workspace.bookingDetails.find(item => item.bookingId === booking.id)?.label || 'Recorded stay base',
      placeName: place?.name || 'City unknown', coordinates: plan.coordinates,
      activityCount: activities.length, unmeasuredCount: activities.length - distances.length, distances,
      days: dates.map(date => {
        const pins = distances.filter(item => item.date === date);
        return { date, measuredCount: pins.length, activityCount: activities.filter(item => item.date === date).length,
          meanStraightLineKm: pins.length ? pins.reduce((sum, item) => sum + item.kilometers, 0) / pins.length : null };
      }),
    }];
  });
  return { candidates, comparisons, transport, stays,
    limits: ['Recorded comparisons only; no live inventory or exhaustive search.', 'Known cash subtotals retain currencies and whole-party quote basis; unknowns prevent complete-cost claims.', 'Transport booking details are separate records, never automatically linked to a scenario or quote.', 'Hotel-base geography uses same-city activity pins across all recorded days, not an assigned stay itinerary. Straight-line distances do not establish walking, road or transit access, opening hours, accessibility or venue verification.'],
  };
}
export type JourneyComparisonModel = ReturnType<typeof buildJourneyComparison>;
