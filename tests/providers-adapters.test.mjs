import assert from "node:assert/strict";
import test from "node:test";

import { createBookingComAdapter } from "../src/lib/providers/booking-com.ts";
import { ProviderError, toProviderFailure } from "../src/lib/providers/errors.ts";
import { safeProviderUrl } from "../src/lib/providers/normalize.ts";
import { manualHealth, manualSearches } from "../src/lib/providers/manual.ts";
import {
  createProviderSession,
  getProviderAccessState,
  providerSessionCookie,
  providerSessionOriginAllowed,
  verifyProviderAccessCode,
  verifyProviderSession,
} from "../src/lib/providers/access.ts";
import { createSeatsAeroAdapter } from "../src/lib/providers/seats-aero.ts";
import { createSerpApiAdapter } from "../src/lib/providers/serpapi.ts";
import { ProviderValidationError, parseProviderSearchRequest } from "../src/lib/providers/validation.ts";

const flightRequest = {
  kind: "cash-flight",
  origin: "SFO",
  destination: "LHR",
  departureDate: "2027-05-01",
  returnDate: "2027-05-10",
  adults: 2,
  cabin: "economy",
  currency: "USD",
};

const awardRequest = {
  kind: "award-flight",
  origin: "SFO",
  destination: "LHR",
  departureDate: "2027-05-01",
  seats: 2,
  program: "aeroplan",
};

test("unconfigured adapters fail closed without exposing configuration", async () => {
  const adapters = [createSerpApiAdapter(), createSeatsAeroAdapter(), createBookingComAdapter()];
  for (const adapter of adapters) {
    assert.equal(adapter.configured(), false);
    assert.equal(adapter.health().configured, false);
    await assert.rejects(
      adapter.search(adapter.id === "seats-aero" ? awardRequest : flightRequest),
      (error) => error instanceof ProviderError && error.code === "not-configured",
    );
  }
});

test("manual mode remains complete when no live provider is configured", () => {
  const health = manualHealth();
  const outcomes = manualSearches(flightRequest);
  assert.ok(health.every((provider) => provider.configured && provider.mode === "manual"));
  assert.deepEqual(outcomes.map((outcome) => outcome.provider), ["expedia", "priceline"]);
  assert.ok(outcomes.every((outcome) => outcome.status === "ok" && outcome.results[0].url?.startsWith("https://")));
});

test("SerpAPI cash-flight success is normalized and upstream credential URLs never escape", async () => {
  const calls = [];
  const adapter = createSerpApiAdapter({
    apiKey: "super-secret-serp-key",
    fetchImpl: async (input, init) => {
      calls.push({ input: String(input), init });
      return jsonResponse({
        search_metadata: { processed_at: "2026-09-14T12:00:00Z" },
        best_flights: [
          {
            price: 999,
            total_duration: 605,
            link: "https://seller.example/offer?api_key=super-secret-serp-key",
            flights: [
              {
                airline: "Example Air",
                departure_airport: { id: "SFO", time: "2027-05-01 10:00" },
                arrival_airport: { id: "LHR", time: "2027-05-02 06:00" },
              },
            ],
          },
        ],
      });
    },
  });

  const result = await adapter.search(flightRequest);
  assert.equal(result.status, "ok");
  assert.equal(result.results[0].title, "SFO to LHR");
  assert.deepEqual(result.results[0].price, { amount: 999, currency: "USD", unit: "ticket" });
  assert.equal(result.results[0].url, undefined);
  assert.match(calls[0].input, /engine=google_flights/);
  assert.match(calls[0].input, /api_key=super-secret-serp-key/);
  assert.doesNotMatch(JSON.stringify(result), /super-secret-serp-key/);
  assert.doesNotMatch(JSON.stringify(adapter.health()), /super-secret-serp-key/);
});

