import { validateNormalizedTrip, type NormalizedTrip } from "./normalized-trip.ts";
import { parseProviderSearchRequest } from "./providers/validation.ts";
import type { CashFlightSearch } from "./providers/types.ts";
import { createResearchLedger, researchTripIdentity, validateResearchLedger } from "./research-ledger.ts";
import { hasPrivatePlanningText } from "./planning-privacy.ts";

export const RESEARCH_MATRIX_LIMIT = 24;
export type MatrixInput = { origins: string; destinations: string; dates: string; adults: string; cabin: string; currency: string };
export type MatrixStatus = "pending" | "running" | "searched-empty" | "found" | "failed" | "unconfigured" | "locked" | "cancelled";
export type MatrixOutcome = { status: MatrixStatus; count: number; checkedAt: string; freshness: string; providerCheckedAt?: string; limitations: string[]; lowest?: { amount: number; currency: string; unit: string } };
export type MatrixRow = { id: string; request: CashFlightSearch; outcome: MatrixOutcome };
export type MatrixState = { generation: number; identity: string; rows: MatrixRow[] };
const empty = (status: MatrixStatus): MatrixOutcome => ({ status, count: 0, checkedAt: "", freshness: "unknown", limitations: [] });
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const split = (value: string) => [...new Set(value.toUpperCase().split(/[\s,]+/).filter(Boolean))];
const timestamp = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : "";
const safeLimitation = (value: unknown) => typeof value === "string" && value.length <= 240 && !hasPrivatePlanningText(value) && !/@|https?:|www\.|gmail|mail[t]o:|\b(?=[A-Z0-9]{6}\b)(?=[A-Z0-9]*\d)[A-Z0-9]+\b/i.test(value) ? value.replace(/[\u0000-\u001f]/g, " ") : "A provider limitation requires manual source review.";

export function prepareResearchMatrix(trip: NormalizedTrip, input: MatrixInput): MatrixState {
  if (validateNormalizedTrip(trip).length) throw new Error("Validate the trip before preparing research.");
  if (Object.values(input).some(value => typeof value !== "string" || value.length > 1000)) throw new Error("Search inputs exceed preparation limits.");
  const origins = split(input.origins), destinations = split(input.destinations), dates = split(input.dates).sort();
  if (!origins.length || !destinations.length || !dates.length || origins.length > 24 || destinations.length > 24 || dates.length > 24) throw new Error("Enter airport codes and one or more exact dates.");
  if (origins.some(code => !/^[A-Z]{3}$/.test(code)) || destinations.some(code => !/^[A-Z]{3}$/.test(code))) throw new Error("Use three-letter airport codes only.");
  if (dates.some(date => date < trip.dateWindow.earliestDeparture || date > trip.dateWindow.latestReturn)) throw new Error("Every search date must be inside the trip planning window.");
  const rows: MatrixRow[] = [];
  for (const origin of origins) for (const destination of destinations) for (const date of dates) {
    if (origin === destination) continue;
    if (rows.length >= RESEARCH_MATRIX_LIMIT) throw new Error("More than 24 queries: narrow the airports or dates before preparing.");
    const request = parseProviderSearchRequest({ kind: "cash-flight", providers: ["serpapi"], origin, destination, departureDate: date, adults: Number(input.adults), cabin: input.cabin, currency: input.currency.toUpperCase() }) as CashFlightSearch;
    rows.push({ id: `${origin}-${destination}-${date}`, request, outcome: empty("pending") });
  }
  if (!rows.length) throw new Error("Choose at least one distinct origin and destination.");
  return { generation: 0, identity: researchTripIdentity(trip), rows };
}

export type MatrixAction = { type: "update"; generation: number; identity: string; id: string; outcome: MatrixOutcome } | { type: "cancel" };
export function reduceResearchMatrix(state: MatrixState, action: MatrixAction): MatrixState {
  if (action.type === "cancel") return { ...state, generation: state.generation + 1, rows: state.rows.map(row => row.outcome.status === "pending" || row.outcome.status === "running" ? { ...row, outcome: empty("cancelled") } : row) };
  if (action.generation !== state.generation || action.identity !== state.identity) return state;
  return { ...state, rows: state.rows.map(row => row.id === action.id ? { ...row, outcome: action.outcome } : row) };
}

