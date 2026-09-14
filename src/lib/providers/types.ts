export const SEARCH_KINDS = ["cash-flight", "award-flight", "hotel", "award-hotel", "place", "research"] as const;

export type SearchKind = (typeof SEARCH_KINDS)[number];
export type LiveProviderId = "serpapi" | "seats-aero" | "booking-com";
export type ManualProviderId = "expedia" | "trivago" | "priceline" | "tripadvisor" | "seats-aero-manual";
export type ProviderId = LiveProviderId | ManualProviderId;

export type ProviderErrorCode =
  | "access-locked"
  | "not-configured"
  | "not-supported"
  | "invalid-request"
  | "authentication"
  | "rate-limited"
  | "timeout"
  | "upstream-error"
  | "invalid-response";

export type Money = {
  amount: number;
  currency: string;
  unit: "total" | "night" | "ticket" | "unknown";
  display?: string;
};

export type ProviderResult = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  url?: string;
  price?: Money;
  points?: number;
  rating?: number;
  reviewCount?: number;
  durationMinutes?: number;
  stops?: number;
  coordinates?: { lat: number; lng: number };
  details?: Record<string, string | number | boolean | string[]>;
};

export type Freshness = {
  basis: "live-request" | "provider-cache" | "manual" | "unknown";
  checkedAt: string;
  providerCheckedAt?: string;
};

export type ProviderSuccess = {
  provider: ProviderId;
  mode: "live" | "manual";
  status: "ok";
  freshness: Freshness;
  limitations: string[];
  results: ProviderResult[];
};

export type ProviderFailure = {
  provider: ProviderId;
  mode: "live";
  status: "error" | "unconfigured" | "locked";
  checkedAt: string;
  limitations: string[];
  error: {
    code: ProviderErrorCode;
    message: string;
    retryable: boolean;
    retryAfterSeconds?: number;
  };
};

export type ProviderOutcome = ProviderSuccess | ProviderFailure;

type BaseSearch = {
  providers?: ProviderId[];
};

export type CashFlightSearch = BaseSearch & {
  kind: "cash-flight";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabin: "economy" | "premium-economy" | "business" | "first";
  currency: string;
};

export type AwardFlightSearch = BaseSearch & {
  kind: "award-flight";
  origin: string;
  destination: string;
  departureDate: string;
  seats: number;
  program: string;
};

export type HotelSearch = BaseSearch & {
  kind: "hotel";
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  currency: string;
  bookingCityId?: number;
  bookerCountry?: string;
};

export type AwardHotelSearch = BaseSearch & {
  kind: "award-hotel";
  location: string;
  startDate: string;
  endDate: string;
  nights?: number;
  maxPoints?: number;
  program?: string;
};

export type PlaceSearch = BaseSearch & {
  kind: "place";
  query: string;
  location?: string;
};

export type ResearchSearch = BaseSearch & {
  kind: "research";
  query: string;
  location?: string;
};

export type ProviderSearchRequest =
  | CashFlightSearch
  | AwardFlightSearch
  | HotelSearch
  | AwardHotelSearch
  | PlaceSearch
  | ResearchSearch;

export type ProviderHealth = {
  provider: ProviderId;
  mode: "live" | "manual";
  configured: boolean;
  capabilities: SearchKind[];
  limitations: string[];
};

export type ProviderHealthResponse = {
  checkedAt: string;
  liveAccess: ProviderAccessState;
  providers: ProviderHealth[];
  note: string;
};

export type ProviderSearchResponse = {
  requestId: string;
  kind: SearchKind;
  status: "ok" | "partial" | "manual" | "failed";
  checkedAt: string;
  liveAccess: ProviderAccessState;
  providers: ProviderOutcome[];
  disclaimer: string;
};

export type ProviderAccessState = {
  state: "available" | "locked";
  reason: string;
};

export type ProviderAdapter = {
  id: LiveProviderId;
  configured(): boolean;
  health(): ProviderHealth;
  supports(kind: SearchKind): boolean;
  search(request: ProviderSearchRequest, signal?: AbortSignal): Promise<ProviderSuccess>;
};
