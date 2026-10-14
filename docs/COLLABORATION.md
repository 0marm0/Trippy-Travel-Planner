# Collaborative planning

TRIPPY supports reviewed file exchange and optional live activity/day rooms. The detailed atlas remains the reviewed Europe sample; generic `/plan` drafts and live boards do not automatically populate it. No database is provisioned, no invitation is sent, and no deployment or booking is performed by these workflows.

## Live activity/day rooms

Open `/collaborate`, prepare a planning board or load the reviewed public sample, and review the content before publishing. The board contains title, dates, cities, activities and assignments to days. Owners update that trip frame and grant/revoke editor or viewer invitations. Editors add/edit activities and arrange days; viewers read. Booking records, booking-state transitions, raw email, traveler identifiers, provider credentials and private trip DTOs are outside this format.

The browser polls every four seconds. Each save carries its last observed revision. Permission is checked inside the same database transaction as the conditional write. A stale save returns the latest safe state and preserves the draft for explicit review/reload. This is direct editing under the granted role, not a proposal-by-proposal owner approval ledger or automatic three-way merge.

| Storage mode | Supported deployment | Requirements |
| --- | --- | --- |
| SQLite | One Node 22.18+/24 server with persistent disk | Explicit enablement; ignored `.private/collaboration/rooms.sqlite`, private backups and process operation |
| Postgres | Multiple servers or Vercel/serverless | Explicit enablement and your own `COLLABORATION_DATABASE_URL`; database account, billing, network controls and backups |

Set `COLLABORATION_ENABLED=true` to enable rooms. Remote or production creation requires the server's privately generated `COLLABORATION_CREATE_CODE`; enter it only in the masked creation field. Development loopback creation works without a code unless configured. Vercel fails closed without durable Postgres. Manual/sample mode works with collaboration disabled. [Complete setup, API and boundaries](LIVE_COLLABORATION.md).

Invitation links carry random capabilities in fragments. Requests use Authorization headers and the server stores capability hashes. Anyone holding a capability has that role; these are not authenticated people or hosted private-trip accounts. Keep the owner capability private. Revocation denies future requests but cannot erase data a recipient already saw. No email address is collected and TRIPPY does not send links. Creation codes, capabilities and connection strings never belong in trip records, logs, screenshots, tracked files or query parameters.

The sample endpoint explicitly loads public-only sample data and projects an allowlist. It preserves valid, unique day assignments to retained activities and reports retained/scheduled/omitted counts. It does not read the private-data gate or share bookings. Review even allowlisted prose before publishing: a validator cannot recognize every private fact.

## Reviewed file exchange

Downloads are copies. `/plan` validates and previews a proposed normalized draft, then accepts the whole record after manual comparison with the current draft. Supported atlas `.trippy` bundles propose existing activity assignments, priorities and known hotel/transport selections. Their v1 format cannot add activities, rewrite dates/cities, import confirmations or detect concurrent edits. New attractions may be plain-language suggestions or activities added to a separate live board.

The update inbox supports local acceptance or rejection. A day list, saved-items list or evidence list may replace the current list; review each affected value against the latest plan. A bundle ID is not authenticated authorship and a file snapshot is not a saved three-way merge base. Retain rejected alternatives and conflicts. Downloads cannot be revoked.

## Remaining product work

- Account identity, recovery, private-trip authorization and encrypted private storage.
- Versioned offline operation proposals, saved merge bases, partial decisions, immutable review receipts and history.
- Presence, comments, reconnect/outbox/rebase, room expiry/deletion and retention controls.
- Generic detailed atlas rendering and explicit integration among `/plan`, live boards and atlas records.
- Distributed abuse controls, hosted backup/restore drills and live Postgres integration verification before an operated hosted launch.

These require their own review and operations decisions. Live rooms do not confer authority to publish a repository, deploy, read private files or mail, make a booking, send invitations or mutate a calendar. [Deployment modes](DEPLOYMENT_MODES.md) · [Collaborative agent prompt](../prompts/COLLABORATIVE_TRIP_GUIDE.md).
