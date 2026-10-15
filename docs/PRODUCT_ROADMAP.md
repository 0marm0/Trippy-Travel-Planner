# Trippy product and design roadmap

Delivery roadmap · updated 2026-10-14 · original proposal baseline `b229d25`.

This retains the proposed delivery sequence and broad acceptance targets. The current status column is assessed against local source in [the complete 62-item build ledger](BUILD_PROGRESS.md); partial delivery does not complete a broader row. It expands the [engineering improvement roadmap](IMPROVEMENT_ROADMAP.md) and [UI direction](UI_UX_ROADMAP.md). [Implementation status](IMPLEMENTATION_STATUS.md) describes what actually works. Existing manual/sample planning must remain usable throughout.

## Product direction

Make a trip feel like one coherent workspace: discover, compare, arrange, book and travel. The same elegant experience should work for a new trip, the sample atlas and a reviewed shared plan. More capability should appear when relevant rather than creating more permanent navigation, forms or panels.

The most consequential gap is parity: the detailed sample atlas, generic workspace, evidence sidecars, optional accounts and shared boards have different capabilities and storage contracts. A visual redesign alone will not connect them. Consolidate reusable presentation and explicit data adapters incrementally; never merge private bookings or credentials into a shared board.

## What is built, and what needs extending

| Existing foundation | Proposed extension |
| --- | --- |
| Rich sample route/city maps and hotel/activity catalogues | Reusable detailed views for arbitrary normalized trips |
| Generic manual workspace with explicit saving and recorded evidence | One selected-trip experience, stable IDs and versioned migration |
| Cash/award comparison and optional provider adapters | Search forms using actual party, cabin, currency, dates and program constraints |
| Live activity/day boards with roles and conflict review | Suggestions, votes, comments, change history and deliberate plan reconciliation |
| Optional encrypted account workspaces | Explicit evidence persistence, recovery transport and verified hosted operation |
| Rich HTML and compact travel/transit/hotel HTML/PDF | Better export configuration, preview, size control and cross-format fidelity |
| Local hotel/activity image caches and failure labels | Subject-accurate coverage tracking and resilient galleries |

Current source includes per-item receipts, dated manual route allocations, a device trip library/import path, editable canonical city/day views, bounded cash research, selected-quote budgeting, recorded journey/base geography, sample filter presets, exact-record workspace search and reviewed room route/stay ideas and discussions. Full editable atlas parity, complete door-to-door multimode evidence, sourced hotel transfer burden, actual provider/hosted verification and independent accessibility review remain gaps. D06 and C09 now have bounded local contracts; broader partial rows remain partial. A passed local build does not establish those capabilities.

## Visual direction: quieter, denser, more useful

1. **One workspace shell.** One trip switcher, primary navigation and contextual action bar. Put integration settings, account maintenance and recovery in secondary surfaces.
2. **Compact by default.** Show the decision summary first; expand evidence, amenities, alternatives and full notes. Offer comfortable density without shrinking text to achieve compactness.
3. **Fewer surface layers.** Use a restrained charcoal base and subtle dividers for most content. Reserve glass for navigation, photo overlays and a few floating controls; avoid a glass card inside every other glass card.
4. **A consistent reading hierarchy.** Shared typography, spacing, radii, shadows and focus styles. Use readable secondary text, quieter metadata and one clear primary action per task.
5. **Photographs with purpose.** Use city heroes for orientation and exact property/activity photos for decisions. Keep captions and galleries accessible; city context is explicitly labelled and never impersonates a hotel photo.
6. **Useful first screen.** Show the current city/day, next decision, booking gaps and usable rows before large decorative summaries. Maps can collapse or sit beside lists.
7. **Details in context.** Open a reusable detail drawer for a hotel, attraction or transport option; keep selection, filters and scroll position intact behind it.
8. **Stable transport identity.** Flight blue `#60a5fa`, rail yellow `#facc15`, car purple `#c084fc`. Booking state uses text/icons/patterns separately. Maintain a readable non-map view.
9. **Phone-first actions.** A short bottom navigation and single detail sheet; on desktop use list/map or list/day split views. Preserve keyboard navigation, visible focus, reduced-motion support and appropriate touch targets.
10. **Polish failure states.** Empty, loading, failed, stale, unavailable and unconfigured are different states with useful next actions. Do not fill unknown data with decorative certainty.

Proposed review targets, not measured current results: no more than one permanent header plus one contextual toolbar; no horizontal page overflow at 390, 768 and 1440 CSS pixels; common actions operable by keyboard; normal interactive targets at least 44 CSS pixels where practical; readable body text rather than tiny dashboard labels. Baseline screenshots must be captured at the same viewport and data state before/after each packet.

