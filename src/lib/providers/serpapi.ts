import { ProviderError } from "./errors.ts";
import { fetchProviderJson, type FetchLike } from "./http.ts";
import { compactResult, integer, isRecord, money, number, records, safeProviderUrl, stableResultId, text } from "./normalize.ts";
import type {
  CashFlightSearch,
  HotelSearch,
  PlaceSearch,
  ProviderAdapter,
  ProviderHealth,
  ProviderResult,
  ProviderSearchRequest,
  ProviderSuccess,
  ResearchSearch,
  SearchKind,
} from "./types.ts";

const ENDPOINT = "https://serpapi.com/search.json";
const CAPABILITIES: SearchKind[] = ["cash-flight", "hotel", "place", "research"];
const DEFAULT_TIMEOUT_MS = 15_000;

export function createSerpApiAdapter(options: {
  apiKey?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
} = {}): ProviderAdapter {
  const apiKey = cleanSecret(options.apiKey);

  return {
    id: "serpapi",
    configured: () => Boolean(apiKey),
    supports: (kind) => CAPABILITIES.includes(kind),
    health: (): ProviderHealth => ({
      provider: "serpapi",
      mode: "live",
      configured: Boolean(apiKey),
      capabilities: CAPABILITIES,
      limitations: [
        "Searches may use SerpAPI's cache, which normally expires after one hour.",
        "Results are research leads and quotes, not inventory holds or confirmations.",
      ],
    }),
    async search(request, signal): Promise<ProviderSuccess> {
      if (!apiKey) {
        throw new ProviderError({ provider: "serpapi", code: "not-configured", message: "Missing API key" });
      }
      if (!CAPABILITIES.includes(request.kind)) {
        throw new ProviderError({ provider: "serpapi", code: "not-supported", message: "Unsupported search kind" });
      }

      const url = buildUrl(request, apiKey);
      const startedAt = new Date().toISOString();
      const { payload } = await fetchProviderJson({
        provider: "serpapi",
        fetchImpl: options.fetchImpl,
        url,
        timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        signal,
      });
      const root = requirePayload(payload);
      const providerCheckedAt = providerTimestamp(root);
      const results = normalize(request, root, [apiKey]);

      return {
        provider: "serpapi",
        mode: "live",
        status: "ok",
        freshness: {
          basis: "provider-cache",
          checkedAt: startedAt,
          ...(providerCheckedAt ? { providerCheckedAt } : {}),
        },
        limitations: [
          "SerpAPI may serve an identical cached search for up to approximately one hour.",
          "Prices and availability can change; verify with the selling provider before purchase.",
          "Returned links are allowlisted for HTTPS and stripped entirely if they contain credential-like query fields.",
        ],
        results: results.slice(0, 20),
      };
    },
  };
}

function buildUrl(request: ProviderSearchRequest, apiKey: string): URL {
  const url = new URL(ENDPOINT);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("output", "json");
  url.searchParams.set("hl", "en");

  switch (request.kind) {
    case "cash-flight":
      addFlightParams(url, request);
      break;
    case "hotel":
      addHotelParams(url, request);
      break;
    case "place":
      addPlaceParams(url, request);
      break;
    case "research":
      addResearchParams(url, request);
      break;
    default:
      throw new ProviderError({ provider: "serpapi", code: "not-supported", message: "Unsupported search kind" });
  }
  return url;
}

function addFlightParams(url: URL, request: CashFlightSearch): void {
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("departure_id", request.origin);
  url.searchParams.set("arrival_id", request.destination);
  url.searchParams.set("outbound_date", request.departureDate);
  url.searchParams.set("type", request.returnDate ? "1" : "2");
  if (request.returnDate) url.searchParams.set("return_date", request.returnDate);
  url.searchParams.set("adults", String(request.adults));
  url.searchParams.set("travel_class", String({ economy: 1, "premium-economy": 2, business: 3, first: 4 }[request.cabin]));
  url.searchParams.set("currency", request.currency);
}

function addHotelParams(url: URL, request: HotelSearch): void {
  url.searchParams.set("engine", "google_hotels");
  url.searchParams.set("q", request.destination);
  url.searchParams.set("check_in_date", request.checkIn);
  url.searchParams.set("check_out_date", request.checkOut);
  url.searchParams.set("adults", String(request.adults));
  url.searchParams.set("currency", request.currency);
}

function addPlaceParams(url: URL, request: PlaceSearch): void {
  url.searchParams.set("engine", "google_maps");
  url.searchParams.set("type", "search");
  url.searchParams.set("q", request.location ? `${request.query} in ${request.location}` : request.query);
}

function addResearchParams(url: URL, request: ResearchSearch): void {
  url.searchParams.set("engine", "google");
  url.searchParams.set("safe", "active");
  url.searchParams.set("q", request.location ? `${request.query} ${request.location}` : request.query);
}

function requirePayload(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new ProviderError({ provider: "serpapi", code: "invalid-response", message: "Expected object response" });
  }
  if (text(payload.error)) {
    throw new ProviderError({ provider: "serpapi", code: "upstream-error", message: "Provider included an error", retryable: true });
  }
  return payload;
}

