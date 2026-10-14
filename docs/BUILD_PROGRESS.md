# Build progress against the product roadmap

Source assessment · 2026-10-14 · local candidate, not a deployment receipt.

This ledger accounts for all **62** IDs in [the product roadmap](PRODUCT_ROADMAP.md). It distinguishes implemented bounded behavior from the broader acceptance target. It does not mark the whole roadmap complete. **Current accounting: 9 implemented, 41 partial, 11 planned, 1 external dependency.** Current source may be ahead of the hosted demo; no publication, deployment, live inventory, eligible provider access or remote database validation is established here.

**Implemented** means the named behavior has a concrete supported local path and contract; external operation still needs its own acceptance. **Partial** means useful source exists but part of the row's acceptance target remains. **Planned** means the listed extension does not yet have a supported complete path. **External dependency** means the remaining acceptance requires an authorized operator-owned environment or service, and source alone cannot establish it.

## This implementation wave

- `/plan` → **Trip tools → Detailed cities & days** mounts `CanonicalTripWorkspace` through the versioned `buildCanonicalAtlas` adapter. City rails, activity grids, day columns and the detail inspector are shared with the atlas. Arbitrary trips retain their own dates, IDs, explicit coordinates, canonical booking states and receipts. Missing geography, images, priorities, stay dates and prices remain unknown. This is a **read-only preview**; the manual workspace remains the editor. Full editable atlas/route/transport/hotel parity and migration of the specialized sample into a compatibility pack remain incomplete. Evidence: [`canonical-atlas.ts`](../src/lib/canonical-atlas.ts), [`trip-workspace.tsx`](../src/components/trip-workspace.tsx), [`canonical-atlas.test.mjs`](../tests/canonical-atlas.test.mjs).
- `/plan` → **Saved trips on this device** previews and revalidates up to 40 indexed saves plus the last saved legacy workspace. Explicit save indexes a validated workspace; listing does not mutate storage. Complete-workspace JSON import validates and previews before acceptance into memory. This is not account sync, a cross-surface trip registry or a general schema migration engine. Evidence: [`workspace-library.ts`](../src/lib/workspace-library.ts), [`workspace-library.tsx`](../src/components/workspace-library.tsx), [`new-trip-planner.tsx`](../src/components/new-trip-planner.tsx), [`workspace-library.test.mjs`](../tests/workspace-library.test.mjs).
- `/plan` → **Research → Search** prepares at most 24 exact one-way cash-flight airport/date queries, displays the scope before an explicit run, uses two bounded workers, supports cancellation and rejects stale generations. Successful-empty, found, failed, locked, unconfigured, cancelled and unsearched scope remain distinct. A reviewed receipt can replace one cash coverage-ledger row. Awards, through tickets/open jaws, hotels and other modes remain unsearched; live eligible-provider operation was not established by mock tests. Evidence: [`research-matrix.ts`](../src/lib/research-matrix.ts), [`research-matrix.tsx`](../src/components/research-matrix.tsx), [`research-matrix.test.mjs`](../tests/research-matrix.test.mjs).
- `/collaborate` prioritizes the loaded board/catalogue and puts setup, invitations and recovery in disclosures. Activity/day proposals remain separate from applied edits; only an owner can apply/reject through an observed-revision transaction. Discussion adds one current choice per owner/editor access capability and bounded comments on pending proposals. Capability pseudonyms are **not verified person identities**; shared invitations share a choice. Discussion cannot apply a proposal or edit bookings. Source/history, role, expiry, revocation and conflict constraints are server-enforced. Evidence: [`schema.ts`](../src/lib/collaboration/schema.ts), [`store.ts`](../src/lib/collaboration/store.ts), [`suggestions.ts`](../src/lib/collaboration/suggestions.ts), [`collaboration-interactions.test.mjs`](../tests/collaboration-interactions.test.mjs).
- `/plan` → **Research → Selected budget** counts only explicit selected quote IDs, once for the recorded party/room basis. Cash, points opportunity cost and cash equivalents have separate per-currency partial subtotals and unknown counts; source programs are not merged. Overlap, party, freshness and missing-term warnings remain visible. No FX, automatic alternative selection or complete-trip budget claim is made. Evidence: [`trip-budget.ts`](../src/lib/trip-budget.ts), [`trip-budget.tsx`](../src/components/trip-budget.tsx), [`trip-budget.test.mjs`](../tests/trip-budget.test.mjs).
- Atlas hotels default to compact exact-property rows with a three-stay comparison and contextual details/photos; map and market-rate sections are collapsed by default. Export studio is mounted in atlas and generic workspaces with scope/layout/theme controls, a sandboxed reading preview, measured HTML bytes and candidate-photo accounting. Linked preview images require opt-in. Remote image bytes, final PDF size, date filtering and image resizing are not promised. Evidence: [`trip-workspace.tsx`](../src/components/trip-workspace.tsx), [`hotel-comparison.ts`](../src/components/hotel-comparison.ts), [`export-studio.tsx`](../src/components/export-studio.tsx), [`export-preview.ts`](../src/lib/export-preview.ts).

