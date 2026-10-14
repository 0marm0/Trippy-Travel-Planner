# Implementation status

This describes the local candidate on 2026-10-14. A compiled adapter, successful local test or recorded quote does not prove live inventory, provider eligibility or hosted readiness. [Remaining work](IMPROVEMENT_ROADMAP.md) · [Verification receipts](RELEASE_REPORT.md).

## Choose the actual workspace

| Surface | Implemented behavior | Boundary |
| --- | --- | --- |
| Sample atlas `/` | Reviewed Europe 2026 routes, maps, hotels, activities, editable days, booking gaps, research surfaces and exports; legacy 2025 view | Specialized sample data and controls; it is not the arbitrary-trip loader |
| Generic `/plan` | Validate and preview arbitrary dates/cities, accept a manual workspace, add route alternatives, destination/day assignments, timed activities, explicit coordinate pins and reviewed stay/transport records | No automatic geocoding, route search, hotel inventory or booking confirmation |
| Research coverage | Per-trip category ledger, source/time/scope/limitations, outstanding work, reviewed JSON import/export and optional device storage | Manual evidence receipts; switching workspace sections preserves the current ledger |
| Quote comparison | Recorded cash/award/transport/stay quotes, dates, party/room basis, currency, baggage/cancellation, source/freshness, unknowns and points/transfer assumptions | Manual sourced comparison; no live inventory acquisition, FX conversion or inferred availability |
| `/collaborate` | Reviewed share-safe city/activity/day boards, role capabilities, conditional writes, reconciliation, optional device recovery and lifecycle controls | Separate board; excludes bookings, research and authentication/provider data |
| Optional `/account` | Better Auth sessions and tenant-isolated encrypted planning workspaces on configured SQLite/Postgres | Disabled by default; explicit upload/load; separate from capability rooms and provider accounts |

## Works without credentials

Generic workspaces start empty, preserve the traveler's destinations/dates and do not inherit sample bookings or geography. Day activities carry manual local times, durations and notes; feasibility checks flag overlaps, midnight spill and destination/locked-anchor conflicts. Route alternatives preserve supplied city orders; ranking and schedule feasibility are not inferred. Booking record changes require preview and acceptance with the canonical states `recommended`, `quoted`, `held`, `confirmed`, `missing`, `conflict`.

Browser saving is explicit and isolates records by trip ID, dates and destinations. Resume/forget controls manage the saved workspace; unsaved preview records remain in memory. Research and quote evidence have separate validated storage/export contracts. Browser storage is device-local and accessible to other users of that browser; it is not encrypted cloud sync.

`trip:init`, `trip:validate` and `schema:check` share normalized validation. Generic planning JSON and itinerary sidecars retain editable records; visual HTML and compact travel/transit/hotel HTML/PDF provide reading copies. Atlas visual/light/dark exports and CSV remain available. [Formats, privacy and offline limits](EXPORTS.md).

The generic workspace can prepare a validated activity-board JSON handoff: review it in `/collaborate` before creating a room. Only cities, coordinates, activities and day assignments transfer. This is explicit file interchange, not bidirectional synchronization with a live room or the sample atlas.

## Optional research and imports

Implemented adapters include SerpApi cash flights/hotels/places/web, Seats.aero cached award flights, separately eligible commercial Live Search, Rooms.aero and eligible Booking.com Demand. Provider tests use mocks and zero-credential degradation. Host travel connectors remain independently installed and authorized agent tools; they do not become website credentials. Rail/car/coach/ferry/operator gaps use manual or authorized source research.

Private Gmail is a read-only candidate preview, with consent before reading and separate approval before any import/state change. It has no durable approve/reject ledger. No local verification used a real mailbox, provider key or private confirmation. [Integration coverage](INTEGRATIONS.md).

## Collaboration and account persistence

Rooms require explicit enablement and persistent Node/SQLite or user-owned Postgres; remote/production creation requires a private creation code. Owners manage dates/cities/invitations, rotate their owner link and delete rooms; editors modify activities/days; viewers read. New invitations expire, revocation and deletion deny subsequent server access, and stale management/writes fail closed. Field/entity/day reconciliation requires explicit choices and validates references; another revision pauses application. Consent-based recovery retains only a validated board and base revision, with capabilities and unfinished forms excluded. [Live contract](LIVE_COLLABORATION.md).

Optional accounts use database-checked sessions, AES-256-GCM plan encryption bound to owner/plan IDs, tenant-qualified queries and revision-conditional updates/deletes. There is a 20-plan limit per account. Account deletion requires the current password and removes server plans/authentication/session records; exports, local copies and backups remain outside that deletion. Password recovery has an injectable transport tested with a mock, but no real transport or recovery UI is wired. Authentication metadata is separate from encrypted trip content. [Configuration and custody](PRIVATE_ACCOUNTS.md).

SQLite tests exercise restart durability and access restrictions with synthetic records. Postgres adapters are implemented but no user-owned remote database was provisioned or tested. Hosted operation, request throttling, enrollment, backups and retention remain operator responsibilities.

## Remaining verification and product gaps

- Source/checked-time fields are not yet attached to every generic activity or booking fact; companion ledgers do not prove each item's freshness.
- Quote comparisons require like-for-like human review; transfers, taxes, service schedules, opening hours and bookability must be reverified.
- Generic workspaces do not replicate every specialized atlas catalogue, city photograph, hotel map or quote-selection feature.
- No automatic booking, points transfer, invitation/email sending or calendar mutation; no presence, room audit history, end-to-end encryption or recovery of a lost room-owner capability.
- Independent accessibility/public-release review and authorized real-provider/hosted-storage integration validation remain separate acceptance work.

Repository publication and deployment require explicit authorization. The existing demo may lag this source and was not redeployed by these changes.