test("Seats.aero defaults to Pro-compatible Cached Search and keeps summary data distinct from trips", async () => {
  let observed;
  const adapter = createSeatsAeroAdapter({
    apiKey: "seats-secret",
    fetchImpl: async (input, init) => {
      observed = { url: new URL(String(input)), init };
      return jsonResponse({
        data: [
          {
            ID: "availability-id",
            Route: { OriginAirport: "SFO", DestinationAirport: "LHR", Source: "aeroplan" },
            Date: "2027-05-01",
            YAvailable: true,
            YMileageCost: "35000",
            YRemainingSeats: 2,
            YAirlines: "AC",
            YDirect: false,
            JAvailable: true,
            JMileageCost: "70000",
            JRemainingSeats: 1,
            JAirlines: "AC",
            JDirect: true,
          },
        ],
      });
    },
  });

  const result = await adapter.search(awardRequest);
  assert.equal(observed.url.origin + observed.url.pathname, "https://seats.aero/partnerapi/search");
  assert.equal(observed.url.searchParams.get("take"), "10");
  assert.equal(observed.url.searchParams.get("sources"), "aeroplan");
  assert.equal(observed.init.method, "GET");
  assert.equal(observed.init.headers["Partner-Authorization"], "seats-secret");
  assert.equal(result.freshness.basis, "provider-cache");
  assert.equal(result.results.length, 2);
  assert.equal(result.results[1].points, 70000);
  assert.equal(result.results[1].stops, 0);
  assert.equal(result.results[1].details.summaryOnly, true);
  assert.equal(result.results[1].durationMinutes, undefined);
});

test("Seats.aero commercial Live Search is an explicit opt-in POST path", async () => {
  let observed;
  const adapter = createSeatsAeroAdapter({
    apiKey: "seats-secret",
    flightMode: "live",
    fetchImpl: async (input, init) => {
      observed = { input: String(input), init };
      return jsonResponse({
        cached: true,
        data: [
          {
            ID: "synthetic-id",
            OriginAirport: "SFO",
            DestinationAirport: "LHR",
            Source: "aeroplan",
            Cabin: "business",
            MileageCost: 70000,
            RemainingSeats: 2,
            FlightNumbers: "AC 1",
            TotalDuration: 620,
            Stops: 0,
            UpdatedAt: "2026-09-14T10:00:00Z",
          },
        ],
      });
    },
  });

  const result = await adapter.search(awardRequest);
  assert.equal(observed.input, "https://seats.aero/partnerapi/live");
  assert.equal(observed.init.method, "POST");
  assert.equal(observed.init.headers["Partner-Authorization"], "seats-secret");
  assert.equal(JSON.parse(observed.init.body).smart_cache, true);
  assert.equal(result.freshness.basis, "provider-cache");
  assert.equal(result.results[0].points, 70000);
  assert.doesNotMatch(JSON.stringify(result), /seats-secret/);
});

test("Rooms.aero award-hotel search normalizes points, minor-unit cash, metadata, and freshness", async () => {
  let observed;
  const adapter = createSeatsAeroAdapter({
    apiKey: "rooms-secret",
    fetchImpl: async (input, init) => {
      observed = { url: new URL(String(input)), init };
      return jsonResponse({
        data: [
          {
            id: "availability-1",
            source: "hyatt",
            arrival_date: "2027-05-02",
            departure_date: "2027-05-04",
            num_nights: 2,
            cash_currency_code: "USD",
            standard_award_available: true,
            standard_award_cost: 30000,
            standard_cash_cost: 68500,
            standard_cpp: 2.28,
            suite_award_available: false,
            booking_link: { url: "https://www.hyatt.com/shop/rooms/example" },
            last_checked_at: "2026-09-10T03:58:01Z",
            hotel: { id: "hotel-1", name: "Park Example", brand: "park", award_category: "7", latitude: 35.1, longitude: 139.2 },
          },
        ],
      });
    },
  });

  const result = await adapter.search({
    kind: "award-hotel",
    location: "Tokyo",
    startDate: "2027-05-01",
    endDate: "2027-05-07",
    nights: 2,
    maxPoints: 40000,
    program: "hyatt",
  });
  assert.equal(observed.url.origin + observed.url.pathname, "https://rooms.aero/partnerapi/search");
  assert.equal(observed.url.searchParams.get("nights"), "2");
  assert.equal(observed.url.searchParams.get("max_points"), "40000");
  assert.equal(observed.init.headers["Partner-Authorization"], "rooms-secret");
  assert.equal(result.results[0].title, "Park Example");
  assert.equal(result.results[0].points, 30000);
  assert.deepEqual(result.results[0].price, { amount: 685, currency: "USD", unit: "total" });
  assert.equal(result.results[0].details.awardCategory, "7");
  assert.equal(result.freshness.providerCheckedAt, "2026-09-10T03:58:01.000Z");
  assert.doesNotMatch(JSON.stringify(result), /rooms-secret/);
});

