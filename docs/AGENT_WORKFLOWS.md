# TRIPPY agent workflows

This is the working contract for a traveler, a human planner, Codex, and Claude. It supplements `AGENTS.md`; it does not authorize purchases, publication, secret handling, or private-data access.

## Shared record and labels

Keep one normalized trip record. Every decision-bearing item carries a source, checked-at time when externally derived, status, confidence/uncertainty, and a distinction between fact, estimate, quote, manual input, recommendation, and confirmation. Preserve alternatives, rejections, assumptions, and conflicts.

Use these booking states only:

| State | Meaning | May become next |
| --- | --- | --- |
| `recommended` | Planning suggestion; no provider inventory claim. | quoted, missing |
| `quoted` | Time-bounded price/availability evidence. | held, confirmed, missing, conflict |
| `held` | Evidence of a provider hold and its expiry. | confirmed, missing, conflict |
| `confirmed` | Reviewed confirmation evidence. | conflict, missing only with reviewed evidence |
| `missing` | Needed item lacks usable evidence or inventory. | recommended, quoted, conflict |
| `conflict` | Sources disagree or details cannot be matched. | confirmed, missing after traveler resolution |

No agent may infer a later state from a prior state. Selection, rejection and cancellation reasons are separate decision metadata; do not invent `booked` or `cancelled` as booking-state values. Follow the runtime schema if historical records have older labels, and flag migrations rather than silently coercing them.

## Choose the actual data surface

