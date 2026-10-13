import { isLoopbackRequest } from "@/lib/private-itinerary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  Vary: "Host",
};
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const MAX_QUERY_LENGTH = 200;
const MAX_CITY_LENGTH = 120;
const MAX_CACHE_ENTRIES = 50;
const MIN_REQUEST_INTERVAL_MS = 1_000;

type NominatimPlace = {
  place_id?: number | string;
  osm_type?: string;
  osm_id?: number | string;
  name?: string;
  display_name?: string;
  lat?: string | number;
  lon?: string | number;
  category?: string;
  type?: string;
};

type PlaceResult = {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  category: string;
};

const processCache = new Map<string, PlaceResult[]>();
let requestQueue: Promise<void> = Promise.resolve();
let lastRequestStartedAt = 0;

export async function GET(request: Request): Promise<Response> {
  if (!isLoopbackRequest(request)) {
    return Response.json({ error: "Not found" }, { status: 404, headers: PRIVATE_HEADERS });
  }

  const url = new URL(request.url);
  const q = readSearchInput(url.searchParams.get("q"), MAX_QUERY_LENGTH);
  const city = readSearchInput(url.searchParams.get("city"), MAX_CITY_LENGTH, true);

  if (!q || city === null) {
    return Response.json({ error: "Provide a valid place query" }, { status: 400, headers: PRIVATE_HEADERS });
  }

  const cacheKey = `${q.toLowerCase()}\u0000${city.toLowerCase()}`;
  const cached = processCache.get(cacheKey);
  if (cached) {
    return Response.json({ places: cached }, { headers: PRIVATE_HEADERS });
  }

  try {
    const places = await runOneAtATime(async () => {
      // A concurrent identical lookup may have completed while this request waited.
      const queuedCache = processCache.get(cacheKey);
      if (queuedCache) return queuedCache;

      const params = new URLSearchParams({
        q: city ? `${q}, ${city}` : q,
        format: "jsonv2",
        limit: "5",
        addressdetails: "1",
      });
      const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": nominatimUserAgent(),
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        throw new Error("Nominatim search failed");
      }

      const payload: unknown = await response.json();
      const normalized = normalizePlaces(payload);
      remember(cacheKey, normalized);
      return normalized;
    });

    return Response.json({ places }, { headers: PRIVATE_HEADERS });
  } catch {
    // Provider details and the submitted location stay out of HTTP error responses.
    return Response.json({ error: "Place search is temporarily unavailable" }, { status: 503, headers: PRIVATE_HEADERS });
  }
}

function readSearchInput(value: string | null, maxLength: number, optional = false): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized && optional) return "";
  if (!normalized || normalized.length > maxLength || /[\u0000-\u001F\u007F]/.test(normalized)) return null;
  return normalized;
}

function nominatimUserAgent(): string {
  const contact = process.env.TRIPPY_CONTACT_EMAIL?.trim();
  return contact
    ? `Trippy-Travel-Planner/0.1 (local user-initiated geocoding; contact: ${contact})`
    : "Trippy-Travel-Planner/0.1 (local user-initiated geocoding)";
}

async function runOneAtATime<T>(operation: () => Promise<T>): Promise<T> {
  let releaseQueue: () => void = () => undefined;
  const previous = requestQueue;
  requestQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previous;
  try {
    const waitMs = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestStartedAt);
    if (waitMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    }
    lastRequestStartedAt = Date.now();
    return await operation();
  } finally {
    releaseQueue();
  }
}

function remember(key: string, places: PlaceResult[]): void {
  if (processCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = processCache.keys().next().value;
    if (oldestKey) processCache.delete(oldestKey);
  }
  processCache.set(key, places);
}

function normalizePlaces(payload: unknown): PlaceResult[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((entry) => normalizePlace(entry));
}

function normalizePlace(value: unknown): PlaceResult[] {
  if (!isRecord(value)) return [];
  const place = value as NominatimPlace;
  const id = placeId(place);
  const displayName = safeText(place.display_name, 500);
  const lat = finiteCoordinate(place.lat, -90, 90);
  const lng = finiteCoordinate(place.lon, -180, 180);
  if (!id || !displayName || lat === null || lng === null) return [];

  const name = safeText(place.name, 160) || displayName.split(",", 1)[0]?.trim() || displayName;
  const category = safeText(place.category, 80) || safeText(place.type, 80) || "unknown";
  return [{ id, name, displayName, lat, lng, category }];
}

function placeId(place: NominatimPlace): string | null {
  const placeId = safeText(place.place_id, 120);
  if (placeId) return placeId;
  const osmType = safeText(place.osm_type, 30);
  const osmId = safeText(place.osm_id, 90);
  return osmType && osmId ? `${osmType}:${osmId}` : null;
}

function finiteCoordinate(value: unknown, min: number, max: number): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function safeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, maxLength);
  return text || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
