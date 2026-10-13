# Planning a trip with TRIPPY

TRIPPY helps you compare a trip as a connected set of decisions: cities and nights, flights or ground transport, hotels, attractions, day plans, and booking gaps. Start in sample/manual mode without keys. Optional providers add dated evidence; the traveler reviews selections and books with the provider.

The goal is the best **feasible value among the alternatives you researched**. A cheaper flight can lose once bags, positioning, airport transfers, an extra hotel night, points consumed, or lost sightseeing time are included. TRIPPY cannot promise the cheapest trip across all global inventory.

## Choose the right starting point

| What you want | Current workflow | Persistence and limits |
| --- | --- | --- |
| Explore the detailed demonstration | Open `/`; use its atlas, city maps, itinerary, comparisons and booking tracking | Specialized Europe 2026 sample; edits are browser-local. Sample dates/prices are illustrative, not current travel advice. |
| Create your own trip | Open `/plan`; enter your dates/cities/origins, preview, accept and download planning JSON | Generic normalized draft; no server upload or persistence. Reload clears it. It does not automatically load into the detailed atlas. |
| Keep a private agent-led record | Use `trip:init`, then `trip:validate` | Ignored `.private/trips/` JSON; agent/manual research follows the schema. Detailed arbitrary-trip rendering remains a separate step. |
| Research a comparison | Use Connections/Search sources, manual links, or the validated provider API | Search results and saved research are evidence, not selected itinerary items or bookings. |

For a private-local CLI draft, substitute your own future dates and destinations:

```sh
npm run trip:init -- --name "Portugal 2027" --start 2027-04-10 --end 2027-04-18 --cities "Lisbon,Porto" --origins "IAD,DCA" --adults 2 --pace balanced --flex-days 2 --themes "food,art" --output .private/trips/portugal-2027/trip.json
npm run trip:validate -- .private/trips/portugal-2027/trip.json
```

The initializer refuses an existing output file. Keep real trip drafts and downloads private-local. See [onboarding](ONBOARDING.md), [data model](TRIP_DATA_MODEL.md), and [setup](SETUP.md).

## 1. Set constraints before searching

Record travelers/rooms, acceptable home airports, hard dates and flexible windows, trip length, fixed events, required/optional/rejected cities, interests, pace, budget/currency, cabin and lodging standard. Include luggage, accessibility, cancellation needs, connection/overnight tolerance, rail/driving preferences, and travel-document unknowns that could invalidate a route.

For awards, add usable program balances, transferable currencies, eligible partners, transfer ratio/bonus/timing, and **your** value per point. Do not include account numbers or loyalty IDs. Keep hard constraints, preferences, assumptions, unknowns and rejections distinct.

A useful agent brief is:

> Plan from this normalized draft. Before pricing, compare at least three materially different routes using my cities, dates and constraints. Vary gateways/open jaws, city order/nights, or regional transport strategy. Keep manual alternatives and rejected options. Research only sources I authorize; show source, checked time, complete cash/points assumptions, door-to-door time and unresolved risks. Propose changes for review; do not book or change confirmation states.

## 2. Create a route frontier

Compare at least three route families before committing to one. For example, a fixed three-city wish list might yield: a linear rail route with an open-jaw flight; a different arrival gateway and reversed city order; and a shorter two-base itinerary with a day trip and less luggage movement. Use alternatives that fit the traveler’s actual constraints; do not invent extra cities when the route is fixed.

For each, show city order and tentative nights, entry/exit airports, intercity modes, estimated door-to-door burden, likely lodging bands, upside, compromise and missing evidence. Then price representative dates and nearby dates inside the accepted flexibility window. Preserve prior leaders when new evidence changes the ranking.

## 3. Search cash flights

With authorized SerpApi access configured server-side, open Connections → Cash flights, enter **three-letter airport codes** and a date, and search configured sources. Although the input placeholder says “Airport or city,” the server validates a single airport code. Save useful results to the local research shortlist and open their sources for verification.

**Current form limits:** the cash form sends one adult, economy, EUR and a one-way date. It does not read the traveler count/cabin/currency from the planning profile. Its Sort selector does not currently change the request or reorder results. For other parameters, use a reviewed agent/manual search or an authorized request to `POST /api/providers/search`. This is a request-body example, not a quote:

