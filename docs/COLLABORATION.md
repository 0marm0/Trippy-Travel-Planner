# Collaborative itineraries: implementation plan

TRIPPY can grow into a trip workspace where friends add ideas, edit daily plans and review changes together. Start with reviewed file proposals, then add a generic itinerary editor, then authenticated hosted sharing. This document is a proposed architecture, not a claim that accounts or simultaneous editing exist today. No deployment, external sharing, invitations, private-data reads or bookings are performed by this plan.

## What exists and what it supports

| Existing seam | Reuse | Limitation |
| --- | --- | --- |
| `src/lib/normalized-trip.ts`, `schema/trip.schema.json`, `/plan` | Generic cities/dates/preferences, schema and relationship validation, preview/accept, local draft download | No generic activities/daily allocations; accepted draft lives in browser memory, not a shared account |
| `src/lib/trippy-bundle.ts`, `schema/trippy-update.schema.json` | Bounded parse/sanitize, canonical ID scope, before/after diff, reviewed local acceptance | v1 references existing activities/options only; no new activity records, base revision, authenticated author or conflict detection |
| `src/components/update-inbox.tsx` | Proposal review UI | Local state update; no shared proposal ledger or durable identity |
| `src/lib/trip-model.ts`, `current-trip.ts` | Display types and reviewed sample compatibility adapter | `Trip2026Payload.id` is `europe-2026`; booking labels and data shapes need explicit canonical migration |
| `src/lib/trip-exports.ts` | Sanitized display snapshots | Downloads are copies, not editable shared workspaces or revocable links |
| `src/lib/providers/` | Typed research adapters, source/freshness/errors and optional manual fallback | Existing server access is not a hosted trip membership or per-user billing system |

The current bundle replaces a supplied day's assignment list and supplied saved-item/evidence arrays. Two independently edited copies can overwrite one another after manual acceptance. A `bundleId` is descriptive; it is not an authenticated author, authorization grant, or durable replay ledger. A `snapshot` is not a three-way merge base. Existing bundles cannot rewrite stops/dates, import confirmations or create activities. See [MODULARITY.md](MODULARITY.md) for the generic renderer dependency.

## Order of delivery

| Milestone | Deliverable and source seam | Completion gate |
| --- | --- | --- |
| C0: reviewed handoff | Local export of a validated, sanitized known-ID workspace snapshot; friend returns v1 proposal to the existing inbox | Export → friend edits supported selections → owner previews → accepts/rejects → reload preserves accepted atlas state; wrong-trip/unknown-ID/private-text cases are visible |
| C1: generic modular itinerary | Versioned canonical stops, activities and day allocations; pure canonical-to-view adapter; editor with add/edit/move/remove and undo | Two invented trips, including one city outside Europe, render and edit without sample defaults; dependency/constraint/date validation passes |
| C2: versioned file collaboration | Redacted share DTO plus bounded operation proposal, base hash/revision, three-way review, durable local decision receipt | Independent additions merge; same-field edits and delete-versus-edit require choice; duplicate proposal is idempotent; stale proposals cannot silently replace current state |
| C3: hosted private groups | Accounts, relational persistence, trip membership, invitation acceptance/revocation, transactional conditional writes, backups | Cross-trip permission tests, revocation races, two-browser conflict flow and restore drill pass before hosted launch |
| C4: optional live convenience | Presence/comments/events; offline outbox/rebase using C2 operations | Reconnect after concurrent edits shows conflicts; revoked members cannot replay writes; optional realtime failure preserves editing |

C0 is useful for choosing from an existing catalogue. It is not the complete “friends add activities” feature. C1–C2 establish that feature without choosing a hosting vendor. Hosted accounts are a separate product and operations commitment. Keep provider-free planning functional at every stage.

## Choose a collaboration path

| Choice | Best fit | What must be built | Tradeoff |
| --- | --- | --- | --- |
| Local versioned files first | A small group that can exchange copies and let one traveler approve the agreed plan | C1 activity editor and C2 base-aware proposals; C0 remains a narrower useful handoff today | Lowest hosting commitment and no accounts; manual exchange, unverified authors and no revocation of copies |
| Your own hosted backend | Friends expect one link, protected access, editing from multiple devices and durable shared history | C1 domain/editor plus C3 accounts, persistence, trip permissions, conditional writes and operations; reuse C2 merge logic for offline proposals | Smoother shared editing after implementation; owner operates security, billing, backups, retention and provider budgets |

For the requested ability to let friends add activities, deliver C1 first and C2 next so the collaboration rules are tested locally. If a protected link and immediate cross-device editing are essential from the outset, deliver C1 then C3 using the same operation contracts, with explicit online conflicts; C2 offline exchange can follow. Merely hosting the current app does not provide either new activity creation or protected shared editing. No cloud, database or authentication vendor is selected until hosting, region, budget and account requirements are known.

## Target module boundaries