## Delivery order

Effort is relative: **S** = bounded component or contract change, **M** = several modules/workflows, **L** = cross-surface architecture or external validation. These are scope estimates, not calendar commitments. Build the next packet only after its dependencies and acceptance checks pass.

| Milestone | Deliverable | Why first | Exit evidence |
| --- | --- | --- | --- |
| 1. Premium compact workspace | Shared design tokens, compact rows, contextual drawers, focused city/day layout, useful blank/error states | Improves daily use immediately without adding product fragmentation | Same-data desktop/phone/keyboard before-after review; no hidden controls or lost state |
| 2. Any trip, same quality | Versioned view adapter, selected-trip registry, canonical IDs, per-item evidence and dated route allocations | Makes later features reusable for people downloading the repo | Sample plus invented one-city and non-European trips complete the same edit/save/map/export path |
| 3. Better travel decisions | Profile-aware searches, comparable quotes, bounded date/airport research and multi-mode route alternatives | Makes search and comparison useful for the actual traveler | Party/cabin/currency/terms preserved, coverage ledger complete, unknown costs never treated as zero |
| 4. Better group planning | Reviewed shared projections, proposals/votes/comments/history, clear access and conflict UX | Adds collaboration without exposing private booking data or overwriting edits | Two independent sessions, concurrent edits, revocation, reconnect and explicit merge review |
| 5. Travel companion and portable outputs | Feasible day routing, travel readiness, offline reading, export studio and operational hardening | Supports the trip after planning and makes work easy to share | Offline/failure checks, export conservation, authorized hosted-storage and recovery checks |

Milestones 1 and 2 can proceed in independent UI and data lanes. Collaboration design can proceed alongside them, but new shared-field writes depend on explicit schema, role and migration decisions. Provider validation requires eligible user-owned access; it is not a prerequisite for the manual path. Remote collaboration depends on verified hosting and storage before anyone relies on it.

## Feature backlog

The rows retain their original proposal scope. Current status is **Implemented**, **Partial**, **Planned** or **External dependency**; see [BUILD_PROGRESS](BUILD_PROGRESS.md) for the evidence and remaining acceptance for every ID. “Implemented” describes the supported local contract, not deployment or live-provider readiness. Priorities are **Now**, **Next**, **Later**. Later items should be promoted by observed user needs rather than implemented all at once.

### Design and navigation

| ID | Proposal | Current status | Priority / effort | Done when |
| --- | --- | --- | --- | --- |
| D01 | Shared tokens and reusable shell across atlas, generic, collaboration, About and account | Partial | Now / M | Same spacing, typography, controls, focus and status semantics across surfaces |
| D02 | Compact/comfortable density with row-based lists | Partial | Now / M | Density persists per device; comparison stays readable and full details remain reachable |
| D03 | One context drawer for activities, hotels and transport | Partial | Now / M | Open/close returns focus and preserves list filters, selection and position |
| D04 | Simplify navigation into route, days, stays, research and trip readiness | Partial | Next / M | Existing features remain reachable; user tests validate labels and task paths |
| D05 | Synchronized list/map/day selection | Partial | Next / M | Selecting a record highlights the same ID without changing the plan |
| D06 | Filter presets, active-filter chips and clear-all | Implemented | Next / S | Counts and empty states explain every active constraint |
| D07 | Extend command search to dates, cities, activities and navigation | Partial | Next / M | Keyboard search opens the correct context and never exposes private/raw records |
| D08 | Intentional photo crops, gallery loading and missing-image treatment | Partial | Now / S | Exact-subject association, attribution, fallback and layout stability verified |
| D09 | Mobile detail sheets and task-focused bottom navigation | Partial | Next / M | Complete planning and comparison flows work at phone width without hover |
| D10 | Accessible chart/map/list alternatives, reduced motion and visible focus | Partial | Now / M | Keyboard and screen-reader review covers core tasks; colors are not the sole signal |
| D11 | Contextual empty, offline, stale and provider-failure states | Partial | Now / M | Each state identifies the gap and preserves work with a relevant next action |
| D12 | Consistent About/README feature tour using current app captures | Partial | Next / S | Each claim links to a supported path; historical/demo/provider limits remain clear |

### Trip model and reusable planning

