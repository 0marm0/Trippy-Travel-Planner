# Export formats and reading copies

Export the current reviewed plan, not a stale sample or raw confirmation. All formats validate/sanitize their input; a private-local label never permits credentials, traveler contacts, booking references, loyalty IDs, seat details or mail links. A recorded `confirmed` state is not new provider verification. See [implementation status](IMPLEMENTATION_STATUS.md) and [privacy](SECURITY.md).

## Choose a format

| Surface / format | Contents and purpose | Limits |
| --- | --- | --- |
| Generic trip JSON | Canonical normalized dates, constraints, routes and booking summaries | Days, pins and activity details are in the itinerary sidecar |
| Generic itinerary JSON | Selected route, pins, day assignments, activities and safe booking details | Companion record; keep it with its trip JSON; not a standalone atlas import |
| Research / quote JSON | Reviewed scope/source/time/limitations and manual comparison assumptions | Separate evidence sidecars; do not infer live quotes or booking states |
| Generic visual HTML | Current manual days, activities, route alternatives, recorded stays/transport, plus validated quote comparisons and research coverage currently loaded in the workspace | Unknown city facts, photos and evidence remain unknown; restore separate evidence sidecars before exporting after a reload |
| Atlas visual HTML | Rich city/day itinerary dossier, existing catalogue context and reviewed imagery | Sample-specific content; images may require preparation/network unless embedded |
| Compact travel HTML / PDF | Dated transport plus stays, icons and recorded states | A reading brief; activity catalogue is intentionally excluded |
| Compact transit HTML / PDF | Dated transport/arrival context | Does not replace a timetable, ticket or operator confirmation |
| Compact hotel HTML / PDF | Stay/check-in context and recorded state | Does not prove room availability, occupancy or final fees |
| Atlas CSV | Flattened current planning rows | No interactive maps/photos; spreadsheet formula prefixes are neutralized |
| Shared board JSON | Reviewed cities, coordinates, activities and day assignments for `/collaborate` import | Excludes bookings/research/access tokens; room creation remains a separate reviewed action |
| Optional account JSON | Validated decrypted planning workspace | Explicit download only; identity/session data and encryption keys are excluded |

## Render options

The atlas retains visual and compact modes, light/dark styling, CSV and supported PDF exports. The generic UI offers a visual HTML itinerary and compact travel/transit/hotel HTML/PDF buttons. Shared renderer contracts support `all`, `travel`, `transit` and `hotels` scopes; use only options actually exposed by the selected UI. Browser print/save-PDF is available in HTML reading copies; dedicated PDF generation needs the local server endpoint.

Rich HTML includes city/day chapters, flight/train/car/hotel logistics, catalogue alternatives, search, expand/collapse, must-do focus and print controls. Generic exports also retain loaded comparison scope, cash/points assumptions, checked times, research states and outstanding questions. Existing visual presentation is preserved alongside the compact briefs. No private reference document was copied into these exports or tracked assets.

## Offline and privacy checks

- Standalone HTML carries its CSS and reading controls. Prepared bundled photos can be embedded; remote images still need network access and retain their separate terms. Failed external activity photos show a neutral “Photo unavailable” placeholder; failed hero photos leave the gradient background. Generic records do not gain sample photos or inferred map positions.
- PDF is a reading copy; HTML controls, live maps and provider searches do not run inside it. No export sends an email, creates a booking or mutates a calendar.
- Check selected dates, route, activities, stays/transport, booking states and unresolved conflicts before downloading. Review notes manually too: schema checks cannot recognize every private fact written in prose.
- Collection-bound failures must be visible; do not publish an incomplete itinerary that silently drops activities or records. Keep editable JSON/evidence alongside a reading copy.
- Once received, files cannot be revoked. Deleting an account or room does not erase exports, screenshots, browser copies or private backups.

Before sharing, verify the exact artifact with synthetic/sample data or reviewed safe planning facts, then obtain any separately required publication/sending authorization.
