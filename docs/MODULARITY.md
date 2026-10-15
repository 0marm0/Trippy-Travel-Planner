# Module boundaries and arbitrary-trip readiness

The current app combines a substantial sample atlas with a generic `/plan` manual workspace. Shared schema/relationship validation also powers the `trip:init` and `trip:validate` CLI. Research, optimization, logistics, interchange and export modules are reusable. The detailed atlas is not yet a plug-in renderer for every file matching `schema/trip.schema.json`; the separate generic workspace now renders manual days, bookings and coordinate maps, with optional item receipts, dated route allocations and retained research/quote comparison fields. Deeper reuse of specialized atlas features remains incremental work.

## Reusable seams today

| Extension | Start here | Verify |
| --- | --- | --- |
| Generic draft, validation or agent brief | `src/lib/normalized-trip.ts`, `schema/trip.schema.json`, `src/components/new-trip-planner.tsx` | Arbitrary cities/dates, relationship/privacy validation, preview then accept, explicit isolated browser persistence, no invented geography/prices or confirmation; normalized-trip tests |
| New research source | `src/lib/providers/types.ts`, adapter factory, `src/lib/providers/index.ts` | Validated requests, no-key failure, freshness, bounded requests, cancellation, sanitized errors; provider adapter tests |
| New route scoring behavior | `src/lib/optimization/route-optimizer.ts` | Explicit weights, asymmetric legs, missing evidence, bounded search, invented stop IDs; optimizer tests |
| Logistics or booking-gap rule | `src/lib/trip-logistics.ts` | Rule explains its evidence and never infers confirmation; logistics tests |
| Agent-authored plan changes | `src/lib/trippy-bundle.ts`, `schema/trippy-update.schema.json` | Parse, size/privacy checks, scope and ID references, preview/accept/reject; bundle tests |
| Generic detailed manual view | `src/lib/planning-view.ts`, `src/components/planning-tools.tsx`, `src/components/generic-trip-workspace.tsx` | Versioned sample-free view, whole-night allocation preview, anchor conflicts, receipt review flags, undo/redo and readiness; preserve unknowns and existing record dates |
| New export format | `src/lib/trip-exports.ts`, HTML/PDF renderers | Start from a sanitized snapshot; never serialize the private source object; export tests |
| Map or activity presentation | `src/components/geographic-map.tsx`, typed view records | Missing coordinates, loading/failure, list fallback, no hardcoded destination requirement |
| Private import parser | `src/lib/imports/gmail/` | Minimum read-only consent, deduplication, private custody, no automatic mutation; Gmail tests |

Live adapters are source code modules with a typed registry, not dynamically loaded third-party plugins. Adding an adapter currently requires updating provider IDs and composition as well as its own implementation. Keep eligibility, coverage, terms, cost and manual fallback in the integration documentation.

## Current coupling

| Source | Current limitation | Required change for generic trips |
| --- | --- | --- |
| `schema/trip.schema.json`, shared validation and `/plan` | Canonical draft creation/preview is implemented; detailed sample rendering uses a different payload | Translate validated canonical input through a documented, versioned detailed view adapter |
| Canonical route candidates and locked anchors | Canonical candidates retain city order; optional workspace allocations now derive dated nights and check fixed anchors/minimum/maximum stays | Retain explicit review; do not confuse allocation checks with researched service times or transit feasibility |
| `src/lib/trip-model.ts` | `Trip2026Payload` has a literal sample identity; older booking labels remain | General trip identity, explicit source mode and canonical booking-state migration |
| `src/lib/current-trip.ts` | Reads compact legacy fields, fixed route dates, sample media/enrichment and reviewed corrections | Isolate this as a compatibility data pack; never apply sample corrections to arbitrary trips |
| `src/app/api/trips/2026/route.ts` | Active endpoint targets one sample | Add trip selection through a safe source registry, with no user-controlled filesystem paths |
| `src/components/trip-workspace.tsx` | Fixed 2025/2026 switch, sample-scoped storage keys, city list, route notes and research examples | Derive selected city, route, dates, flags, airports and persistence namespace from the selected trip |
| `src/components/research-optimizer.tsx` | Presentation favors one sample leg and EUR; missing-leg source search is guarded | Data-driven first usable leg, explicit currency basis and a complete empty-state flow |
| `src/lib/planner.ts` and map enrichment | Legacy geographic catalogue covers a subset of destinations | Accept supplied reviewed coordinates; missing coordinates should omit a pin and explain the limitation |
| Export API and download names | Some names contain the sample year | Derive safe filenames from trip identity; retain redaction and bounded image fetching |

Removing a label or renaming a type alone does not establish arbitrary-trip support. The new trip must pass the same planning, persistence, map, provider, review and export flow without inheriting the sample's dates or confirmation narrative.

## Incremental migration

