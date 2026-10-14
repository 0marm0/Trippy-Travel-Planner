# Local candidate and preparation receipts

**READY_FOR_OWNER_REVIEW: the local source and production build are prepared.** The beta includes a sample atlas, separate generic manual workspace, recorded research/quote evidence, reading exports, live-board lifecycle and optional encrypted accounts. No hosted deployment or real-provider readiness follows from local tests. Publication, repository creation, account settings and deployment remain separate operations.

## Initial preparation — 2026-10-13

The following initial receipts and counts are historical. The current module update appears below and supersedes older capability limitations.

## Repository identity

At the initial audit the checkout was on `main` with no Git remote. The signed-in GitHub account is `0marm0`; its repository listing returned no Trippy match, and an exact lookup of `0marm0/Trippy` returned not found. This does not establish whether another account or organization owns an unrelated copy. The initial preparation did not create or push a repository. The owner subsequently authorized creating the private staging repository; see the staging update below.

## Delivered

- MIT source license, contributor/security policies, safe issue/PR templates, pinned CI and Dependabot configuration.
- `/plan`: arbitrary cities, airports, dates and preferences; shared JSON Schema and relationship validation; preview before acceptance; downloadable planning JSON; agent brief; browser-memory-only drafts.
- `trip:init`: private-local normalized drafts with no-overwrite and symlink protection. `trip:validate` and `schema:check` validate the real schema rather than only the legacy sample shape.
- Agent setup/trip prompts and workflows covering travelers, dates/windows/length, anchors, route alternatives, cities/interests, pace, budget/cabin, points/fees/transfer rules, travel-document needs without identifiers, accessibility, luggage, modes/connections, cancellations, must-dos, rejections, assumptions and consent.
- User-owned integration accounts/keys with zero-key fallbacks, coverage and freshness limits, and separate consent for private imports. Booking states cannot be promoted from a quote or recommendation.
- Independent Vercel and self-hosted Node guidance. Forks use their own accounts, projects, billing and environment settings. No maintainer Vercel identifiers or credentials are needed.
- Stronger sample redaction and blank booking links. All itinerary export modes remove private identifiers; CSV cells neutralize spreadsheet formulas.
- 156 restored, reviewed WebP travel photos (154 guide images and two automotive images). Brand/app icons are about 133 KB combined. The 20 missing activity images identified against the deployed dashboard have been restored; generic fallback placeholders remain available. Original files and review contact sheets stay private.
- Public media manifest, metadata stripping, provenance/privacy review and hash validation. Local guide photos render from this checkout and can be embedded into standalone HTML and visual PDF exports.
- Patched Next.js 16.3.8, sharp 0.35.5 and Ajv 8.18.0, with refreshed lockfile.
- Next.js private file-trace exclusions, `.vercelignore`, and a regression-tested build boundary gate. A private trip file initially present in a function trace was excluded; final traces contain zero detected private targets.

## Verification

The integrated gates cover lint, TypeScript, 86 tests, public sample validation, canonical schema validation, production build, browser/server bundle privacy, staged/history scanning, public media and production dependency advisories. The build boundary check reports 31 trace manifests and 7,021 traced entries with zero findings. The media inventory reports 164 local assets and 1,074 remote references with zero missing-file, privacy, metadata or rights-attestation findings.

The redacted sample has 230 activity records, 176 hotels and 13 booking summaries. Independent review inspected its strings/keys without printing personal identifiers. Independent source review found and verified fixes for dictionary-key privacy, credential-shaped text, CLI symlink escapes, untrusted export fields, CSV formulas, locked-anchor destination retention and image-download timeouts.

Browser verification exercised non-European draft creation, validation, review/acceptance, JSON download, agent brief, mobile layout and clearing on reload. The downloaded planning record passes the same validator. A visual PDF smoke test returned a valid three-page PDF with embedded imagery. A browser-downloaded HTML dossier contains 68 embedded WebP photo occurrences, zero unresolved bundled-image paths, and passes a contact/link privacy scan. Local QA files live under ignored `output/playwright` and `.playwright-cli` paths.

