# Guided trip onboarding

## Outcome

Onboarding turns an ambiguous trip idea into a constraint ledger and a small route frontier. It does not claim a booking, collect credentials by default, or make the traveler answer every possible question before seeing useful alternatives. Manual/sample mode is first-class; researched and private-local modes are opt-in.

## The staged conversation

### 1. Frame the trip

Collect, with “skip for now” available:

- travelers, rooms, children or support needs that affect inventory; mobility/accessibility, dietary, sleep, luggage, and safety needs;
- home city plus acceptable airports/stations and willingness to position, arrive/depart different cities, or use an open jaw;
- earliest/latest outbound and return dates, target trip length, hard/flexible windows, fixed events/reservations, and fixed city/date anchors;
- passport, visa, transit-document, border, and eligibility constraints that could invalidate a route;
- required, optional, rejected, and curiosity-only cities/experiences;
- pace, start/end-of-day preference, rest cadence, cabin, lodging standard, budget/currency, and cancellation/change preference;
- points programs, balances, transferable currencies, transfer partners/ratios/timing, and a points valuation; and
- tolerance for rail, driving/rental car, overnight travel, buses/ferries, connections, and disruption.

State the initial assumptions, missing decision-bearing details, and chosen data mode. Do not ask for account passwords, OAuth tokens, confirmation codes, or full email contents.

### 2. Make route candidates before research

Generate three to five materially different multi-city candidates. Each must differ in city composition/order/nights, gateway/open-jaw or positioning approach, or regional-mode strategy. A superficially different airline connection does not qualify.

For each candidate show the route thesis, date allocation, gateway plan, expected door-to-door burden, principal upside, compromise, and fragile assumption. Ask a maximum of three follow-ups only when they decide between those candidates.

### 3. Evidence pass and reactive calibration

With explicit research authorization and actual provider access, compare candidate-date ranges, direct versus reasonable connection options, positioning/open-jaw options, rail/car/coach/ferry alternatives, and lodging bands. Attach source, retrieval time, currency, fees, cabin, coverage, cancellation terms, and a `quote`, `estimate`, `manual`, `sample`, `historic`, or `unavailable` label.

Ask questions anchored in actual deltas: “The direct option costs $310 more and saves six hours; which wins?” “This award uses 35,000 transferable points plus $77 and takes a day to transfer; should cash lead?” “Moving two nights shifts the museum closure risk and reduces hotel cost 18%; acceptable?” Preserve prior selections and explain a re-rank.

### 4. City discovery and feasible itinerary

Research a broad catalogue for every retained city. Cover activities across categories, neighborhoods, day trips, seasonal events, practical hours/closures, reservations, and indoor/weather alternatives. Score records explicitly; retain must/should/could tiers; group geographically; avoid redundant days; and include verified coordinates and tiered map pins where available. Use high-quality source-backed photos with attribution/usage basis and a fallback.

Build editable days around fixed anchors, transit, check-in/out, meals, rests, luggage, mobility, and realistic capacity. Display unresolved closures, long transfers, and infeasible combinations. Do not silently lock a generated itinerary.

### 5. Review, imports, and exports

Review facts, quotes, preferences, alternatives, recommendation explanations, and booking states before locking each route, leg, stay, activity, or day. Current structured state can export a sanitized working CSV, visual HTML dossier, and operational PDF.

Booking data uses `recommended`, `quoted`, `held`, `confirmed`, `missing`, and `conflict`. Gmail/email/file/calendar imports require a second, scoped consent: declare the read-only minimum scope, read only approved material, normalize/dedupe/redact a review queue, and wait for acceptance before import/write or state change. Gmail is never assumed connected.

## Wizard experience

Use a short decision panel, a continuously updated constraint/route preview, source/freshness badges, and “why this question?” disclosure. Keep the result explainable: show price/time/points/cancellation deltas, ranking factors, map confidence, and what would change the answer. If a hard constraint, travel-document issue, provider permission, booking conflict, or material tradeoff is unresolved, pause and ask instead of inferring.