```json
{
  "kind": "cash-flight",
  "providers": ["serpapi"],
  "origin": "IAD",
  "destination": "LIS",
  "departureDate": "2027-04-10",
  "returnDate": "2027-04-18",
  "adults": 2,
  "cabin": "economy",
  "currency": "USD"
}
```

Omit `returnDate` for one way. Compare direct and reasonable connecting options, alternate airports and positioning legs with separate bounded requests. The adapter implements one-way/round-trip search, not SerpApi’s multi-city request or follow-up selection/booking-token flow. Compare an open jaw manually as a complete provider fare as well as separate one-way legs; summing individual flights does not establish a through-ticket price or protection.

SerpApi documents one-way, round-trip and multi-city capabilities, optional filters and cache behavior. TRIPPY exposes only a subset and does not enable deep search or exhaustive pagination; it returns at most 20 normalized results. Default provider results may differ from the browser. Treat fares as snapshots and verify the entire itinerary and total for all travelers with the selling provider. [Official Google Flights API documentation](https://serpapi.com/google-flights-api).

## 4. Search award seats

Configure your eligible personal Seats.aero key only in untracked `.env.local` as `SEATS_AERO_API_KEY`; leave `SEATS_AERO_SEARCH_MODE=cached`. No key is needed for manual research. Eligible Pro access is for non-commercial use; commercial API use requires written agreement and eligibility/quota can vary. [Official API access guidance](https://developers.seats.aero/reference/getting-started-p).

Connections → Award seats provides a starter search, but currently sends one seat and `program: "any"`. Do not treat that as a reliable all-program search: verify accepted source names with the provider. For a specific program and party size, submit a reviewed request such as:

```json
{
  "kind": "award-flight",
  "providers": ["seats-aero"],
  "origin": "IAD",
  "destination": "LIS",
  "departureDate": "2027-04-10",
  "seats": 2,
  "program": "aeroplan"
}
```

Check whether your requested route/date/program is covered. The cached adapter requests one date and up to ten route summaries; it returns available cabins, points and some seat counts. It does **not** request flight-level Get Trips detail, filter cached summaries by requested party size, or supply complete taxes. A summary is a lead: verify sufficient seats, all segments, mixed cabin, taxes and booking rules with the loyalty program. Missing results mean unknown coverage/availability, not proof that no award exists. [Official Cached Search reference](https://developers.seats.aero/reference/cached-search).

`SEATS_AERO_SEARCH_MODE=live` is reserved for an approved commercial Live Search API agreement, not personal Pro API keys. That adapter sends the requested seat count and permits an exact-query cached fallback. It retains provider filters that can omit expensive or mismatched-airport options; inspect freshness even after a successful request. A consumer website or host MCP entitlement is a separate surface from this API configuration. [Official Live Search reference](https://developers.seats.aero/reference/live-search).

Never transfer points based only on a cache observation. Recheck bookable inventory, transfer timing and applicable program terms before the traveler approves an irreversible transfer or purchase.

## 5. Compare cash and points fairly

Use the same travelers, route, cabin, baggage and cancellation terms. Convert to one currency using a disclosed rate/date. Record whether each amount is per person, per ticket, per night or party total; do not multiply a provider fare until its unit is verified. Unknown taxes, seat counts or change terms stay unknown.

For a transparent comparison, calculate manually or in an agent worksheet:

```text
Cash outlay = fare + required extras + positioning/ground transport + extra lodging
Award outlay = award taxes/surcharges + required extras + positioning/ground transport
               + transfer/purchase fees + extra lodging
Effective award cost = Award outlay + points consumed × traveler value per point
                       + separately stated foregone benefits
Net redemption CPP = (comparable cash outlay - Award outlay) / points consumed × 100
```

Use dollars per point in effective cost and cents per point in CPP. State how earned rewards, cancellation flexibility and other foregone benefits are valued; avoid counting the same opportunity cost twice. When transferring, show both source currency spent and destination miles received, with ratio/bonus and rounding. Value the actual scarce source points or program miles consistently; do not treat a transfer bonus as free cash.

A hypothetical comparable $800 cash itinerary versus 40,000 miles + $100 costs 1.75 cents per mile in net redemption value. At a traveler valuation of 1.5 cents/mile, the award’s effective cost is $700 before other differences. At 2 cents/mile it is $900. Neither answer overrides unavailable seats, an unsafe connection or a hard budget.

Keep money and time visible separately. If you monetize time, disclose the traveler’s hourly assumption. Show cancellation, overnight travel and separate-ticket risk alongside arithmetic. These expanded calculations are a planning method; the present atlas optimizer does not automatically evaluate award economics or transfer eligibility.

## 6. Compare every practical intercity mode

| Mode | Include in the comparison |
| --- | --- |
| Air | Bags/seats, airport access, security/check-in, layovers, time zones, arrival transfer, separate tickets and disruption buffers |
| Rail | Exact stations, access/egress, reserved seats, luggage, changes, last departure and border rules |
| Car | Pickup/drop-off, one-way/cross-border permissions and fees, driver eligibility, insurance, fuel, tolls, parking and driving fatigue |
| Coach/bus | Exact terminals, luggage, traffic, overnight burden, seat comfort and arrival-hour transit |
| Ferry | Port access, seasonal timetable, check-in, weather risk, cabin/vehicle charges and onward connections |

The direct adapters search flights, hotels, places and general web evidence. There is no built-in live rail, car, coach or ferry fare adapter. Use official operators or user-authorized, actually available host connectors and record sourced manual quotes. General web results are research leads, not timetable or inventory authority.

The atlas Decision lab compares existing air/rail/car/coach options and models adjacent dates without changing the itinerary. Its route optimizer ranks supplied legs by cost, time, simplicity, reliability and carbon, with penalties for missing links/backtracking. The core accepts 2–9 stops and ferry legs, while the current atlas controls expose four modes. It caps evaluated permutations, treats pair quotes as reversible, chooses nights from supplied bounds, and does not validate dated schedules, directional prices, border rules or total-trip calendar feasibility. A “high” confidence label means the supplied legs have timestamps; it is not an independent feasibility certificate. Confirm direction/date and complete costs before relying on any suggested order. [Optimizer implementation](../src/lib/optimization/route-optimizer.ts).

## 7. Choose hotels and build days geographically

Research a broad city catalogue: signature sights, museums/history, food/evenings, neighborhoods, walks, day trips, seasonal events and indoor alternatives. Record official opening/closure days, duration, booking requirements, cost basis, accessibility and checked time. Search/place ratings help discovery; confirm decision-bearing details at the venue’s official source.

Pin verified locations, then cluster nearby activities into realistic days. Compare hotel neighborhoods against those clusters **and** the exact arrival/departure stations, airport links and terminals. A cheap remote hotel may add repeated taxi costs; an airport hotel may help an early flight but consume a city day. Use actual walking/transit routes and service hours, not straight-line map distance. Include check-in/out, luggage storage, meals, rest, ticket slots, daylight and weather fallbacks.

For stays, compare the full dated occupancy total, room/bed type, included taxes/fees, breakfast, cancellation, payment timing and transit burden. The starter hotel form searches one adult/room for one night. The API accepts dates, adults/rooms and currency; Booking.com additionally needs an approved city ID and booker country. Award-hotel search uses Rooms.aero; its dates bound possible **check-in** dates, and `nights` specifies length. Cached evidence and optional cash comparison need provider verification. See [integrations](INTEGRATIONS.md).

In the sample atlas, review alternatives, edit supported activity assignments/priorities and transport/stay selections, and inspect the map alongside the day list. For your generic trip, retain the catalogue, clusters and itinerary in schema-compatible agent/manual records; `/plan` does not yet provide this detailed editable atlas for arbitrary records.

## 8. Track booking gaps and review before export

Use only `recommended`, `quoted`, `held`, `confirmed`, `missing`, and `conflict`. Selection or saved research does not create a hold. A hold needs evidence and expiry; confirmation needs reviewed confirmation evidence. Keep unresolved dates, conflicting sources, missing reservations and rejected alternatives visible.

Before locking, review every route leg, stay and activity; recheck prices, schedules, inventory, hours, cancellation rules and door-to-door feasibility. Booking, email sending, calendar mutation, publication and deployment require explicit authorization. Optional Gmail import is a scoped, read-only candidate preview; it does not automatically confirm or write itinerary changes. [Import rules](GMAIL_IMPORT.md).

Export the accepted generic draft as planning JSON. The specialized atlas can export sanitized CSV, HTML and PDF from its current working state. Exports must exclude secrets, email links/addresses, confirmation numbers, references, record locators, loyalty IDs and seat assignments, even for local-private trips. Keep traveler-needed private booking details outside exportable records. See [agent workflow](AGENT_WORKFLOWS.md) and [security](SECURITY.md).