## Design and navigation

| ID | Status | Current evidence and remaining acceptance |
| --- | --- | --- |
| D01 | Partial | Shared design vocabulary, controls and `detail-drawer.tsx` exist; atlas, generic, collaboration and account still use different shells. Cross-surface token/shell acceptance remains. |
| D02 | Partial | Atlas hotel compact/gallery density persists per device with storage-failure handling; generic/collaboration lists are compact. A consistent comfortable-density contract across all surfaces remains. |
| D03 | Partial | Native detail drawer is reused for hotel/activity, generic editing, collaboration and export review with Escape/focus return. Transport still uses its existing leg presentation; not every context has one shared inspector. |
| D04 | Partial | Generic route/day/booking/research sections, research subnavigation and compact contextual actions are implemented. A unified shell and validated task-label study remain. |
| D05 | Partial | Existing atlas maps focus activity/hotel IDs and generic maps show only explicit pins. Selection synchronization across every list/day/map is incomplete; some sample hotel map actions select a stay. |
| D06 | Planned | Individual searches/category/rating/price/map filters exist. Saved presets, a complete active-chip system and cross-view clear-all behavior are not implemented. |
| D07 | Partial | Atlas command search/navigation exists. Full arbitrary-trip/date/entity search and the complete keyboard acceptance target remain. |
| D08 | Partial | Exact-property photos, attribution, image-failure fallback/retry and gallery controls exist. Missing-source coverage, every crop and all gallery failure layouts are not independently accepted. |
| D09 | Partial | Responsive lists and modal drawers exist. A consistent mobile task navigation and full phone planning/comparison acceptance remain. |
| D10 | Partial | Non-map lists, status text, focus styles and native dialog behavior exist. Independent screen-reader, reduced-motion and complete keyboard review remain. |
| D11 | Partial | Provider capability/failure/freshness states, validation errors, empty lists and conflict-preserved drafts are implemented. Full offline and failure-state coverage across all modules remains. |
| D12 | Partial | Current status/feature documentation and app tours exist. A complete current-capture tour and supported-path claim review are still needed. |

## Trip model and reusable planning

| ID | Status | Current evidence and remaining acceptance |
| --- | --- | --- |
| P01 | Partial | `canonical-atlas.ts` and mounted `CanonicalTripWorkspace` reuse city/day/activity/detail primitives with lossless unknowns. Read-only preview only; full editable detailed parity and a sample compatibility-pack migration remain. |
| P02 | Partial | `workspace-library.ts` isolates/revalidates device saves; complete-workspace import previews before acceptance. Cross-atlas/account/room trip selection and general migration remain. |
| P03 | Partial | `itemEvidence` records basis/source/time/summary/unknowns, invalidates changed receipts and survives supported saves/exports. No explicit confidence field or automatic comprehensive evidence population is provided. |
| P04 | Partial | `planning-view.ts` derives dated manual nightly allocations, validates night totals/minimums/maximums/locked anchors and previews day destinations. Actual transit feasibility and schedule-based conflict checks remain. |
| P05 | Implemented | Version-1 `GenericWorkspace` explicitly validates and retains itinerary, item evidence, route allocations, research/quote sidecars and budget selections through complete JSON and supported device/account save/load paths. Hosted verification is separate. |
| P06 | Planned | Reviewed import is available, but it does not create a separately identified duplicate/scenario or infer new ownership. Safe scenario duplication remains. |
| P07 | Implemented | Generic itinerary edits support local undo/redo while separately edited research/quote state is retained. Shared room revisions and conflict review remain separate operations. |
| P08 | Partial | Guided intake, normalized constraints and agent prompts/packets exist. A saved adaptive question flow that reacts to actual research tradeoffs remains. |
| P09 | Partial | `planningReadiness` and next-decision controls identify structural gaps and navigate review sections. A unified item-targeted decision inbox across surfaces remains. |
| P10 | Planned | Local undo and exports are available. Named persistent snapshots with readable restore/change previews are not implemented. |

