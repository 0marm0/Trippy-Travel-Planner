# TRIPPY — Travel Optimizer trip data model

## Canonical data boundary

TRIPPY renders and edits normalized trip data, not a generated personal HTML page. The existing JSON Schema remains the validation baseline; application types may add the view-oriented records below only after the schema evolves with matching validation and migration.

Keep raw provider responses, OAuth tokens, raw Gmail/file contents, and unreviewed import evidence outside exportable trip data.

## Design rules

- Use ISO 8601 dates/date-times and explicit time zones where time matters.
- Store money in integer minor units plus ISO currency; store points as integer amounts plus loyalty program.
- Attach provider/source identity, checked time, price/fee basis, freshness, and limitations to external facts/quotes.
- Preserve `unknown` rather than inventing a fee, availability, point valuation, confirmation, or flag resolution.
- Treat `idea`, `shortlisted`, `selected`, `held`, `booked`, and `cancelled` as distinct decision states.
- A booking is confirmed only after user review of a confirmation record. A recommendation, quote, or import candidate cannot imply `booked`.
- Public/story export is a separate redaction transform, not the same object with a different screen.

## Core trip records

| Record | Purpose | Privacy/decision boundary |
| --- | --- | --- |
| `Trip` | Name, status, dates, travelers, origins, destinations, preferences | Public export requires redaction review |
| `Destination` / `CityPlan` | Ordered route stop, nights, city-scoped flags, choices | Flag explains a planning concern; does not alter booking state |
| `RouteCandidate` | Alternative city order/date allocation and score reasons | Comparison, not a confirmation |
| `FlightOption` | Cash/points itinerary, segments, taxes/fees, freshness | A quote/availability observation, never a ticket |
| `StayOption` / `Activity` | Researched or manually entered city option | Source and decision state retained |
| `ItineraryDay` / `ItineraryItem` | Daily plan, conflicts, transit, slack, and selected items | Expand/collapse is UI state, not data loss |
| `BookingImportCandidate` | Parsed Gmail/file candidate and review state | Private queue; raw input reference excluded from trip export |
| `Booking` | User-reviewed confirmed/held booking data | Confirmation reference is private/redacted |
| `SourceEvidence` / `Quote` | Provider/source provenance and price basis | Raw response stays out of canonical export |

## Overview and city-plan fields

The overview derives ordered route stops, dates, nights, and map geometry from the selected route/city plans. It may summarize unresolved city flags, but each flag remains addressable to its city/day/source.

```ts
type PlanningFlag = {
  id: string
  cityId?: string
  dayId?: string
  severity: "info" | "warning" | "blocking"
  code: string
  message: string
  sourceRef?: string
  checkedAt?: string
  resolvedAt?: string
}

type CityPlan = {
  cityId: string
  arrivalDate?: string
  departureDate?: string
  flags: PlanningFlag[]
  stayOptionIds: string[]
  activityIds: string[]
}
```

Flags must contain a human-readable reason and should carry evidence/freshness when derived externally. The UI may filter map pins by category, but `showHotelPins` and `showActivityPins` are presentation preferences, not mutations of `stayOptionIds`, `activityIds`, ranking, or itinerary state.

## Flight cash-versus-points fields

Represent a cash/points comparison as explicit values and assumptions rather than one opaque total.

```ts
type FlightOption = {
  id: string
  origin: string
  destination: string
  segments: Array<{ from: string; to: string; departAt?: string; arriveAt?: string }>
  cash?: { amountMinor: number; currency: string; taxesFeesMinor?: number }
  award?: { program: string; points: number; taxesFeesMinor?: number; currency: string }
  checkedAt?: string
  freshness: "fresh" | "stale" | "unknown"
  status: "idea" | "shortlisted" | "selected" | "held" | "booked" | "cancelled"
}
```

Effective cost is derived with a traveler-supplied point valuation and disclosed fees/assumptions. Unknown fees or unavailable award space stay unknown/unavailable; they are not coerced to zero. A flight map derives geometry from `segments` and must retain a textual airport/connection representation.

## Itinerary and import records

`ItineraryDay` contains the date, city, ordered items, travel/slack context, and detected conflicts. Whether a day is expanded is local UI state; the data model always retains the full plan.

```ts
type BookingImportCandidate = {
  id: string
  source: "gmail" | "ics" | "pdf" | "file"
  parsedBooking: Record<string, unknown>
  confidence?: number
  duplicateOfBookingId?: string
  reviewStatus: "pending" | "accepted" | "rejected"
  rawReference: string // private store reference; never public export
}
```

Only `accepted` candidates may create or update a normalized booking, and the app must record the user review. Rejected candidates are retained or deleted according to the private retention policy, never automatically re-imported.

## Minimal existing-schema example

```json
{
  "schemaVersion": 1,
  "id": "sample-city-break",
  "name": "Sample city break",
  "status": "planning",
  "dateWindow": {
    "earliestDeparture": "2027-04-10",
    "latestReturn": "2027-04-18",
    "flexDays": 2
  },
  "travelers": { "adults": 2, "childrenAges": [] },
  "origins": [{ "kind": "airport", "code": "AAA" }],
  "destinations": [{ "id": "sample-city", "name": "Sample City", "priority": "required" }],
  "preferences": {
    "pace": "balanced",
    "directFlightBias": 0.7,
    "hotelLocationBias": 0.8,
    "activityThemes": ["food", "architecture"]
  },
  "anchors": [],
  "routeCandidates": [],
  "bookings": []
}
```

## Export profiles

A public/story export strips or hashes traveler names/emails, confirmation and loyalty references, private notes, home location, raw import references, provider tokens, request headers, and sensitive booking fields. Preview every included field before creating that export. A private backup has different access controls and must never be mistaken for a safe public artifact.