| ID | Proposal | Current status | Priority / effort | Done when |
| --- | --- | --- | --- | --- |
| P01 | Canonical-to-detailed-view adapter; sample becomes a compatibility data pack | Partial | Now / L | Arbitrary trip views inherit no sample dates, bookings, cities or photo assumptions |
| P02 | Unified trip selection, saved-draft library and versioned state migration | Partial | Next / L | Switching trips never leaks selections/evidence and old saves can be reviewed/migrated |
| P03 | Per-item source, checked time, confidence and unknown fields | Partial | Now / M | Evidence survives editing, interchange and reading exports with stable references |
| P04 | Dated nightly allocation for every route candidate | Partial | Now / M | Nights sum correctly and fixed-event/transit conflicts are explained |
| P05 | Versioned workspace envelope for trip, itinerary and evidence | Implemented | Next / L | Explicit save/load restores supported sidecars or clearly reports omissions |
| P06 | Duplicate a trip or create a reviewed scenario | Implemented | Next / M | New IDs and ownership; no accidental copying of confirmation or access data |
| P07 | Safe undo/redo for local edits | Implemented | Next / M | Explicit local changes can be reversed; shared revision conflicts remain separate |
| P08 | Better guided intake with saved constraints and reactive questions | Partial | Next / M | Dates, travelers, points, pace and must-dos drive prompts; no repeated answered questions |
| P09 | Unified decision inbox for incomplete evidence and booking gaps | Partial | Next / M | Every issue opens its source item and distinguishes recommendation from confirmation |
| P10 | Plan snapshots with readable change summaries | Implemented | Later / L | Restore previews its effect; exports/private records/access credentials remain separate |

### Routes, flights, points and stays

| ID | Proposal | Current status | Priority / effort | Done when |
| --- | --- | --- | --- | --- |
| R01 | Wire search forms to actual travelers, cabin, rooms, currency and trip dates; fix Sort | Implemented | Now / M | Outgoing requests and ordering reflect visible controls and unsupported fields are disclosed |
| R02 | Bounded flexible-date matrix with searched/failed/unsearched cells | Partial | Next / L | Visible scope, cancellation, quota estimate and manual fallback; no automatic exhaustive claim |
| R03 | Airport/gateway/open-jaw comparison with protection and positioning context | Partial | Next / L | Whole-ticket quotes remain distinct from summed one-ways and self-transfers |
| R04 | Whole-route alternatives varying city order, nights and ground modes | Partial | Next / L | At least three materially different feasible candidates or explicit constraints preventing them |
| R05 | One leg comparison for flight, rail, car and supported coach/ferry evidence | Partial | Next / M | All-in cost, door-to-door time and unknowns are comparable; geometry is labelled honestly |
| R06 | Points-program balances, ratios, bonuses and valuation scenarios | Partial | Next / L | Source points, taxes, delays and seat evidence are visible; no automatic transfer |
| R07 | Pin and compare a small shortlist of complete cash/award options | Partial | Next / M | Equivalent party, dates, cabin and terms; incomplete totals never win by treating gaps as zero |
| R08 | Hotel base comparison against the actual days | Partial | Next / L | Travel burden uses sourced routes or labelled estimates, including airport/station transfers |
| R09 | Hotel total-stay and room/cancellation comparison, including split stays | Partial | Next / M | Per-night and total units, taxes, occupancy, bed types and terms remain explicit |
| R10 | Opt-in saved-search refresh and price/award change alerts | Planned | Later / L | Eligible provider, budget, interval, expiry, freshness and explicit notification authorization |

### Friends and group decisions

| ID | Proposal | Current status | Priority / effort | Done when |
| --- | --- | --- | --- | --- |
| C01 | Compact shared-board shell with contextual editing instead of permanent long forms | Implemented | Now / M | Add/edit and day assignment work without displacing the whole catalogue |
| C02 | “Suggest a change” mode with owner review | Implemented | Next / L | Proposal is distinct from an applied edit; rejected suggestions remain intelligible |
| C03 | Votes and personal must-do lists | Partial | Next / M | Group preference never silently changes confirmed bookings or the owner's locked anchors |
| C04 | Comments attached to safe activity/day/proposal IDs | Implemented | Next / M | Bounded text, role checks and deletion/retention rules; no private booking uploads |
| C05 | Clear save/reconnect indicators and participant presence | Partial | Next / L | Presence is explicitly scoped and ephemeral; pending/failed/saved states are distinguishable |
| C06 | Shared change history and attributable revision summaries | Implemented | Next / L | Authorized members see safe changes; no raw credentials/identifiers in history |
| C07 | Human-readable invitation role, expiry and revocation UI | Implemented | Next / S | Owner/editor/viewer behavior and expired/revoked outcomes are obvious and tested |
| C08 | Explicit proposal reconciliation between shared board and owner workspace | Partial | Next / L | Mapping/version preview, deletions and conflicts reviewed; no automatic full-plan synchronization |
| C09 | Reviewed route/stay proposals using a separate allowlisted share schema | Implemented | Later / L | Private bookings and references remain excluded; owner decides what becomes selected |
| C10 | Better identity/recovery options for rooms | Planned | Later / L | Chosen account/capability model and migration verified before promising owner recovery |

