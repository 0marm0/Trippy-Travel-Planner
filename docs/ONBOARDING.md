# Guided trip onboarding

## Outcome

Onboarding turns an ambiguous trip idea into a constraint ledger and a small route frontier. It does not claim a booking, collect credentials by default, or make the traveler answer every possible question before seeing useful alternatives. Manual/sample mode is first-class; researched and private-local modes are opt-in.

## What is implemented today

The `/plan` page validates/previews your dates, cities, origins and preferences before acceptance into a separate manual workspace. Add route alternatives, day destinations, timed activities, explicit coordinate maps and previewed stays/transport. Record research scope and sourced cash/award/stay/transport quotes in separate evidence modules. Save/resume explicitly in this browser or download compatible JSON/HTML/PDF; optional accounts require configured storage and an explicit upload/load. No live inventory, geocoding or confirmation is inferred.

The CLI creates a schema-backed record in `.private/trips/<slug>/trip.json` with exclusive, no-overwrite writes. Use `npm run trip:init -- --name "Portugal 2027" --start 2027-04-10 --end 2027-04-18 --cities "Lisbon,Porto" --origins "IAD,DCA"`, then `npm run trip:validate -- .private/trips/portugal-2027/trip.json`. See [setup](SETUP.md#create-your-own-trip) for optional fields.

The detailed atlas at `/` still uses a specialized 2026 Europe loader (`src/lib/current-trip.ts`, `/api/trips/2026`) and sample-scoped browser storage. Its setup panel records travelers, rooms, origin, pace, research priorities and route/date flexibility; it does not create arbitrary stops or change loaded dates. Generic `/plan` records are not integrated into that atlas yet. Do not claim that saving a profile applies a new route or fetches live prices.

The atlas update inbox can preview supported changes to existing activity assignments, priorities, saved items, transport/stay selections and research evidence. It cannot replace route stops, introduce a new trip, import raw bookings or mutate confirmation state. Follow [the bundle contract](AGENT_UPDATE_BUNDLES.md) and report unsupported changes plainly.

Keep real records out of tracked samples. Accepted `/plan` records support a separate manual workspace, explicit browser save/resume and optional encrypted account save/load on a configured server. Account storage is not automatic synchronization; source evidence and route research remain traveler/agent work. `/collaborate` receives only a reviewed share-safe activity/day JSON projection, never bookings or private identifiers. [Live rooms](LIVE_COLLABORATION.md) · [Accounts](PRIVATE_ACCOUNTS.md).

## First-run boundary

Begin with one short choice: **local-private, agent-connected, configured private account, or public sample**. Browser previews stay in memory; accepted manual workspaces can be saved explicitly on this device. Accounts need separate configuration and explicit upload/load. Live rooms publish only reviewed board content. Explain residual browser/export/backup copies and preserve existing authorizations for their exact scope.

An agent-connected session may use only connectors installed in that agent host and explicitly approved by the traveler. Those host-local credentials never become website configuration. A personal-cloud deployment is a separate website instance; its environment secrets may support direct website adapter calls only. Public-sample mode contains only redacted material and must not imply that a provider or connector is live. See [deployment modes](DEPLOYMENT_MODES.md).

## The staged conversation

### 0. Select only the modules that help

Use [the setup prompt](../prompts/SETUP_GUIDE.md) to confirm installation and mode, then enable optional modules independently. Explain the credential owner, minimum scope, coverage/freshness, provider charges/limits, permitted uses and manual fallback before configuration. The traveler enters keys into an ignored local file or their own hosting secret settings; the agent checks redacted configuration status only.

Do not ask for credentials merely to begin planning. An existing authorization covers the named scope until the traveler changes it; ask again when adding a private source, expanding permissions, importing records, or deploying. Host connectors and website adapters are separate systems. Use [agent-guided host setup](INTEGRATIONS.md#agent-guided-host-setup) to discover/install/authenticate only actual tools, [the SerpApi steps](INTEGRATIONS.md#serpapi-user-owned-account-and-key) and [the Seats.aero choice](INTEGRATIONS.md#seatsaero-choose-api-or-host-mcp) for user-owned access. Never overwrite an existing `.env.local` or ask for a key in chat.

### 1. Frame the trip

Collect, with “skip for now” available:

- travelers, rooms, children or support needs that affect inventory; mobility/accessibility, dietary, sleep, luggage, and safety needs;
- home city plus acceptable airports/stations and willingness to position, arrive/depart different cities, or use an open jaw;
- earliest/latest outbound and return dates, target trip length, hard/flexible windows, fixed events/reservations, and fixed city/date anchors;
- passport nationality/document-validity facts only as needed, visa, transit-document, border, and eligibility constraints that could invalidate a route;
- required, optional, rejected, and curiosity-only cities/experiences;
- pace, start/end-of-day preference, rest cadence, cabin, lodging standard, budget/currency, and cancellation/change preference;
- points programs, balances, transferable currencies, transfer partners/ratios/timing, and a points valuation; and
- tolerance for rail, driving/rental car, overnight travel, buses/ferries, connections, and disruption.

Record these answers as hard constraints, soft preferences, rejections, provisional assumptions, unknowns and consent. Use the traveler’s dates/cities; sample dates and destinations never fill missing values silently. State the initial assumptions, missing decision-bearing details, and chosen data mode. Do not ask for account passwords, OAuth tokens, confirmation codes, or full email contents.

### 2. Make route candidates before research

Generate three to five materially different multi-city candidates. Each must differ in city composition/order/nights, gateway/open-jaw or positioning approach, or regional-mode strategy. A superficially different airline connection does not qualify.

For each candidate show the route thesis, date allocation, gateway plan, expected door-to-door burden, principal upside, compromise, and fragile assumption. Ask at most three follow-ups at a time only when they decide between those candidates. If explicit hard constraints permit only one city or route, explain the limitation and compare three feasible allocation/mode strategies without inventing permission for extra destinations.

### 3. Evidence pass and reactive calibration

With explicit research authorization and actual provider access, compare candidate-date ranges, direct versus reasonable connection options, positioning/open-jaw options, rail/car/coach/ferry alternatives, and lodging bands. Normalize like-for-like party/date/cabin/room/stay totals, mandatory fees, cancellation conditions and location/transit burden across sources before scoring. Use [the comparison checklist](INTEGRATIONS.md#compare-like-for-like-results). Attach source, retrieval time, currency, fees, cabin, coverage, cancellation terms, and a `quote`, `estimate`, `manual`, `sample`, `historic`, or `unavailable` label.

Ask questions anchored in actual deltas: “The direct option costs $310 more and saves six hours; which wins?” “This award uses 35,000 transferable points plus $77 and takes a day to transfer; should cash lead?” “Moving two nights shifts the museum closure risk and reduces hotel cost 18%; acceptable?” Preserve prior selections and explain a re-rank.

### 4. City discovery and feasible itinerary

Research a broad catalogue for every retained city. Cover activities across categories, neighborhoods, day trips, seasonal events, practical hours/closures, reservations, and indoor/weather alternatives. Score records explicitly; retain must/should/could tiers; group geographically; avoid redundant days; and include verified coordinates and tiered map pins where available. Use high-quality source-backed photos with attribution/usage basis and a fallback.

Build editable days around fixed anchors, transit, check-in/out, meals, rests, luggage, mobility, and realistic capacity. Display unresolved closures, long transfers, and infeasible combinations. Do not silently lock a generated itinerary.

### 5. Review, imports, and exports

Review facts, quotes, preferences, alternatives and booking states before locking each decision. Generic workspaces provide visual HTML, compact travel/transit/hotel HTML/PDF and editable trip/itinerary JSON; evidence sidecars export separately. Atlas CSV/light/dark/visual modes remain. Check the current record, redaction, sources and format limitations before sharing. [Export matrix](EXPORTS.md).

Booking data uses `recommended`, `quoted`, `held`, `confirmed`, `missing`, and `conflict`. Gmail/email/file/calendar imports require a second, scoped consent: declare the read-only minimum scope, read only approved material, normalize/dedupe/redact a review queue, and wait for acceptance before import/write or state change. Gmail is never assumed connected.

## Guided experience design

For a future general-purpose wizard, use a short decision panel, a continuously updated constraint/route preview, source/freshness badges, and “why this question?” disclosure. Keep the result explainable: show price/time/points/cancellation deltas, ranking factors, map confidence, and what would change the answer. If a hard constraint, travel-document issue, provider permission, booking conflict, or material tradeoff is unresolved, pause and ask instead of inferring.
