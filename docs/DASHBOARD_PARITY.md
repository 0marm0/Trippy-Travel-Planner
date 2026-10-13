# Deployed dashboard and repository parity

Read-only audit on 2026-10-13 of <https://trippy-travel-optimizer.vercel.app/> and the repository public sample served at `http://127.0.0.1:3107`. This is feature/data/media evidence, not deployment authorization, a new price check, or verification of deferred photo licenses. No provider credentials, private trip files, Gmail, booking mutation, or calendar access were used.

## Dashboard inventory

The deployed dashboard exposes the following features. Their implementation exists in this checkout; parity requires the complete application, public assets, and normalized loader, rather than a bare trip JSON or screenshot.

| Surface | Observed deployment | Repository implementation |
| --- | --- | --- |
| Plan / Decide / Travel | Three modes; decision queue/coverage; date-aware travel tools | `src/components/trip-workspace.tsx`, `decision-mode.tsx`, `travel-mode.tsx` |
| Route & dates | Layered flight/train/car/city map; seven stops; calendar/timeline/list overview; booking gaps and automotive drawers | `trip-workspace.tsx`, `route-atlas.tsx`, `trip-overview.tsx`, `trip-logistics.ts` |
| Transport | Selected option comparison by leg | `trip-workspace.tsx` TransportView / TransportLegCard |
| Cities & sights | City rail, photos, priority/category filters, exact coordinate map, tips, activity detail and save/day controls | `trip-workspace.tsx` CityView / ActivityGrid / ActivityDrawer |
| Daily itinerary | City/day selection, map, arrivals, compact view, reset, draggable day activities, priority/day/up/down/remove controls, catalogue | `trip-workspace.tsx` ItineraryBuilder |
| Hotels & days | 176 hotels, seven city filters, price/rating/sort/fit filters, hotel/activity/logistics map layers, provider comparison lanes and galleries | `trip-workspace.tsx`, `hotel-refresh-panel.tsx` |
| All activities | 230 activities with filtering and detail drawers, including optional cities outside the seven-stop route | `trip-workspace.tsx` ActivitiesView |
| Flights & research | Date/leg/mode/objective controls, shortlist, route optimization, cash-versus-points inputs and flight map | `research-optimizer.tsx`, `optimization/route-optimizer.ts`, `/api/optimizer/route` |
| Settings / setup / exports | Connections, launch, appearance, planning profile, update/export entry points | `integration-center.tsx`, `deployment-center.tsx`, `update-inbox.tsx`, trip export modules |
| Generic new trip | Separate schema-backed planner, distinct from specialized 2026 atlas | `/plan`, `new-trip-planner.tsx`, `normalized-trip.ts` |

The deployed research UI has optimization objectives and score factors, not a separate top-level “Factors” tab. The app has seven planning tabs. Historical provider rates remain dated evidence, even where a saved panel labels coverage “live”; this audit did not reprice them.

## Snapshot before media restoration

The normalized endpoint comparison found identical catalogue sizes: **230 activities, 176 hotels, seven route stops**. The deployment returned **1,226 distinct image references**; the local public payload returned **1,207**, including **20 activity placeholders**. Differences primarily arise from media locations and placeholders, not missing dashboard code or missing activity records.

- Deployed: 144 distinct guide-photo references; 146 references overall to the historical `europe-trip-optimizer.omarmo.chatgpt.site` host.
- Local normalized payload: 126 distinct guide-photo references; 127 local image references including the placeholder; no missing local image files.
- 146 activity image fields differed. Most changed from historical remote hosting to same-identity bundled guide paths. Twenty changed to placeholders: 18 optional Egypt activities and two Nürburgring activities.
- Both payloads retained the same remote host counts apart from the historical origin/local migration. The largest hotel catalogue host was `img.fih.io` (998 distinct references), followed by `imgcy.trivago.com` (10). A remote reference does not establish continuing availability or redistribution rights.
- Raw sample JSON counts are not comparable to normalized endpoint counts: the loader merges generated provider/enrichment catalogues. The raw sample had 205 distinct references and 30 placeholder occurrences at this checkpoint.

The deployed city DOM confirmed photos loading from the historical origin, including `audi-r8-road.jpg` and `nurburgring-aerial.jpg` at natural width 1800px. Existing guide originals included a 160px Nürburg Castle photo and a 250px Adenau photo. Successful loading and larger dimensions are distinct from subject accuracy or visual quality; a 160px original cannot gain detail by upscaling.

The 20 unresolved deployed-to-local associations are saved in ignored `output/parity/missing-media.json`, with public source URL, activity ID, city, title and intended path. Eighteen are `/guide-images/<hash>.webp` references for Egypt; the other two are `/images/audi-r8-road.jpg` and `/images/nurburgring-aerial.jpg`. Width/height are null where no observed dimension was available. No remote image bytes were downloaded for this audit. Root media restoration may resolve these candidates; rerun the audit after that change rather than treating these snapshot counts as final.

## Cause and clone requirements