## Routes, flights, points and stays

| ID | Status | Current evidence and remaining acceptance |
| --- | --- | --- |
| R01 | Implemented | `provider-search-controls.ts` and Connections wire supported party/cabin/room/currency/date/program controls and sorting to requests, with unsupported scope disclosed. This does not establish eligible live access or inventory. |
| R02 | Partial | `research-matrix.ts` provides a reviewed 24-query one-way cash scope, bounded workers/cancellation/statuses and a coverage receipt. Award/multimode/through-ticket matrices and real-provider validation remain. |
| R03 | Planned | Manual quote scopes can record airport pairs. A supported gateway/open-jaw/protection/positioning comparison workflow is not implemented. |
| R04 | Partial | Generic route candidates and manual night allocations preserve different city orders. Automatic whole-route/mode generation and sourced feasibility for three alternatives remain. |
| R05 | Partial | Sample transport comparisons and generic cash/award/transport quote records exist. A generic whole-leg door-to-door model with all rail/car/coach/ferry costs and timing remains. |
| R06 | Partial | `trip-quote-comparison.ts` explains source points, ratios, minimums/increments, taxes and valuation. Program-balance/bonus scenarios and verified eligibility/timing/seat evidence remain. |
| R07 | Partial | Recorded cash/award comparisons reject incompatible scope and unknown equivalents; budget selection keeps alternatives explicit. A complete pinned-option comparison across all intended cases remains. |
| R08 | Partial | Atlas hotel/activity maps and location/fit context exist. Sourced transfer and daily travel-burden calculations for hotel bases remain. |
| R09 | Partial | Three-stay atlas comparison discloses dates/occupancy/rooms/total/breakfast/cancellation/source and unknown tax inclusion. Full split-stay and generic hotel-catalogue parity remain. |
| R10 | Planned | Manual refresh/search controls exist. Saved refresh schedules and authorized price/award notifications are not implemented; eligible providers and notification consent would be required. |

## Friends and group decisions

| ID | Status | Current evidence and remaining acceptance |
| --- | --- | --- |
| C01 | Implemented | Loaded collaboration rooms/local sample use a compact trip bar, catalogue/day board, contextual add/edit drawer and collapsible settings/invitation/recovery controls. |
| C02 | Implemented | Separate activity/day suggestions are saved pending; transactional owner-only apply/reject preserves immutable receipts and stale/conflicting drafts. Direct editor activity/day editing remains an existing separate permission. |
| C03 | Partial | Server-managed support/concern/neutral choice per proposal/access capability is implemented. Pseudonyms are not verified people; personal must-do lists are not implemented. |
| C04 | Implemented | Pending-proposal comments have safe 500-character text, server access attribution/time, owner/editor writes, viewer reads and revision/expiry/revocation checks. Comments remain immutable after posting and are removed with room deletion; no standalone comment deletion or notifications. |
| C05 | Partial | Save/reconnect/paused/dirty/conflict indicators exist. Participant presence is not implemented. |
| C06 | Planned | Proposal receipts and current votes/append-only comments exist. They are not a shared board revision audit log or full change history. |
| C07 | Implemented | Owner invitation UI reviews role/lifetime, creates/revokes access and shows expiry; server enforcement covers viewer/editor/owner, expiration, revocation and lifecycle restrictions. |
| C08 | Partial | Generic-to-board reviewed JSON projection and room-local reconciliation exist. Reviewed reverse mapping of proposals into the owner's generic workspace and cross-surface version/deletion reconciliation remain. |
| C09 | Planned | Shared schema permits safe activity/day proposals only. Route/stay proposal sharing needs a separate allowlisted contract; private bookings stay excluded. |
| C10 | Planned | Rooms use capabilities and optional accounts are separate. Account-bound room migration, lost-owner recovery and verified new identity/recovery choices remain. |

## Days, maps and the trip itself