### Days, maps and the trip itself

| ID | Proposal | Current status | Priority / effort | Done when |
| --- | --- | --- | --- | --- |
| T01 | Day timeline with travel blocks, buffers, local time zones and downtime | Partial | Next / L | Overlaps, midnight travel and unknown travel times remain explicit |
| T02 | Reorder a day or move an activity with keyboard-equivalent controls | Partial | Next / M | Dates/locks/reservations are validated and changes can be reviewed/reversed |
| T03 | Neighborhood clustering and route suggestions | Partial | Next / L | Uses known coordinates and an explicit walking/transit basis; no fabricated path |
| T04 | Opening-hour, closure and reservation checks per planned date | Partial | Next / L | Source/time retained; uncertain schedules prompt review rather than blocking by assumption |
| T05 | Rainy-day, low-energy and accessible alternatives | Partial | Next / M | Alternatives preserve requirements and do not imply medical/accessibility suitability without evidence |
| T06 | Personal/group budget view with known, estimated and unknown amounts | Implemented | Next / M | Currency/rate/date and party basis disclosed; no unsupported complete-total claim |
| T07 | Trip readiness checklist linked to actual records | Partial | Next / M | Stay, transport, activity and transfer gaps link to their review surfaces |
| T08 | Travel mode focused on today, next movement and useful directions | Partial | Next / M | Local timezone/date selection explicit; emergency/offline limitations clear |
| T09 | Offline read-only trip pack with queued edits as a separate later capability | Partial | Later / L | Shows snapshot age and unavailable maps/images; reconnect never overwrites silently |
| T10 | Personal tasks, packing and group responsibilities | Implemented | Later / M | Optional modules; safe assignments and notification consent; no clutter in the core itinerary |

### Exports, agents and operating quality

| ID | Proposal | Current status | Priority / effort | Done when |
| --- | --- | --- | --- | --- |
| O01 | Export studio: visual dossier, compact briefs and editable records with preview | Partial | Next / M | Format/scope/date/theme/photo options accurately describe supported output |
| O02 | Export photo-size budget and embedded/local/remote asset summary | Partial | Next / M | Warns before excessive output; never silently drops requested records |
| O03 | Cross-format conservation checks and print-layout regression gallery | Partial | Now / M | Selected route, days, stays, transport, states and icons agree across supported formats |
| O04 | Item-level provider/connector capability and setup dashboard | Partial | Next / M | Configured, eligible, healthy, unsupported and untested remain distinct; no secrets shown |
| O05 | Agent research plan with approval, progress, coverage and bounded retries | Partial | Next / L | Actual tools and query scope named; cost/access limits enforced; proposals preview before writes |
| O06 | Durable private import candidate review/approve/reject and retention ledger | Planned | Next / L | Separate read/import decisions, deduplication and redaction; raw records stay private |
| O07 | Photo coverage/attribution repair queue with exact-subject review | Partial | Next / M | Six failed hotel sources and missing activities tracked; new sources reviewed before caching |
| O08 | Hosted storage, recovery, backups, throttling and key-rotation validation | External dependency | Next / L | Authorized synthetic multi-instance/restart/restore/access tests pass before remote reliance |
| O09 | Reproducible onboarding for own keys, own hosting and sample/manual mode | Implemented | Now / M | Fresh install reaches a working trip without keys; optional setup never assumes a connector |
| O10 | Performance, keyboard, screen-reader, offline and independent release review | Partial | Now / M | Named representative flows and failure conditions tested; public/hosting decisions remain separate |

## First three implementation packets

### Packet A — compact shared foundation

Scope: D01, D02, D03, D08, D10, D11 and the presentation-only part of C01. Extract reusable shell, toolbar, list row, detail drawer, state badge and photo frame; apply first to hotels, day planning and the shared catalogue. Keep all existing export modes and transport colors.

Review with identical sample content and a deliberately sparse invented trip. Check desktop split view, phone single-column flow, keyboard edit/reorder, image failure, map failure and reopening details. Reject density achieved through unreadably small text, hidden primary actions or excessive nested panels. Complete before redesigning every secondary page.

### Packet B — new trips get the same product

