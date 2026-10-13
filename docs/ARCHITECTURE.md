# Architecture

TRIPPY is a Next.js application with a detailed sample atlas, a generic trip-draft workflow, optional server-side research adapters, optional live activity/day rooms, and an explicitly separated private import boundary. The primary atlas loads the reviewed Europe 2026 sample. `/plan` creates or previews a normalized draft for arbitrary cities and dates, then hands it to the traveler's agent. `/collaborate` edits a separate share-safe planning board using hashed role capabilities and durable SQLite/Postgres revision checks. Generic atlas integration, quote selection and maps remain future work; hosted private-trip accounts are also future work. See [module boundaries and migration plan](MODULARITY.md) and [live collaboration](LIVE_COLLABORATION.md).

## Runtime today

```mermaid
flowchart TD
  Sample[Reviewed public sample] --> Loader[Server sample adapter]
  Loader --> API[GET /api/trips/2026]
  API --> UI[Browser workspace]
  UI <--> State[Browser local storage]
  UI --> Optimizer[Route optimization API]
  UI --> Research[Provider search API]
  Research --> Access[Server access and validation]
  Access --> Providers[Optional research adapters]
  UI --> Export[Sanitized export snapshot]
  Export --> Files[CSV / HTML / PDF]
  Consent[Explicit private-local consent and gates] --> Imports[Private itinerary or Gmail preview]
  Imports --> Review[Candidate review]
  Form[Generic /plan form or pasted JSON] --> Validate[Shared normalized-trip validation]
  Validate --> Preview[Preview every proposed field]
  Preview --> Accept[Explicit draft acceptance]
  Accept --> Draft[Planning JSON download or agent brief copy]
```

`src/app/page.tsx` mounts `src/components/trip-workspace.tsx`. The workspace fetches the sample API, composes planning views, and saves selections and assignments to local storage. `src/lib/current-trip.ts` adapts the older compact sample format into the typed view payload in `src/lib/trip-model.ts`. It also joins reviewed corrections, map coordinates, and hotel enrichment. The legacy 2025 view has a separate data path.

`src/app/plan/page.tsx` mounts `src/components/new-trip-planner.tsx`. Its draft stays in browser memory and clears on reload. Shared logic in `src/lib/normalized-trip.ts` creates drafts, validates the actual JSON Schema plus relationships and private-text checks, and generates the agent brief. Preview does not replace an accepted draft. Acceptance enables a local JSON download or explicit clipboard copy; it does not invoke providers, import personal records, infer bookings, save to the sample atlas, or persist a hosted account.

The same shared validation powers `npm run trip:init`, `npm run trip:validate`, and the release gate's `schema:check`. Initialization writes a new normalized draft beneath the private-local trip directory and refuses an existing destination. The CLI is a local authoring tool, not a server filesystem endpoint.

The server has no durable normalized trip write API, authenticated trip ownership model, shared workspace, or cross-device sync. Client selections do not update the sample file. Hosting a website instance does not create a private trip account or a backup of browser state. [Deployment modes](DEPLOYMENT_MODES.md) describes that boundary.

## Code boundaries

| Concern | Source home | Contract |
| --- | --- | --- |
| App shell and API handlers | `src/app/` | HTTP request validation, authorization, bounded responses, cache policy |
| Planning presentation | `src/components/` | Props and local interaction; no provider credentials |
| Generic draft and agent handoff | `src/components/new-trip-planner.tsx`, `src/lib/normalized-trip.ts`, `schema/trip.schema.json` | Browser-memory preview/accept/download/copy; actual schema, relationships and privacy validation |
| Sample compatibility adapter | `src/lib/current-trip.ts`, reviewed enrichment modules | Translate reviewed sample data into a view payload; isolate legacy keys |
| Typed view records | `src/lib/trip-model.ts` | Stops, activities, stays, transport, days, and booking summaries |
| Route decisions | `src/lib/optimization/route-optimizer.ts` | Structured stops, candidate legs, explicit weights, uncertainty and explanations |
| Logistics | `src/lib/trip-logistics.ts` | Derive planning gaps and timeline from records; preserve confirmation semantics |
| Research providers | `src/lib/providers/` | Optional typed research results with source, freshness, limitations and failure state |
| Agent update interchange | `src/lib/trippy-bundle.ts`, `schema/trippy-update.schema.json` | Bounded, parsed, previewed changes against an existing workspace scope |
| Exports | `src/lib/trip-exports.ts`, HTML/PDF modules, export API | Build and sanitize a selected snapshot before rendering files |
| Private access and imports | `src/lib/private-access.ts`, `src/lib/private-itinerary.ts`, `src/lib/imports/gmail/` | Explicit local/private consent, read-only candidates, raw input custody |
| Public release checks | `scripts/`, `.github/workflows/ci.yml` | Current artifacts and reachable history; no secret-dependent verification |

