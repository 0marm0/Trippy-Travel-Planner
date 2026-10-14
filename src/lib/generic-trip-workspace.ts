import { validateNormalizedTrip, type NormalizedTrip } from './normalized-trip.ts';
import { safeCollaborationSourceUrl } from './collaboration/schema.ts';
import { validateResearchLedger, type ResearchLedgerData } from './research-ledger.ts';
import { validateQuoteComparison, type QuoteComparisonData } from './trip-quote-comparison.ts';

export const bookingStates = ['recommended', 'quoted', 'held', 'confirmed', 'missing', 'conflict'] as const;
export type WorkspaceActivity = { id: string; placeId: string; title: string; date: string; time: string; durationMinutes: number; notes: string };
export type WorkspaceBookingDetail = { bookingId: string; label: string; placeId: string; notes: string };
export type ItemEvidence = { target: 'activity' | 'booking' | 'destination'; targetId: string; basis: 'manual' | 'fact' | 'estimate' | 'quote'; source: string; sourceUrl: string; checkedAt: string; summary: string; unknowns: string; reviewRequired?: boolean };
export type RouteAllocation = { routeId: string; stops: Array<{ placeId: string; nights: number }> };
export type GenericWorkspace = {
  version: 1; trip: NormalizedTrip; selectedRouteId: string;
  places: Array<{ placeId: string; lat: number; lng: number }>;
  days: Array<{ date: string; placeId: string }>;
  activities: WorkspaceActivity[];
  bookingDetails: WorkspaceBookingDetail[];
  itemEvidence?: ItemEvidence[];
  routeAllocations?: RouteAllocation[];
  researchEvidence?: ResearchLedgerData;
  quoteEvidence?: QuoteComparisonData;
  budgetQuoteIds?: string[];
};
export type BrowserStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Dates are the planning window, never inferred confirmed travel dates. */
export function workspaceDates(trip: NormalizedTrip): string[] {
  const dates: string[] = [];
  for (let current = Date.parse(trip.dateWindow.earliestDeparture); current <= Date.parse(trip.dateWindow.latestReturn); current += 86400000) dates.push(new Date(current).toISOString().slice(0, 10));
  return dates;
}
export function createWorkspace(trip: NormalizedTrip): GenericWorkspace {
  const errors = validateNormalizedTrip(trip);
  if (errors.length) throw new Error('Invalid planning record');
  return { version: 1, trip: structuredClone(trip), selectedRouteId: '', places: [], days: workspaceDates(trip).map(date => ({ date, placeId: '' })), activities: [], bookingDetails: [] };
}

