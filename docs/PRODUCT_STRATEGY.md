# TRIPPY — Travel Optimizer: product strategy

## Product promise

Turn ambiguous trip ideas into a premium, editable plan that is easy to understand and honest about tradeoffs across time, route complexity, cash, points, and travel style.

The product should not merely generate prose. It should maintain a structured trip, show why recommendations rank highly, preserve alternatives, distinguish researched options from confirmed bookings, and make changed recommendations traceable to new evidence.

## Primary user journey

1. **Describe the trip** — travelers/rooms, home airports and positioning tolerance, hard and flexible dates/trip length, hard anchors, likely cities and rejections, budget, cabin, points balances/transfers, pace, passport/visa, accessibility, luggage, cancellation, and ground/overnight/connection tolerance.
2. **Calibrate preferences** — a short set of high-signal choices such as direct flight versus savings, landmark versus neighborhood time, hotel quality versus location, and packed versus relaxed days.
3. **Explore route candidates** — generate a small set of materially different city orders and date allocations.
4. **Price the frontier** — only after materially different candidates exist, fetch enough current flight, train, car, bus/ferry, and lodging data to compare candidate dates, direct/connections, positioning/open jaws, and regional modes; or use explicit sample/manual inputs. Do not pretend every price is live when it is not.
5. **Select a route** — show cheapest, fastest, lowest-friction, points-efficient, and balanced options with cash/points valuations and tradeoffs exposed.
6. **Discover and rank** — research activities, neighborhoods, food, events, and day trips; score them against the traveler profile.
7. **Build the itinerary** — schedule feasible days with transit and rest buffers, then let the traveler lock individual decisions and explicitly accept any re-prioritization after live prices change.
8. **Import confirmations** — parse approved booking emails/files into deduplicated proposed records; require review before merging or changing state.
9. **Travel mode** — concise today/next cards, offline-friendly documents, map links, and alerts; private-local confirmation details remain outside public/sample/export records.

## Product baseline

- Premium wizard and generic navigation: Overview, Route, Transport, Stays, Activities, Itinerary, Map, Bookings, Settings.
- Example trips containing fictional or clearly public sample data; sample/manual mode is a first-class path.
- Provider interfaces, mock providers, and explicit permission/coverage disclosures.
- Ranking explanations and editable preference weights.
- Accessible fallback UI when maps, photos, or APIs are unavailable.

## Privacy boundary

- Personal destinations, travel dates, home airport, companions, budgets, points balances, loyalty IDs, confirmations, and email content.
- Personal screenshots unless they have been deliberately redacted and approved for a future, explicitly authorized external use.
- Raw provider responses that include account or booking data.
- API keys, OAuth client secrets, refresh tokens, cookies, session files, and local MCP configuration containing credentials.
- Provider photos unless their license and redistribution terms permit inclusion.

## Personal-only UI from the current artifact

The “Autobahn & rentals,” “Ring driving,” and “Car museums” items are trip-specific. The generic product should not expose them as global tabs. In a private itinerary they can move to the end under **Trip extras** or appear contextually inside the relevant destination. TRIPPY gets one generic **Transport** area and supports optional trip-specific collections.

## Recommendation model

Every recommendation should expose:

- score and rank;
- the important positive and negative reasons;
- source and “checked at” time;
- price basis and included fees;
- whether it is an idea, shortlist item, held option, or confirmed booking;
- constraints that could invalidate it.

Suggested activity score components:

`preference fit + uniqueness + evidence quality + geographic fit + schedule fit + value - transit cost - crowd risk - redundancy`

Suggested transport comparison components:

`cash + taxes + points opportunity cost + positioning + baggage + ground transfer + change risk + time cost + overnight penalty`

Weights are traveler settings. Hard constraints filter candidates; soft preferences score them.

For awards, expose the cash comparator, points required, taxes/surcharges, positioning and transfer costs, transfer ratio/time/risk, cancellation terms, source, and checked-at time. Calculate `CPP = (comparable cash fare - unavoidable award cash cost) / points × 100`; never imply a transferable balance has instant availability or a universal fixed value.

City discovery starts broad, then narrows. Records need categories, neighborhood/day-trip/event context, opening/closure and reservation evidence, duration, coordinates, accessibility, photo attribution/usage basis, and fallback. Score for preference fit, uniqueness, evidence, geographic/schedule fit, value, transit, crowd risk, and redundancy. A day plan needs geographic clusters, category diversity, practical buffers, and closure/weather fallbacks.

## State and approval model

Use only `recommended`, `quoted`, `held`, `confirmed`, `missing`, and `conflict` for booking-relevant records. A recommendation is not quoted; a quote is not held; a hold is not confirmed. Confirmed status needs reviewed evidence. Conflicting records remain visible as conflicts until the traveler resolves them.

Provider, Gmail, email, file, and calendar access are optional and provider-neutral. Explain source, scope, freshness, cost, coverage, and manual fallback; get explicit consent; request the minimum read-only permission; deduplicate and redact into a review queue; then obtain a second approval before import/write or a state change. Never assume an official provider MCP exists.

## Route optimization

Represent cities and airports as nodes and transport choices as time-dependent edges. Build a small Pareto frontier rather than claiming one mathematically “best” route:

- lowest out-of-pocket cost;
- shortest door-to-door duration;
- fewest transfers / lowest disruption risk;
- best points use under the traveler’s valuations;
- balanced recommendation.

Always compare a direct flight with reasonable one-stop/connection, rail, and car options when those modes are plausible. Include positioning and airport-transfer time. A cheap fare that consumes an extra day should look expensive to a time-sensitive traveler.

## Delivery phases

### Phase 0 — private separation and safety

- Locate the canonical app source.
- Keep a clean local working copy with no inherited personal history.
- Extract personal trip data and media from presentation code.
- Define the normalized trip schema and mock data.
- Complete current-tree and history secret scans before any external remote or sharing action.

### Phase 1 — useful without integrations

- New-trip wizard and editable preference profile.
- Manual route, stay, activity, and booking entry.
- Example trip, itinerary builder, map links, calendar/JSON export.
- Transparent local ranking with mock price quotes.

### Phase 2 — provider adapters

- Search/discovery provider.
- Maps/geocoding/routing provider.
- Cash-flight, award-flight, rail, lodging, and activity adapters.
- Caching, freshness, rate limits, and normalized quote comparison.

### Phase 3 — booking imports and agent clients

- File/ICS/PDF import first.
- Opt-in email import with least privilege and a review queue.
- Codex/Claude guided workflow.
- Optional MCP server exposing narrow, read-focused trip tools.

### Phase 4 — optional collaboration and external product

- Accounts and encrypted per-user storage.
- Sharing permissions, collaboration, and change history.
- Optional ChatGPT app and hosted service.
- Any demo, publishing, hosted service, or external sharing only after redaction, security review, availability checks, and explicit approval.

## Non-goals for the first usable release

- Completing purchases or reservations inside the app.
- Storing payment cards.
- Autonomous email modification or sending.
- Claiming universal “best deal” coverage.
- Scraping providers in violation of access controls or terms.
- Exporting raw email, confirmation codes, references, loyalty identifiers, secrets, or provider authentication material.

## Operating references

[Onboarding](ONBOARDING.md) defines the traveler conversation. [Agent workflows](AGENT_WORKFLOWS.md) defines handoffs and stop conditions for humans, Codex, and Claude. [Research playbook](RESEARCH_PLAYBOOK.md) defines evidence, photo, map, route, and itinerary standards.
