# Export formats and reading copies

Export the current reviewed plan, not a stale sample or raw confirmation. All formats validate/sanitize their input; a private-local label never permits credentials, traveler contacts, booking references, loyalty IDs, seat details or mail links. A recorded `confirmed` state is not new provider verification. See [implementation status](IMPLEMENTATION_STATUS.md) and [privacy](SECURITY.md).

## Choose a format

| Surface / format | Contents and purpose | Limits |
| --- | --- | --- |
| Generic trip JSON | Canonical normalized dates, constraints, routes and booking summaries | Days, pins and activity details are in the itinerary sidecar |
| Generic itinerary JSON | Selected route, pins, day assignments, activities, safe booking details and optional item receipts, night allocations, research/quote evidence and selected budget quote IDs | Companion record; keep it with its trip JSON; not a standalone atlas import |
| Research / quote JSON | Reviewed scope/source/time/limitations and manual comparison assumptions | Standalone exports remain available alongside optional workspace retention; do not infer live quotes or booking states |
| Generic visual HTML | Current manual days, activities, route alternatives, recorded stays/transport, plus validated quote comparisons and research coverage currently loaded in the workspace | Recorded attributed activity photos, coordinates and explicit unknown priorities are retained; assigned planning days never become hotel stay dates. Unknown facts/photos remain unknown; explicit workspace saves retain loaded evidence. Whole-itinerary compact HTML also preserves context/evidence; narrow scopes retain relevant item receipts only |
| Atlas visual HTML | Rich city/day itinerary dossier, existing catalogue context and reviewed imagery | Sample-specific content; images may require preparation/network unless embedded |
| Compact travel HTML / PDF | Dated transport plus stays, icons and recorded states | A reading brief; activity catalogue is intentionally excluded |
| Compact transit HTML / PDF | Dated transport/arrival context | Does not replace a timetable, ticket or operator confirmation |
| Compact hotel HTML / PDF | Stay/check-in context and recorded state | Does not prove room availability, occupancy or final fees |
| Atlas CSV | Flattened current planning rows | No interactive maps/photos; spreadsheet formula prefixes are neutralized |
| Shared board JSON | Reviewed cities, coordinates, activities and day assignments for `/collaborate` import | Excludes bookings/research/access tokens; room creation remains a separate reviewed action |
| Optional account JSON | Validated decrypted planning workspace | Explicit download only; identity/session data and encryption keys are excluded |

## Render options

The atlas retains visual and compact modes, light/dark styling, CSV and supported PDF exports. Both the generic workspace and atlas offer Export studio, with scope (`all`, `travel`, `transit`, `hotels`), visual/compact layout, supported light/dark themes and optional inclusive date windows inside the trip. Overlapping stays retain their original dates and terms; trip-wide route/evidence/budget context is explicitly labeled. Invalid records outside the selected window still block export. Existing reading and editable JSON paths remain available. Shared renderer contracts support `all`, `travel`, `transit` and `hotels` scopes; use only options actually exposed by the selected UI. Browser print/save-PDF is available in HTML reading copies; dedicated PDF generation needs the local server endpoint.

Rich HTML includes city/day chapters, flight/train/car/hotel logistics, catalogue alternatives, search, expand/collapse, must-do focus and print controls. Generic exports also retain loaded comparison scope, cash/points assumptions, checked times, research states and outstanding questions. Existing visual presentation is preserved alongside the compact briefs. No private reference document was copied into these exports or tracked assets.

## Export studio preview

[`export-studio.tsx`](../src/components/export-studio.tsx) derives the preview and download from the current parent snapshot and renderer callback, including current generic context/evidence. [`export-preview.ts`](../src/lib/export-preview.ts) checks the full snapshot before scoping: invalid or over-limit records outside the requested scope still block the export. Explicit unknown generic destination windows remain unknown rather than borrowing sample dates. Counts disclose route/date context retained by narrow briefs; compact layout uses no photos.

The titled iframe has an empty sandbox and a restrictive content-security policy: scripts, forms and navigation are disabled. Linked image loading starts off. Opt-in permits HTTPS images and, for local development, the exact loopback HTTP app origin. It does not enable a general plaintext image source. The downloadable HTML remains a normal reading file with its existing controls; the sandbox preview is not a PDF page proof.

After explicit image opt-in, approved local photos are fetched by the parent app and embedded only in the sandbox preview, avoiding opaque-origin loopback image blocking. This is bounded to 40 unique files, 1,000,000 bytes per file, 8,000,000 retained response bytes and three workers. Requests omit credentials, reject redirects and accept only PNG/JPEG/WebP; closing, changing scope or disabling images cancels obsolete work. Failed or omitted local images use neutral fallbacks and visible counts. Preview embeddings have a separate memory budget; they do not change linked-image downloads or promise a complete offline pack. External preview images still depend on network access.

The studio reports unique local/external/embedded photo candidates and the UTF-8 HTML byte count against a 1,500,000-byte studio budget. Counts are candidates, not successful downloads or a guarantee the renderer uses every photo. Linked-image bytes and final PDF size remain unknown until loaded. The current sanitizer does not retain arbitrary embedded image data. A budget failure blocks download; it never silently removes records.

Local `/media` links need the app origin or separately bundled assets; linked external photos need network access. The PDF endpoint has its own 1,500,000-byte request budget and bounded approved-image retrieval; visual PDF loading currently considers up to 60 unique daily-activity images. Missing imagery may be omitted. A visual HTML preview therefore does not promise every photo appears in a PDF, or that a detached HTML file works fully offline.

## Offline and privacy checks

- Standalone HTML carries its CSS and reading controls. Prepared bundled photos can be embedded; remote images still need network access and retain their separate terms. Failed external activity photos show a neutral “Photo unavailable” placeholder; failed hero photos leave the gradient background. Generic records do not gain sample photos or inferred map positions.
- PDF is a reading copy; HTML controls, live maps and provider searches do not run inside it. No export sends an email, creates a booking or mutates a calendar.
- Check selected dates, route, activities, stays/transport, booking states and unresolved conflicts before downloading. Review notes manually too: schema checks cannot recognize every private fact written in prose.
- Collection-bound failures must be visible; do not publish an incomplete itinerary that silently drops activities or records. Keep editable JSON/evidence alongside a reading copy.
- Once received, files cannot be revoked. Deleting an account or room does not erase exports, screenshots, browser copies or private backups.

Before sharing, verify the exact artifact with synthetic/sample data or reviewed safe planning facts, then obtain any separately required publication/sending authorization.

## Visual design and transport identity

Rich reading copies use photo-led city panoramas, charcoal glass surfaces and daily timelines. Explicit mode metadata takes precedence over venue names: flights are blue, rail is yellow and driving is purple in HTML and PDF. Booking state stays a separate badge. Generic days include recorded stay ranges and dated movements, without promoting a quote or hold to confirmed. The generic workspace groups downloads under **Export & download** and opens the shared Export studio for reading-copy review. Item receipts marked `reviewRequired` carry that warning into generic reading copies; saving a source does not refresh it.