1. Extend the implemented canonical draft/schema boundary into detailed views. Keep the sample compatibility adapter intact so existing reviewed data and browser state survive. Preserve `/plan`'s preview/accept handoff and refusal to fabricate researched results.
2. Add a source registry for reviewed public examples and approved private-local inputs. Do not expose arbitrary path reads or embed private data into browser bundles.
3. Build one pure adapter from canonical records to the view payload. Resolve IDs, dates, currency, reviewed coordinates, booking states and unknowns there; return useful validation errors for incomplete records.
4. Namespace saved state by trip ID and version, with an explicit migration/reset choice. Switching trips must not transfer saved hotels, activity IDs, assignments or provider evidence.
5. Derive navigation and research defaults from the loaded payload. Move sample narrative, airport geometry, correction rules and media into its data pack. Keep missing stays, activities, transport and coordinates editable and visible.
6. Split the large workspace component by view and state responsibility when the generic contract is stable. A shared display/formatting layer should eliminate duplicated city aliases and implicit currency assumptions.
7. Verify two materially different invented trips through the complete browser flow before claiming generic support. Provider credentials remain optional throughout.

## Acceptance criteria

- An invented non-European trip and an invented one-city trip validate and render without editing source city lists, dates, currency or airport constants.
- No city key silently aliases a distinct destination into the sample route. Input IDs remain stable and referenced records resolve correctly.
- Empty or partial route, activity, hotel, transport and coordinate data produce clear editable states rather than crashes or substituted sample facts.
- Route optimization discloses missing edges and uncertainty. A route comparison never changes confirmation state.
- Switching between trips preserves isolated selections and assignments; a schema migration cannot apply silently to unrelated stored data.
- Agent updates are constrained to the selected trip and require visible review. Rejected alternatives and unknowns survive.
- Public exports exclude private identifiers and raw imports, use the selected trip's metadata, and pass scanner and independent review.
- The full local release gate and a keyboard/mobile representative flow pass with zero provider credentials.

## Scope of public release

The repository now has a separate generic manual workspace, recorded quote/research evidence, reviewed board handoff and optional encrypted account module alongside the sample atlas. These support local planning before deeper specialized atlas migration. Hosted/provider operation and independent public-release acceptance remain unverified; see [status](IMPLEMENTATION_STATUS.md).

## Additional implemented contracts

- `generic-trip-workspace.ts` and its UI separate canonical trip data from days, pins, activity/booking details and optional `itemEvidence`, `routeAllocations`, `researchEvidence`, `quoteEvidence` and selected `budgetQuoteIds`; explicit device/account saves and itinerary exports retain these fields. Entity changes mark retained item receipts `reviewRequired`; `generic-itinerary-html.ts` adapts validated input to shared reading exports.
- `trip-budget.ts` consumes validated recorded quotes and explicit selection IDs, preserving currencies/source programs and exposing missing amounts, stale checks, party mismatch and overlap. It does not automatically combine alternatives or infer complete coverage.
- Research/quote modules validate independent source/time/scope and cash/points assumptions; they remain recorded evidence, not provider fetchers.
- Connections controls build validated profile-aware requests and cancel superseded queries; actual result sorting preserves unknown prices/currencies/units and source freshness. `provider-search-controls.ts` does not expand provider capabilities.
- Export studio derives current preview/download options from props, validates before scoping, blocks silent collection loss and makes linked-image loading explicit. Its sandbox is separate from the downloadable reading file.
- Collaboration suggestions are bounded optional state: append-only proposals and owner review transactions are separate from normal board edits. Legacy boards remain valid. Reconciliation includes proposals as entities.
- Collaboration reconciliation/recovery/lifecycle keep current-revision choices, referential validation and token-free retained records separate from capability custody.
- `accounts/` uses Better Auth server sessions, tenant-qualified encrypted workspaces, revision checks and an account quota; identity/session records do not enter planning exports. Hosted Postgres and real recovery transport need authorized private verification.

[Status](IMPLEMENTATION_STATUS.md) · [Exports](EXPORTS.md) · [Private accounts](PRIVATE_ACCOUNTS.md).


## Versioned planning extensions

`GenericWorkspace` keeps the normalized trip as the authoritative identity and adds optional validated sidecars instead of expanding booking state semantics. `booking-planning.ts` owns referenced stay/transport metadata and preview/apply behavior; `trip-preparation.ts` owns bounded tasks and explicit fallback swaps. Both use type-only workspace imports, shared privacy/media contracts and pure validation. Their UI workbenches accept the owner workspace and return a validated next copy through the existing history callback. Device/account persistence and complete editable JSON preserve the sidecars; scenario copies exclude booking metadata whenever booking records are excluded.

Shared revision history is separately implemented in `collaboration/history.ts` and the room store. It is not a workspace sidecar: server transactions append bounded category summaries, authenticated history reads apply room lifecycle checks, and the client only renders a validated response. This keeps shared access bookkeeping out of exported travel data.