export function parseMatrixOutcome(body: unknown, httpStatus: number, currency: string): MatrixOutcome {
  const outcomes = record(body) && Array.isArray(body.providers) ? body.providers : [];
  const provider = outcomes.find(value => record(value) && value.provider === "serpapi");
  if (!record(provider)) return empty(httpStatus === 403 ? "locked" : "failed");
  const checked = record(provider.freshness) ? provider.freshness : {};
  const base = { count: 0, checkedAt: timestamp(checked.checkedAt || provider.checkedAt), freshness: checked.basis === "provider-cache" || checked.basis === "live-request" ? checked.basis : "unknown", providerCheckedAt: timestamp(checked.providerCheckedAt) || undefined, limitations: Array.isArray(provider.limitations) ? [...provider.limitations.slice(0, 5).map(safeLimitation), ...(provider.limitations.length > 5 ? ["Additional provider limitations require source review."] : [])] : [] };
  if (httpStatus < 200 || httpStatus >= 300 || provider.status !== "ok" || provider.mode !== "live" || !Array.isArray(provider.results)) return { ...base, status: provider.status === "unconfigured" ? "unconfigured" : provider.status === "locked" || httpStatus === 403 ? "locked" : "failed" };
  if (provider.results.some(result => !record(result) || typeof result.id !== "string" || result.kind !== "cash-flight" || typeof result.title !== "string")) return { ...base, status: "failed", limitations: [...base.limitations, "The returned result structure could not be verified."] };
  const prices = provider.results.flatMap(result => record(result) && record(result.price) && result.price.currency === currency && typeof result.price.amount === "number" && Number.isFinite(result.price.amount) && result.price.amount >= 0 && ["total", "ticket"].includes(String(result.price.unit)) ? [{ amount: result.price.amount, currency, unit: String(result.price.unit) }] : []);
  const units = new Set(prices.map(price => price.unit));
  return { ...base, status: provider.results.length ? "found" : "searched-empty", count: provider.results.length, ...(prices.length && units.size === 1 ? { lowest: prices.reduce((a, b) => a.amount < b.amount ? a : b) } : {}) };
}

export function matrixCoverageReceipt(trip: NormalizedTrip, state: MatrixState, recordedAt = new Date().toISOString()) {
  if (state.identity !== researchTripIdentity(trip) || !state.rows.length || state.rows.length > RESEARCH_MATRIX_LIMIT) throw new Error("Prepare a current trip matrix first.");
  const attempted = state.rows.filter(row => !["pending", "running", "cancelled"].includes(row.outcome.status));
  if (!attempted.length || state.rows.some(row => row.outcome.status === "running")) throw new Error("Finish or cancel the run before recording coverage.");
  const row = createResearchLedger(trip).rows.find(item => item.category === "cash")!;
  const basis = state.rows[0].request;
  const allSearched = state.rows.every(item => item.outcome.status === "found" || item.outcome.status === "searched-empty");
  const rows = state.rows.map(item => `${item.request.origin}-${item.request.destination}/${item.request.departureDate}:${item.outcome.status}`);
  const ledger = createResearchLedger(trip);
  const receipt = { ...row, state: allSearched ? "researched" as const : "failed" as const, scope: `${basis.adults} adults; ${basis.cabin}; ${basis.currency}; one-way. ${rows.join("; ")}`, source: "SerpApi via bounded cash-flight matrix", sourceUrl: "", checkedAt: timestamp(recordedAt), notes: "Run receipt time is the local recording time; inspect each query for provider check time/cache basis. Found counts are research leads. Empty applies only to successful queried scope; failures, locked, unconfigured and cancelled scopes remain unknown. No exhaustive search or live inventory guarantee.", nextAction: `Unsearched: awards, through-ticket/open-jaw pricing, rail/car/coach/ferry, lodging, taxes/baggage/terms and other airports/dates.${trip.travelers.childrenAges.length ? " Child pricing unsupported; adult-only results are not full-party quotes." : ""} Verify selected leads with the provider.` };
  ledger.rows = ledger.rows.map(item => item.id === receipt.id ? receipt : item);
  return validateResearchLedger(ledger, trip).rows.find(item => item.id === receipt.id)!;
}

/** Two bounded workers. No retries, pagination or follow-up requests; caller rejects stale generations. */
export async function runResearchMatrix(state: MatrixState, fetcher: typeof fetch, onUpdate: (action: MatrixAction) => void, signal: AbortSignal): Promise<void> {
  if (!state.rows.length || state.rows.length > RESEARCH_MATRIX_LIMIT) throw new Error("Prepare at most 24 queries before running.");
  let cursor = 0;
  const update = (row: MatrixRow, outcome: MatrixOutcome) => { if (!signal.aborted) onUpdate({ type: "update", generation: state.generation, identity: state.identity, id: row.id, outcome }); };
  await Promise.all(Array.from({ length: Math.min(2, state.rows.length) }, async () => {
    while (!signal.aborted && cursor < state.rows.length) {
      const row = state.rows[cursor++];
      update(row, empty("running"));
      try {
        const response = await fetcher("/api/providers/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(row.request), signal: AbortSignal.any([signal, AbortSignal.timeout(20_000)]) });
        const body: unknown = await response.json();
        update(row, parseMatrixOutcome(body, response.status, row.request.currency));
      } catch { update(row, empty("failed")); }
    }
  }));
}
