import { SEARCH_KINDS, type ProviderId, type ProviderSearchRequest, type SearchKind } from "./types.ts";

const PROVIDER_IDS: ProviderId[] = [
  "serpapi",
  "seats-aero",
  "booking-com",
  "expedia",
  "trivago",
  "priceline",
  "tripadvisor",
  "seats-aero-manual",
];
const PROVIDER_CAPABILITIES: Record<ProviderId, SearchKind[]> = {
  serpapi: ["cash-flight", "hotel", "place", "research"],
  "seats-aero": ["award-flight", "award-hotel"],
  "booking-com": ["hotel"],
  expedia: ["cash-flight", "hotel"],
  trivago: ["hotel"],
  priceline: ["cash-flight", "hotel"],
  tripadvisor: ["hotel", "place", "research"],
  "seats-aero-manual": ["award-flight", "award-hotel"],
};
const COMMON_KEYS = ["kind", "providers"];
const KEYS: Record<SearchKind, string[]> = {
  "cash-flight": [...COMMON_KEYS, "origin", "destination", "departureDate", "returnDate", "adults", "cabin", "currency"],
  "award-flight": [...COMMON_KEYS, "origin", "destination", "departureDate", "seats", "program"],
  hotel: [...COMMON_KEYS, "destination", "checkIn", "checkOut", "adults", "rooms", "currency", "bookingCityId", "bookerCountry"],
  "award-hotel": [...COMMON_KEYS, "location", "startDate", "endDate", "nights", "maxPoints", "program"],
  place: [...COMMON_KEYS, "query", "location"],
  research: [...COMMON_KEYS, "query", "location"],
};

export class ProviderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderValidationError";
  }
}

export function parseProviderSearchRequest(value: unknown): ProviderSearchRequest {
  const input = record(value);
  const kind = enumValue(input.kind, SEARCH_KINDS, "kind");
  rejectUnknownKeys(input, KEYS[kind]);
  const providers = parseProviders(input.providers, kind);
  const base = providers ? { providers } : {};

  switch (kind) {
    case "cash-flight": {
      const departureDate = date(input.departureDate, "departureDate");
      const returnDate = optionalDate(input.returnDate, "returnDate");
      if (returnDate && returnDate < departureDate) fail("returnDate must be on or after departureDate");
      return {
        ...base,
        kind,
        origin: airport(input.origin, "origin"),
        destination: airport(input.destination, "destination"),
        departureDate,
        ...(returnDate ? { returnDate } : {}),
        adults: intRange(input.adults, 1, 9, "adults"),
        cabin: enumValue(input.cabin, ["economy", "premium-economy", "business", "first"] as const, "cabin"),
        currency: currency(input.currency),
      };
    }
    case "award-flight":
      return {
        ...base,
        kind,
        origin: airport(input.origin, "origin"),
        destination: airport(input.destination, "destination"),
        departureDate: date(input.departureDate, "departureDate"),
        seats: intRange(input.seats, 1, 9, "seats"),
        program: patternString(input.program, /^[a-z0-9][a-z0-9-]{0,49}$/, "program"),
      };
    case "hotel": {
      const checkIn = date(input.checkIn, "checkIn");
      const checkOut = date(input.checkOut, "checkOut");
      if (checkOut <= checkIn) fail("checkOut must be after checkIn");
      const adults = intRange(input.adults, 1, 30, "adults");
      const rooms = intRange(input.rooms, 1, 9, "rooms");
      if (rooms > adults) fail("rooms cannot exceed adults");
      const bookingCityId = optionalInteger(input.bookingCityId, "bookingCityId");
      const bookerCountry = optionalPatternString(input.bookerCountry, /^[a-z]{2}$/, "bookerCountry");
      if ((bookingCityId === undefined) !== (bookerCountry === undefined)) {
        fail("bookingCityId and bookerCountry must be provided together");
      }
      if (providers?.includes("booking-com") && bookingCityId === undefined) {
        fail("booking-com searches require bookingCityId and bookerCountry");
      }
      return {
        ...base,
        kind,
        destination: boundedString(input.destination, 1, 160, "destination"),
        checkIn,
        checkOut,
        adults,
        rooms,
        currency: currency(input.currency),
        ...(bookingCityId === undefined ? {} : { bookingCityId, bookerCountry: bookerCountry! }),
      };
    }
    case "award-hotel": {
      const startDate = date(input.startDate, "startDate");
      const endDate = date(input.endDate, "endDate");
      if (endDate < startDate) fail("endDate must be on or after startDate");
      return {
        ...base,
        kind,
        location: boundedString(input.location, 1, 160, "location"),
        startDate,
        endDate,
        ...(input.nights === undefined ? {} : { nights: intRange(input.nights, 1, 5, "nights") }),
        ...(input.maxPoints === undefined ? {} : { maxPoints: intRange(input.maxPoints, 1, 10_000_000, "maxPoints") }),
        ...(input.program === undefined
          ? {}
          : { program: patternString(input.program, /^[a-z0-9][a-z0-9-]{0,49}(?:,[a-z0-9][a-z0-9-]{0,49}){0,6}$/, "program") }),
      };
    }
    case "place":
    case "research":
      return {
        ...base,
        kind,
        query: boundedString(input.query, 1, 300, "query"),
        ...(input.location === undefined ? {} : { location: boundedString(input.location, 1, 160, "location") }),
      };
  }
}

