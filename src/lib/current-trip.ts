import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BookingRecord, CityDayPlan, HotelOffer, MapPlace, TransportLeg, TransportOption, Trip2026Payload, TripActivity, TripHotel, TripStop } from "./trip-model";
import { applyAuthoritative2026Corrections } from "./authoritative-trip-corrections";

/* The importer reads the historical site's trusted, generated data bundle. Its
   shape is intentionally flexible because the upstream site is not typed. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
const LIVE_ORIGIN = "https://europe-trip-optimizer.omarmo.chatgpt.site";
const routeDates = [
  ["ring", "2026-09-22", "2026-09-24", "Germany", "DE"],
  ["wroclaw", "2026-09-24", "2026-09-27", "Poland", "PL"],
  ["krakow", "2026-09-27", "2026-09-30", "Poland", "PL"],
  ["brussels", "2026-09-30", "2026-10-03", "Belgium", "BE"],
  ["amsterdam", "2026-10-03", "2026-10-05", "Netherlands", "NL"],
  ["berlin", "2026-10-05", "2026-10-09", "Germany", "DE"],
  ["munich", "2026-10-09", "2026-10-12", "Germany", "DE"],
] as const;

const flags: Record<string, string> = { DE: "🇩🇪", PL: "🇵🇱", BE: "🇧🇪", NL: "🇳🇱" };
const cityFallbacks: Record<string, string> = {
  ring: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85",
  wroclaw: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Market_square%2C_Wroclaw.jpg?width=1600",
  krakow: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rynek_Glowny_Krakow.jpg?width=1600",
  brussels: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1600&q=85",
  amsterdam: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1600&q=85",
  berlin: "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1600&q=85",
  munich: "https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=1600&q=85",
};

const caches = new Map<"private" | "sample", Trip2026Payload>();

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function absoluteImage(value: string, city: string) {
  if (!value) return cityFallbacks[city] || cityFallbacks.berlin;
  return value.startsWith("/") ? `${LIVE_ORIGIN}${value}` : value;
}

function priority(value: string): TripActivity["priority"] {
  if (/must/i.test(value)) return "must";
  if (/should|worth/i.test(value)) return "should";
  return "could";
}

export async function loadCurrentTrip({ allowPrivate = false }: { allowPrivate?: boolean } = {}): Promise<Trip2026Payload> {
  const cacheKey = allowPrivate ? "private" : "sample";
  const cached = caches.get(cacheKey);
  if (cached) return cached;
  const configuredPath = process.env.TRIPPY_2026_DATA_PATH;
  const publicSample = join(process.cwd(), "examples", "trips", "2026-europe-sample.json");
  const candidates = allowPrivate
    ? configuredPath ? [configuredPath, publicSample] : [join(process.cwd(), ".private", "2026-trip.json"), publicSample]
    : [publicSample];
  let source = "";
  let dataMode: Trip2026Payload["dataMode"] = "sample";
  for (const candidate of candidates) {
    try {
      source = await readFile(candidate, "utf8");
      dataMode = candidate.includes(`${join("examples", "trips")}`) ? "sample" : "private";
      break;
    } catch {
      // Continue to the redacted public sample when no private workspace exists.
    }
  }
  if (!source) throw new Error("The 2026 trip dataset is unavailable.");
  const raw = applyAuthoritative2026Corrections(JSON.parse(source) as AnyRecord);
  const guide = raw.$r as AnyRecord;
  const imageOverrides = { ...(raw.ci || {}), ...(raw.li || {}) } as AnyRecord;
  const originalActivities = (guide.activities as AnyRecord[]).map((activity) => ({
    ...activity,
    url: activity.url || guide.cities?.[activity.city]?.url || "",
    category: activity.category || (/museum|gallery|palace|cathedral|castle|memorial/i.test(activity.title) ? "History & museums" : /food|market|beer|night/i.test(activity.title) ? "Food & evenings" : /BMW|car|circuit|lap/i.test(activity.title) ? "Automotive" : "Walks & scenery"),
  }));
  const activities: TripActivity[] = [...(raw.oi || []), ...(raw.si || []), ...originalActivities].map((activity: AnyRecord) => {
    const override = imageOverrides[activity.id] || {};
    return {
      id: activity.id,
      city: activity.city,
      title: activity.title,
      description: activity.description || "",
      details: activity.details || "",
      url: activity.url || "",
      category: activity.category || "Explore",
      priority: priority(activity.priority || "Could do"),
      image: absoluteImage(override.image || activity.image || "", activity.city),
      status: activity.status || "Planning option",
      lat: activity.lat,
      lng: activity.lon,
      closed: Boolean(activity.closed),
      fit: activity.fit,
      access: activity.access,
      imageSource: override.imageSource,
      imageCredit: override.imageCredit,
    };
  });

  const baseHotels = [...(raw.bi || []), ...(raw.Ci || [])] as AnyRecord[];
  const baseByName = new Map(baseHotels.map((hotel) => [hotel.name, hotel]));
  const providerBySlug = raw.Si || {};
  const offerByName = raw.Ii || {};
  const ratings = raw.Fi || {};
  const hotels: TripHotel[] = (raw.yi as AnyRecord[]).map((hotel) => {
    const base = baseByName.get(hotel.name) || {};
    const provider = providerBySlug[slug(hotel.name)] || {};
    const details = offerByName[hotel.name] || {};
    const rating = ratings[hotel.name] || [];
    const published = raw.Pi?.[hotel.city]?.[hotel.name];
    const offers: HotelOffer[] = [...(details.offers || [])];
    if (!offers.length && published) offers.push({ provider: "Booking.com", total: published, currency: "EUR", checkIn: "", checkOut: "", adults: 1, rooms: 1, checked: raw.X || "2026-09-07", url: provider.booking || "" });
    return {
      id: `${hotel.city}-${slug(hotel.name)}`,
      city: hotel.city,
      name: hotel.name,
      tier: hotel.tier,
      neighborhood: hotel.neighborhood,
      low: hotel.low,
      high: hotel.high,
      stars: hotel.stars,
      flags: hotel.flags || [],
      amenities: hotel.amenities || [],
      why: base.why || `${hotel.neighborhood}. A distinct full-hotel option for this itinerary.`,
      tradeoff: base.tradeoff || "Compare exact transit time and cancellation terms before booking.",
      rating: rating[0] ?? provider.rating,
      reviews: rating[1] ?? provider.reviews,
      lat: details.lat ?? provider.lat ?? base.lat,
      lng: details.lon ?? provider.lon ?? base.lon,
      images: (details.images?.length ? details.images : provider.image ? [provider.image] : [cityFallbacks[hotel.city]]).map((image: string) => absoluteImage(image, hotel.city)),
      offers,
      official: hotel.official || base.official,
    };
  });

  const cities = raw.U as AnyRecord;
  const stops: TripStop[] = routeDates.map(([id, checkIn, checkOut, country, code]) => {
    const city = cities[id];
    return { id, name: city.name, country, flag: flags[code], checkIn, checkOut, nights: Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000), lat: city.lat, lng: city.lon, stay: city.stay, hero: cityFallbacks[id] };
  });
  const legDates: Record<string, string> = { "frankfurt-ring": "2026-09-22", "ring-frankfurt": "2026-09-24", "frankfurt-wroclaw": "2026-09-24", "wroclaw-krakow": "2026-09-27", "krakow-brussels": "2026-09-30", "brussels-amsterdam": "2026-10-03", "amsterdam-berlin": "2026-10-05", "berlin-munich": "2026-10-09" };
  const legOrder = ["frankfurt-ring", "ring-frankfurt", "frankfurt-wroclaw", "wroclaw-krakow", "krakow-brussels", "brussels-amsterdam", "amsterdam-berlin", "berlin-munich"];
  const transport: TransportLeg[] = Object.values(raw._i as AnyRecord).filter((leg: AnyRecord) => legDates[leg.id]).map((leg: AnyRecord) => ({
    id: String(leg.id),
    from: String(leg.from),
    to: String(leg.to),
    date: legDates[String(leg.id)],
    recommend: String(leg.recommend),
    options: (leg.options as AnyRecord[]).map((option): TransportOption => ({
      id: String(option.id),
      mode: option.mode as TransportOption["mode"],
      name: String(option.name),
      ride: String(option.ride),
      door: String(option.door),
      hours: Number(option.hours),
      low: Number(option.low),
      high: Number(option.high),
      note: String(option.note),
      source: option.source,
      published: option.published,
      extra: option.extra,
    })),
  })).sort((left, right) => left.date.localeCompare(right.date) || legOrder.indexOf(left.id) - legOrder.indexOf(right.id));

  const payload: Trip2026Payload = {
    id: "europe-2026",
    dataMode,
    title: "2026 Europe Trip",
    subtitle: "Frankfurt in · Munich out",
    start: "2026-09-21",
    end: "2026-10-12",
    stops,
    activities,
    hotels,
    transport,
    cityPlans: raw.Sa as Record<string, CityDayPlan[]>,
    dayAnchors: raw.Ta,
    mapPlaces: Object.fromEntries(Object.entries(raw.Aa as AnyRecord).map(([city, places]) => [city, (places as AnyRecord[]).map((place): MapPlace => ({
      id: String(place.id),
      title: String(place.title),
      detail: String(place.detail || ""),
      lat: Number(place.lat),
      lng: Number(place.lng ?? place.lon),
      layer: place.layer as MapPlace["layer"],
    }))])),
    clusterGuidance: raw.Oa,
    bookings: raw.$a as BookingRecord[],
  };
  caches.set(cacheKey, payload);
  return payload;
}
