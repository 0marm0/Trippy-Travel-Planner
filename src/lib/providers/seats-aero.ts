import { ProviderError } from "./errors.ts";
import { fetchProviderJson, type FetchLike } from "./http.ts";
import { compactResult, integer, isRecord, money, number, records, safeProviderUrl, stableResultId, text } from "./normalize.ts";
import type { AwardFlightSearch, AwardHotelSearch, ProviderAdapter, ProviderHealth, ProviderResult, ProviderSearchRequest, ProviderSuccess } from "./types.ts";

const CACHED_FLIGHT_ENDPOINT = "https://seats.aero/partnerapi/search";
const LIVE_FLIGHT_ENDPOINT = "https://seats.aero/partnerapi/live";
const ROOMS_ENDPOINT = "https://rooms.aero/partnerapi/search";
const DEFAULT_TIMEOUT_MS = 20_000;
type SeatsFlightMode = "cached" | "live";

export function createSeatsAeroAdapter(options: {
  apiKey?: string;
  flightMode?: SeatsFlightMode;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
} = {}): ProviderAdapter {
  const apiKey = cleanSecret(options.apiKey);
  const flightMode = options.flightMode ?? "cached";
  const fetchImpl = options.fetchImpl;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    id: "seats-aero",
    configured: () => Boolean(apiKey),
    supports: (kind) => kind === "award-flight" || kind === "award-hotel",
    health: (): ProviderHealth => ({
      provider: "seats-aero",
      mode: "live",
      configured: Boolean(apiKey),
      capabilities: ["award-flight", "award-hotel"],
      limitations: [
        flightMode === "live"
          ? "Flight Live Search is explicitly enabled and requires a commercial agreement with Seats.aero; personal Pro keys are not eligible."
          : "Flight searches use Seats.aero Cached Search, which is available to eligible Pro users and is not a live airline query.",
        "Rooms.aero award-hotel search uses the same key but a separate daily quota and cached rates checked within the last 21 days.",
        "Program coverage, seat counts, taxes, trip detail, and cash comparisons vary by loyalty program.",
      ],
    }),
    async search(request: ProviderSearchRequest, signal?: AbortSignal): Promise<ProviderSuccess> {
      if (!apiKey) throw new ProviderError({ provider: "seats-aero", code: "not-configured", message: "Missing API key" });
      if (request.kind === "award-hotel") return searchAwardHotels({ request, apiKey, fetchImpl, timeoutMs, signal });
      if (request.kind !== "award-flight") {
        throw new ProviderError({ provider: "seats-aero", code: "not-supported", message: "Unsupported search kind" });
      }
      return flightMode === "live"
        ? searchLiveFlights({ request, apiKey, fetchImpl, timeoutMs, signal })
        : searchCachedFlights({ request, apiKey, fetchImpl, timeoutMs, signal });
    },
  };
}

type SearchOptions<T extends AwardFlightSearch | AwardHotelSearch> = {
  request: T;
  apiKey: string;
  fetchImpl?: FetchLike;
  timeoutMs: number;
  signal?: AbortSignal;
};

async function searchCachedFlights(options: SearchOptions<AwardFlightSearch>): Promise<ProviderSuccess> {
  const checkedAt = new Date().toISOString();
  const url = new URL(CACHED_FLIGHT_ENDPOINT);
  url.searchParams.set("origin_airport", options.request.origin);
  url.searchParams.set("destination_airport", options.request.destination);
  url.searchParams.set("start_date", options.request.departureDate);
  url.searchParams.set("end_date", options.request.departureDate);
  url.searchParams.set("sources", options.request.program);
  url.searchParams.set("take", "10");
  const root = requireObjectEnvelope(await seatsGet(options, url));
  const rows = records(root.data);
  const providerCheckedAt = latestTimestamp(rows, ["UpdatedAt", "updated_at", "Date", "date"]);
  return {
    provider: "seats-aero",
    mode: "live",
    status: "ok",
    freshness: { basis: "provider-cache", checkedAt, ...(providerCheckedAt ? { providerCheckedAt } : {}) },
    limitations: [
      "This is Seats.aero cached summary availability, not a live airline search or a hold.",
      "Each result summarizes a route, date, program, and cabin; flight-level itinerary details require a separate Get Trips lookup and are not inferred here.",
      "Some programs omit seat counts or taxes, and cached availability may have changed since retrieval.",
    ],
    results: rows.flatMap((row, index) => normalizeCachedAvailability(row, index, options.request)).slice(0, 40),
  };
}

