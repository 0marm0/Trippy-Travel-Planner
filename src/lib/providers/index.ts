import "server-only";

import { createBookingComAdapter } from "./booking-com.ts";
import { ProviderError, toProviderFailure } from "./errors.ts";
import { manualHealth, manualSearches } from "./manual.ts";
import { createSeatsAeroAdapter } from "./seats-aero.ts";
import { createSerpApiAdapter } from "./serpapi.ts";
import type { ProviderAdapter, ProviderHealth, ProviderOutcome, ProviderSearchRequest } from "./types.ts";

export * from "./types.ts";
export { ProviderValidationError, parseProviderSearchRequest } from "./validation.ts";

function liveAdapters(): ProviderAdapter[] {
  return [
    createSerpApiAdapter({ apiKey: process.env.SERPAPI_API_KEY }),
    createSeatsAeroAdapter({
      apiKey: process.env.SEATS_AERO_API_KEY,
      flightMode: process.env.SEATS_AERO_SEARCH_MODE === "live" ? "live" : "cached",
    }),
    createBookingComAdapter({
      apiKey: process.env.BOOKING_COM_API_KEY,
      affiliateId: process.env.BOOKING_COM_AFFILIATE_ID,
      environment: process.env.BOOKING_COM_DEMAND_ENV === "sandbox" ? "sandbox" : "production",
    }),
  ];
}

export function getProviderHealth(): ProviderHealth[] {
  return [...liveAdapters().map((adapter) => adapter.health()), ...manualHealth()];
}

export async function searchProviders(
  request: ProviderSearchRequest,
  signal?: AbortSignal,
  options: { allowLive?: boolean } = {},
): Promise<ProviderOutcome[]> {
  const matching = liveAdapters().filter(
    (adapter) => adapter.supports(request.kind) && (!request.providers || request.providers.includes(adapter.id)),
  );
  const liveOutcomes = await Promise.all(
    matching.map(async (adapter): Promise<ProviderOutcome> => {
      if (options.allowLive === false) {
        return toProviderFailure(
          new ProviderError({ provider: adapter.id, code: "access-locked", message: "Locked" }),
          adapter.id,
        );
      }
      try {
        return await adapter.search(request, signal);
      } catch (error) {
        return toProviderFailure(error, adapter.id);
      }
    }),
  );
  return [...liveOutcomes, ...manualSearches(request)];
}
