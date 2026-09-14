import { ProviderError } from "./errors.ts";
import { fetchProviderJson, type FetchLike } from "./http.ts";
import { compactResult, integer, isRecord, money, records, safeProviderUrl, stableResultId, text } from "./normalize.ts";
import type { HotelSearch, ProviderAdapter, ProviderHealth, ProviderResult, ProviderSearchRequest, ProviderSuccess } from "./types.ts";

const BASE_URLS = {
  production: "https://demandapi.booking.com/3.2/accommodations/search",
  sandbox: "https://demandapi-sandbox.booking.com/3.2/accommodations/search",
} as const;
const DEFAULT_TIMEOUT_MS = 15_000;

export function createBookingComAdapter(options: {
  apiKey?: string;
  affiliateId?: string;
  environment?: "production" | "sandbox";
  fetchImpl?: FetchLike;
  timeoutMs?: number;
} = {}): ProviderAdapter {
  const apiKey = cleanSecret(options.apiKey);
  const affiliateId = cleanSecret(options.affiliateId);
  const environment = options.environment ?? "production";
  const configured = Boolean(apiKey && affiliateId);

  return {
    id: "booking-com",
    configured: () => configured,
    supports: (kind) => kind === "hotel",
    health: (): ProviderHealth => ({
      provider: "booking-com",
      mode: "live",
      configured,
      capabilities: ["hotel"],
      limitations: [
        "Demand API access requires an approved Booking.com Affiliate Partner API user.",
        environment === "sandbox"
          ? "When credentials are configured, the adapter targets Booking.com's simulated sandbox inventory."
          : "When credentials are configured, the adapter targets production Demand API inventory.",
        "Demand API coverage and prices are not a one-to-one mirror of Booking.com's consumer website.",
      ],
    }),
    async search(request: ProviderSearchRequest, signal?: AbortSignal): Promise<ProviderSuccess> {
      if (!configured || !apiKey || !affiliateId) {
        throw new ProviderError({ provider: "booking-com", code: "not-configured", message: "Missing API credentials" });
      }
      if (request.kind !== "hotel") {
        throw new ProviderError({ provider: "booking-com", code: "not-supported", message: "Unsupported search kind" });
      }
      if (request.bookingCityId === undefined || !request.bookerCountry) {
        throw new ProviderError({
          provider: "booking-com",
          code: "invalid-request",
          message: "Booking.com requires a city ID and booker country",
        });
      }

      const checkedAt = new Date().toISOString();
      const { payload } = await fetchProviderJson({
        provider: "booking-com",
        fetchImpl: options.fetchImpl,
        url: new URL(BASE_URLS[environment]),
        init: {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "X-Affiliate-Id": affiliateId,
          },
          body: JSON.stringify({
            booker: { country: request.bookerCountry, platform: "desktop" },
            checkin: request.checkIn,
            checkout: request.checkOut,
            city: request.bookingCityId,
            guests: { number_of_adults: request.adults, number_of_rooms: request.rooms },
          }),
        },
        timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        signal,
      });
      const root = requirePayload(payload);
      return {
        provider: "booking-com",
        mode: "live",
        status: "ok",
        freshness: { basis: "live-request", checkedAt },
        limitations: [
          environment === "sandbox" ? "These are simulated sandbox results, not live inventory." : "Availability is a live API quote, not a hold or confirmation.",
          "Demand API inventory can differ from Booking.com's consumer website and must not be compared as exact coverage.",
          "Returned links are included only when they are HTTPS and contain no credential-like query fields.",
        ],
        results: records(root.data).slice(0, 50).map((row, index) => normalizeHotel(row, index, request, [apiKey, affiliateId])),
      };
    },
  };
}

function requirePayload(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new ProviderError({ provider: "booking-com", code: "invalid-response", message: "Expected object response" });
  }
  return payload;
}

function normalizeHotel(row: Record<string, unknown>, index: number, request: HotelSearch, forbiddenValues: readonly string[]): ProviderResult {
  const id = integer(row.id) ?? text(row.id, 80) ?? index;
  const price = isRecord(row.price) ? row.price : {};
  const currency = text(row.currency, 3) ?? request.currency;
  return compactResult({
    id: stableResultId("booking-com", "hotel", index, id),
    kind: "hotel",
    title: text(row.name, 200) ?? `Booking.com accommodation ${id}`,
    subtitle: request.destination,
    url: safeProviderUrl(row.url ?? row.deep_link_url, forbiddenValues),
    price: money(price.book ?? price.total ?? row.price, currency, "total"),
    details: {
      accommodationId: String(id),
      ...(text(row.payment_timing, 50) ? { paymentTiming: text(row.payment_timing, 50)! } : {}),
    },
  });
}

function cleanSecret(value: string | undefined): string | undefined {
  const secret = value?.trim();
  return secret && !/^your_.+_here$/i.test(secret) ? secret : undefined;
}
