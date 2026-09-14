import { safeProviderUrl, stableResultId } from "./normalize.ts";
import type { ManualProviderId, ProviderHealth, ProviderSearchRequest, ProviderSuccess, SearchKind } from "./types.ts";

type ManualDefinition = {
  id: ManualProviderId;
  label: string;
  home: string;
  capabilities: SearchKind[];
  limitation: string;
};

const DEFINITIONS: ManualDefinition[] = [
  {
    id: "expedia",
    label: "Expedia",
    home: "https://www.expedia.com/",
    capabilities: ["cash-flight", "hotel"],
    limitation: "Manual handoff only. TRIPPY does not scrape or verify Expedia inventory or prices.",
  },
  {
    id: "trivago",
    label: "trivago",
    home: "https://www.trivago.com/",
    capabilities: ["hotel"],
    limitation: "Manual handoff only. TRIPPY does not scrape or verify trivago inventory or prices.",
  },
  {
    id: "priceline",
    label: "Priceline",
    home: "https://www.priceline.com/",
    capabilities: ["cash-flight", "hotel"],
    limitation: "Manual handoff only. TRIPPY does not scrape or verify Priceline inventory or prices.",
  },
  {
    id: "tripadvisor",
    label: "Tripadvisor",
    home: "https://www.tripadvisor.com/",
    capabilities: ["hotel", "place", "research"],
    limitation: "Manual handoff only. TRIPPY does not scrape or verify Tripadvisor listings, reviews, inventory, or prices.",
  },
  {
    id: "seats-aero-manual",
    label: "Seats.aero",
    home: "https://seats.aero/",
    capabilities: ["award-flight", "award-hotel"],
    limitation: "Manual handoff only. Sign-in, plan eligibility, program coverage, availability, and prices must be checked on Seats.aero.",
  },
];

export function manualHealth(): ProviderHealth[] {
  return DEFINITIONS.map((definition) => ({
    provider: definition.id,
    mode: "manual",
    configured: true,
    capabilities: definition.capabilities,
    limitations: [definition.limitation],
  }));
}

export function manualSearches(request: ProviderSearchRequest): ProviderSuccess[] {
  return DEFINITIONS.filter(
    (definition) =>
      definition.capabilities.includes(request.kind) && (!request.providers || request.providers.includes(definition.id)),
  ).map((definition) => {
    const checkedAt = new Date().toISOString();
    return {
      provider: definition.id,
      mode: "manual",
      status: "ok",
      freshness: { basis: "manual", checkedAt },
      limitations: [definition.limitation, "Opening this link does not make a booking or change itinerary status."],
      results: [
        {
          id: stableResultId(definition.id, request.kind, 0, suggestedQuery(request)),
          kind: request.kind,
          title: `Continue manually on ${definition.label}`,
          subtitle: suggestedQuery(request),
          url: safeProviderUrl(definition.home),
          details: { suggestedQuery: suggestedQuery(request), coverage: "not-verified" },
        },
      ],
    };
  });
}

function suggestedQuery(request: ProviderSearchRequest): string {
  switch (request.kind) {
    case "cash-flight":
      return `${request.origin} to ${request.destination}, ${request.departureDate}${request.returnDate ? ` to ${request.returnDate}` : ""}, ${request.adults} adult${request.adults === 1 ? "" : "s"}, ${request.cabin}`;
    case "award-flight":
      return `${request.origin} to ${request.destination}, ${request.departureDate}, ${request.seats} seat${request.seats === 1 ? "" : "s"}, ${request.program}`;
    case "award-hotel":
      return `${request.location}, check-in dates ${request.startDate} to ${request.endDate}${request.nights ? `, ${request.nights} night${request.nights === 1 ? "" : "s"}` : ""}${request.program ? `, ${request.program}` : ""}`;
    case "hotel":
      return `${request.destination}, ${request.checkIn} to ${request.checkOut}, ${request.adults} adult${request.adults === 1 ? "" : "s"}, ${request.rooms} room${request.rooms === 1 ? "" : "s"}`;
    case "place":
    case "research":
      return request.location ? `${request.query}, ${request.location}` : request.query;
  }
}