`src/lib/current-trip.ts` loads the tracked `examples/trips/2026-europe-sample.json` in public mode, applies corrections, merges provider media, and converts historical image paths. Private-local overrides are gated separately. The earlier deployment rewrites guide paths onto the historical remote origin; this checkout intentionally recognizes bundled `/guide-images/`, `/media/` and placeholder paths. A clone with the full `public/` directory serves those photos locally. Public/sample construction must continue through the reviewed build and privacy gates.

The route overview uses the local SVG route atlas. Detailed city/hotel/day maps use MapLibre, the bundled Night style, public workers and category icons. `npm ci` runs `maps:prepare`, copying the worker/shared modules from the pinned installed package; `public/ne-110m-countries.geojson`, `public/styles/trippy-night.json`, `public/maplibre-gl-worker.mjs`, `public/maplibre-gl-shared.mjs` and `public/icons/*.png` must remain available. Deployed city DOM reported Night with 119 style layers. Other city styles fetch OpenFreeMap; custom/CARTO/satellite styles use documented optional environment names. No map/provider key is necessary for manual sample mode. Tile/glyph/network dependencies can still affect the tiled city map.

A known deployment/source skew is the overview’s “Brussels → Amsterdam rail · 3 Oct” hero text; deployed logistics show 2 Oct and this checkout’s hero source uses 2 Oct. The deployed page is not proof of the exact current source revision. Browser state also contains local selections/preferences, so a clean browser is needed for acceptance.

## Repeatable verification

Run `node scripts/audit-dashboard-parity.mjs http://127.0.0.1:<port>` against a freshly built public sample server. The optional URL is restricted to localhost; the script fetches only `/api/trips/2026`, requires sample mode, checks identifier/credential patterns before retaining evidence, checks referenced local files, and writes bounded counts/associations to ignored `output/parity/summary.json`. It does not download images or invoke providers. Historical payload hashes identify only that response, not an immutable deployment commit.

Then verify a clean clone in the browser across all seven planning tabs, three modes, city/map style and layer controls, activity detail, hotel photo gallery, editable daily plan and generic `/plan` preview/acceptance flow. Run the repository quality/release gates. Code presence and this read-only audit do not replace root’s clean-clone browser acceptance.

## Restored candidate and collaboration boundary

The prepared repository now contains 154 bundled guide photos plus the two restored automotive images at `/media/audi-r8-road.webp` and `/media/nurburgring-aerial.webp`. Independent review of the 20-image restoration contact sheets found landmarks, public scenes, a car and a circuit aerial; no visible traveler documents, booking identifiers or contact information at that review scale. The generic car photo includes a visible plate. This thumbnail-scale review does not prove absence of every incidental detail or verify license receipts. The tracked sample diff changes 22 image fields for the 20 restored associations: 18 Egypt catalogue images, two automotive catalogue images and two automotive override fields. The other sample fields are preserved. Source thumbnails range from 160px to 1000px; the two automotive originals were 1800px wide. Restoration preserves the source image rather than asserting a higher-resolution substitute.

The collaboration implementation is a **separate planning room at `/collaborate`**, linked from the atlas and generic planner. The atlas remains the rich 2026 dashboard: full hotel catalogue and galleries, transport alternatives, booking/logistics records, provider research, automotive add-ons, daily builder and maps. These rich dashboard records are not synchronized as a complete shared trip DTO. Rooms synchronize only a reviewed board with title/dates, cities, activities/notes, permitted local image/source associations and ordered activity assignments to days. Room edits do not rewrite the atlas or its local browser state.

The room UI has a city/activity/day board, coordinate map, owner/editor/viewer access, owner invitation revocation, revision-checked saves and polling. It requires an explicit content preview/acceptance before creating persisted shared state. Collaboration is disabled by default; SQLite needs a persistent single server, while hosted/serverless operation requires configured durable Postgres and protected room creation. Manual/sample atlas viewing remains available without this setup. The room has no shared booking states, hotel selection, cash-versus-points workbench, provider search, presence indicators or automatic merge. These are product-scope limits, not deployed parity features silently implemented by the room.

Independent backend review checked request bounds and origins, role authorization, hashed capabilities, transaction/revision conflict handling, revocation, SQLite path confinement, sample projection and generic error responses. A targeted fix aligned ID validation with prose validation for six-character uppercase alphanumeric locator shapes. Seven collaboration tests and scoped lint pass. Live Postgres was not exercised; runtime/clean-clone acceptance remains a separate check. Private prose screening is heuristic, so room content still needs user review.

## Final fresh production comparison

The restored production candidate served at loopback port 3108 returned 230 activities, 176 hotels and seven stops in verified sample mode. It has **zero activity placeholders**, **zero missing local image files** and **144 normalized guide-photo references**, matching the deployed guide-reference count. All 18 deployed guide images missing from the first checkout are now bundled, and the two automotive photos use reviewed local `/media/` paths. The circuit aerial replaces the unrelated generic Nürburgring hero. Other browser preferences and historical remote provider-photo availability can still differ. The public image gate checks 164 local assets and 1,074 remote references with zero metadata, missing-file or review findings.
