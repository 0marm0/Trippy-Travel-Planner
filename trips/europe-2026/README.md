# Europe 2026 knowledge base

This folder is the durable, share-safe index for the primary TRIPPY sample trip. It preserves the useful planning context recovered from the Bar Trip work while keeping personal operational data out of Git.

## Canonical sources

- `examples/trips/2026-europe-sample.json` is the complete redacted application dataset: route, city coordinates, 230 researched activity records, 176 hotel candidates, provider links and price snapshots, map places, day plans, transport comparisons, and 13 redacted booking-status records.
- `docs/2026_TRIP_CORRECTIONS.md` overrides stale historical assumptions. Read it before interpreting any route, flight, hotel, or booking state.
- `docs/RESEARCH_PLAYBOOK.md` defines evidence, ranking, photo, freshness, and citation expectations.
- `docs/TRIP_DATA_MODEL.md` and `schema/trip.schema.json` define the portable data contract.
- `research/README.md` records the current refresh queue and source requirements.

## Current reviewed route

| Dates | Stop | Status / next logistical action |
| --- | --- | --- |
| Sep 21–22 | US → Frankfurt | Confirmed inbound flight; private details stay local |
| Sep 22–24 | Nürburgring | Stay and driving session confirmed; Frankfurt rental car remains open |
| Sep 24–27 | Wrocław | LH1374 and stay confirmed |
| Sep 27–30 | Kraków | Rail and duplicate-hotel decision remain open; stay/tour coverage is recorded |
| Sep 30–Oct 3 | Brussels | KLM via Amsterdam and stay coverage are confirmed; the public record omits private details |
| Oct 3–5 | Amsterdam | Brussels → Amsterdam rail and hotel remain open |
| Oct 5–9 | Berlin | European Sleeper confirmed; hotel remains open |
| Oct 9–12 | Munich | Berlin → Munich transport and hotel remain open; UA109 return is confirmed |

The cancelled Copenhagen routing is historical only. It must never be reintroduced as an active recommendation or calendar anchor.

## Research domains preserved in the sample

- City sights, neighborhoods, museums, food, automotive experiences, day trips, ranking tiers, map coordinates, photos, source URLs, access notes, and closure flags.
- Hotels by city with neighborhoods, coordinates, quality/value tiers, amenities, ratings, tradeoffs, provider handoffs, exact-date snapshots, and map-relative analysis.
- Flights, rail, driving, airport transfers, rental-car logistics, Autobahn/Nürburgring context, route options, cost ranges, door-to-door time, and booking status.
- Day plans, fixed booking anchors, hotel/airport/rail/activity map pins, geographic clustering guidance, and export-ready logistics.

## Private companion vault

Operational information belongs only in `.private/trips/europe-2026/`:

- `bookings/`: confirmations, seats, ticket numbers, passenger data and receipts.
- `source-archive/`: raw ChatGPT/Bar Trip exports, Gmail messages, PDFs and screenshots.
- `provider-cache/`: personal provider responses and refresh payloads.
- `notes/`: private operational notes that must appear only in local/private exports.

That entire `.private/` tree is ignored. Never move its content into this folder, fixtures, screenshots, issues, commits, update bundles, or a public deployment.

## Known source limitation

The current Bar Trip project mirror exposes no files under its read-only `sources/` directory. The reconstructed redacted dataset and the linked documentation above are therefore the available durable project context. Raw chat or email exports can be added later to the private vault without changing the public sample.