Scope: P01, P03, P04 and a minimal P02. Establish a versioned detailed view model with a compatibility adapter for the reviewed sample. Add dated candidate allocations and evidence references before connecting additional atlas features. Keep existing state migration explicit; preserve manual entry and unknown coordinates.

Acceptance: an invented single-city trip and a non-European multi-city trip complete create → compare alternatives → arrange days → add reviewed stays/transport → save/reload → map/list → export without inheriting sample facts. No silent booking promotion, cross-trip leakage or missing evidence on export.

### Packet C — meaningful comparisons and friend suggestions

Two independent lanes after their contracts are ready: R01/R07/R09 use the traveler profile and like-for-like evidence; C02/C03/C07 improve group choices on the existing safe board. Shared room and account writes remain distinct. Use provider mocks/manual records until separately authorized eligible live validation.

Acceptance: searches preserve party/cabin/currency/room basis; sorting works; a comparison explains cash/points/unknowns. Two sessions suggest, review and conflict on safe activity/day changes; revocation and stale revisions deny writes without losing local drafts.

## Source homes and parallel work packets

| Work lane | Start here | Boundary |
| --- | --- | --- |
| Shared visual foundation | `src/components/premium.css`, `src/app/workspace.css`, `src/components/hotel-compact.css`, generic/collaboration workspace CSS | Root integration owner controls shared tokens; no state/schema rewrites in a styling packet |
| Detailed trip parity | `src/lib/trip-model.ts`, `src/lib/current-trip.ts`, `src/lib/normalized-trip.ts`, `schema/trip.schema.json`, `src/components/trip-workspace.tsx` | Keep the 2026 compatibility pack and explicit saved-state migration |
| Day workflow and evidence | `src/lib/generic-trip-workspace.ts`, `src/components/generic-trip-workspace.tsx`, research/quote sidecars | Stable item IDs, validation and provenance before linked inspectors |
| Travel comparison | `src/components/integration-center.tsx`, `src/components/research-optimizer.tsx`, `src/lib/providers/`, `src/lib/optimization/` | Profile-aware requests, real sorting, directional/date-aware legs; live access separate |
| Collaboration | `src/components/collaboration-workspace.tsx`, `src/lib/generic-collaboration.ts`, room persistence/lifecycle modules | Keep safe projections, role checks, conditional writes and reconnect/revocation behavior |
| Exports and photo quality | `src/lib/trip-exports.ts`, HTML/PDF renderers, `public/media-manifest.json` | Sanitize selected current data; retain all existing modes and subject attribution |

The initial design audit found tiny hotel metadata labels, tall three-column hotel cards with price below other facts, a large accepted-trip introduction, and long always-visible collaboration forms. Prioritize layout and hierarchy over adding more decorative effects. Keep an optional photographic gallery view while making aligned decision rows the compact default.

After the shared core, an agent handoff should become a resumable validated packet of constraints, coverage, rejected options, pending decisions and proposed updates. Do not replace the current supported schema with unvalidated agent prose. Later live-update transport can improve on the current four-second room polling, but must revalidate access and retain drafts through disconnects; a transport choice does not solve authorization or merge semantics.

## Work organization and definition of done

Use separate owners for shared UI components, canonical data/migration, provider comparison, collaboration, and exports/verification. Limit simultaneous edits to shared schemas and workspace state; assign one integration owner. Do not start every backlog item at once.

Each packet needs a written outcome, current/proposed behavior, touched contracts, migration/fallback, acceptance fixtures, desktop/phone/keyboard evidence and a concise remaining-gap note. App changes require the repository quality gate and a representative planning flow. Live research, cloud provisioning, invitations, sending, bookings, calendar writes and public publication retain their existing separate authorization boundaries.

Before describing a feature as built, update status/README/agent instructions consistently. The architecture prose currently has older statements about account persistence and the generic handoff; reconcile those with current implementation before using it as an implementation specification. API adapters alone do not make the UI search every date/program/provider.

## Decisions already resolved and decisions to defer

Use the existing Trippy charcoal design, deliberate photography, flight/rail/car colors, MIT code and separately licensed photos. Keep provider-neutral/manual mode and user-owned keys/hosting. These do not need to be re-asked.

Defer a real-time transport vendor, account-bound room migration, paid providers, notification delivery and hosted deployment until their acceptance requirements and actual operating environment are known. Bounded portions of Packets A–C are now implemented. Use the [build ledger](BUILD_PROGRESS.md) to choose the remaining acceptance work; read-only detailed views do not complete editable parity, and no commitment to every later feature or external deployment follows.
