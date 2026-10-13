import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "../../schema/trip.schema.json" with { type: "json" };

export type NormalizedTrip = {
  schemaVersion: 1;
  id: string;
  name: string;
  status: string;
  dateWindow: { earliestDeparture: string; latestReturn: string; flexDays: number };
  travelers: { adults: number; childrenAges: number[] };
  origins: Array<{ kind: "airport" | "station" | "city"; code: string }>;
  destinations: Array<{ id: string; name: string; priority: "required" | "optional" | "curious"; minimumNights?: number; maximumNights?: number }>;
  preferences: { pace: "relaxed" | "balanced" | "packed"; directFlightBias: number; hotelLocationBias: number; activityThemes: string[]; currency?: string; pointValuations?: Record<string, number> };
  anchors: Array<{ id: string; date: string; label: string; locked: boolean; placeId?: string }>;
  routeCandidates: Array<{ id: string; label: string; status: string; placeOrder: string[]; score?: number; scoreReasons?: string[] }>;
  bookings: Array<{ id: string; kind: string; status: string; startAt: string; endAt: string; provider?: string }>;
};

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);
const privateText = /https?:\/\/|\bBearer\s+[a-z0-9_.~+\/-]{12,}|\b\d{9,}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|mail\.google\.com|mailto[:]|\b(?:confirmation|booking|reservation|record)\s*(?:number|code|reference|ref|locator)\s*[:#-]?\s*[a-z0-9-]{4,}|\b(?:seat|pnr|loyalty id)\s*[:#-]?\s*[a-z0-9-]{2,}|\b(?:sk-|ghp_|github_pat_|AIza|ya29\.)[a-z0-9_-]{12,}/i;

function safeErrorPath(path: string): string {
  return path.split("/").map((part) => /^[a-z0-9_-]{0,64}$/i.test(part) && !privateText.test(part) ? part : "[field]").join("/") || "/";
}

/** Schema + relationships + private-data boundary. Errors never echo values. */
export function validateNormalizedTrip(value: unknown): string[] {
  if (!validateSchema(value)) return (validateSchema.errors || []).map((error) => `${safeErrorPath(error.instancePath)}: ${error.keyword} constraint failed`);
  const trip = value as NormalizedTrip;
  const errors: string[] = [];
  const { earliestDeparture: start, latestReturn: end } = trip.dateWindow;
  if (start >= end) errors.push("/dateWindow: return must be after departure");
  const nights = (Date.parse(end) - Date.parse(start)) / 86400000;
  if (nights > 365) errors.push("/dateWindow: planning window must be at most 365 nights");
  const places = new Set(trip.destinations.map((item) => item.id));
  if (places.size !== trip.destinations.length) errors.push("/destinations: IDs must be unique");
  for (const collection of ["anchors", "routeCandidates", "bookings"] as const) {
    if (new Set(trip[collection].map((item) => item.id)).size !== trip[collection].length) errors.push(`/${collection}: IDs must be unique`);
  }
  for (const [index, place] of trip.destinations.entries()) {
    if (place.minimumNights !== undefined && place.maximumNights !== undefined && place.minimumNights > place.maximumNights) errors.push(`/destinations/${index}: minimum nights exceed maximum`);
  }
  const requiredMinimum = trip.destinations.filter((item) => item.priority === "required").reduce((sum, item) => sum + (item.minimumNights || 0), 0);
  if (requiredMinimum > nights) errors.push("/destinations: required minimum nights exceed date window");
  for (const [index, route] of trip.routeCandidates.entries()) {
    if (!route.placeOrder.length || route.placeOrder.some((id) => !places.has(id)) || new Set(route.placeOrder).size !== route.placeOrder.length) errors.push(`/routeCandidates/${index}/placeOrder: use unique known destinations`);
    if (trip.destinations.some((item) => item.priority === "required" && !route.placeOrder.includes(item.id))) errors.push(`/routeCandidates/${index}: required destination missing`);
    if (trip.anchors.some((anchor) => anchor.locked && anchor.placeId && !route.placeOrder.includes(anchor.placeId))) errors.push(`/routeCandidates/${index}: locked anchor destination missing`);
  }
  for (const [index, anchor] of trip.anchors.entries()) {
    if (anchor.date < start || anchor.date > end || (anchor.placeId && !places.has(anchor.placeId))) errors.push(`/anchors/${index}: outside window or unknown destination`);
  }
  for (const [index, booking] of trip.bookings.entries()) {
    if (Date.parse(booking.endAt) < Date.parse(booking.startAt)) errors.push(`/bookings/${index}: end precedes start`);
  }
  function inspect(item: unknown, path: string) {
    if (typeof item === "string" && privateText.test(item)) errors.push(`${path}: private identifier or credential-shaped text is forbidden`);
    if (Array.isArray(item)) item.forEach((child, index) => inspect(child, `${path}/${index}`));
    else if (item && typeof item === "object") Object.entries(item).forEach(([key, child]) => {
      if (privateText.test(key)) errors.push(`${path}: private identifier in field name is forbidden`);
      inspect(child, `${path}/${safeErrorPath(key)}`);
    });
  }
  inspect(trip, "");
  return errors;
}

export function tripSlug(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "my-trip";
}

export function createNormalizedTrip(input: { name: string; start: string; end: string; cities: string[]; origins: string[]; adults: number; pace: NormalizedTrip["preferences"]["pace"]; flexDays: number; themes: string[] }): NormalizedTrip {
  return {
    schemaVersion: 1, id: tripSlug(input.name), name: input.name.trim(), status: "planning",
    dateWindow: { earliestDeparture: input.start, latestReturn: input.end, flexDays: input.flexDays },
    travelers: { adults: input.adults, childrenAges: [] },
    origins: input.origins.map((code) => ({ kind: "airport", code: code.trim().toUpperCase() })),
    destinations: input.cities.map((name, index) => ({ id: `${tripSlug(name).slice(0, 58)}-${index + 1}`, name: name.trim(), priority: "required" })),
    preferences: { pace: input.pace, directFlightBias: 0.5, hotelLocationBias: 0.5, activityThemes: [...new Set(input.themes)], currency: "USD", pointValuations: {} },
    anchors: [], routeCandidates: [], bookings: [],
  };
}

export function agentTripBrief(trip: NormalizedTrip): string {
  return `Help me plan ${trip.name} using Trippy's AGENTS.md and docs/AGENT_WORKFLOWS.md.\nDates: ${trip.dateWindow.earliestDeparture} to ${trip.dateWindow.latestReturn}; flexibility: ${trip.dateWindow.flexDays} days.\nTravelers: ${trip.travelers.adults} adults; child ages: ${trip.travelers.childrenAges.join(", ") || "none recorded"}.\nOrigins: ${trip.origins.map((item) => item.code).join(", ")}.\nCities: ${trip.destinations.map((item) => `${item.name} (${item.priority})`).join(", ")}.\nPace: ${trip.preferences.pace}; interests: ${trip.preferences.activityThemes.join(", ") || "not specified"}.\nAsk one compact batch for trip length within the window, fixed anchors, city flexibility, budget/cabin, points balances/transfer rules/valuations, passport and visa needs without document numbers, accessibility, luggage, rail/car, overnight/connection tolerance, cancellations, must-dos and rejections. Record unknowns and hard constraints.\nBuild at least three materially different multi-city route candidates BEFORE price research; if constraints make that impossible, explain and ask instead of fabricating variants. Do not infer confirmation. Quotes need sources, timestamps and cash/points fee assumptions.\nSample/manual mode works without keys. Ask which installed connectors I have and obtain consent before any private access or live paid research. My API keys stay only in .env.local or my own hosting secret manager; never ask me to paste values.\nI have not authorized email/file/calendar access, bookings, deployment or publication. Preview normalized changes before any import write or booking-state change.\nNormalized trip JSON:\n${JSON.stringify(trip, null, 2)}`;
}
