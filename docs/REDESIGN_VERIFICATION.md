# Local redesign verification — 2026-09-13

## Delivered

Replaced the invented demo and oversized hero with a compact route-first workspace. The source itinerary is read at runtime from outside this project. Route, flights/transport, cities, stays, activities and daily plans have separate views. The map uses real geographic tiles and source city coordinates; activity/property locations are manual pins, not fabricated geocoding.

## Checks performed

- Lint, TypeScript, three automated planner tests and production build passed.
- Date-shift test covers city stops, transport legs and calendar dates without mutating the source.
- Cash/points test covers fees and unknown values. Link test rejects executable URLs.
- Browser: four route selectors rendered; Grand Tour selection persisted across reload; all eight city cards rendered.
- Browser: 12 of 12 route tiles loaded; zoom changed from level 4 to 5; fit control returned the route view.
- Browser: Lisbon must-do filter returned eight cards; searching Jerónimos returned one; its detail drawer opened with the source description and day choices.
- Browser: fare form rejected a quote without a cash price or points amount. No test quote was saved into the personal workspace.
- Browser: settings tabs displayed trip/date and preference controls.
- At 390px viewport: route and city documents had no horizontal page overflow; city map measured 360px wide; navigation used the bottom bar. Desktop viewport restored afterward.
- Basic current-tree privacy preflight passed. No Git history exists to scan; this is not a comprehensive secret or media-rights clearance.

## Remaining acceptance work

- End-to-end persisted quote, stay, pin and activity-add flows need an isolated test workspace before being described as comprehensively verified.
- Live provider APIs, Gmail OAuth/import review, geocoding, automatic itinerary optimization and public first-run onboarding remain unimplemented.
- The saved source is not proof of current prices, opening hours, reservations, or image redistribution rights.
- Do not publish, deploy, expose the local server, or add the source HTML/photos to the repository. Hostname checks are not authentication for a hosted service.
