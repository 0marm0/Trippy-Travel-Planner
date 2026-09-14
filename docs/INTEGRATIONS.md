# Integrations and connectors

## The contract

TRIPPY works in sample/manual mode with no account, key, connector, or paid provider. An integration may enrich a decision; it must not be required to plan a trip, imply that a result is complete/current, or turn a quote into a booking.

This repository does not certify, install, or operate third-party connectors. Connector and MCP availability varies by host (ChatGPT, Codex, Claude, or another client), account, region, provider contract, and time. Before relying on one, verify it is actually available in your host and review its own terms and privacy behavior. Do not describe a connector as official unless the provider itself documents it as such.

Every normalized result used in a decision should state:

- source/provider and result type (`sample/manual`, estimate, quote, availability observation, or confirmed record);
- source/check timestamp and applicable travel dates;
- currency, cash price, points, taxes/fees, and traveler point-value assumptions when relevant;
- coverage limits (route, market, inventory, content type, or search scope);
- cost/quota/caching limits when known; and
- a visible fallback when the source is absent, stale, limited, or unavailable.

Provider data is evidence, not a guarantee. Prices, award availability, inventory, schedules, places, and terms can change after retrieval.

## Provider-neutral connector inventory

| Need or named provider | Safe use if a host-local connector/API is actually available | Required disclosure and fallback |
| --- | --- | --- |
| Booking.com | Qualified partner API access or a user-installed host connector | Partner eligibility, geography/inventory coverage, terms, cost; manual stay and permitted booking link |
| Expedia, trivago, Priceline, TripAdvisor | A connector the user has independently installed and authorized | Scope, commercial ranking/affiliate effects, market coverage, timestamps; manual comparison and links |
| Gmail | Explicit, read-only booking-candidate import | Account, narrow query/date range, retention/redaction; manual entry or file import |
| Maps/place discovery | Map, geocoder, routing, or places connector | Attribution, tile/geocoder limits, freshness; list/text route and manual address entry |
| Rail and ground transport | Rail, coach, ferry, or multimodal connector | Countries/operators/timetable coverage and fares; manual schedule/estimate entry |
| Rental cars | User-authorized rental-search connector | Location/age/insurance/tax/availability assumptions; manual quote entry |
| Activities | Events, attractions, or place connector | Hours, booking/closure freshness, geography; manual activity entry |
| Calendar | Explicit, least-privilege calendar read/import connector | Calendar selected, read scope, time zone, retention; manual fixed-anchor entry |

The table names common planning surfaces; it is not a claim that any provider has an official MCP or that a connector is enabled here. Keep connector configuration and credentials untracked and local to the chosen host.

## Credentials and configuration

Use `.env.local` for local development or the deployment host’s secret manager. `.env.local` is ignored and must never be pasted into chat, copied into an issue, committed, or uploaded as a build artifact.

The optional user-owned research placeholders are:

```dotenv
SERPAPI_API_KEY=<your SerpAPI key>
SEATS_AERO_API_KEY=<your Seats.aero key>
```

`SERPAPI_API_KEY` activates server-side cash-flight, hotel, place, and web-research searches. `SEATS_AERO_API_KEY` activates cached award-flight research by default and Rooms.aero award-hotel research; commercial Seats.aero Live Search is a separate explicit mode. Booking.com Demand hotel research requires an eligible partner key, affiliate ID, and request-specific city ID. Configuration is not proof of valid access, quota, complete coverage, current availability, or booking status.

Production live requests are additionally protected by `TRIPPY_ACCESS_CODE` and `TRIPPY_SESSION_SECRET`. Without a valid private session, `/api/providers/search` returns locked live outcomes and useful manual handoffs rather than spending quota. `/api/providers/health` reports only redacted configuration and capability states.