function normalize(request: ProviderSearchRequest, root: Record<string, unknown>, forbiddenValues: readonly string[]): ProviderResult[] {
  switch (request.kind) {
    case "cash-flight":
      return normalizeFlights(root, request.currency, forbiddenValues);
    case "hotel":
      return normalizeHotels(root, request.currency, forbiddenValues);
    case "place":
      return normalizePlaces(root, forbiddenValues);
    case "research":
      return normalizeResearch(root, forbiddenValues);
    default:
      return [];
  }
}

function normalizeFlights(root: Record<string, unknown>, currency: string, forbiddenValues: readonly string[]): ProviderResult[] {
  return [...records(root.best_flights), ...records(root.other_flights)].map((flight, index) => {
    const segments = records(flight.flights);
    const first = segments.at(0);
    const last = segments.at(-1);
    const departure = isRecord(first?.departure_airport) ? first.departure_airport : undefined;
    const arrival = isRecord(last?.arrival_airport) ? last.arrival_airport : undefined;
    const origin = text(departure?.id, 10) ?? "Origin";
    const destination = text(arrival?.id, 10) ?? "destination";
    const airlines = [...new Set(segments.map((segment) => text(segment.airline, 80)).filter((value): value is string => Boolean(value)))];
    const bookingUrl = safeProviderUrl(flight.booking_link ?? flight.link, forbiddenValues);
    const durationMinutes = integer(flight.total_duration);
    return compactResult({
      id: stableResultId("serpapi", "cash-flight", index, flight.departure_token ?? `${origin}-${destination}`),
      kind: "cash-flight",
      title: `${origin} to ${destination}`,
      subtitle: airlines.join(", ") || undefined,
      url: bookingUrl,
      price: money(flight.price, currency, "ticket"),
      durationMinutes,
      stops: Math.max(segments.length - 1, 0),
      details: {
        segmentCount: segments.length,
        ...(text(departure?.time, 60) ? { departsAt: text(departure?.time, 60)! } : {}),
        ...(text(arrival?.time, 60) ? { arrivesAt: text(arrival?.time, 60)! } : {}),
      },
    });
  });
}

function normalizeHotels(root: Record<string, unknown>, currency: string, forbiddenValues: readonly string[]): ProviderResult[] {
  return records(root.properties).map((property, index) => {
    const rate = isRecord(property.rate_per_night) ? property.rate_per_night : {};
    const total = isRecord(property.total_rate) ? property.total_rate : {};
    const coordinates = isRecord(property.gps_coordinates) ? property.gps_coordinates : undefined;
    const lat = number(coordinates?.latitude);
    const lng = number(coordinates?.longitude);
    return compactResult({
      id: stableResultId("serpapi", "hotel", index, property.property_token ?? property.name),
      kind: "hotel",
      title: text(property.name, 200) ?? "Unnamed property",
      subtitle: text(property.type, 80),
      url: safeProviderUrl(property.link ?? property.booking_link ?? property.google_hotels_link, forbiddenValues),
      price:
        money(rate.extracted_lowest, currency, "night", rate.lowest) ??
        money(total.extracted_lowest, currency, "total", total.lowest),
      rating: number(property.overall_rating),
      reviewCount: integer(property.reviews),
      coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
      details: {
        ...(Array.isArray(property.amenities)
          ? { amenities: property.amenities.map((item) => text(item, 80)).filter((item): item is string => Boolean(item)).slice(0, 12) }
          : {}),
      },
    });
  });
}

function normalizePlaces(root: Record<string, unknown>, forbiddenValues: readonly string[]): ProviderResult[] {
  return records(root.local_results).map((place, index) => {
    const coordinates = isRecord(place.gps_coordinates) ? place.gps_coordinates : undefined;
    const lat = number(coordinates?.latitude);
    const lng = number(coordinates?.longitude);
    return compactResult({
      id: stableResultId("serpapi", "place", index, place.data_id ?? place.place_id ?? place.title),
      kind: "place",
      title: text(place.title, 200) ?? "Unnamed place",
      subtitle: text(place.address, 300) ?? text(place.type, 100),
      url: safeProviderUrl(place.website ?? place.link, forbiddenValues),
      rating: number(place.rating),
      reviewCount: integer(place.reviews),
      coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
      details: {
        ...(text(place.type, 100) ? { type: text(place.type, 100)! } : {}),
        ...(text(place.price, 40) ? { priceLabel: text(place.price, 40)! } : {}),
      },
    });
  });
}

function normalizeResearch(root: Record<string, unknown>, forbiddenValues: readonly string[]): ProviderResult[] {
  return records(root.organic_results).map((result, index) =>
    compactResult({
      id: stableResultId("serpapi", "research", index, result.position ?? result.link ?? result.title),
      kind: "research",
      title: text(result.title, 240) ?? "Untitled result",
      subtitle: text(result.snippet, 600),
      url: safeProviderUrl(result.link, forbiddenValues),
      details: { ...(integer(result.position) ? { position: integer(result.position)! } : {}) },
    }),
  );
}

function providerTimestamp(root: Record<string, unknown>): string | undefined {
  const metadata = isRecord(root.search_metadata) ? root.search_metadata : undefined;
  const value = text(metadata?.processed_at ?? metadata?.created_at, 80);
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function cleanSecret(value: string | undefined): string | undefined {
  const secret = value?.trim();
  return secret && !/^your_.+_here$/i.test(secret) ? secret : undefined;
}