The generic normalized trip schema in `schema/trip.schema.json` and its city-break example drive the new draft workflow and CLI. They remain distinct from the older compact Europe sample and the current `Trip2026Payload`. A schema-valid new draft does not yet become a selectable detailed atlas workspace automatically. Do not describe these formats as interchangeable without an explicit view adapter.

Shared validation checks unique IDs, date-window bounds, night constraints, known route/anchor references, required cities and locked-anchor destination retention. Route candidates currently record city order without dated nightly allocations. Validation therefore does not prove that a candidate reaches a fixed event on time, provides enough transit slack, or has bookable inventory; those require researched allocation and review.

## Provider boundary

`ProviderAdapter` in `src/lib/providers/types.ts` specifies `configured`, `health`, `supports`, and `search`. A search returns normalized results and freshness, or a typed failure. The composition root in `src/lib/providers/index.ts` constructs adapters server-side; request parsing, access checks, and HTTP handling remain outside presentation components.

Implemented adapters cover SerpApi cash flights, hotels, places and general research; Seats.aero award flights and Rooms.aero award hotels; and Booking.com Demand hotel research for eligible accounts. Manual provider handoffs preserve useful zero-key behavior. A compiled adapter or a configured key does not prove current inventory, account eligibility, complete coverage, or booking ability.

Credentials remain in untracked local configuration or a server secret manager. Production live quota uses the signed-session access boundary. Private itinerary-file adapters are disabled in production. Host-local MCPs belong to the agent host and are not installed into or reachable through a deployed Next.js app merely because its documentation names them.

## Data, review, and privacy

The product contract uses `recommended`, `quoted`, `held`, `confirmed`, `missing`, and `conflict` booking states. A recommendation, quote, parsed email, or optimization result cannot create a confirmation. Existing compatibility types still contain older labels such as `tbc`; the schema and migration work described in [MODULARITY.md](MODULARITY.md) must reconcile those labels explicitly rather than silently promoting their state.

Gmail preview is an optional private read-only research path. Raw messages, provider payloads, OAuth material, links and booking identifiers must remain outside public samples and exports. Import candidates require explicit review before a normalized write or state transition. A durable review/approve/reject ledger is not currently implemented.

Atlas export is a separate sanitization step with its own tests. It is not the full private object rendered in a different theme. Legacy `private-operational` callers now receive redacted downloadable artifacts too; the UI no longer offers a private identifier-bearing download. The generic planning JSON download and agent brief require a validated, accepted planning draft; they are a separate interchange path from atlas CSV/HTML/PDF. Public samples must be built through the sanctioned sample transform, scanned, and independently reviewed. Browser local storage is still user data: it is not appropriate for multi-user authorization, secret custody, or durable retention guarantees.

## Presentation and resilience

Maps are optional presentation. Routes, dates and lists remain visible when tiles, geocoding, images, or providers fail. Hotel and activity pin toggles change map density without changing selections. Research and optimization views retain manual, unavailable, partial and stale states rather than inventing availability or price certainty.

UI controls should work by keyboard and on small screens, with textual status and non-color-only distinctions. The current quality gate covers lint, types, tests, sample checks, production compilation and privacy/history scans; it must be accompanied by a representative browser planning flow. A build alone does not verify accessibility or live provider coverage.

## Extension rules

Keep route-specific dates, city aliases, imagery, airport defaults and booking narrative in reviewed data packs or the compatibility adapter. Keep the optimizer and provider contracts free of sample city assumptions. Add tests with invented destinations and missing data before expanding the product claims. [MODULARITY.md](MODULARITY.md) records the existing coupling and acceptance criteria for that migration.