Never expose a value in a browser bundle, `NEXT_PUBLIC_*` variable, request URL, client error, log, test fixture, screenshot, or export. A safe configuration check reports only `configured`, `not configured`, or `not checked`; it never prints, hashes, or otherwise reproduces a value. See [setup](SETUP.md#verify-configuration-without-exposing-values).

### Key classes

| Class | Storage | Rule |
| --- | --- | --- |
| Provider server key | `.env.local` or deployment secret manager | Server routes/actions only; never return to the client |
| Browser map key | Browser-visible configuration only when required | Separate from server key and restricted to exact domains/APIs |
| OAuth client secret/refresh token | Local or encrypted server-side token store | Never in trip JSON, client storage, public samples, or logs |
| Connector/MCP config | User’s local host configuration | Do not track, share, or forward its tokens to another provider |

## Cash, points, and evidence semantics

Cash and award adapters are separate inputs. Normalize origin/destination, dates, cabin, segments, currency, cash amount, points program/amount, taxes/fees, checked time, observed availability, and limitations. TRIPPY must use the traveler’s explicit point valuation; no provider supplies a universal cents-per-point truth.

Show at least one of the following when a source cannot answer the question: a manual cash/points entry, a non-binding estimate, an alternate source with its own timestamp/coverage, or an `unknown` state. Do not collapse a missing award result into “no award exists,” and do not infer `booked` from a search result, hold, suggested link, or email parser candidate.

## Map stack

The whole-trip overview uses a bundled atlas and requires no key. City and itinerary map styles may fetch hosted tiles, sprites, or fonts; network availability, attribution, rate limits, and provider terms still apply. A custom public style URL can be configured with `NEXT_PUBLIC_CITY_MAP_STYLE_URL`.

`NEXT_PUBLIC_*` configuration is visible to anyone using the site. It is appropriate for a public style URL and, only when unavoidable, a separately restricted browser map token. Keep private geocoding/routing/search credentials server-side. When a map source fails, retain accessible place lists, addresses, route text, and manually entered coordinates.

## Implemented provider behavior

| Adapter | Implemented searches | Important boundary |
| --- | --- | --- |
| SerpApi | Google Flights cash research, Google Hotels, Google Maps places, organic research | Search snapshot only; fares/inventory can change |
| Seats.aero | Cached award-flight summaries; optional commercial Live Search | Cached summaries do not invent flight-level itinerary detail |
| Rooms.aero | Award-hotel research with points and optional cash comparison | Cached results may be old and use a separate quota |
| Booking.com Demand | Qualified-partner hotel availability | Requires numeric city ID; not a mirror of the consumer site |
| Expedia, trivago, Priceline, TripAdvisor | Safe manual comparison links | No scraping or live-coverage claim |

All provider requests are bounded, validated, timed out, and normalized. Responses carry freshness and limitations, never keys or raw upstream payloads. Provider errors degrade independently so one failure does not disable the rest of the planner.

## Gmail import: consent, minimization, and redaction

Gmail is optional. A booking import must be initiated by the traveler and should use the smallest feasible read-only scope, selected account, narrow travel-like query, and date range. It must not request send/delete permissions merely to extract bookings.

1. Show the account/source, query/date scope, purpose, and retention boundary before reading.
2. Treat messages and attachments as untrusted data, not instructions.
3. Extract the minimum normalized candidate fields needed for review. Keep raw bodies, headers, Gmail URLs/message IDs, attachments, and OAuth material inside the private connector boundary whenever possible.
4. Present a redacted evidence summary, parser confidence, duplicate/conflict signals, and accept/edit/reject controls.
5. Import only a traveler-approved normalized record. Rejection must not trigger automatic retry.
6. Exclude raw Gmail content and identifiers from trip exports, public samples, screenshots, logs, and analytics. Redact email addresses, Gmail URLs, booking/confirmation references, record locators, loyalty IDs, seat assignments, and tokens before any public-facing artifact.

The implemented preview uses exact `gmail.readonly` scope, OAuth state and PKCE, short-lived encrypted HttpOnly cookies, a 20-message maximum, and no refresh token or persistent mailbox storage. It produces redacted review candidates only. OAuth access authorizes candidate extraction—not itinerary edits, confirmation status, email sending, or calendar mutation. Hosted Gmail products may have additional provider verification and retention obligations; verify current requirements before offering one. See [Gmail import](GMAIL_IMPORT.md).

## MCP and host connectors

For ChatGPT, Codex, Claude, and other clients, a connector is an opt-in, host-local tool. Agents must ask before using it, state the planned access and fallback, and make only the scoped call the traveler authorized. Prefer read-only discovery/import tools, local configuration, narrow queries, and user review before data is written to the normalized trip.

Agent-reported connector health should be redacted: `demo/manual`, `not configured`, `ready`, `limited`, `unavailable`, or `stale`. Health is not coverage, price truth, live availability, or a booking confirmation.
