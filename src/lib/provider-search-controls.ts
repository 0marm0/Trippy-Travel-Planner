import type { CashFlightSearch, Money, ProviderSearchRequest } from "./providers/types.ts";
import { parseProviderSearchRequest } from "./providers/validation.ts";

export type ProviderSearchKind = "cash-flights" | "hotels" | "places" | "award-seats" | "award-hotels";
export type ProviderSort = "balanced" | "price" | "time";
export type ProviderSearchProfile = {
  adults?: number; childrenAges?: number[]; rooms?: number;
  cabin?: CashFlightSearch["cabin"]; currency?: string; awardSeats?: number; awardProgram?: string;
};
export type ProviderSearchControls = {
  origin: string; destination: string; date: string; endDate: string; query: string;
  adults: string; rooms: string; cabin: string; currency: string; seats: string; program: string; nights: string;
};

/** Unknowns remain blank. The caller supplies route/stay dates independently of the trip window. */
export function initializeProviderControls(seed?: Partial<ProviderSearchControls> & { profile?: ProviderSearchProfile }): ProviderSearchControls {
  const profile = seed?.profile;
  return {
    origin: seed?.origin || "", destination: seed?.destination || "", date: seed?.date || "", endDate: seed?.endDate || "", query: seed?.query || "",
    adults: seed?.adults ?? (profile?.adults ? String(profile.adults) : ""), rooms: seed?.rooms ?? (profile?.rooms ? String(profile.rooms) : ""),
    cabin: seed?.cabin ?? profile?.cabin ?? "", currency: seed?.currency ?? profile?.currency ?? "",
    seats: seed?.seats ?? (profile?.awardSeats ? String(profile.awardSeats) : ""), program: seed?.program ?? profile?.awardProgram ?? "", nights: seed?.nights ?? "",
  };
}

export function buildProviderSearchRequest(kind: ProviderSearchKind, controls: ProviderSearchControls): ProviderSearchRequest {
  const { origin, destination, date, endDate, query, adults, rooms, cabin, currency, seats, program, nights } = controls;
  const request = kind === "cash-flights"
    ? { kind: "cash-flight", origin, destination, departureDate: date, adults: Number(adults), cabin, currency: currency.toUpperCase() }
    : kind === "award-seats"
      ? { kind: "award-flight", origin, destination, departureDate: date, seats: Number(seats), program: program.trim() }
      : kind === "hotels"
        ? { kind: "hotel", destination: query || destination, checkIn: date, checkOut: endDate, adults: Number(adults), rooms: Number(rooms), currency: currency.toUpperCase() }
        : kind === "award-hotels"
          ? { kind: "award-hotel", location: query || destination, startDate: date, endDate, ...(nights ? { nights: Number(nights) } : {}), ...(program.trim() ? { program: program.trim() } : {}) }
          : { kind: "place", query, ...(destination ? { location: destination } : {}) };
  return parseProviderSearchRequest(request);
}

type SortableResult = { price?: Money; durationMinutes?: number };
/** Cash prices compare only in the selected currency and one known unit. No FX/points valuation is invented. */
export function sortProviderResults<T extends SortableResult>(results: readonly T[], sort: ProviderSort, currency: string): T[] {
  const units = new Set(results.flatMap(result => result.price?.currency === currency.toUpperCase() && result.price.unit !== "unknown" ? [result.price.unit] : []));
  const price = (result: T) => result.price && result.price.currency === currency.toUpperCase() && units.size === 1 && result.price.unit !== "unknown" && Number.isFinite(result.price.amount) && result.price.amount >= 0 ? result.price.amount : undefined;
  const time = (result: T) => typeof result.durationMinutes === "number" && Number.isFinite(result.durationMinutes) && result.durationMinutes > 0 ? result.durationMinutes : undefined;
  const prices = results.flatMap(result => price(result) === undefined ? [] : [price(result)!]);
  const times = results.flatMap(result => time(result) === undefined ? [] : [time(result)!]);
  const normalized = (value: number | undefined, values: number[]) => value === undefined ? 1.25 : Math.max(...values) === Math.min(...values) ? 0 : (value - Math.min(...values)) / (Math.max(...values) - Math.min(...values));
  const score = (result: T) => {
    if (sort === "price") return price(result) ?? Infinity;
    if (sort === "time") return time(result) ?? Infinity;
    const count = Number(prices.length > 0) + Number(times.length > 0);
    return count ? ((prices.length ? normalized(price(result), prices) : 0) + (times.length ? normalized(time(result), times) : 0)) / count : 0;
  };
  return results.map((result, index) => ({ result, index })).sort((a, b) => (score(a.result) - score(b.result)) || a.index - b.index).map(item => item.result);
}
