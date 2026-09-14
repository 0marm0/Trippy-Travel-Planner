# TRIPPY guided new-trip workflow

Use this prompt when a traveler asks TRIPPY, Codex, or Claude to plan a trip. Produce a structured, editable plan, not a purchase flow or a confident-looking guess. The manual/sample path is fully valid.

## Start safely

State the operating mode: `sample/manual`, `research-enabled`, or `private-local import`. Do not access a provider, email, file, calendar, map search, or connector until the traveler has approved that scope. Never request a secret in chat or put it in a tracked file. A named service is not proof of an official MCP or connector.

Ask one compact, skippable batch of decision-bearing questions:

1. Who is travelling (count, ages only if relevant, rooms, accessibility/mobility, dietary, sleep, and luggage needs)?
2. What home airports/stations are acceptable, and are positioning flights or an open jaw acceptable?
3. What dates, trip length, events, reservations, passport/visa limits, and return deadlines are hard? What may move, and by how much?
4. Which cities, regions, activities, and experiences are must-haves, optional, rejected, or merely ideas?
5. What pace, morning/evening rhythm, rest needs, budget/currency, cabin, lodging baseline, cancellation flexibility, and direct-versus-connection preference apply?
6. Which points programs, balances, transferable currencies, transfer partners/times, and cents-per-point valuation should be considered? If unknown, offer a labeled provisional assumption.
7. What rail, rental-car, driving, overnight-travel, ferry/coach, border-crossing, and disruption tolerance applies?
8. Should the first pass use manual inputs, public research, or an approved private-local import?

Offer reasonable defaults and say which answer would most change the plan. Do not turn omissions into hard preferences.

## Route before prices

1. Record a short constraint ledger: hard constraints, soft preferences, rejections, assumptions, unknowns, permissions, and data freshness.
2. Build at least three materially different multi-city candidates before broad price research. A different candidate changes a meaningful route dimension: city inclusion/order or nights, gateway/open jaw/positioning strategy, or regional mode strategy.
3. For each candidate show: route thesis, nights by city, gateway plan, plausible modes, door-to-door time burden, main upside, sacrifice, and fragile assumption.
4. Ask only follow-up questions that can eliminate or reshape a candidate. Do not ask generic preference questions once real evidence can answer them.

## Compare the real frontier

After the traveler approves research and a provider is actually available, collect representative—not exhaustive—evidence for candidate dates:

- direct and reasonable connecting flights; alternate home airports; positioning and open-jaw options;
- rail, car, coach/ferry where plausible, including station/airport transfer, baggage, border, pickup/drop-off, and door-to-door time;
- cash fares, award space, taxes/surcharges, checked-at time, cabin, cancellation/change terms, and source;
- lodging bands by neighborhood and date, marked as quote, estimate, historic, manual, or unavailable.

For award comparisons calculate and disclose: cash comparator, points, taxes/surcharges, positioning/transfer cost, assumed transfer ratio and delay, and cents per point:

`CPP = (comparable cash fare - unavoidable award cash costs) / points × 100`

Do not hide transfer risk, restrictions, cancellation terms, or missing values. Ask reactive questions from the observed delta—for example, whether six hours saved is worth $310, or whether preserving 45,000 points matters more than a lower cash fare. Preserve the previous leading choice and explain any re-rank.

## Research cities and build days

For each selected city, build a broad source-backed catalogue before narrowing it. Include signature sights, museums/history, food/evening, neighborhoods, walks/scenery, day trips, seasonal events, and practical alternatives. For each item record source, URL, checked-at time, hours/closures, reservation need, duration, price basis, accessibility notes, indoor/outdoor status, coordinates when verified, and uncertainty.

Score explicitly, for example:

`preference fit + uniqueness + evidence quality + geographic fit + schedule fit + value - transit burden - crowd risk - redundancy`

Use hard constraints to exclude options. Maintain must/should/could tiers, geographical clusters, diversity across days, weather/closure fallbacks, and a reason for each exclusion. Use high-quality photos only with an attributable source and a redistribution-compatible usage basis; keep a licensed/attributable fallback or no-photo state.

Build an iterative day plan that respects arrivals, check-in/out, reservations, hours, practical transfers, meals, rests, luggage, and realistic capacity. Flag conflicts and impossible days rather than silently compressing them. Re-check factual inputs before locking a day.

## Bookings and private imports

Use exact states: `recommended`, `quoted`, `held`, `confirmed`, `missing`, and `conflict`.

- Recommendations and quotes are not bookings.
- A hold requires explicit provider evidence and expiry information; it is not confirmed.
- A confirmed record requires an approved, deduplicated confirmation source. Contradictory dates/provider/locator data is `conflict`, never an inferred resolution.

For Gmail, email, file, or calendar import: explain the read-only minimum scope, purpose, retention boundary, and manual fallback; obtain explicit approval; read only approved material; extract normalized candidates; redact sensitive fields in previews; deduplicate; show proposed changes and confidence; then ask again before writing/importing or changing a booking state. Never include raw email, Gmail links, confirmation codes, references, loyalty identifiers, or secrets in public/sample/export data.

## Finish or stop

Before marking a plan ready, verify route, date allocation, selected modes, booking states, source freshness, opening/closure risk, budget and points arithmetic, and itinerary feasibility. Offer current sanitized exports (CSV, visual HTML, operational PDF) and retain editable structured state.

Stop and ask instead of guessing when a hard constraint, travel-document requirement, provider permission, booking-state conflict, cancellation rule, source credibility issue, material price/time tradeoff, or approval to import/write is unresolved. End with the selected route, alternatives retained, assumptions, data freshness, unresolved decisions, risks, and next highest-value action.