test("Booking Demand only runs with both credentials and normalizes accommodation search", async () => {
  let observed;
  const adapter = createBookingComAdapter({
    apiKey: "booking-secret",
    affiliateId: "affiliate-123",
    environment: "sandbox",
    fetchImpl: async (input, init) => {
      observed = { input: String(input), init };
      return jsonResponse({ data: [{ id: 12337, currency: "EUR", price: { book: 644.8 }, url: "https://booking.example/hotel/12337" }] });
    },
  });
  const result = await adapter.search({
    kind: "hotel",
    destination: "Amsterdam",
    checkIn: "2027-05-01",
    checkOut: "2027-05-03",
    adults: 2,
    rooms: 1,
    currency: "EUR",
    bookingCityId: -2140479,
    bookerCountry: "us",
  });

  assert.equal(observed.input, "https://demandapi-sandbox.booking.com/3.2/accommodations/search");
  assert.equal(observed.init.headers.Authorization, "Bearer booking-secret");
  assert.equal(observed.init.headers["X-Affiliate-Id"], "affiliate-123");
  assert.equal(result.results[0].price.amount, 644.8);
  assert.match(result.limitations[0], /simulated sandbox/);
  assert.doesNotMatch(JSON.stringify(result), /booking-secret|affiliate-123/);
});

test("rate limits and upstream errors become safe typed failures", async () => {
  const rateLimited = createSerpApiAdapter({
    apiKey: "never-return-this-key",
    fetchImpl: async () => new Response("quota detail containing never-return-this-key", { status: 429, headers: { "Retry-After": "45" } }),
  });
  const upstreamError = createSeatsAeroAdapter({
    apiKey: "another-secret",
    fetchImpl: async () => new Response("airline internal detail", { status: 503 }),
  });

  const rateFailure = await rateLimited.search(flightRequest).catch((error) => toProviderFailure(error, "serpapi"));
  const upstreamFailure = await upstreamError.search(awardRequest).catch((error) => toProviderFailure(error, "seats-aero"));
  assert.equal(rateFailure.error.code, "rate-limited");
  assert.equal(rateFailure.error.retryAfterSeconds, 45);
  assert.equal(upstreamFailure.error.code, "upstream-error");
  assert.equal(upstreamFailure.error.retryable, true);
  assert.doesNotMatch(JSON.stringify([rateFailure, upstreamFailure]), /never-return-this-key|another-secret|airline internal/);
});

test("provider timeouts abort the fetch and are classified without retrying", async () => {
  let aborted = false;
  const adapter = createSerpApiAdapter({
    apiKey: "timeout-secret",
    timeoutMs: 10,
    fetchImpl: async (_input, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener(
          "abort",
          () => {
            aborted = true;
            reject(new DOMException("aborted", "AbortError"));
          },
          { once: true },
        );
      }),
  });

  const failure = await adapter.search(flightRequest).catch((error) => toProviderFailure(error, "serpapi"));
  assert.equal(aborted, true);
  assert.equal(failure.error.code, "timeout");
  assert.equal(failure.error.retryable, true);
});