async function searchLiveFlights(options: SearchOptions<AwardFlightSearch>): Promise<ProviderSuccess> {
  const checkedAt = new Date().toISOString();
  const { payload } = await fetchProviderJson({
    provider: "seats-aero",
    fetchImpl: options.fetchImpl,
    url: new URL(LIVE_FLIGHT_ENDPOINT),
    init: {
      method: "POST",
      headers: seatsHeaders(options.apiKey, true),
      body: JSON.stringify({
        origin_airport: options.request.origin,
        destination_airport: options.request.destination,
        departure_date: options.request.departureDate,
        source: options.request.program,
        seat_count: options.request.seats,
        smart_cache: true,
      }),
    },
    timeoutMs: options.timeoutMs,
    signal: options.signal,
  });
  const root = responseRoot(payload);
  const cached = root?.cached === true;
  const rows = Array.isArray(payload) ? records(payload) : records(root?.data ?? root?.results ?? root?.trips);
  const providerCheckedAt = latestTimestamp(rows, ["UpdatedAt", "updated_at"]);
  return {
    provider: "seats-aero",
    mode: "live",
    status: "ok",
    freshness: { basis: cached ? "provider-cache" : "live-request", checkedAt, ...(providerCheckedAt ? { providerCheckedAt } : {}) },
    limitations: [
      cached
        ? "Seats.aero returned its opt-in exact-query cached fallback after a live-search issue."
        : "Seats.aero reports a live provider search; availability must still be verified before transfer or purchase.",
      "Live Search requires a commercial agreement; this mode must not be enabled for a personal Pro key.",
      "Dynamic-price and mismatched-airport filters remain enabled; some expensive options may be omitted.",
    ],
    results: rows.slice(0, 50).map((row, index) => normalizeLiveTrip(row, index, options.request)),
  };
}

async function searchAwardHotels(options: SearchOptions<AwardHotelSearch>): Promise<ProviderSuccess> {
  const checkedAt = new Date().toISOString();
  const url = new URL(ROOMS_ENDPOINT);
  url.searchParams.set("location", options.request.location);
  url.searchParams.set("start_date", options.request.startDate);
  url.searchParams.set("end_date", options.request.endDate);
  url.searchParams.set("take", "50");
  if (options.request.nights !== undefined) url.searchParams.set("nights", String(options.request.nights));
  if (options.request.maxPoints !== undefined) url.searchParams.set("max_points", String(options.request.maxPoints));
  if (options.request.program) url.searchParams.set("source", options.request.program);
  const root = requireObjectEnvelope(await seatsGet(options, url));
  const rows = records(root.data);
  const providerCheckedAt = latestTimestamp(rows, ["last_checked_at"]);
  return {
    provider: "seats-aero",
    mode: "live",
    status: "ok",
    freshness: { basis: "provider-cache", checkedAt, ...(providerCheckedAt ? { providerCheckedAt } : {}) },
    limitations: [
      "Rooms.aero Search returns cached award availability retrieved within the last 21 days, not a live hotel-system quote or hold.",
      "Start and end dates bound possible check-in dates; they are not a fixed check-in/check-out pair unless nights is supplied.",
      "Cash comparison is included only when the loyalty program published it alongside the award rate; cash values are converted from minor currency units.",
    ],
    results: rows.flatMap((row, index) => normalizeAwardHotel(row, index, options.request, [options.apiKey])).slice(0, 100),
  };
}

