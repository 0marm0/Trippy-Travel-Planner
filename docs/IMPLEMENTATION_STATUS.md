# Implementation status

This page separates what works today from what still requires private configuration or future product work. It is intentionally conservative: a compiled adapter is not proof of a valid account, complete market coverage, or bookable inventory.

## Works with no credentials

- Full redacted 2026 Europe sample and manual planning workflow.
- Static `/about` product introduction with reviewed local photo gallery, plus the README and complete bundled-photo documentation gallery.
- Generic `/plan` workflow for arbitrary cities and dates: schema/relationship-validated draft preview, explicit acceptance, planning JSON download and agent brief copy. Drafts stay in browser memory and clear on reload.
- Shared normalized-trip creation/validation through `trip:init`, `trip:validate`, and `schema:check`; canonical booking states and no confirmation-reference field in the planning schema.
- Route overview, detailed city maps, hotels, activities, daily itinerary, booking gaps, cash-versus-points comparison, and downloadable CSV/HTML/PDF exports.
- Explainable route optimization from manually entered candidate legs.
- Provider health and research surfaces that degrade to manual handoffs.
- Local browser persistence for planner edits and saved research shortlist items.
- Phone-native bottom navigation and a keyboard-accessible trip command palette (`⌘/Ctrl+K`) for fast movement across the complete workspace.

The detailed atlas remains tailored to the reviewed Europe 2026 sample, with a separate legacy 2025 view. The generic planning schema now drives `/plan` and the CLI, but accepted drafts do not yet populate generic daily itinerary, quote-selection or map views. The reusable modules and remaining trip/city coupling are documented in [MODULARITY.md](MODULARITY.md).

Atlas CSV/HTML/PDF downloads apply redaction even for legacy private-operational callers. Private booking identifiers remain outside downloadable artifacts. The repository's source license is MIT; third-party media rights are a separate review boundary.

## Implemented but optional

- SerpApi server adapter for cash flights, hotels, places, and web research.
- Seats.aero cached award-flight research; commercial Live Search only when explicitly configured.
- Rooms.aero award-hotel research.
- Booking.com Demand hotel research for eligible partner accounts.
- Private Gmail read-only booking-candidate preview with no automatic import or trip mutation.
- Production live-quota access code and signed secure session.

These paths were validated with mocks and zero-credential degradation. No real provider key, mailbox, or private booking record was used during repository verification.

## Manual by design

- Expedia, trivago, Priceline, and TripAdvisor comparisons open safe handoffs; TRIPPY neither scrapes them nor claims live API coverage.
- Rail, coach, ferry, car rental, calendar, and activity providers can be entered manually or supplied by an independently installed, user-authorized host connector.
- No result makes a purchase, sends mail, changes a calendar, or becomes confirmed without explicit traveler review.

## Next production phases

1. Authenticated multi-user accounts and an encrypted database for private trips.
2. A durable Gmail review/approve/reject ledger with an explicit retention and deletion policy.
3. Distributed rate limiting and per-user provider budgets.
4. Additional official provider adapters where account eligibility and terms permit.
5. Independent public-release review, accessibility audit, and provider-credential integration tests in a private environment. The local candidate now includes staged-tree and reachable-history scanning, but that does not replace independent review.
6. A canonical-trip adapter for detailed itinerary/maps/quote selection, data-driven atlas trip selection and isolated per-trip persistence, followed by complete browser verification using materially different invented trips. Generic validated draft creation and agent handoff are already implemented.

The private staging GitHub repository is `0marm0/Trippy-Travel-Planner` and remains pre-release. A working Vercel demo does not authorize source publication.
