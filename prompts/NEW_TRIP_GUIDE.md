# TRIPPY guided new-trip workflow

Use this prompt when a traveler asks TRIPPY, Codex, or Claude to plan a trip. Produce a structured, editable plan, not a purchase flow or a confident-looking guess. The manual/sample path is fully valid.

## Start safely

State the operating mode: `sample/manual`, `research-enabled`, or `private-local import`. Use existing authorizations for their named scope. Do not access a provider, private email/file/calendar, map search or connector beyond approved scope. Ask before expanding access, importing records or changing booking state. Never request a secret in chat or put it in a tracked file. A named service is not proof of an official MCP or connector.

Ask one compact, skippable batch of decision-bearing questions:

1. Who is travelling (count, ages only if relevant, rooms, accessibility/mobility, dietary, sleep, and luggage needs)?
2. What home airports/stations are acceptable, and are positioning flights or an open jaw acceptable?
3. What are the earliest/latest outbound and return dates, minimum/target/maximum trip length, return-home deadline and fixed city/date anchors? Which dates may move, by how much, and do travel/overnight-flight days count toward the length? Which passport/visa unknowns could invalidate a route?
4. Which cities, regions, activities and experiences are required, optional or rejected? What minimum/maximum nights fit each city, and which places can be day trips instead of a hotel change?
5. What pace, morning/evening rhythm, rest needs, budget/currency, cabin, lodging baseline, cancellation flexibility, and direct-versus-connection preference apply?
6. Which usable points balances, source currencies, destination programs, transfer partners/ratios/bonuses/rounding/times/restrictions and traveler valuations should be considered? If unknown, offer a labeled provisional assumption.
7. What rail, rental-car, driving, overnight-travel, ferry/coach, border-crossing, and disruption tolerance applies?
8. Should the first pass use manual inputs, public research, or an approved private-local import?

Use the traveler’s dates, destinations and route length; never silently inherit the Europe sample. Offer reasonable labeled defaults and say which answer would most change the plan. Do not turn omissions into hard preferences.

## Choose a supported workspace

Use `/plan` to validate, preview and accept an arbitrary-trip record into its separate manual workspace, or `trip:init`/`trip:validate` for private-local files. The workspace supports supplied route alternatives, day destinations, timed activities, manual coordinate maps and previewed booking changes. It does not infer geography, schedules, inventory or confirmation. Saving/resuming in this browser is explicit and trip-isolated. Optional accounts separately support reviewed load and explicit encrypted save/update; keep actual trip records out of tracked samples.

Maintain research coverage and recorded cash/award/stay/transport comparisons in their validated sidecars, with source/time/scope/unknowns and equivalent party/currency/terms. Their presence is evidence recorded by the traveler/agent, not automatic provider search. Preserve editable trip/itinerary/evidence exports and a compatible visual or compact reading copy. The 2026 atlas remains a distinct specialized example; its update bundles do not create arbitrary trips. See [status](../docs/IMPLEMENTATION_STATUS.md), [exports](../docs/EXPORTS.md) and [accounts](../docs/PRIVATE_ACCOUNTS.md).

## Route before prices

1. Record a short constraint ledger: hard constraints, soft preferences, rejections, assumptions, unknowns, permissions, and data freshness.
2. Build at least three materially different multi-city candidates before broad price research. A different candidate changes a meaningful route dimension: city inclusion/order or nights, gateway/open jaw/positioning strategy, or regional mode strategy. If hard constraints permit only one city or route, explain why and compare three feasible allocation/mode strategies instead of adding unapproved destinations.
3. For each candidate show: route thesis, nights by city, gateway plan, plausible modes, door-to-door time burden, main upside, sacrifice, and fragile assumption.
4. Ask only follow-up questions that can eliminate or reshape a candidate. Do not ask generic preference questions once real evidence can answer them.

## Research a bounded cash/award and route matrix

Use [the research playbook](../docs/RESEARCH_PLAYBOOK.md) to make an explicit coverage matrix and search ledger **before provider calls**. Agree or state a provisional research budget and meaningful-improvement threshold; do not spend unbounded quota or search the full Cartesian product automatically.

1. Represent every accepted home airport and retained route family with a feasible initial search or named coverage gap. Compare preferred dates plus earlier/later alternatives and representative permitted durations; keep fixed city/date anchors and minimum/maximum nights valid.
2. Compare entry/exit gateways, same-gateway returns, open jaws, city order/nights and positioning only inside approved constraints. Quote a complete multi-city/open-jaw ticket where possible as well as separate legs; separate-leg sums do not prove through-ticket price/protection.
3. Include nonstop and plausible connecting options within accepted stop/layover/overnight/airport-change limits. Explore alternative hubs/carriers when evidence could change the result. Report which dates/connections were not searched; never claim all connections or global cheapest inventory from bounded results.
4. Search cash and usable award programs separately for each competitive route/date family. Validate actual party size, cabin/segments, bookable seat count, taxes/fees, cancellation and transfer eligibility/timing. Missing results, unsupported coverage and provider errors remain distinct unknowns.
5. Compare every practical allowed intercity mode: air, rail, rental car, coach and ferry. Use official operators or authorized available connectors/manual quotes for gaps; there is no direct live ground-transport adapter. Include hotel-to-hotel access, exact terminals, check-in, baggage, border/buffer time, parking/tolls/fuel/insurance, one-way charges, service days and disruption risks.
6. Price lodging bands and complete stays in each candidate’s actual dates/base areas. Recompute the **whole trip** when gateways, city order, nights or modes change; a cheap local leg may worsen hotel costs or useful trip time.