/** Same human label on different dates or destinations must not share state. */
export function workspaceKey(trip: NormalizedTrip): string {
  return `trippy.workspace.v1:${encodeURIComponent(JSON.stringify([trip.id, trip.dateWindow.earliestDeparture, trip.dateWindow.latestReturn, trip.destinations.map(place => [place.id, place.name])]))}`;
}
function exactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key)));
}
function safeText(value: unknown, maximum: number): value is string {
  if (typeof value !== 'string' || value.length > maximum) return false;
  // Apply the canonical private-text boundary to every sidecar text field too.
  const probe = { schemaVersion: 1, id: 'safety-check', name: value || 'empty', status: 'planning', dateWindow: { earliestDeparture: '2030-01-01', latestReturn: '2030-01-02', flexDays: 0 }, travelers: { adults: 1, childrenAges: [] }, origins: [{ kind: 'airport', code: 'AAA' }], destinations: [{ id: 'place', name: 'Place', priority: 'required' }], preferences: { pace: 'balanced', directFlightBias: 0.5, hotelLocationBias: 0.5, activityThemes: [] }, anchors: [], routeCandidates: [], bookings: [] };
  // Long notes are checked in bounded chunks with overlap, preserving identifier detection.
  for (let offset = 0; offset < value.length; offset += 60) {
    probe.name = value.slice(offset, offset + 120);
    if (validateNormalizedTrip(probe).length) return false;
  }
  return true;
}
export function validateWorkspace(input: unknown): string[] {
  let value = input as Record<string, unknown>;
  const fail = ['Workspace is invalid or contains unsafe fields; no changes saved.'];
  const required = ['version', 'trip', 'selectedRouteId', 'places', 'days', 'activities', 'bookingDetails'];
  const optional = ['itemEvidence', 'routeAllocations', 'researchEvidence', 'quoteEvidence', 'budgetQuoteIds'];
  if (!value || typeof value !== 'object' || Array.isArray(value) || !required.every(key => Object.hasOwn(value, key)) || Object.keys(value).some(key => ![...required, ...optional].includes(key))) return fail;
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || validateNormalizedTrip(record.trip).length) return fail;
  value = record;
  const trip = value.trip as NormalizedTrip;
  if (value.selectedRouteId !== '' && !trip.routeCandidates.some(route => route.id === value.selectedRouteId)) return fail;
  const places = new Set(trip.destinations.map(place => place.id));
  const dates = new Set(workspaceDates(trip));
  if (![value.places, value.days, value.activities, value.bookingDetails].every(Array.isArray)) return fail;
  const pins = value.places as GenericWorkspace['places'], days = value.days as GenericWorkspace['days'], activities = value.activities as WorkspaceActivity[], details = value.bookingDetails as WorkspaceBookingDetail[];
  if (pins.length > places.size || new Set(pins.map(pin => pin?.placeId)).size !== pins.length || pins.some(pin => !exactKeys(pin, ['placeId', 'lat', 'lng']) || !places.has(pin.placeId) || !Number.isFinite(pin.lat) || !Number.isFinite(pin.lng) || Math.abs(pin.lat) > 90 || Math.abs(pin.lng) > 180)) return fail;
  if (days.length !== dates.size || new Set(days.map(day => day?.date)).size !== days.length || days.some(day => !exactKeys(day, ['date', 'placeId']) || !dates.has(day.date) || (day.placeId !== '' && !places.has(day.placeId)))) return fail;
  if (activities.length > 2000 || new Set(activities.map(item => item?.id)).size !== activities.length || activities.some(item => !exactKeys(item, ['id', 'placeId', 'title', 'date', 'time', 'durationMinutes', 'notes']) || !/^[a-z0-9-]{1,64}$/.test(item.id) || !places.has(item.placeId) || !safeText(item.title, 120) || !item.title.trim() || !safeText(item.notes, 1000) || !dates.has(item.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time) || !Number.isInteger(item.durationMinutes) || item.durationMinutes < 1 || item.durationMinutes > 1440)) return fail;
  if (details.length > trip.bookings.length || new Set(details.map(detail => detail?.bookingId)).size !== details.length || details.some(detail => !exactKeys(detail, ['bookingId', 'label', 'placeId', 'notes']) || !trip.bookings.some(booking => booking.id === detail.bookingId) || (detail.placeId !== '' && !places.has(detail.placeId)) || !safeText(detail.label, 120) || !safeText(detail.notes, 1000))) return fail;
  if (value.itemEvidence !== undefined) {
    if (!Array.isArray(value.itemEvidence) || value.itemEvidence.length > 2000) return fail;
    const seen = new Set<string>();
    for (const raw of value.itemEvidence) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !['target','targetId','basis','source','sourceUrl','checkedAt','summary','unknowns'].every(key => Object.hasOwn(raw,key)) || Object.keys(raw).some(key => !['target','targetId','basis','source','sourceUrl','checkedAt','summary','unknowns','reviewRequired'].includes(key)) || (Object.hasOwn(raw,'reviewRequired') && typeof raw.reviewRequired !== 'boolean')) return fail;
      const evidence = raw as ItemEvidence;
      const known = evidence.target === 'activity' ? activities.some(item => item.id === evidence.targetId) : evidence.target === 'booking' ? trip.bookings.some(item => item.id === evidence.targetId) : evidence.target === 'destination' && places.has(evidence.targetId);
      const key = `${evidence.target}:${evidence.targetId}`;
      if (!known || seen.has(key) || !['manual','fact','estimate','quote'].includes(evidence.basis) || !safeText(evidence.source,160) || !safeText(evidence.summary,500) || !safeText(evidence.unknowns,500) || typeof evidence.sourceUrl !== 'string' || evidence.sourceUrl.length > 1500 || (evidence.sourceUrl !== '' && safeCollaborationSourceUrl(evidence.sourceUrl) !== evidence.sourceUrl)) return fail;
      if (typeof evidence.checkedAt !== 'string' || (evidence.checkedAt !== '' && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(evidence.checkedAt) || !Number.isFinite(Date.parse(evidence.checkedAt)) || new Date(evidence.checkedAt.slice(0,10)+'T00:00:00Z').toISOString().slice(0,10) !== evidence.checkedAt.slice(0,10)))) return fail;
      if (['fact','quote'].includes(evidence.basis) && (!evidence.source.trim() || !evidence.checkedAt)) return fail;
      seen.add(key);
    }
  }
  if (value.routeAllocations !== undefined) {
    if (!Array.isArray(value.routeAllocations) || value.routeAllocations.length > trip.routeCandidates.length || new Set(value.routeAllocations.map(item => item?.routeId)).size !== value.routeAllocations.length) return fail;
    for (const raw of value.routeAllocations) {
      if (!exactKeys(raw, ['routeId','stops']) || !Array.isArray(raw.stops)) return fail;
      const route = trip.routeCandidates.find(item => item.id === raw.routeId);
      if (!route || raw.stops.length !== route.placeOrder.length || raw.stops.some((stop,index) => !exactKeys(stop,['placeId','nights']) || stop.placeId !== route.placeOrder[index] || !Number.isInteger(stop.nights) || Number(stop.nights) < 1 || Number(stop.nights) > 365)) return fail;
      if (raw.stops.reduce((sum,stop) => sum + stop.nights,0) > dates.size - 1) return fail;
    }
  }
  if (value.budgetQuoteIds !== undefined && (!Array.isArray(value.budgetQuoteIds) || value.budgetQuoteIds.length > 300 || value.budgetQuoteIds.some(id => typeof id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(id)) || new Set(value.budgetQuoteIds).size !== value.budgetQuoteIds.length)) return fail;
  try {
    if (value.researchEvidence !== undefined) validateResearchLedger(value.researchEvidence,trip);
    if (value.quoteEvidence !== undefined) validateQuoteComparison(value.quoteEvidence,trip);
    if (JSON.stringify(value).length > 2_000_000) return fail;
  } catch { return fail; }
  return [];
}
export function saveWorkspace(store: BrowserStore, value: GenericWorkspace): void {
  if (validateWorkspace(value).length) throw new Error('Unsafe or invalid workspace; not saved');
  store.setItem(workspaceKey(value.trip), JSON.stringify(value));
  store.setItem('trippy.workspace.active.v1', workspaceKey(value.trip));
}
export function loadWorkspace(store: BrowserStore, trip?: NormalizedTrip): GenericWorkspace | null {
  const key = trip ? workspaceKey(trip) : store.getItem('trippy.workspace.active.v1');
  if (!key || !key.startsWith('trippy.workspace.v1:')) return null;
  const raw = store.getItem(key);
  if (!raw || raw.length > 2_000_000) return null;
  try { const value: unknown = JSON.parse(raw); if (validateWorkspace(value).length) return null; const workspace = value as GenericWorkspace; return workspaceKey(workspace.trip) === key ? workspace : null; } catch { return null; }
}
export function removeWorkspace(store: BrowserStore, trip: NormalizedTrip): void {
  const key = workspaceKey(trip); store.removeItem(key);
  if (store.getItem('trippy.workspace.active.v1') === key) store.removeItem('trippy.workspace.active.v1');
}
export function exportWorkspace(value: GenericWorkspace): { trip: string; itinerary: string } {
  if (validateWorkspace(value).length) throw new Error('Unsafe or invalid workspace; export blocked');
  return { trip: JSON.stringify(value.trip, null, 2) + '\n', itinerary: JSON.stringify({ version: value.version, tripId: value.trip.id, selectedRouteId: value.selectedRouteId, places: value.places, days: value.days, activities: value.activities, bookingDetails: value.bookingDetails, ...(value.itemEvidence ? { itemEvidence: value.itemEvidence } : {}), ...(value.routeAllocations ? { routeAllocations: value.routeAllocations } : {}), ...(value.researchEvidence ? { researchEvidence: value.researchEvidence } : {}), ...(value.quoteEvidence ? { quoteEvidence: value.quoteEvidence } : {}), ...(value.budgetQuoteIds ? {budgetQuoteIds:value.budgetQuoteIds} : {}) }, null, 2) + '\n' };
}
export function workspaceConflicts(value: GenericWorkspace): string[] {
  const conflicts: string[] = [];
  for (const day of value.days) {
    const activities = value.activities.filter(item => item.date === day.date).sort((a, b) => a.time.localeCompare(b.time));
    let end = 0;
    for (const item of activities) {
      const [hour, minute] = item.time.split(':').map(Number), start = hour * 60 + minute;
      if (start < end) conflicts.push(`${day.date}: activities overlap.`);
      if (start + item.durationMinutes > 1440) conflicts.push(`${day.date}: activity crosses midnight.`);
      if (day.placeId && day.placeId !== item.placeId) conflicts.push(`${day.date}: activity differs from assigned destination.`);
      end = Math.max(end, start + item.durationMinutes);
    }
    for (const anchor of value.trip.anchors.filter(anchor => anchor.locked && anchor.date === day.date && anchor.placeId)) if (day.placeId && anchor.placeId !== day.placeId) conflicts.push(`${day.date}: locked anchor is in another destination.`);
  }
  return [...new Set(conflicts)];
}