For any new destination/date combination, use `/plan` for browser draft/validation/preview/acceptance/download, or `npm run trip:init -- ...` for an ignored private-local file. Validate records with `npm run trip:validate -- <path>` and `schema/trip.schema.json`. `/plan` has no server upload or persistence and clears on reload. The current atlas loader and `Trip2026Payload` are specialized to the Europe sample; a schema-valid generic record is not automatically renderable there. Keep real trip records private-local, preserve the public sample, and state the remaining manual or unsupported step. See [current onboarding limits](ONBOARDING.md#what-is-implemented-today).

Agent update bundles propose a narrow set of decisions for existing atlas IDs; they do not create trips, add route stops or confirm bookings. Use [the bundle contract](AGENT_UPDATE_BUNDLES.md), preview a diff and obtain acceptance before applying a bundle.

For authorized live group planning, `/collaborate` uses a separate bounded board of dates, cities, activities and day assignments. The owner reviews its safe contents before publishing, then grants editor or viewer capabilities. Editors may add/edit activities and arrange days; only owners change the trip frame or manage invitations. Polling checks shared revisions every four seconds. Preserve an unsaved draft on HTTP 412 and require an explicit reconciliation/reload; never auto-retry a stale state. This does not sync `/plan`, alter the sample atlas or import bookings. Store tokens only in the capability flow, never in trip records, logs, query parameters or exports. Configure user-owned durable storage and a private remote/production creation code following [LIVE_COLLABORATION.md](LIVE_COLLABORATION.md); provisioning, deployment and sending links still require authorization.

## Phase 0 — consent and constraint ledger

**Human/traveler:** supplies known trip facts and decides whether manual/sample, provider research, or an optional private-local import is allowed.

**Codex/Claude:** asks one compact, skippable high-impact batch: travelers/rooms; origin airports and positioning/open-jaw tolerance; hard/flexible dates and trip length; fixed anchors; destinations/interests/rejections; pace; budget/cabin/lodging/cancellation; points programs/balances/transfers; passports/visas; accessibility/luggage; rail/car/overnight/direct-connection tolerance. Record unknowns and reasonable provisional assumptions.

**Stop/ask:** conflicting hard dates/anchors, a material travel-document or accessibility blocker, or unapproved provider/private-data access. Missing answers may stay unknown while provisional route exploration proceeds; do not commit a route that depends on them.

## Phase 1 — route frontier before research

Build at least three materially different multi-city route candidates before broad price research. Vary city mix/order/nights, gateway/open jaw/positioning, or regional mode strategy. Respect explicit single-city or fixed-route constraints; when they prevent three distinct multi-city routes, explain why and compare three feasible allocation/mode strategies. For each, give date allocation, route thesis, plausible mode chain, estimated door-to-door burden, upside, sacrifice, and fragile assumption.

Do not replace this phase with “which airline do you prefer?” Ask follow-ups only when the answer would change the route frontier.

## Phase 2 — authorized evidence and reactive choices

With the traveler’s authorization and a confirmed available provider/manual source, compare representative dates and:

- direct and reasonable connection flights, alternate airports, positioning, and open jaws;
- rail, car, coach/ferry, pickups/drop-offs, baggage, border, overnight, airport/station transfer, and door-to-door time;
- cash, award points, taxes/surcharges, transfer ratio/time, cancellation/change terms, source, and freshness;
- lodging bands by neighborhood, date, occupancy, cancellation, and evidence status.

Show the delta that matters, preserve the former leader, and ask the traveler to decide only observed tradeoffs. Examples: money versus six hours, transfer risk versus award value, central hotel versus longer transit, or flexible date versus a closure/event conflict.

## Phase 3 — city research and itinerary construction

Follow [the research playbook](RESEARCH_PLAYBOOK.md). Keep a broad catalogue before prioritizing. Build must/should/could tiers, category diversity, geographic clusters, source-backed map pins, and fallback plans. Then make editable days that include arrival/departure, check-in/out, reservations, hours, transit, meals, rest, luggage, accessibility, and weather/closure fallbacks.

Before locking, run a feasibility pass and present conflicts. Changes to selected/locked items need explanation and approval, not silent optimization.

## Phase 4 — optional import workflow

1. Explain provider availability, minimum read-only scope, purpose, retention, and manual fallback.
2. Obtain explicit approval to read the named email/file/calendar scope. Do not assume Gmail or any official MCP exists.
3. Extract only normalized candidates; do not store raw mail in the trip record.
4. Deduplicate by provider, route/property, date/time, and safe non-secret identifiers. Mark ambiguous matches `conflict`.
5. Redact preview fields, show proposed changes and confidence, and obtain a second approval before import/write or a booking-state change.
6. Keep raw email, links, confirmation codes, references, loyalty identifiers, and secrets in private-local custody only.

## Phase 5 — review, export, and handoff

Review selected route, dates, sources/freshness, price/points arithmetic, booking states, opening/closure risk, and day feasibility. Exports must reflect current selected transport/stays/activities/priorities/dates but only sanitized fields. Handoffs state data mode, permissions used, assumptions, sources/freshness, unresolved decisions, conflicts, and the next highest-value question.

## Agent-specific guardrails

**Codex:** use repository schemas and tests; keep providers behind adapters; do not expose private values in command output, fixtures, docs, or commits.

**Claude:** keep the conversation focused on the next decision; do not turn a connector name into a capability claim; present evidence and uncertainty in plain language.

**Both:** use existing session authorizations for their exact scope. Do not publish, book, send email, modify a calendar, expand connector permissions or access a private source without explicit authorization. Stop and ask rather than guessing on any material constraint, consent, booking, legal/travel-document, or data-quality question.

## Complete planning handoff

Use [the copyable master prompt](../prompts/START_HERE.md) to connect setup, trip intake and the full research workflow. Deliver a constraint ledger, at least three route/allocation candidates, a date/airport/program/mode search ledger, cash-versus-points calculation, hotel total-price/location comparison, broad per-city activity catalogue, feasible editable day plan, and booking-gap list. Record searched and unsearched combinations and react to actual tradeoffs. The detailed [new-trip prompt](../prompts/NEW_TRIP_GUIDE.md) and [research playbook](RESEARCH_PLAYBOOK.md) define adaptive search coverage; [integrations](INTEGRATIONS.md) defines actual tool discovery and user-owned credential setup. Keep research sidecars private-local when they do not fit the strict trip schema.

Check optional live-room setup separately: `/collaborate` supports reviewed activity/day boards with owner/editor/viewer capabilities, conditional saves and durable SQLite/Postgres. Confirm persistence, editor/viewer restrictions, conflict preservation and revocation with synthetic/sample content before handing off a configured server. Host connector access stays with the authorized agent and does not become an entitlement for friends or the deployed website.

## Acceptance checklist

Use the applicable rows as receipts, with `verified`, `not checked`, `not applicable` or `blocked` plus a reason. Separate setup completion, bounded research completion, traveler acceptance and booking readiness; one does not establish the others.

| Work | Evidence required before handoff |
| --- | --- |
| Intake and workspace | Actual mode and supported surface; constraint/consent ledger; schema-valid record; safe private-local location for real plans; known persistence/download behavior |
| Route comparison | Three materially different feasible route/allocation strategies, or the constraint-based explanation; dates/nights and all required legs; preserved alternatives/rejections |
| Search coverage | Date/airport/program/mode ledger; party/cabin/currency basis; query timestamps and outcomes; declared budget/stop condition; gaps and fallback for every relevant family |
| Cash and points | Comparable cash and award outlay; taxes/fees and unknowns; source-points denominator, transfer rules/timing and disclosed valuation; no inferred inventory or holds |
| Stays and cities | Actual stay/room/occupancy totals and terms; alternative base areas where feasible; broad attributable catalogue for every retained city; verified geography or explicit unknowns |
| Day feasibility | Arrivals/departures, fixed anchors, hours, reservations, local time zones, transfers, check-in/out, meals/rest/luggage and closure/weather alternatives checked |
| Bookings/imports | Every necessary reservation represented; canonical states with evidence; approved read scope and separate accepted normalized write when importing; private identifiers excluded |
| Sharing | Current sanitized artifact or reviewed live board; actual recipient role; explicit publication/sending authorization; supported format and known copy/revocation limits |
| Live server setup | Configured durable backend; synthetic/sample role checks, restart persistence, stale-write draft preservation and revocation; remote creation gate and reachability checked if in scope |
| Repository change | Relevant lint/types/tests/build/schema/privacy checks and representative end-to-end flow; observed failures and untested external services named |

A handoff should include the editable record location, companion evidence ledger, checks/results, unresolved constraints and the next action. Keep token-bearing URLs, raw imports, credentials and private booking identifiers out of receipts. Do not describe a hosted Postgres integration as tested unless a user-authorized database was actually exercised.
