# 2026 workspace refresh

Local implementation and verification record. Nothing was published or deployed.

## Delivered

- Compact blue-black glass shell, blue-accent cards and controls, and optional Midnight blue appearance under Settings. Trip setup lives in Settings instead of a permanent introductory panel.
- Supplied TRIPPY globe icon in the 2026 header, loading and setup surfaces, legacy 2025 brand surfaces, and browser icon. The source PNG is preserved losslessly. Transport and activity symbols remain separate.
- Slate-blue land and dark-blue water on the bundled route atlas. It is independent of hosted map tiles.
- Detailed city maps with real-coordinate pins, distinct hotel/airport/rail symbols and labels, priority-colored activities, layer toggles, city/all-pin framing, and optional arrival inset.
- TRIPPY Night, a local palette derivative retaining all 119 Bright style layers. Bright, Liberty, Fiord, and Dark remain available. Existing browser choices are preserved. See [integration details](INTEGRATIONS.md#map-stack).
- Glass dropdowns replace operating-system select popups in the 2026 workspace, including workspace, map styles, activity tiers/dates, filtering and setup. Arrow/Home/End navigation, Escape dismissal and focus return are supported.
- Calendar months stacked vertically, timeline and tabular date views. Calendar dates open their matching itinerary day, including the final departure day. Transport choices and activity priority edits feed these views.
- Working CSV, standalone visual HTML, operational light/dark PDFs, and photo dossier PDF downloads. Exports include edited day order, priorities, selected stays and transport. Ordinary exports omit private reference fields.
- Added a compact command palette for every workspace (`⌘/Ctrl+K`), a phone-native glass navigation dock, simplified mobile header actions, quieter shared card hierarchy, and a map-rendering veil so city tiles never flash as an unfinished blank panel.

## Browser checks

An isolated local browser session used the redacted sample, not the user's saved browser workspace.

- Loaded Night tiles and actual markers in Nürburgring and Kraków; visually inspected screenshots.
- Switched Night to Bright and back; verified the application state changed.
- Opened the workspace glass menu at desktop and 390px mobile widths.
- Changed Adenau's priority and moved it to another day; verified control values and exported photo dossier reflect the edit.
- Added an activity from the city catalogue; verified the command picker resets to “Add to day.”
- Verified keyboard selection and Escape focus return.
- Verified October starts below September at the same horizontal position.
- Verified seven timeline stops, 21 table dates, and October 12 calendar-to-itinerary navigation.
- Verified document width equals viewport width at 390px; inspected mobile header, map and calendar screenshots.
- Downloaded all five export formats with successful browser download completion. Inspected actual PDF metadata and rendered operational and photo-dossier pages. The visual PDF contained embedded activity photos.
- Verified the supplied brand PNG loaded in the header and its bytes match the provided original.

Browser evidence and downloaded samples are under ignored `output/playwright/` and `.playwright-cli/`. These are local QA artifacts, not release fixtures.

The prior release passed lint, TypeScript, 43 automated tests, sample validation, production build, and current-tree privacy preflight. The publication candidate adds a separate staged-tree and reachable-history scan; see `RELEASE_CANDIDATE.md`. Passing it is still not a public-release security sign-off.

## Limits and release boundaries

- Hosted tiles/fonts/photos still need network access. OpenFreeMap has no service-level guarantee. An imported external hotel image returned HTTP 403 during testing; the UI's fallback remains necessary. Some upstream map shield filters emit null-value warnings without preventing map rendering.
- Export repair verifies real downloads and current itinerary state; it does not assert pixel-for-pixel parity with every older chat-site dossier.
- This refresh is not a claim that all historic chat-site functionality has been exhaustively ported. Use the product roadmap and parity inventory for remaining work.
- Public sample validation is not permission to publish. Review the [public release checklist](PUBLIC_RELEASE_CHECKLIST.md) and [security policy](SECURITY.md) before any GitHub release.
- Keep `.private/`, real `.env` files, OAuth/connector credentials, email contents, booking references and confirmation numbers out of source, exports intended for sharing, screenshots and Git history. Confirmed travel dates and public flight numbers may remain in the sample. Real SerpAPI and Seats.aero keys never belong in committed files; examples contain placeholders only.

## Latest refinement and cancellation correction

- Enlarged the supplied globe to a floating transparent mark; removed its square frame. Main route atlas fits closer while keeping all eight destination labels in bounds.
- Added calendar Details toggle, country flags, supplied transport symbols, US departure September 21, and final departure October 12 (22 calendar days). Detailed narrow-screen calendars scroll within their month instead of squeezing flight text into unreadable columns.
- Shared logistics distinguishes confirmed, missing, TBC, and conflicting records. Missing transport and nightly stay coverage appears in red and in a separate main-page section. Selecting an option does not confirm a booking.
- Reconciled the current Wrocław-first route against the latest reviewed project history. Lufthansa LH1374 and the October 5 European Sleeper are confirmed; cancelled Copenhagen and refunded KLM paths are inactive everywhere. See `2026_TRIP_CORRECTIONS.md`.
- Replaced reference-text heuristics with a typed reviewed booking status so public redaction cannot turn a confirmed booking into “Needs booking” or upgrade a placeholder into a confirmation.
- Rebuilt the operational PDF and interactive visual HTML against the supplied source artifacts while keeping private confirmation, passenger, carriage, berth, and email details out of exports.
- The full validation suite is rerun after each export revision. No GitHub publication or remote creation was performed.