async function seatsGet<T extends AwardFlightSearch | AwardHotelSearch>(options: SearchOptions<T>, url: URL): Promise<unknown> {
  const { payload } = await fetchProviderJson({
    provider: "seats-aero",
    fetchImpl: options.fetchImpl,
    url,
    init: { method: "GET", headers: seatsHeaders(options.apiKey) },
    timeoutMs: options.timeoutMs,
    signal: options.signal,
  });
  return payload;
}

function seatsHeaders(apiKey: string, json = false): Record<string, string> {
  return { Accept: "application/json", "Partner-Authorization": apiKey, ...(json ? { "Content-Type": "application/json" } : {}) };
}

function requireObjectEnvelope(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new ProviderError({ provider: "seats-aero", code: "invalid-response", message: "Expected object response" });
  }
  if (text(payload.error)) {
    throw new ProviderError({ provider: "seats-aero", code: "upstream-error", message: "Provider included an error", retryable: true });
  }
  return payload;
}

function responseRoot(payload: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(payload)) return undefined;
  return requireObjectEnvelope(payload);
}

const CABINS = [
  { code: "Y", name: "economy" },
  { code: "W", name: "premium-economy" },
  { code: "J", name: "business" },
  { code: "F", name: "first" },
] as const;

function normalizeCachedAvailability(row: Record<string, unknown>, index: number, request: AwardFlightSearch): ProviderResult[] {
  const route = isRecord(row.Route) ? row.Route : {};
  const origin = text(route.OriginAirport ?? row.OriginAirport, 10) ?? request.origin;
  const destination = text(route.DestinationAirport ?? row.DestinationAirport, 10) ?? request.destination;
  const source = text(row.Source ?? route.Source, 80) ?? request.program;
  const departureDate = text(row.Date ?? row.date, 20) ?? request.departureDate;
  return CABINS.flatMap(({ code, name }, cabinIndex) => {
    if (row[`${code}Available`] !== true) return [];
    const points = integer(row[`${code}MileageCost`]);
    const remainingSeats = integer(row[`${code}RemainingSeats`]);
    return [
      compactResult({
        id: stableResultId("seats-aero", "award-flight", index * 4 + cabinIndex, `${row.ID ?? "summary"}-${code}`),
        kind: "award-flight",
        title: `${origin} to ${destination}`,
        subtitle: `${source} · ${name} · ${departureDate}`,
        points: points !== undefined && points >= 0 ? points : undefined,
        stops: row[`${code}Direct`] === true ? 0 : undefined,
        details: {
          program: source,
          cabin: name,
          departureDate,
          summaryOnly: true,
          ...(remainingSeats !== undefined && remainingSeats > 0 ? { remainingSeats } : {}),
          ...(text(row[`${code}Airlines`], 120) ? { airlines: text(row[`${code}Airlines`], 120)! } : {}),
        },
      }),
    ];
  });
}

function normalizeLiveTrip(row: Record<string, unknown>, index: number, request: AwardFlightSearch): ProviderResult {
  const origin = text(row.OriginAirport ?? row.origin_airport, 10) ?? request.origin;
  const destination = text(row.DestinationAirport ?? row.destination_airport, 10) ?? request.destination;
  const cabin = text(row.Cabin ?? row.cabin, 40);
  const flightNumbers = text(row.FlightNumbers ?? row.flight_numbers, 120);
  const source = text(row.Source ?? row.source, 80) ?? request.program;
  const points = integer(row.MileageCost ?? row.mileage_cost ?? row.mileage);
  const remainingSeats = integer(row.RemainingSeats ?? row.remaining_seats);
  return compactResult({
    id: stableResultId("seats-aero", "award-flight", index, row.ID ?? row.id ?? `${source}-${flightNumbers}`),
    kind: "award-flight",
    title: `${origin} to ${destination}`,
    subtitle: [source, cabin, flightNumbers].filter(Boolean).join(" · ") || undefined,
    points: points !== undefined && points >= 0 ? points : undefined,
    durationMinutes: integer(row.TotalDuration ?? row.total_duration),
    stops: integer(row.Stops ?? row.stops),
    details: {
      program: source,
      ...(remainingSeats !== undefined && remainingSeats > 0 ? { remainingSeats } : {}),
      ...(text(row.DepartsAt ?? row.departs_at, 80) ? { departsAt: text(row.DepartsAt ?? row.departs_at, 80)! } : {}),
      ...(text(row.ArrivesAt ?? row.arrives_at, 80) ? { arrivesAt: text(row.ArrivesAt ?? row.arrives_at, 80)! } : {}),
      ...(number(row.TotalTaxes ?? row.total_taxes) !== undefined ? { taxesReportedMinorUnits: number(row.TotalTaxes ?? row.total_taxes)! } : {}),
      ...(text(row.TaxesCurrency ?? row.taxes_currency, 3) ? { taxesCurrency: text(row.TaxesCurrency ?? row.taxes_currency, 3)! } : {}),
    },
  });
}