| ID | Status | Current evidence and remaining acceptance |
| --- | --- | --- |
| T01 | Partial | Generic activities carry manual time/duration; overlap, midnight, assigned-destination and anchor conflicts are checked. Travel buffers, local time zones, downtime and sourced travel durations remain. |
| T02 | Partial | Atlas/shared day controls and generic activity editing support keyboard-accessible moves; generic local edits have undo/redo. Full lock/reservation/date feasibility parity and independent keyboard acceptance remain. |
| T03 | Partial | Sample cluster guidance and explicit-coordinate maps exist. Generic neighborhood clustering and sourced walking/transit route suggestions remain. |
| T04 | Partial | Sample closures/context and manual source/time item evidence can be retained. Automatic date-specific opening-hour/reservation verification is not implemented. |
| T05 | Planned | Users can retain manual alternatives. No structured rainy-day, low-energy or evidence-backed accessible-alternative module is implemented. |
| T06 | Implemented | `trip-budget.ts` and the selected-budget checklist show explicit-ID per-currency cash/points/equivalent partial totals, program-specific points, unknown counts and overlap/party/freshness warnings. No FX or complete-trip total is inferred. |
| T07 | Partial | Generic readiness links structural stay/transport/activity/evidence gaps to review sections; sample has booking/travel gaps. Record-targeted cross-surface readiness and live revalidation remain. |
| T08 | Partial | Atlas travel mode focuses a selected day and movement context. Equivalent generic travel mode, local-time-zone behavior and full offline/emergency acceptance remain. |
| T09 | Partial | Reading exports and local assets provide offline copies with network/image limits disclosed. A complete dated offline trip pack and reconnect acceptance remain; queued edits are not implemented. |
| T10 | Planned | Personal tasks, packing and responsibility assignment are not implemented. |

## Exports, agents and operating quality

| ID | Status | Current evidence and remaining acceptance |
| --- | --- | --- |
| O01 | Partial | Export studio is mounted for generic/atlas scope/layout/theme/sandboxed preview and current HTML/PDF reading output; editable JSON stays separate. Date-range filters and full cross-format visual fidelity acceptance remain. |
| O02 | Partial | `export-preview.ts` measures HTML bytes and local/external/embedded photo candidates, blocks excessive output and discloses unknown asset/PDF bytes. Photo resizing/quality budgets and actual remote-byte measurement remain. |
| O03 | Partial | Export sanitation/conservation/unit/schema tests and existing reading formats are implemented. A complete print-layout regression gallery and independent cross-format visual acceptance remain. |
| O04 | Partial | Connections shows configuration/capability states, supported scope and setup guidance. Item-level eligible/live health verification and a complete cross-provider setup dashboard remain. |
| O05 | Partial | Agent packets, manual coverage ledgers and the explicit bounded cash matrix exist. A general approved agent executor with actual tool/cost limits and durable progress/retry control remains. |
| O06 | Planned | Private Gmail candidate preview is not a durable approve/reject/retention ledger. Separate read/import consent and raw-private custody remain mandatory. |
| O07 | Partial | Media manifests, exact-source mappings, attribution and image failure/retry labels exist. A persistent subject-reviewed repair queue for remaining sources/coverage is not implemented. |
| O08 | External dependency | Local SQLite and Postgres adapter code exist. Hosted multi-instance/restart/backup/restore/throttling/key-rotation acceptance needs authorized user-owned infrastructure; no remote provisioning or verification is claimed. |
| O09 | Implemented | Manual/sample paths and normalized trip CLI work without keys; onboarding documents optional user-owned credentials, minimum access and Node/Vercel choices. Provider connection and hosted acceptance remain separate. |
| O10 | Partial | Repository quality gates and representative browser checks exist. Independent screen-reader/keyboard/performance/offline/public-release review and environment-specific final receipts remain. |

## Verification and handoff boundary

This documentation packet inspected current source and existing tests; it did not run new tests or change application code. Focused test evidence is in the named test files. Current repository/browser results belong in [the release report](RELEASE_REPORT.md), with commands, scope and actual outcomes supplied by the integration owner. Historical receipt counts must not be treated as current counts.

The next decisions are editable detailed-view parity, cross-surface trip/migration boundaries, broader sourced multimode research and independent accessibility/operational acceptance. Deployment, real providers, cloud storage, private imports, notifications and booking actions retain their separate authorization requirements.
