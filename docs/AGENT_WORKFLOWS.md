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
| `confirmed` | Reviewed confirmation evidence. | conflict, missing/cancelled only with evidence |
| `missing` | Needed item lacks usable evidence or inventory. | recommended, quoted, conflict |
| `conflict` | Sources disagree or details cannot be matched. | confirmed, missing after traveler resolution |

No agent may infer a later state from a prior state.

## Phase 0 — consent and constraint ledger

**Human/traveler:** supplies known trip facts and decides whether manual/sample, provider research, or an optional private-local import is allowed.

**Codex/Claude:** asks one compact, skippable high-impact batch: travelers/rooms; origin airports and positioning/open-jaw tolerance; hard/flexible dates and trip length; fixed anchors; destinations/interests/rejections; pace; budget/cabin/lodging/cancellation; points programs/balances/transfers; passports/visas; accessibility/luggage; rail/car/overnight/direct-connection tolerance. Record unknowns and reasonable provisional assumptions.

**Stop/ask:** missing hard dates, a potential passport/visa blocker, unclear traveler count/accessibility requirement, conflicting fixed anchor, or unapproved provider/private-data access.

## Phase 1 — route frontier before research

Build at least three materially different multi-city route candidates before broad price research. Vary city mix/order/nights, gateway/open jaw/positioning, or regional mode strategy. For each, give date allocation, route thesis, plausible mode chain, estimated door-to-door burden, upside, sacrifice, and fragile assumption.

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

**Both:** do not publish, book, send email, modify a calendar, or use a private connector without explicit current authorization. Stop and ask rather than guessing on any material constraint, consent, booking, legal/travel-document, or data-quality question.
