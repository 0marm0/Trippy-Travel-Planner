# TRIPPY — Travel Optimizer architecture

## Product boundary

TRIPPY is a Next.js trip-planning app. Its primary surface is a trip overview: route and date summary, an at-a-glance map, planning progress, and direct city drilldowns. The app remains useful in demo/manual mode; connected providers enrich an existing plan but never become a prerequisite for viewing or editing it.

The implementation keeps four concerns separate:

1. **Trip data** — user-authored cities, dates, choices, and reviewed bookings.
2. **Planning views** — overview, city drilldowns, flight builder, and daily itinerary.
3. **Provider results** — time-bounded quotes, map/geocoding results, and import candidates.
4. **Credentials and raw imports** — server-only secrets, OAuth tokens, and raw email/file references.

## Runtime shape

```text
Browser (Next.js UI)
  ├─ overview: route, dates, overview map, completed onboarding
  ├─ city drilldown: flags, city map, hotel/activity pin filters
  ├─ flight builder: cash-versus-points comparison and route map
  └─ itinerary: collapsed day summaries, then reviewed import candidates
                         │
                         ▼
                 Next.js server boundary
  ├─ trip read/write and validation
  ├─ provider-adapter orchestration and freshness handling
  ├─ import parsing and review queue
  └─ export/redaction controls
                         │
                         ▼
      normalized trip store   provider adapters   private import store
```

Client components may handle local interaction and rendering. Server components/routes/actions own validation, private provider calls, OAuth token use, rate limits, and persistent writes. A browser never receives a provider secret, raw Gmail body, OAuth refresh token, or unreviewed booking payload.

Private itinerary-file adapters are disabled in production. Live provider adapters are optional and server-only; production quota is locked behind a signed private session even when credentials are configured. Development access uses a loopback bypass for local testing. A `Host` header alone is not treated as authorization, and the public 2026 endpoint always defaults to the redacted sample.

## Route and view model

- **Overview (`/`)** is the default decision surface. It shows dates, the selected route, a route/map overview, next unresolved work, and the completed onboarding summary. Onboarding is collapsed once completed, but remains editable and discoverable.
- **City drilldowns** are scoped to a selected destination rather than global destination-specific tabs. They surface only planning flags relevant to that city, such as an unpriced stay, closure risk, or schedule conflict.
- **City maps** display selected/shortlisted places by default. Independent hotel and activity pin toggles control density without changing underlying selections.
- **Flight builder** is a dedicated planning surface, not a city-map mode. It compares cash and points options using explicit traveler valuations, taxes/fees, freshness, and route geometry on a flight map.
- **Itinerary** begins as collapsed daily summaries so the route and dates remain legible. Importing Gmail or files is a separate, explicit action that opens a review queue; it must not expand or overwrite a day automatically.

The URL/state model should make the active trip and selected city/day addressable, while keeping transient map toggles and open/closed panels local unless users choose to save them.

## Data and domain boundaries

The canonical model is normalized trip data described in [Trip data model](TRIP_DATA_MODEL.md). It records decision state, flags, provenance, and references; it does not embed raw provider responses or email bodies.

Important invariants:

- An option, quote, import candidate, and confirmed booking are different records/states.
- A `booked` state requires a user-confirmed booking record, never a recommendation, price quote, or parser guess.
- Provider values retain provider identity, checked time, price basis, and known uncertainty.
- A city flag is a transparent planning signal with source/reason and severity; it is not a hidden score or a booking assertion.
- Imported data enters a private candidate queue before it can affect trip data.

## Provider adapter contract

Adapters are server-side, optional, and independently degradable. Each adapter returns normalized output plus provider/native identifiers, request parameters, checked time, freshness/expiry, currency and total-price basis, included/unknown fees, coverage limits, and an error or rate-limit state.

```ts
type ProviderOutcome = {
  provider: string
  mode: "live" | "manual"
  status: "ok" | "error" | "unconfigured" | "locked"
  freshness?: {
    basis: "live-request" | "provider-cache" | "manual" | "unknown"
    checkedAt: string
  }
  limitations: string[]
  results?: NormalizedResearchResult[]
}
```

Manual/demo adapters implement the same interface with clearly labeled sample or user-entered data. An unavailable award, lodging, Gmail, or map adapter must leave the applicable view editable and communicate the limitation rather than blocking the whole trip.

Implemented live kinds are cash flights, award flights, hotels, award hotels, places, and general research. Booking.com, when available to a qualified partner, is a **Demand API adapter**. It is not documented or represented as an official Booking.com MCP server. See [Integrations](INTEGRATIONS.md).

## Import pipeline

```text
Gmail connector or user-selected file
  → private candidate record
  → parser confidence + deduplication
  → visible review/edit/reject step
  → normalized, user-accepted booking
```

Deduplication may use a privacy-preserving confirmation-reference hash together with provider, dates, traveler, and route/property signals. Keep the original raw email/file in the private import boundary where possible; public/exportable trip data only carries the reviewed normalized record.

## Presentation and resilience

- Maps have a list/link fallback; map failure cannot hide dates, route, or shortlisted places.
- No image, map tile, provider quote, or import is assumed authoritative merely because it renders.
- Loading, unavailable, stale, partial, manual, and demo states are first-class UI states.
- Accessible controls include keyboard-operable pin toggles, clear expanded/collapsed state, textual flag explanations, and non-color-only map/flag distinctions.

## Non-goals

TRIPPY does not make purchases, send email, alter calendars, or infer confirmation. It is not a marketplace, a universal price-coverage claim, or a replacement for provider terms and eligibility checks.