For every query record candidate/query ID, safe parameters, source/check and cache times, outcome, currency/unit, party-total cash/points/fees, cabin/stops/time, terms/unknowns, retain/reject reason and next evidence needed. Deduplicate identical requests. Expand neighboring dates, gateways, programs or route allocations where a real price/time/availability delta might change the leader; preserve the displaced leader.

At each bounded sweep, show the best cost/time/flexibility alternatives and coverage gaps. Ask only reactive questions from observed deltas. Stop expansion when each retained family is comparable, critical unknowns are resolved or disclosed, and another bounded sweep yields no improvement above the stated threshold. Stop failed/rate-limited paths after bounded handling and offer manual fallback. Report partial coverage honestly; reopen for new evidence/constraints rather than endlessly retrying.

### Compare cash and points explicitly

Use comparable travelers, route/cabin, baggage and terms in one disclosed currency. Verify per-person versus party totals and keep unknown fees unknown:

```text
Cash outlay = fare + required extras + positioning/local transfers + extra lodging
Award outlay = taxes/surcharges + extras + positioning/local transfers + extra lodging
               + transfer/purchase fees
Effective award cost = Award outlay + points consumed × traveler value per point
Net redemption CPP = (comparable Cash outlay - Award outlay) / points consumed × 100
```

Use dollars per point for effective cost and cents for CPP. Show source points spent versus destination miles received after transfer ratio/bonus/rounding; state the denominator and avoid double-counting both currencies. Explain foregone rewards, flexibility/time and risk separately. A high CPP cannot override hard constraints, unavailable seats or risky transfers. Verify program inventory/rules before the traveler approves transfer or purchase. These calculations and coverage are agent/manual work, not an automatic atlas feature; the current search form uses narrow defaults, so consult [adapter limits](../docs/PLANNING_GUIDE.md).

## Research cities and build days

For each retained city, including short and arrival/departure stops, build a broad source-backed catalogue before narrowing it. Cover categories and useful alternatives rather than inventing a fixed attraction count. Include signature sights, museums/history, food/evening, neighborhoods, walks/scenery, day trips, seasonal events, and practical alternatives. For each item record source, URL, checked-at time, hours/closures, reservation need, duration, price basis, accessibility notes, indoor/outdoor status, coordinates when verified, and uncertainty.

Score explicitly, for example:

`preference fit + uniqueness + evidence quality + geographic fit + schedule fit + value - transit burden - crowd risk - redundancy`

Use hard constraints to exclude options. Maintain must/should/could tiers, geographical clusters, diversity across days, weather/closure fallbacks, and a reason for each exclusion. Use high-quality photos only with an attributable source and a redistribution-compatible usage basis; keep a licensed/attributable fallback or no-photo state.

Compare at least two plausible hotel/base areas when feasible: one near activity clusters and another convenient to exact arrival/departure stations, airports or ports. Use actual stay dates/rooms/occupancy, full fees, cancellation/payment, luggage storage and practical transit at the relevant hours. Explain savings against repeated transfer cost/time; straight-line proximity does not establish access. Revisit route/nights when hotel value changes the frontier.

Build an iterative day plan around geographic clusters, local time zones, fixed anchors and useful sightseeing hours. Respect arrivals, check-in/out, reservations, hours, practical transfers, meals, rests, luggage and realistic capacity. Flag conflicts and impossible days rather than silently compressing them. Re-check factual inputs before locking a day.

## Bookings and private imports

Maintain a booking-needs ledger for every selected flight, rail, car, coach/ferry, stay and timed activity. Record safe dates/item facts, evidence freshness, payment/cancellation deadlines and hold expiry. Use exact states: `recommended`, `quoted`, `held`, `confirmed`, `missing`, and `conflict`.

- Recommendations and quotes are not bookings.
- A hold requires explicit provider evidence and expiry information; it is not confirmed.
- A confirmed record requires an approved, deduplicated confirmation source. Contradictory dates/provider/locator data is `conflict`, never an inferred resolution.

For Gmail, email, file, or calendar import: explain the read-only minimum scope, purpose, retention boundary, and manual fallback; obtain explicit approval; read only approved material; extract normalized candidates; redact sensitive fields in previews; deduplicate; show proposed changes and confidence; then ask again before writing/importing or changing a booking state. Never include raw email, Gmail links, confirmation codes, references, loyalty identifiers, or secrets in public/sample/export data.

