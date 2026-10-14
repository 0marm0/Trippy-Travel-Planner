import type { NormalizedTrip } from "./normalized-trip.ts";
import { safeCollaborationSourceUrl } from "./collaboration/schema.ts";
import { hasPrivatePlanningText } from "./planning-privacy.ts";

export const researchStates = ["unsearched", "researched", "unsupported", "failed"] as const;
export type ResearchState = typeof researchStates[number];
export type ResearchRow = { id: string; category: "cash" | "award" | "routes" | "transport" | "hotels" | "activities" | "bookings"; cityId?: string; label: string; state: ResearchState; scope: string; source: string; sourceUrl: string; checkedAt: string; notes: string; nextAction: string };
export type ResearchLedgerData = { version: 1; tripIdentity: string; rows: ResearchRow[] };
const sensitive = /@|\b(?:secret|password|oauth|bearer|api[\s_-]?key|confirmation|pnr|booking[\s_-]?(?:reference|number|code)|record[\s_-]?locator|loyalty|seat[\s_-]?(?:assignment|number|\d+[a-z]))\b|\b(?:sk-|ghp_|github_pat_|AIza|ya29\.)[a-z0-9_-]+|\b\d{9,}\b/i;
function text(value: unknown, maximum = 1000, allowUrl = false) {
  if (typeof value !== "string" || value.length > maximum || /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/.test(value) || sensitive.test(value.normalize("NFKC")) || hasPrivatePlanningText(value) || (!allowUrl && /https?:|www\.|mailto\x3a|gmail/i.test(value))) throw new Error("Use planning evidence only; remove private identifiers or unsupported values.");
  return value.trim();
}
export function researchTripIdentity(trip: NormalizedTrip) {
  return JSON.stringify([trip.id, trip.dateWindow, trip.destinations.map(city => [city.id, city.name]), trip.travelers, trip.origins, trip.preferences]);
}
export function researchStorageKey(trip: NormalizedTrip) {
  return "trippy.research.v1." + encodeURIComponent(researchTripIdentity(trip));
}
export function createResearchLedger(trip: NormalizedTrip): ResearchLedgerData {
  const rows: ResearchRow[] = [];
  const add = (category: ResearchRow["category"], label: string, cityId?: string) => rows.push({ id: `${category}-${rows.length}`, category, ...(cityId ? { cityId } : {}), label, state: "unsearched", scope: "", source: "", sourceUrl: "", checkedAt: "", notes: "", nextAction: "" });
  add("cash", "Cash flights across dates, airports and connections");
  add("award", "Award flights, taxes and transferable points");
  add("routes", "Three route families and gateway alternatives");
  add("transport", "Flights, rail, car and other plausible city connections");
  for (const city of trip.destinations) { add("hotels", `${city.name}: hotel price and location`, city.id); add("activities", `${city.name}: broad activity catalogue and feasible days`, city.id); }
  add("bookings", "Booking gaps and confirmation review");
  return { version: 1, tripIdentity: researchTripIdentity(trip), rows };
}
export function validateResearchLedger(input: unknown, trip: NormalizedTrip): ResearchLedgerData {
  const fail = () => { throw new Error("Invalid research ledger for this trip. No changes were imported."); };
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail();
  const value = input as ResearchLedgerData;
  if (Object.keys(value).some(k => !["version", "tripIdentity", "rows"].includes(k)) || value.version !== 1 || value.tripIdentity !== researchTripIdentity(trip) || !Array.isArray(value.rows) || value.rows.length > 150) return fail();
  const expected = createResearchLedger(trip).rows;
  if (expected.length !== value.rows.length) return fail();
  const rows = value.rows.map((row, index) => {
    const base = expected[index];
    if (!row || typeof row !== "object" || Object.keys(row).some(k => !["id", "category", "cityId", "label", "state", "scope", "source", "sourceUrl", "checkedAt", "notes", "nextAction"].includes(k)) || row.id !== base.id || row.category !== base.category || row.cityId !== base.cityId || row.label !== base.label || !researchStates.includes(row.state)) return fail();
    const sourceUrl = text(row.sourceUrl, 500, true);
    if (sourceUrl && !safeCollaborationSourceUrl(sourceUrl)) return fail();
    const checkedAt = text(row.checkedAt, 32);
    if (checkedAt && (!Number.isFinite(Date.parse(checkedAt)) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(checkedAt))) return fail();
    const source = text(row.source, 160), scope = text(row.scope);
    if (row.state === "researched" && (!source || !scope || !checkedAt)) throw new Error("Researched rows require a source, checked time and disclosed search scope.");
    return { ...base, state: row.state, scope, source, sourceUrl, checkedAt, notes: text(row.notes), nextAction: text(row.nextAction) };
  });
  return { version: 1, tripIdentity: value.tripIdentity, rows };
}
export function researchFreshness(row: ResearchRow, now = Date.now()) {
  if (!row.checkedAt) return "unchecked";
  const elapsed = now - Date.parse(row.checkedAt);
  if (elapsed < -300000) return "future timestamp";
  return elapsed > 7 * 86400000 ? "older than 7 days" : "checked within 7 days";
}
