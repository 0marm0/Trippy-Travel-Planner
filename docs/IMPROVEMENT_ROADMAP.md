# Improvement roadmap

Trippy has a working sample atlas, generic validated draft creation, sanitized exports and optional shared activity/day rooms. It does not yet offer one complete arbitrary-trip workspace. This roadmap prioritizes the remaining product gaps; it is not a release promise or authorization to provision services, access private records or deploy.

For implemented behavior and verification boundaries, see [implementation status](IMPLEMENTATION_STATUS.md). Source audit: 2026-10-13, principally `src/components/new-trip-planner.tsx`, `src/components/collaboration-workspace.tsx`, `src/lib/collaboration/store.ts` and the collaboration API routes. Provider adapters have mock/degradation coverage, not proof of live eligible accounts. Hosted Postgres still needs private integration validation.

## 1. Connect new-trip drafts to the full workspace

**Gap:** `/plan` can create, validate, preview and accept arbitrary-trip planning records, download JSON and copy an agent brief. It does not feed the detailed atlas's maps, itinerary or quote-selection views. The atlas remains specialized around the 2026 sample.

**Acceptance:** Two materially different invented trips with different dates, continents and city counts render through the same map/day/hotel/transport views. Loading either never imports sample bookings, cities or dates. Edits and persisted preferences are isolated by trip ID; unknown coordinates and unpriced options remain unknown. Schema validation and a browser flow verify preview → acceptance → workspace editing → sanitized export.

## 2. Make shared editing easier to recover and reconcile

**Built:** Owners and editors add, edit and delete activities; assign, unassign and reorder them within days. Owners manage metadata and invitations; viewers cannot write. Four-second polling and revision-conditional saves detect concurrent changes without silently overwriting them. Conflicts preserve the board and unfinished activity form in the current tab, offer a validated share-safe board JSON download (excluding unfinished form fields), and require confirmation before discarding local edits to load the latest state. Date changes retain in-range day assignments and return out-of-range assignments to the catalogue.

**Gap:** Conflicting states need a clearer, field-level reconciliation workflow. The current room UI reviews the incoming state and offers explicit discard/load, without merging or reimporting downloaded boards. Automatic recovery after reload remains future work. Existing polling, unload and header-link protection does not cover every browser-history navigation.

**Acceptance:** A two-browser scenario with independent activity and day edits displays both versions, preserves the local draft and applies only explicitly accepted changes against the current revision. A second concurrent update interrupts reconciliation safely. Role revocation prevents further writes. Any draft recovery is explicit, share-safe and keeps access capabilities separate from planning data.

## 3. Complete the room lifecycle

**Gap:** Revocable editor/viewer invitations exist; room deletion, invitation expiry and owner-link rotation do not. Hosted Postgres is implemented but has no live database verification receipt.

**Acceptance:** Owners can revoke or expire invitations, rotate ownership access and delete a room with a clearly stated retention policy. Tests verify old links fail, viewer/editor roles cannot manage ownership, and deleted data is removed according to that policy. A user-authorized private Postgres environment verifies restart persistence, concurrent writes and revocation across separate server instances. Do not label hosted support production-validated until these checks pass.

## 4. Make research coverage and freshness visible in the trip

**Built:** Optional cash, award, hotel and search adapters coexist with manual entry and safe provider handoffs. Research results require eligibility, attribution and checked-at times; a result never creates a booking.

**Gap:** A reusable trip-level coverage ledger should make outstanding hotels, city research, flexible dates, gateways, rail/car options and booking gaps easier to inspect from the workspace.

**Acceptance:** Each requested research category has a source, checked-at time, evidence state, limitations and unresolved action. A materially different three-route comparison retains rejected alternatives and cash/points assumptions. Missing, stale or unavailable provider results remain visible; unavailable award search never implies no seats exist. Account-backed tests run only in an explicitly authorized private environment, with no credentials or raw response identifiers entering artifacts.

## 5. Add private-trip accounts only with a complete privacy model

**Gap:** Capability-based share-safe rooms are not authenticated private-trip accounts. Private confirmation imports have a read-only candidate preview, without a durable approve/reject ledger.

**Acceptance:** Document ownership, access, retention, deletion and recovery before introducing a private-trip database. Test tenant isolation, authorization, encrypted storage where required, import deduplication and explicit approve/reject decisions. Raw email and operational booking identifiers remain outside public/exportable records. Provider quotas and budgets are isolated by user, and exports remain sanitized.

## 6. Verify readiness on representative devices and failures

**Built:** Repository lint, type checks, tests, schema checks, production builds, private-boundary scans and sample browser flows provide a local quality gate.

**Acceptance:** Run an independent accessibility and public-release review of the exact candidate, keyboard and phone planning flows, two-browser collaboration, offline/map failures and materially different invented trips. Record which storage/provider modes were exercised and which remain unverified. A passing local gate does not authorize publication or deployment.

The next product milestone should combine priorities 1 and 2: a traveler starts their own trip, edits real days and safely reconciles a friend's suggestions. More providers should follow demonstrated coverage gaps and eligible account access.