Optional `/collaborate` rooms contain share-safe activities/days, not bookings, private-trip accounts or atlas imports. Review before publishing a board; keep private identifiers and tokens outside it. Implementation does not authorize provisioning, deployment or sending invitations. See [live collaboration](../docs/LIVE_COLLABORATION.md).

## Finish or stop

Before marking a plan ready, verify route, date allocation, selected modes, booking states, source freshness, opening/closure risk, budget and points arithmetic, and itinerary feasibility. Offer sanitized exports only through a renderer compatible with the actual record (the current atlas has CSV, visual HTML and PDF) and retain editable structured state.

Stop and ask instead of guessing when a hard constraint, travel-document requirement, provider permission, booking-state conflict, cancellation rule, source credibility issue, material price/time tradeoff, or approval to import/write is unresolved. End with the selected route and retained cost/time/flexibility alternatives, whole-trip costs and points assumptions, search coverage/omissions, each-city catalogue and base comparison, feasible day plan, booking gaps, unknowns and next highest-value action. Validate the structured record; keep research detail not supported by the schema in a sanitized companion ledger. A bounded discovery pass may be complete while a dependent booking decision remains unresolved.

Return a compact [acceptance checklist](../docs/AGENT_WORKFLOWS.md#acceptance-checklist) with receipts and gaps. Name the actual supported rendering/sharing surface, the editable record and companion ledger locations, and whether this is bounded discovery, a traveler-accepted plan or a still-unresolved booking decision. Do not mark an omitted city, hotel search, transport leg or award program complete merely because another part of the plan is detailed.

## Use the current planning tools

In `/plan`, use **Route & map → Compare the whole journey** to preview distinct city-order/night proposals and record gateways, through/separate tickets, protection, leg times and existing quote IDs. Missing costs, transfers, scope, timing and eligibility stay unknown; a bounded recorded comparison is not an exhaustive cheapest search. Retain materially different route candidates, then use **Route & map → Compare dated routes** to allocate nights and preview day destinations. This validates recorded constraints; it does not establish service schedules. Do not move dated activities or bookings silently to fit a candidate.

Use **Research coverage → Item evidence** for decision-specific sources, checked times, basis and unknowns. Editing a supported record preserves its old receipt with a required-review flag; review or replace that receipt rather than treating its timestamp as a fresh check. Use **Quote comparisons** for sourced comparable alternatives and **Selected budget** to count only explicitly chosen quotes. Keep currencies separate and disclose unrecorded costs, overlapping alternatives and points assumptions.

The **Search** matrix prepares at most 24 exact one-way cash airport/date combinations. Preparing makes no provider requests; running uses the user's configured SerpApi allowance, two concurrent queries, bounded timeouts and no automatic retries. Review the scope and permission/cost basis before running. Record every exact outcome and review the proposed cash coverage receipt before accepting replacement. Awards, through-ticket/open-jaw pricing, positioning protection, rail/car, hotels and city research still need their own coverage; never extrapolate a cash-only matrix to a complete-trip or cheapest-price claim.

Save the complete copy explicitly when research/quote tools change. Download **complete workspace JSON** for a resumable record, not only the normalized trip file or reading copy. At setup, **Saved trips on this device** previews a validated stored copy; complete JSON restoration validates and previews before opening memory. **Trip tools → Detailed cities & days** supports editing activities, assignments, destination names, attributed photos and sourced pins with the same local undo history. Missing priorities, geography and hotel dates stay unknown. **Trip tools → Scenarios & snapshots** creates a separately identified reviewed scenario or explicit named device recovery point; opening/restoring never saves to an account automatically. **Friends & shared edits** reviews a downloaded base and updated board with per-change choices before applying supported edits; new activities need explicit date/time/duration. Bookings and quote/research evidence stay outside shared boards. Use **Next decisions** to revisit remaining structural gaps and **Export studio** to review rich/compact scopes. Network photos, final PDF layout and offline assets require their separate checks.


## Preparing the final plan

In `/plan`, use **Stays & transport → Stay & transport details** to review metadata for existing booking records: destination links, attributed hotel photos and sourced coordinates, or explicit transport endpoints and entered travel/transfer minutes. Keep unknowns blank. Metadata does not select a quote, refresh a price or change reservation state.

Use **Trip tools → Tasks, packing & alternatives** for personal tasks, packing, role aliases and optional date/city/activity references. Ask about weather fallback preferences, energy, accessibility and packing constraints; retain unknown suitability and opening hours. Save both activities before linking a same-city alternative. Preview and approve the exact slot swap; never silently change the itinerary because of a forecast. Repair task/fallback references before deleting an activity.

For an enabled shared room, **Shared revision history → Load history** shows a retained window of server summaries. It is not an unlimited archive or verified participant identity. Owner/editor/viewer access still applies. Sharing and exchanging an accepted board with the owner workspace remain explicit reviewed actions.
