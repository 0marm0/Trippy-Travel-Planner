# TRIPPY workspace and guided-planning roadmap

## Current product shape

The 2026 workspace is a local-first, provider-neutral planner with Route & dates, Transport, Cities & sights, Daily itinerary, Hotels & days, Activities, and Flights & research. Its route overview provides calendar, timeline, and list views; the itinerary supports current structured exports. The 2025 workspace remains a separately gated private-local legacy view.

Current visual choices—Obsidian or Midnight blue glass, a compact header, layered route atlas, tiled city/day maps, and editable lists—must remain subordinate to truthful planning state. Map lines are geographic connections, not turn-by-turn routes. A map, photo, tile, or provider failure must leave the plan readable and editable.

## Guided onboarding experience

The new-trip flow should progress through: trip frame, route freedoms, travel style, evidence-backed tradeoffs, city discovery, itinerary review, and optional import review. Each stage shows saved assumptions, hard constraints, unresolved risks, source/freshness, and a manual/sample fallback. Ask compact, high-impact questions first; create three or more materially different route candidates before price research; then surface only reactive price/time/points/cancellation decisions.

The UI must distinguish facts, estimates, manual entries, stale quotes, live quotes, recommendations, held options, confirmations, missing data, and conflicts. Never turn a visual selection into a booking claim.

## Route, transport, and awards

Route candidates need city order/nights, gateways, open-jaw or positioning logic, mode choices, total door-to-door burden, key risks, and explicit tradeoffs. Transport should compare direct versus connection, cash versus points, rail/car/coach alternatives, transfers, baggage, cancellation, and checked-at evidence. The cash-vs-points workbench must disclose taxes/surcharges, transfer assumptions, positioning costs, and cents-per-point calculation.

## City research, maps, and itinerary

Every retained city needs a broad catalogue, category filters, must/should/could tiers, source and closure/reservation context, map coordinates with confidence, geographical clusters, and accessible map/list parity. City/day maps should show only verified pins, label their layers, provide fit/zoom controls, and offer a usable non-map fallback. Photos require source/attribution/usage basis and a fallback.

The itinerary builder should make travel, check-in/out, reservations, meals, rest, accessibility, luggage, and closure risks visible. It should preserve alternatives, support a compact/detailed view, show conflicts rather than hiding them, and require review before locking changes.

## Private imports and exports

Gmail is not assumed connected. Any Gmail/email/file/calendar connector is opt-in, least-scope, read-only, reviewed, deduplicated, and approved before import/write. Public/sample screens and all exports must omit raw content, email links, confirmations, references, loyalty IDs, and secrets.

Exports are derived from the current structured itinerary and labelled honestly: working CSV, visual HTML dossier, and operational/visual PDF. Before offering an export, sanitize its data and retain current selected transport, stays, activities, priorities, and dates.

## Acceptance checkpoints

Before calling a workflow ready, verify: route candidates existed before pricing; price/points math is reproducible; selected values flow into calendar/timeline/list/maps/exports; map and no-map states work; every research fact has source/freshness; no booking state is inferred; and private data cannot enter sample, screenshots, commits, or exports. See [Onboarding](ONBOARDING.md), [Agent workflows](AGENT_WORKFLOWS.md), and [Research playbook](RESEARCH_PLAYBOOK.md).