Use pure domain functions for validation, operation application, diff and merge. Browser UI and server handlers must call the same domain rules. A proposed layout is `src/lib/collaboration/{types,share-projection,operations,merge}.ts`, `schema/trippy-share.schema.json` and `schema/trippy-proposal.schema.json`; these files do not exist yet. Add a `TripRepository` interface for loading a redacted revision, submitting a proposal and accepting a reviewed proposal. Its local and hosted implementations share contracts, not storage credentials.

Keep the sample compatibility adapter separate. Activity editing should target canonical records; the view adapter derives presentation. Transport, stays, activities, route allocations and comments should be independently editable modules with stable IDs and explicit relationships. Use entity IDs rather than array indexes in operations, and never recycle deleted IDs. Preserve tombstones for the supported offline merge window.

## Proposed data contracts

These contracts require a new format/version; the current v1 parser must not silently accept them. Version denotes schema compatibility. Revision denotes content changes. Neither confers permission.

| Record | Required fields and rules |
| --- | --- |
| `ShareSnapshot` | `format`, `schemaVersion`, opaque `tripId`, `revision`, canonical `contentHash`, `createdAt`, sanitized title, selected dates/stops, approved activity catalogue, daily assignments, planning choices/evidence, visible limitations; construct by allowlist |
| `Activity` | Stable opaque `id`, known `placeId`, title, category, bounded plain-text notes, optional reviewed coordinates/duration/opening constraints, evidence references, `recommended` initial booking status; source facts and estimates remain distinct |
| `DayAllocation` | Stable stop ID, ISO local date, timezone, stable assignment IDs, activity reference, optional local time/duration, ordering; dates must fit trip/stop windows and locked anchors |
| `Proposal` | `proposalId`, `tripId`, `schemaVersion`, `baseRevision`, `baseHash`, `createdAt`, bounded operation list and safe summary; offline author alias is unverified metadata |
| `Operation` | Stable `operationId`; supported action such as `activity.add`, `activity.update`, `activity.remove`, `assignment.add/move/remove`, `choice.set`; entity ID, expected entity/field revision, typed payload; no arbitrary JSON paths or executable values |
| `ReviewReceipt` | Proposal/base/current/result revisions and hashes, accepted/rejected operation IDs, conflict choices, decision time; hosted actor derived from session, not a submitted body |

Define deterministic serialization before hashing (sorted object keys, preserved meaningful list ordering, explicit absent/null rules, normalized timestamps). Verify the saved base bytes against the hash; a supplied hash alone is not a merge base or proof of authorship. Retain an immutable sanitized base snapshot locally for C2. Bound bytes, strings, operations and history retention; reject unsupported versions and oversized input before preview.

New activities enter as suggestions. Adding an activity or selecting a hotel never promotes a booking. Booking transitions use only `recommended`, `quoted`, `held`, `confirmed`, `missing`, `conflict` and their separate review rules. Editors cannot create confirmations by sending an operation.

## File workflow and conflicts

1. Owner selects what friends need, previews the sanitized snapshot, then downloads it locally. The user chooses recipients and sends it using their own channel; TRIPPY does not send messages.
2. Friend opens the same version of TRIPPY or gives the reviewed file to their agent. They change their local copy and return a proposal relative to its saved base.
3. Owner previews every proposed addition, removal and move, along with stale data and schedule conflicts. Accept/reject choices are recorded before the canonical revision advances.
4. Owner sends a fresh accepted snapshot when useful. Copies already downloaded cannot be remotely revoked; file mode has no trustworthy actor identity or access enforcement.

For C0, manually compare every changed field with the latest local plan. Warn that saved/evidence arrays and day lists may replace current work. Treat friend additions outside the known catalogue as separate suggestions; do not describe them as importable v1 activities.

For C2, compare base, local and proposed values. Apply a change automatically only when the current field still equals its base, or when both changes resolve to the same value. Distinct activity additions can combine when IDs do not collide. Same-field edits, remove-versus-edit, changed dates, conflicting hotel choices and moves that violate anchors become explicit conflicts. Array reorder is a conflict unless the operation's positioning precondition remains valid. Show “original / your current plan / friend's proposal”; offer keep current, use proposed, or edit a combined value. Validate the whole resulting graph after decisions; never silently use last writer wins. Reject/rebase when the saved base is unavailable. Undo creates a new revision; history remains intact.

## Hosted authorization and persistence

Use a standard maintained authentication integration when C3 is authorized; keep domain modules provider-neutral. A relational database can hold `trips`, `trip_members`, `invitations`, `trip_revisions`, `proposals`, `proposal_decisions` and `operations`. Choose a managed vendor only after checking region, retention, cost, backup and user requirements. No account/database vendor is selected by this document.

| Role | Shared plan capabilities |
| --- | --- |
| Owner | Manage membership/invitations, transfer ownership through a separate verified flow, accept changes, manage shared plan |
| Editor | Add/edit activities and assignments under reviewed or owner-enabled direct-edit policy; submit proposals; cannot grant access or change booking state |
| Viewer | Read the authorized shared projection; cannot write, trigger paid research or access private booking records |