function normalizeAwardHotel(row: Record<string, unknown>, index: number, request: AwardHotelSearch, forbiddenValues: readonly string[]): ProviderResult[] {
  const hotel = isRecord(row.hotel) ? row.hotel : {};
  const source = text(row.source ?? hotel.source, 80) ?? request.program ?? "program not reported";
  const title = text(hotel.name ?? row.hotel_name ?? row.name, 200) ?? "Unnamed award hotel";
  const bookingLink = isRecord(row.booking_link) ? row.booking_link : undefined;
  const currency = text(row.cash_currency_code ?? row.currency_code, 3)?.toUpperCase();
  return (["standard", "suite"] as const).flatMap((roomType, roomIndex) => {
    const available = row[`${roomType}_award_available`];
    const points = integer(row[`${roomType}_award_cost`]);
    if (available === false || (available !== true && (points === undefined || points <= 0))) return [];
    const cashMinor = integer(row[`${roomType}_cash_cost`]);
    return [
      compactResult({
        id: stableResultId("seats-aero", "award-hotel", index * 2 + roomIndex, `${row.id ?? hotel.id ?? title}-${roomType}`),
        kind: "award-hotel",
        title,
        subtitle: `${source} · ${roomType} award`,
        url: safeProviderUrl(bookingLink?.url ?? row.booking_url, forbiddenValues),
        points: points !== undefined && points > 0 ? points : undefined,
        price: cashMinor !== undefined && cashMinor >= 0 && currency ? money(cashMinor / 100, currency, "total") : undefined,
        coordinates:
          number(hotel.latitude) !== undefined && number(hotel.longitude) !== undefined
            ? { lat: number(hotel.latitude)!, lng: number(hotel.longitude)! }
            : undefined,
        details: {
          program: source,
          roomType,
          ...(text(row.arrival_date, 20) ? { checkIn: text(row.arrival_date, 20)! } : {}),
          ...(text(row.departure_date, 20) ? { checkOut: text(row.departure_date, 20)! } : {}),
          ...(integer(row.num_nights) ? { nights: integer(row.num_nights)! } : {}),
          ...(number(row[`${roomType}_cpp`]) ? { centsPerPoint: number(row[`${roomType}_cpp`])! } : {}),
          ...(text(hotel.brand, 80) ? { brand: text(hotel.brand, 80)! } : {}),
          ...(text(hotel.award_category, 40) ? { awardCategory: text(hotel.award_category, 40)! } : {}),
        },
      }),
    ];
  });
}

function latestTimestamp(rows: Record<string, unknown>[], keys: string[]): string | undefined {
  const timestamps = rows
    .flatMap((row) => keys.map((key) => text(row[key], 80)))
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((left, right) => right.getTime() - left.getTime());
  return timestamps[0]?.toISOString();
}

function cleanSecret(value: string | undefined): string | undefined {
  const secret = value?.trim();
  return secret && !/^your_.+_here$/i.test(secret) ? secret : undefined;
}
