# Agent instructions for Europe 2026

1. Read `docs/2026_TRIP_CORRECTIONS.md` before doing any trip work. It is authoritative over stale chat text and historical datasets.
2. Treat `examples/trips/2026-europe-sample.json` as the share-safe working corpus, not proof that a price remains live or a reservation exists.
3. Never infer `confirmed` from a route suggestion, an email subject, a redacted field, or a provider result. Preserve `confirmed`, `missing`, `conflict`, `cancelled`, and `planning` as separate states.
4. Never place API keys, OAuth tokens, access codes, booking references, ticket numbers, seats, passenger names, personal email, raw messages, or receipts in tracked files, logs, screenshots, bundles, or public exports.
5. Private operational material may be read only from `.private/trips/europe-2026/` or an explicitly configured external path. It may appear only in an authenticated/private or loopback-local view and a deliberately selected private export.
6. Research each city using current primary/official sources where possible. Record source URL, retrieval date, exact travel dates and occupancy, currency, cancellation terms, evidence confidence, coordinates, and photo rights/credit separately.
7. Rank activities by traveler preference, distinctiveness, time cost, geography, opening constraints, reservation risk, weather resilience, and route fit. Do not manufacture rankings or photos.
8. Compare cash and points as distinct evidence. Include taxes/fees, transfer bonuses, positioning cost, cancellation rules and cents-per-point assumptions; never claim live award inventory from cached Seats.aero data.
9. Compare every intercity leg across viable flight, rail and car options using door-to-door time and missing-booking state. Never book or cancel without explicit user approval.
10. Proposed changes must arrive as a validated TRIPPY update bundle and remain preview-only until the user accepts the diff.