The production dependency audit reports zero advisories. The full audit still reports five high findings in the development-only ESLint/fast-glob/micromatch/braces chain; no patched braces version was available in the checked registry. Do not use `npm audit fix --force`, which proposes downgrading the framework ESLint configuration. Revisit through dependency maintenance. The framework patch addresses published [Next.js advisories](https://github.com/advisories/GHSA-3w37-wq28-93x7).

Reproduce the complete source/build gate with:

```bash
npm ci
npm run release:check
```

Run `npm run build:boundary:check` again after creating any standalone or Vercel deployment package. Those copied packages were not generated or deployed in this preparation; the current check covers the local build traces.

## Photo license scope

The owner explicitly states that licenses have already been acquired for all existing photos and authorizes preparing the repository with them. That attestation is recorded against the exact current photo-reference inventory. Receipt documents and per-photo license/attribution mapping are deferred at the owner's direction. This is an owner attestation, not independent inspection of the underlying terms or a claim that third-party photos are MIT licensed. See [media guidance](MEDIA.md) for separate photo terms and adding future images. Resolve required credits and downstream redistribution conditions when supplying the records.

## Product limits to disclose

The rich atlas remains sample-specific. `/plan` separately renders arbitrary manual routes, maps from supplied coordinates, days, activities and previewed stay/transport records, with explicit device persistence and optional account save/load. Research/quote sidecars preserve recorded sources and assumptions but do not acquire inventory. Feasibility signals do not prove complete date allocation, service schedules or provider bookability.

Rooms use reviewed share-safe activity/day records with reconciliation/recovery, invitation expiry/revocation and owner rotation/deletion. Accounts are separately enabled Better Auth storage, with tenant-qualified encrypted plans, revisions, quotas and password-confirmed deletion. Postgres and real recovery transport remain privately unverified. Do not upload raw confirmations, Gmail/private data or credentials to shared/public records. The existing deployed demo was not redeployed by these changes.

## Release operations still to perform

1. Review the candidate and this report. The owner chose private staging at `0marm0/Trippy-Travel-Planner`; repository creation is complete.
2. Push the reviewed commit, confirm CI and configure appropriate branch/ruleset protections where the account plan supports them. Do not include ignored private files, originals, screenshots or QA exports.
3. When publishing, enable GitHub private vulnerability reporting and verify its contributor-facing entry point. GitHub documents this feature for public repositories; do not treat its absence on a private staging repository as a source-code defect. [Configuration guide](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository).
4. Add accurate repository links and optional user-owned deploy/fork links after the final repository URL exists. Then separately authorize any deployment, verify its packaged artifact and test the deployed zero-key flow.

Public visibility and deployment were not executed. Private repository creation was subsequently authorized; the staged update below records that scope.

## Private staging update — 2026-10-13

The owner authorized repository creation after reviewing the prepared candidate. `0marm0/Trippy-Travel-Planner` has been created with private visibility and linked as `origin`. The display name is **Trippy Travel Planner**; the package name is `trippy-travel-planner`. This approval covers repository creation and pushing the reviewed source, not public visibility or deployment.

The candidate now includes an expanded photographic README, a complete 156-image gallery, a static `/about` introduction, detailed cash/award and multimodal planning instructions, and a separate collaboration architecture and agent walkthrough. Live collaboration is now implemented at `/collaborate` for a separate share-safe activity/day board. Friends can add new activities there; the current atlas update bundle still references existing activity IDs. The implementation does not provision a database or deploy a hosted service.

The updated local gate passes lint, types, 86 tests, sample/schema validation, production build, privacy/media, file-trace boundaries, staged/history scan and production dependency audit. Independent reviews found no remaining material capability/sharing overclaims. CI status and final commit are reported after the push; the repository remains private.

## Dashboard parity and shared editing update — 2026-10-13

The full downloaded application includes all seven atlas tabs, Plan/Decide/Travel, transport layers and route maps, city sights, hotel/activity maps and galleries, daily editing, route research and exports. `/about` is the introduction, not a replacement dashboard. The restored 18 Egypt photographs and two automotive photos have independent contact-sheet review and metadata/hash checks. Seventeen Egypt originals are small thumbnails; the source resolution is documented rather than inflated. The Nürburgring hero now uses the recovered circuit aerial instead of unrelated generic scenery.

Live browser acceptance passed 15 checks across isolated owner, editor and viewer contexts: explicit sample sharing review, fragment removal, role restrictions, synchronized activity/day edits, stale-save HTTP 412, preserved drafts, explicit conflict resolution, invitation revocation, persistent access after reload, and mobile layout. Local artifacts remain ignored. PostgreSQL adapter code is present but no live PostgreSQL service has been provisioned or exercised. See [live collaboration](LIVE_COLLABORATION.md) and [dashboard parity](DASHBOARD_PARITY.md).

A clean checkout without ignored local files or environment settings passed the full release gate and the seven-tab/three-mode browser flow. Browser checks confirmed route-layer toggles, city marker-layer changes, hotel gallery selection, and day-order persistence after reload. All eight About gallery images loaded; the About and atlas layouts had no horizontal overflow at 390px.

The first remote CI run flagged GitHub/Dependabot system contact addresses as personal contacts. Independent classification of the flagged commits found only GitHub service identities. The history scanner now permits exactly `noreply@github.com` and `support@github.com`, alongside its existing reserved test/noreply patterns. Regression coverage still rejects personal contacts on the GitHub domain and lookalike domains, in staged files, commit messages and author metadata, without printing matched values. No history rewrite was performed. GitHub documents the [web merge committer identity](https://docs.github.com/en/enterprise-cloud%40latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets); the [official Dependabot repository](https://github.com/dependabot/dependabot-core/issues/3480) documents its sign-off identity.

## Complete setup/planning guide and production collaboration repair

The README now highlights flexible-date cash/points research, multimodal routes, hotel total-price/location comparisons, broad city discovery, editable daily plans, all-mode booking gaps and optional live rooms. `prompts/START_HERE.md` is the copyable master handoff. Both agent entry files point to expanded setup, provider/host connector discovery, date/airport/program/mode search coverage, explicit omissions and stopping criteria, hotel-base comparison and feasible city-day planning. Current adapter and generic-atlas boundaries remain explicit. Official onboarding references are linked with checked dates; KAYAK host support is discovered rather than assumed.

The screenshot gallery now has 20 captures, including editable itinerary cards, a live sample-only room board and invitation/revocation controls. A production browser check found that comparing Origin against Next's internal request URL rejected valid `127.0.0.1` requests. Origin checks now validate the public Host, accept forwarded scheme only from explicitly trusted ingress, and continue to deny foreign origins. Every production room creation requires a server creation code, regardless of a loopback Host claim. The production browser then created a reviewed sample room and two invitation roles successfully; no code or capability values appear in captures. The full local release gate passes 87 tests, and independent documentation review found no material capability overclaims.


## Collaboration and product polish pass — 2026-10-14 UTC

- Replaced forest-green collaboration styling with Trippy blue/black panels, the shared globe mark, responsive controls and accessible labels. Refreshed all three collaboration screenshots; reviewed full-size pixels and stripped derivative metadata. About now shows real itinerary controls and shared-board imagery with supported starting paths.
- Fixed multi-line notes, retained in-range day assignments after date changes, protected unfinished forms from polling and navigation through header links, separated validation from connectivity errors, confirmed destructive actions and added validated board downloads during conflicts. Downloads exclude unfinished form fields; at that checkpoint draft reimport/reconciliation were not yet implemented; the current module update below supersedes that limitation.
- Production browser exercise used isolated invented records and reviewed public sample rooms: owner/editor/viewer access; activity add/edit; day assignment/reorder; retained assignments after date extension; cross-browser updates; typed activity draft preserved on conflict; valid board download; viewer write rejected with HTTP 403; revoked editor disconnected. Phone viewport had no horizontal overflow. No real provider, mailbox or hosted database was contacted.
- Independent scoped code review passed. Local release gate passed 88 tests, lint/type/schema/build and boundary/privacy/history/media checks; production dependency audit found zero vulnerabilities. A final rebuild covered the final About copy and explicit notes label.
- README/agent workflows now provide starting-path and capability matrices plus concrete setup, planning and sharing acceptance receipts. [Improvement roadmap](IMPROVEMENT_ROADMAP.md) prioritizes arbitrary-trip atlas integration, explicit conflict reconciliation, room lifecycle and hosted-storage verification, visible research coverage and private-trip accounts. These are future acceptance criteria, not completed features.

## Current module update — 2026-10-14

- Generic manual workspaces now render two independent invented-trip shapes without sample geography/bookings: supplied routes, explicit pins, day destinations/timed activities, conflicts and reviewed booking records. Device persistence is explicit and trip-isolated; schema/private-text checks apply to exports.
- Research coverage and sourced cash/award/stay/transport comparison retain scope, timestamps, party/currency/terms, missing amounts and source-points/transfer assumptions. They are recorded evidence, not automatic inventory search.
- Generic workspaces prepare reviewed activity-board JSON; live boards preview/import/export, reconcile original/local/latest fields/entities/days and optionally retain credential-free board/base recovery. Lifecycle covers expiring invitations, revocation, owner rotation and room deletion with stale-operation checks.
- Optional Better Auth accounts use database sessions, tenant-qualified AES-GCM encrypted workspaces, revision checks, password-confirmed deletion and a 20-plan quota. Synthetic tests cover actual auth flows and mocked reset transport; no real reset delivery is wired. [Account custody](PRIVATE_ACCOUNTS.md).
- Shared rich HTML dossier and compact travel/transit/hotel HTML/PDF preserve current recorded states, dates and safe facts. Atlas light/dark/visual/CSV modes and imagery remain. [Format matrix](EXPORTS.md). Styling was informed by examined reference CSS; private source documents were not copied into tracked artifacts.

**Previous integrated source gate: PASS — 144/144 tests (historical checkpoint).** `npm run release:check` completed with lint, TypeScript, schema/sample validation, production build, build/private-boundary checks, privacy/history/media checks and zero production dependency advisories. These counts describe the preceding module checkpoint; the visual/photo update below has a separate pending final gate. Scoped code reviews identified and fixed research-tab state loss, explicit credential-label acceptance, private database symlink ancestry and passwordless deletion. This is scoped local review, not an independent public-release or hosted/provider certification. No real secret, mailbox, provider inventory or hosted database was used.

Remaining work includes consistent per-item sources/freshness, deeper specialized-atlas reuse, durable private import review/retention, real recovery transport, hosted Postgres/provider checks and independent accessibility/public-release review. Publication/deployment still require explicit authorization.

## Final browser and export receipts — 2026-10-14

Local browser verification exercised generic workspace editing and isolated browser persistence, optional account save/load and lifecycle, and shared-board review/reconciliation with invitation expiry, owner rotation and room deletion. These checks used reviewed sample or invented records and isolated local storage. No real provider credentials, traveler confirmations, mailbox or hosted database was used.

Rich visual HTML and compact travel/transit/hotel HTML/PDF checks verified conservation of the current supported planning records and recorded states. Existing visual/light/dark atlas modes, CSV and photos remain available; exports do not infer inventory or confirmations. The local gallery now documents 23 screenshots, including three new generic/visual-export/reconciliation captures, and a 187-image local inventory. Screenshot/media registration is checked separately from source tests.

The evidence supports the local candidate and scoped review. Hosted Postgres, actual provider eligibility/inventory, real password recovery and independent public-release/accessibility acceptance remain unverified. No public publication or deployment was performed.


## Visual and photo refinement pass — 2026-10-14

**Final integrated source gate: PASS, 156/156 tests.** Lint, typecheck, sample/schema validation, production build, build boundary, privacy/history and dependency audit passed. Final screenshot registration is separately validated against the media manifest. Earlier PASS statements in this report apply to their recorded snapshots and do not certify this final visual/photo candidate.

The current UI preserves the planning, research, booking-state, collaboration and export contracts while reducing hotel-card density. Property galleries try recorded alternatives after an image fails. Hotel pros/trade-offs and booking-source comparisons remain available through expandable controls. City-context and unavailable labels distinguish missing property/activity photography from actual subject photos. Existing provider attribution remains attached when a local derivative replaces a recorded URL.

Photo coverage is **170/176 catalogue hotels cached locally**, with six selected source images returning HTTP 404. Other recorded photos and unchanged original URLs remain alternatives. The market scan has **81/112 results with an exact-property reference** and **31 without one**; remote reference coverage does not establish live browser availability. Activities resolve to **162 local, 38 remote and 30 empty photo fields**. The 21 newly cached activity source images benefit 16 activity records after the existing association/override rules. These counts do not claim comprehensive hotel or activity photography.

The original **1,074-reference owner-attested inventory is unchanged**; cache derivatives use existing licensed-by-owner source references only. License receipts, required per-photo credits and redistribution-condition mapping remain deferred. No new external source, fabricated property association, rate, booking confirmation or publication authority follows from these changes.

The completed asset target is **383 local images including 28 screenshots**, preserving the original photos and earlier captures. All 383 images including 28 screenshots are registered and visually reviewed. Browser checks exercised generic editing, save/reload/resume, the export dropdown and download, city/day collaboration filters, compact property cards and photographic dossier controls. Existing desktop/mobile checks remain valid; the final source check adds a lodging-kind regression across real HTML/PDF wrappers. Three compact PDF scopes and four HTML presentations were generated from sanitized sample data; the rich HTML embedded 167 photos. Private repository synchronization is separate from public publication and hosted deployment.

## Reusable planning and group decisions — 2026-10-14

This candidate adds a bounded shared planning view and read-only detailed city/day adapter for arbitrary trips, dated manual night allocations with review, per-item evidence and stale-receipt warnings, itinerary undo/redo, complete workspace JSON restore, a device trip library, selected-quote per-currency partial budgets, profile-aware provider controls, a bounded exact-date cash matrix, compact hotel rows/three-stay comparisons, and a shared export studio. Collaboration adds pending activity/day proposals, transactional owner review and access-pseudonymous votes/comments. It remains a separate share-safe board.

All 62 roadmap IDs are accounted for in [the implementation ledger](BUILD_PROGRESS.md): 9 implemented, 41 partial, 11 planned and 1 external dependency. This is substantial local implementation, not completion of the whole roadmap. Detailed arbitrary-trip editing parity, broader sourced award/multimode optimization, reviewed board/workspace synchronization, push presence, persistent restore history and hosted operational acceptance remain open.

Current local receipts:

- ESLint, TypeScript, **240 tests**, public sample validation, normalized schema validation and production build passed. The build-boundary scan checked 39 manifests and 15,046 traced entries with zero findings. Current source/browser/server privacy and staged/reachable-history checks passed. A synthetic credential-bearing URL fixture initially tripped the strict staged scanner; its runtime construction was corrected without weakening the scanner, and its focused tests/history checks passed again.
- Media validation reports **385 local assets / 30 screenshots**, 1,074 original remote references and zero missing-file, privacy, metadata or rights-attestation findings. Two new screenshots show the export studio and an invented proposal discussion; compact hotel rows were refreshed. The existing owner attestation and deferred per-photo license receipts remain unchanged. Production dependency audit reports zero vulnerabilities.
- Browser checks used an invented Tokyo/Kyoto trip: saved-trip preview/open, dated allocation preview/application, compact day editing, changed-record evidence warnings, undo, source persistence, a four-query prepare-only matrix and complete editable JSON download. The downloaded record validates with six days, one activity, one item receipt and nine research rows. No live provider search was run.
- Browser export checks downloaded current generic HTML and a valid four-page visual PDF. Sample exports regenerated 22 days, 167 embedded local photo assets, four HTML formats and travel/transit/hotel PDF scopes. Representative rendered generic/travel/hotel PDF pages were inspected. Reading HTML, PDF and editable JSON retain separate capabilities and network/image limits.
- Browser collaboration checks on temporary local SQLite used invented owner/editor access: vote/comment saving, preservation of an unfinished comment across drawer close/reopen, owner application of a pending activity, and same-path capability switching at the same revision. The address fragment was removed and the new role loaded. Store/HTTP/effect tests separately cover stale writes, roles, history immutability, revocation/expiry, size limits and obsolete reads.
- The opaque iframe could not load loopback photos directly. The opt-in parent-origin preview path now embeds at most 40 approved local assets, with per-file/aggregate/concurrency limits and neutral omitted/failed fallbacks. Browser inspection confirmed a decoded hero and **40 embedded / 0 failed / 122 omitted**, using 3.13 MB source bytes. Preview embeddings do not alter linked downloads or establish a complete offline pack.

The GitHub staging repository was verified PRIVATE. No public visibility change, hosted deployment, real provider inventory, remote database, outbound invitation, private import, payment or booking action is established by these receipts. Exact pushed-commit CI is an additional receipt, separate from the local checks above.