/** Retain the receipt, but never present evidence as current after its supported record changes. */
export function reconcileItemEvidence(previous: GenericWorkspace, next: GenericWorkspace): GenericWorkspace {
  const record = (workspace: GenericWorkspace, evidence: ItemEvidence) => evidence.target === 'activity' ? workspace.activities.find(item => item.id === evidence.targetId) : evidence.target === 'booking' ? {record:workspace.trip.bookings.find(item => item.id === evidence.targetId),detail:workspace.bookingDetails.find(item => item.bookingId === evidence.targetId)} : {place:workspace.trip.destinations.find(item => item.id === evidence.targetId),pin:workspace.places.find(item => item.placeId === evidence.targetId)};
  if (!next.itemEvidence) return next;
  return {...next,itemEvidence:next.itemEvidence.map(evidence => previous.itemEvidence?.some(item => item.target === evidence.target && item.targetId === evidence.targetId) && JSON.stringify(record(previous,evidence)) !== JSON.stringify(record(next,evidence)) ? {...evidence,reviewRequired:true} : evidence)};
}

/** Complete editable envelope: read-only parsing precedes an explicit UI acceptance. */
export function parseWorkspaceImport(text: string): GenericWorkspace {
  if (typeof text !== 'string' || text.length > 2_000_000) throw new Error('Workspace JSON exceeds the 2 MB limit.');
  let value: unknown;
  try { value=JSON.parse(text); } catch { throw new Error('Invalid workspace JSON; nothing imported.'); }
  if(validateWorkspace(value).length)throw new Error('Workspace JSON failed validation or privacy checks; nothing imported.');
  return structuredClone(value as GenericWorkspace);
}