test("strict validation rejects unknown fields, invalid dates, incompatible providers, and incomplete Booking configuration", () => {
  assert.throws(() => parseProviderSearchRequest({ ...flightRequest, apiKey: "oops" }), ProviderValidationError);
  assert.throws(() => parseProviderSearchRequest({ ...flightRequest, departureDate: "2027-02-30" }), ProviderValidationError);
  assert.throws(() => parseProviderSearchRequest({ ...flightRequest, providers: ["tripadvisor"] }), ProviderValidationError);
  assert.throws(
    () =>
      parseProviderSearchRequest({
        kind: "hotel",
        destination: "Paris",
        checkIn: "2027-05-01",
        checkOut: "2027-05-02",
        adults: 2,
        rooms: 1,
        currency: "EUR",
        providers: ["booking-com"],
      }),
    /bookingCityId/,
  );
  assert.deepEqual(
    parseProviderSearchRequest({
      kind: "award-hotel",
      location: "Tokyo",
      startDate: "2027-05-01",
      endDate: "2027-05-07",
      nights: 2,
      maxPoints: 50000,
      program: "hyatt",
    }).kind,
    "award-hotel",
  );
  assert.throws(
    () => parseProviderSearchRequest({ kind: "award-hotel", location: "Tokyo", startDate: "2027-05-07", endDate: "2027-05-01" }),
    /endDate/,
  );
});

test("production provider access is locked without a valid HttpOnly session while loopback development remains available", () => {
  const config = { nodeEnv: "production", accessCode: "private-access-code", sessionSecret: "a-session-secret-that-is-at-least-32-characters" };
  const locked = getProviderAccessState(new Request("https://trippy.example/api/providers/health"), config);
  assert.equal(locked.state, "locked");
  assert.equal(verifyProviderAccessCode("wrong-access-code", config), false);
  assert.equal(verifyProviderAccessCode("private-access-code", config), true);

  const token = createProviderSession(config.sessionSecret);
  assert.equal(verifyProviderSession(token, config.sessionSecret), true);
  const authorized = getProviderAccessState(
    new Request("https://trippy.example/api/providers/health", { headers: { cookie: `trippy_provider_session=${token}` } }),
    config,
  );
  assert.equal(authorized.state, "available");
  assert.match(providerSessionCookie(token, true), /HttpOnly/);
  assert.match(providerSessionCookie(token, true), /SameSite=Strict/);
  assert.match(providerSessionCookie(token, true), /Secure/);
  assert.equal(
    getProviderAccessState(new Request("http://localhost:3000/api/providers/health"), {
      nodeEnv: "development",
      accessCode: undefined,
      sessionSecret: undefined,
    }).state,
    "available",
  );
});

test("provider session mutations require exact same-origin requests in production", () => {
  assert.equal(
    providerSessionOriginAllowed(
      new Request("https://trippy.example/api/providers/session", { headers: { origin: "https://trippy.example" } }),
      "production",
    ),
    true,
  );
  assert.equal(providerSessionOriginAllowed(new Request("https://trippy.example/api/providers/session"), "production"), false);
  assert.equal(
    providerSessionOriginAllowed(
      new Request("https://trippy.example/api/providers/session", { headers: { origin: "https://attacker.example" } }),
      "production",
    ),
    false,
  );
  assert.equal(providerSessionOriginAllowed(new Request("http://localhost:3000/api/providers/session"), "development"), true);
});

test("credential-like, non-HTTPS, and userinfo URLs are never returned", () => {
  assert.equal(safeProviderUrl("http://example.com"), undefined);
  assert.equal(safeProviderUrl("https://user:pass@example.com/path"), undefined);
  assert.equal(safeProviderUrl("https://example.com/path?token=secret"), undefined);
  assert.equal(safeProviderUrl("https://example.com/path?q=opaque-secret-value", ["opaque-secret-value"]), undefined);
  assert.equal(safeProviderUrl("https://example.com/path?destination=Paris"), "https://example.com/path?destination=Paris");
});

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}
