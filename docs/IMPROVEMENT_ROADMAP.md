# Improvement roadmap

The local candidate now includes a generic manual trip workspace, research and quote evidence, richer itinerary exports, reviewed shared-board handoff, reconciliation/recovery, room lifecycle and optional encrypted accounts. This roadmap describes remaining work, not a promise of live coverage or authorization to provision, publish or deploy. See [current status](IMPLEMENTATION_STATUS.md), [exports](EXPORTS.md) and [verification](RELEASE_REPORT.md).

## 1. Carry evidence through every decision

**Built:** Generic dates/cities, explicit maps, route alternatives, days/activities and previewed booking states; per-trip research coverage and recorded cash/award/stay/transport comparison.

**Remaining:** Activity hours, coordinates, duration, stay/transport terms and booking facts need consistently attached per-item sources/checked times. Companion ledgers currently require manual correlation. No automatic geocoding, catalogue discovery or fresh quotes are implied.

**Acceptance:** Two materially different invented trips retain sources, uncertainty, price basis and rejected alternatives through editing, JSON interchange and reading exports. Missing taxes, time zones, schedules and quote age remain visible. All selected legs/stays and each retained city have a coverage receipt or explicit gap; repricing changes neither a locked anchor nor a booking state silently.

## 2. Validate research against eligible live providers

**Built:** Optional adapters, safe handoffs, manual quote math and a ledger that distinguishes unsearched, researched, unsupported and failed work.

**Remaining:** Actual account eligibility, party/cabin/currency coverage, quotas, cached freshness, complete award segments/taxes and dated operator service remain unverified by local mocks. More providers should follow observed coverage gaps.

**Acceptance:** An explicitly authorized private environment tests bounded queries and failures without credentials/raw identifiers in artifacts. Comparisons disclose dates/airports/programs/modes searched and omitted, equivalent party/room/terms, transfer ratio/delay and source-point valuation. A failed search never becomes evidence of no inventory. No global-cheapest claim follows a bounded search.

## 3. Prove hosted persistence and operational custody

**Built:** Durable SQLite room tests, role/expiry/revocation/rotation/deletion, reconciliation and consent-based recovery. Optional Better Auth accounts use tenant predicates, encryption, revision checks and a 20-plan account limit.

**Remaining:** Hosted Postgres tests, real password-reset transport, enrollment/abuse controls, operational backups/retention and encryption-key rotation procedure. Capability rooms remain separate from account identity and booking storage.

**Acceptance:** User-authorized Postgres tests exercise separate instances, concurrent writes, restart, revoked/expired/deleted access and tenant isolation. Account deletion/password requirements and storage quotas are independently checked. Operator documentation distinguishes logical deletion from local copies/backups, and has a tested key-recovery/rotation plan. No outbound email or cloud resources are created as a side effect of implementation.

## 4. Improve shared planning without silent data loss

**Built:** Generic workspace to reviewed board JSON; board import/export; field/entity/day reconciliation; explicit choices; retained local board/base with no credentials; expired invitations and owner lifecycle controls.

**Remaining:** Presence, audit history, richer comparison of route/stay proposals and optional controlled synchronization. Unfinished forms are deliberately excluded from retained/exported board data. Lost owner capabilities have no identity-based recovery.

**Acceptance:** Two-browser editing preserves both versions, deletion/reference conflicts fail validation, and another revision interrupts reconciliation. Device recovery is explicitly reviewed; disabling it removes the retained copy. Any future synchronization names exactly which records move, requires review and keeps bookings/private identifiers outside rooms.

## 5. Finish imports and representative release review

**Built:** Sanitized structured/reading exports, broad local gates, synthetic account/room/model tests and browser flows.

**Remaining:** Durable private confirmation candidate approve/reject/retention ledger; independent accessibility and exact-candidate public-release review; broader phone/keyboard/offline/failure coverage. Local reference styling informed the export design; private reference documents are not repository assets.

**Acceptance:** An authorized import deduplicates and shows redacted changes before writing; raw mail and traveler identifiers never enter exportable records. Exported days, activities, selected routes and recorded states match the current workspace. Verify rich HTML, compact travel/transit/hotel copies, CSV and supported PDF variants, offline limitations and meaningful collection-bound errors. Preserve existing atlas/light/dark modes and photos.

The next milestone is evidence continuity and privately verified hosted/provider operation. The implemented manual path remains usable while these gaps are addressed.