Default to review-required edits. If the owner enables direct activity edits, record each committed edit with revision/actor and show conflicts. Locked anchors, dates, bookings and permission changes retain separate review. Membership must be checked on every read, write, export, research call and event subscription. Deny by default and use server-derived identities. This follows [OWASP's authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), checked 2026-10-13.

Invitation links should contain a high-entropy, short-lived, single-use token whose hash is stored server-side. Tokens belong only to the delivery/acceptance path, never trip files, exports, logs, analytics or referrers. Bind acceptance to the intended authenticated account when an invite is account-specific. Any contact identifier remains in private identity infrastructure, outside the shared trip DTO. Sending invitations requires explicit user authorization. Role changes and revocations are audited; expired/revoked invites cannot be redeemed. Prevent removal of the last owner. Recheck membership inside the write transaction so a stale editor session cannot win a revocation race; terminate or invalidate subscriptions too.

Reads return a strong ETag for the authorized shared revision. Writes require `If-Match` and compare-and-swap within the same database transaction as validation, permission checks, revision creation and operation deduplication. A stale conditional write returns `412`; domain constraint conflicts return `409` with safe conflict metadata. Never retry a stale mutation as an unconditional overwrite. Conditional writes and strong comparison follow [RFC 9110 §13.1.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1), checked 2026-10-13. A websocket event announces a new revision; it never grants access or authorizes a write.

Do not serve private groups as public/static pages. Authorized responses and redacted exports need explicit cache controls; avoid shared CDN cache keys, analytics payloads, error dumps and search indexing containing trip content. Restore/delete/retention behavior must be documented and tested. Revocation blocks future access but cannot erase prior screenshots or downloads.

## Privacy and research cost boundaries

Build `ShareSnapshot` by allowlist from planning data; never serialize a private object then hide fields in the UI. Shared plans may contain only the user's approved decision-useful information. Even redacted cities/dates/preferences are personal itinerary content and must not become public examples without explicit approval. Recipient preview remains necessary.

Keep raw booking/email data, confirmation references, record locators, seats, loyalty identifiers, email addresses/links and tokens in a separate private booking vault. The vault has a separate authorization boundary and retention policy; trip membership alone grants no access. Shared views receive only approved booking summaries/state. C3 can ship without a hosted vault by keeping operational details private-local. No identifiers or credentials belong in snapshots, proposals, receipts, comments, exports, fixtures, screenshots or tracked files. Scan nested keys and text as well as structured fields; sanitization does not establish consent.

Each hosted research request needs an authorized actor, permitted provider, explicit payer and approved quota. Track per-user/per-trip/provider counters and estimated monetary reservations atomically before dispatch; settle actual usage afterward with provider-specific reconciliation. Limit concurrent requests, retries, daily spend and result sizes. Default paid quotas to zero until configured. An editor must not spend the owner's personal key by editing or accepting a proposal. Provider credentials stay server-side in the user's configured secret custody, separate from the shared DTO. Source cache scope must respect provider terms and privacy; manual/no-key fallback remains visible. Existing host-local keys and access controls do not prove multi-user permission or commercial use rights.

## Acceptance packet

Before claiming a milestone complete, retain test receipts and the demonstrated scope. Use invented data exclusively for screenshots and collaboration tests.

- Two materially different trips edit independently; switching trips cannot leak assignments, activity IDs, dates, currencies or provider evidence.
- Owner exports → friend adds a new activity in C1/C2 → friend moves it to a day → owner previews → accepts → friend receives the accepted revision. Rejecting leaves the canonical plan unchanged.
- Two friends add distinct activities; two friends edit the same title; delete competes with edit; overlapping assignments violate a locked anchor; stale base is missing; unknown IDs and duplicate operations arrive. Expected merge/conflict behavior is explicit and deterministic.
- Privacy checks cover free text, keys, Unicode, nested structures, source/evidence, comments, receipts and error paths. Unknown fields cannot smuggle private payloads. No real values are read to test this.
- Hosted viewer/editor/owner checks cover reads/writes/exports/research/subscriptions across two unrelated trips, role escalation, expired/replayed invites and revoked session/outbox races.
- Two simultaneous hosted writes yield one committed revision and one safe stale response; retry with the same operation ID cannot duplicate an activity. No silent overwrite occurs after reconnect.
- Paid research requires payer consent and an available quota, including parallel requests. No-provider mode completes the collaboration flow.
- Keyboard/mobile review, clear authorship limitations, cache behavior, backup/restore, deletion and offline-state messaging pass. Run the repository lint, typecheck, tests, schema/privacy checks and build plus a representative end-to-end flow.

Realtime presence and CRDTs can be reconsidered after measured demand. Start with versioned operations and explicit conflicts: shared itinerary constraints and booking review still require application-level decisions even if text edits eventually use a CRDT.