function parseProviders(value: unknown, kind: SearchKind): ProviderId[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length < 1 || value.length > PROVIDER_IDS.length) fail("providers must be a non-empty provider ID array");
  const providers = value.map((item) => enumValue(item, PROVIDER_IDS, "providers"));
  if (new Set(providers).size !== providers.length) fail("providers must not contain duplicates");
  const unsupported = providers.find((provider) => !PROVIDER_CAPABILITIES[provider].includes(kind));
  if (unsupported) fail(`${unsupported} does not support ${kind}`);
  return providers;
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail("Request body must be a JSON object");
  return value as Record<string, unknown>;
}

function rejectUnknownKeys(input: Record<string, unknown>, allowed: string[]): void {
  const unknown = Object.keys(input).find((key) => !allowed.includes(key));
  if (unknown) fail("Request contains an unknown field");
}

function boundedString(value: unknown, min: number, max: number, name: string): string {
  if (typeof value !== "string") fail(`${name} must be a string`);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < min || normalized.length > max || /[\u0000-\u001F\u007F]/.test(value)) {
    fail(`${name} is invalid`);
  }
  return normalized;
}

function patternString(value: unknown, pattern: RegExp, name: string): string {
  const normalized = boundedString(value, 1, 160, name);
  if (!pattern.test(normalized)) fail(`${name} is invalid`);
  return normalized;
}

function optionalPatternString(value: unknown, pattern: RegExp, name: string): string | undefined {
  return value === undefined ? undefined : patternString(value, pattern, name);
}

function airport(value: unknown, name: string): string {
  return patternString(value, /^[A-Z]{3}(?:,[A-Z]{3}){0,4}$/, name);
}

function currency(value: unknown): string {
  return patternString(value, /^[A-Z]{3}$/, "currency");
}

function date(value: unknown, name: string): string {
  const normalized = patternString(value, /^\d{4}-\d{2}-\d{2}$/, name);
  const parsed = new Date(`${normalized}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) fail(`${name} is not a real calendar date`);
  return normalized;
}

function optionalDate(value: unknown, name: string): string | undefined {
  return value === undefined ? undefined : date(value, name);
}

function intRange(value: unknown, min: number, max: number, name: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    fail(`${name} must be an integer from ${min} to ${max}`);
  }
  return value;
}

function optionalInteger(value: unknown, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value === 0) fail(`${name} must be a non-zero integer`);
  return value;
}

function enumValue<const T extends readonly string[]>(value: unknown, allowed: T, name: string): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) fail(`${name} must be one of: ${allowed.join(", ")}`);
  return value as T[number];
}

function fail(message: string): never {
  throw new ProviderValidationError(message);
}
