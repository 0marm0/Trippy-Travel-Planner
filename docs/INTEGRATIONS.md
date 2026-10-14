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
| KAYAK, Expedia, trivago, Priceline, TripAdvisor | A connector the user has independently installed and authorized | Scope, commercial ranking/affiliate effects, market coverage, timestamps; manual comparison and links |
| Gmail | Explicit, read-only booking-candidate import | Account, narrow query/date range, retention/redaction; manual entry or file import |
| Maps/place discovery | Map, geocoder, routing, or places connector | Attribution, tile/geocoder limits, freshness; list/text route and manual address entry |
| Rail and ground transport | Rail, coach, ferry, or multimodal connector | Countries/operators/timetable coverage and fares; manual schedule/estimate entry |
| Rental cars | User-authorized rental-search connector | Location/age/insurance/tax/availability assumptions; manual quote entry |
| Activities | Events, attractions, or place connector | Hours, booking/closure freshness, geography; manual activity entry |
| Calendar | Explicit, least-privilege calendar read/import connector | Calendar selected, read scope, time zone, retention; manual fixed-anchor entry |

The table names common planning surfaces; it is not a claim that any provider has an official MCP or that a connector is enabled here. Keep connector configuration and credentials untracked and local to the chosen host.

## Agent-guided host setup

Start by identifying the actual host and session: ChatGPT, Codex desktop/CLI, Claude web/Desktop/Code, or another MCP client. Ask the agent to inventory available tools without accessing private data. A provider in a recommendation or a list of installed packages is not evidence that its search tool is callable in this session.

1. Search the host’s current plugin/connector directory for the chosen provider. Inspect publisher, official provider documentation, supported host/region/account, authentication, read/write tools and privacy terms. Treat a missing result as unavailable here; do not invent an MCP address or substitute an unreviewed community package.
2. Install/connect only after the user chooses the integration. The user completes provider sign-in/OAuth in the host’s trusted authorization flow; no password, API key or token goes into chat or trip JSON. Request search/read access, not booking, alert creation, email sending or calendar writes. If the host cannot limit scopes, explain its actual access and allow only the approved tools.
3. Refresh the connection/start a new supported session as the host requires. Discover the exposed tool names and argument schema. Record an inventory: provider, host, callable search kinds, authentication status, party/date/market limits, permission boundary and manual fallback.
4. Within already authorized research, run one bounded search with real trip dates/party or a clearly labeled public test. Verify returned dates, traveler count, currency, source timestamp and evidence type. Installation or a health status alone is not tested access. Record `not checked`, `unavailable`, `configured but untested`, `tested with limits`, or `tested for this query`; do not generalize one successful search to all inventory.
5. Normalize only decision-useful facts into the comparison. Keep raw responses and host tokens outside trip data. Retry a failure only when a changed input or documented transient condition justifies it; otherwise preserve manual/provider-site research.

### Platform paths

- **ChatGPT/Codex directory:** open Plugins, search/open the listing, select its install control, then complete any connection/authentication prompt. Start a new chat and select the installed tool with `@` or request it by name. Labels and access vary with the host/account; follow the actual directory. [Official plugin guide](https://learn.chatgpt.com/docs/plugins).
- **Codex MCP:** use `codex mcp list` or `/mcp` in the CLI session to inspect configured/active servers. Add a custom server only from the provider’s documented command/URL; use `codex mcp login <server-name>` when it supports OAuth. Do not put a secret value in shell arguments, tracked config or command output. [Official MCP guide](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
- **Claude:** browse Customize → Connectors or the chat’s connector management entry, open the listing and select Connect/Install. Review detected authentication and tool permissions. For a custom remote connector, use only the provider-documented URL. Remote connections may run from Anthropic’s cloud rather than the local computer, so “host-connected” is not a claim of local-only processing. [Official connector guide](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities).

### Provider paths and evidence limits

| Provider/category | Practical path | Verified boundary or fallback |
| --- | --- | --- |
| Seats.aero | Follow [official MCP setup](https://seats.aero/mcp); documented remote URL is `https://seats.aero/mcp`. Use host OAuth if offered. | Official docs distinguish account-free public searches from Pro-authorized expanded access. MCP access is separate from the website’s API key and commercial Live Search entitlement. Enable search only; alerts are actions. |
| Expedia | In supported Claude hosts, find Expedia in the connector directory, connect and inspect Search Hotels/Search Flights. | [Expedia’s guide](https://www.expedia.com/playground/mcp/doc/) documents US availability, no Expedia account needed for search, one search type per call and website handoff for booking. Other hosts/regions must be checked independently. |
| Booking.com | Look for the provider’s app in the actual host directory; review its current search capabilities and authorize that host flow. | [Booking.com documents a ChatGPT accommodation app](https://news.booking.com/bookingcom-debuts-agentic-ai-innovations-adding-to-its-robust-suite-of-genai-tools-for-customers/). This does not establish availability in a particular account or provide a Demand API key. Do not guess a remote MCP URL. |
| KAYAK | Search the actual host directory; if no verified connector is available, use KAYAK’s own site or Ask AI and enter reviewed results manually. | [KAYAK’s current help](https://www.kayak.com/c/help/search/) documents native flight/hotel/car/activity search. That native AI service is not evidence of an external host MCP, and this repo supplies no KAYAK adapter or custom endpoint. |
| trivago, Priceline, TripAdvisor | Search the actual host directory and inspect the current publisher/listing before use. | No custom MCP endpoint or account-wide availability is established here. If absent or unverified, use their ordinary sites/manual quotes. Historical plugin announcements do not prove a current connector. |
| Rental cars | Discover installed rental tools, such as a named supplier or aggregator, and inspect supported pickup/drop-off locations, dates and filters. | A hotel/flight connector does not imply car inventory. Keep age, insurance, deposit and one-way/extra-driver assumptions explicit; no reservation action. |
| Activities/maps | Discover installed attraction/event/place/routing tools separately; use official venue evidence for hours/closures and admissions. | Search discovery does not guarantee ticket inventory, walking-time accuracy or redistribution rights to images. Retain list/manual coordinates and venue links. |
| Rail/coach/ferry | Discover a tool covering the actual operators/countries and requested date; otherwise consult official operator timetables and fares. | No direct live adapter is implemented here. Distinguish an actual dated fare from a generic schedule or estimate. |

Host tools do not become website integrations by installing them. The TRIPPY website uses only its direct implemented adapters and its own server environment. Do not copy an agent host’s OAuth/session credentials into `.env.local` or a deployment.

These host/provider references were checked on **2026-10-13**. Recheck the listing and permissions at setup time; the inventory and bounded result are the evidence of this session’s access.

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

### SerpApi: user-owned account and key

1. Decide whether general cash-flight/hotel/place/web research is useful; manual mode remains available.
2. The user creates/signs into their own [SerpApi account](https://serpapi.com/users/sign_up), checks [current plans/quotas](https://serpapi.com/pricing), and opens [Manage API Key](https://serpapi.com/manage-api-key). Do not promise a free allowance, fixed price or suitability for a shared/commercial site without current terms.
3. If `.env.local` does not exist, create it from `.env.example`; otherwise preserve the existing ignored file. The user enters the key locally under `SERPAPI_API_KEY`; it never goes into chat. Never overwrite their other module settings.
4. Restart the local server. Check only redacted presence through Connections/provider health (`configured`/`not configured`/`not checked`). With research authorization, make one bounded request using the actual airport codes/dates and inspect normalized timestamps/limitations. A configured key is not validated access.

The website adapter covers the search kinds listed below; it does not implement every filter or multi-city flow in [SerpApi’s Flights API](https://serpapi.com/google-flights-api). Search/cache snapshots require verification at the airline/hotel before a decision involving purchase. Check quotas before broad date/provider sweeps.

### Seats.aero: choose API or host MCP

For the website API module, the user reviews [official eligibility](https://developers.seats.aero/reference/getting-started-p), signs into their own Seats.aero account and checks whether the API tab in their personal settings is available. Eligible Pro access is for non-commercial use; not every Pro user can generate a key, and commercial use needs written agreement. If unavailable, use authorized host/public searches or manual award research instead of bypassing eligibility.

The user enters an available personal key locally as `SEATS_AERO_API_KEY`, preserving other settings, and restarts the server. Keep `SEATS_AERO_SEARCH_MODE=cached` (the default); set `live` only with the separate commercial Live Search entitlement. Verify a bounded query and exact seat count, cabin, taxes and program restrictions before transfer/purchase; cached summaries are incomplete availability evidence. Rooms.aero uses the same key with separate quotas, not universal hotel coverage. The host MCP path above uses its own provider authorization; Pro MCP live features do not establish partner API live entitlement.

Never ask the user to paste either key. Record only configuration status and the tested query’s result/limits. Provider accounts, billing and API permitted uses stay with the user. These account/key references were checked **2026-10-13**.

### Key classes

| Class | Storage | Rule |
| --- | --- | --- |
| Provider server key | `.env.local` or deployment secret manager | Server routes/actions only; never return to the client |
| Browser map key | Browser-visible configuration only when required | Separate from server key and restricted to exact domains/APIs |
| OAuth client secret/refresh token | Local or encrypted server-side token store | Never in trip JSON, client storage, public samples, or logs |
| Connector/MCP config | User’s local host configuration | Do not track, share, or forward its tokens to another provider |

## Search workflows and current form limits

Follow the [planning guide](PLANNING_GUIDE.md) for route-first research, cash/award requests, effective-cost arithmetic, multimodal comparisons and hotel/attraction geography.

The Connections form is a starter research surface, not a full traveler-specific search engine. Cash searches currently send one adult, economy, EUR and one-way travel; award searches send one seat and `program: "any"`; hotel searches send one adult/room for one night. The visible Sort selector is not wired to search or result ordering. Flight requests require a single three-letter airport code despite the form's broader placeholder. Use reviewed manual/agent requests or the validated API for actual party size, cabin, currency, return date, hotel length and supported award-program key. A saved result stays research evidence and does not become a trip item or confirmed booking.

`POST /api/providers/search` accepts the six kinds in [provider types](../src/lib/providers/types.ts) and rejects unknown fields. It supports a provider allowlist; `/api/providers/health` reports redacted configuration, not tested credential validity. Production quota access requires a private session. Do not put provider credentials in request bodies or browser code.

## Cash, points, and evidence semantics

Cash and award adapters are separate inputs. Normalize origin/destination, dates, cabin, segments, currency, cash amount, points program/amount, taxes/fees, checked time, observed availability, and limitations. TRIPPY must use the traveler’s explicit point valuation; no provider supplies a universal cents-per-point truth.

Show at least one of the following when a source cannot answer the question: a manual cash/points entry, a non-binding estimate, an alternate source with its own timestamp/coverage, or an `unknown` state. Do not collapse a missing award result into “no award exists,” and do not infer `confirmed` from a search result, hold, suggested link, or email parser candidate.

## Compare like-for-like results

An agent may combine approved host tools, website adapters and manual quotes, but must keep sources separate and normalize each candidate before ranking:

- **Flights/awards:** origin/destination and positioning legs, exact dates/time zones, party/seat count, cabin, baggage, segments/connections, cash currency and total fees, points program/amount, transfer assumptions and cancellation/change conditions. Unknown seat counts or taxes stay unknown.
- **Hotels:** exact property/address or verified coordinates, room/rate type, check-in/out and number of nights, adults/children ages/rooms, full-stay total and currency, taxes/resort/mandatory fees, meal inclusion, payment timing, cancellation deadline/time zone and refundable status. Do not compare a nightly headline, one-person rate and multi-night family total as equal quotes. Record missing fee/term data visibly.
- **Location:** verify proximity to the traveler’s actual attractions, station/airport, accessibility needs and evening plans. Report neighborhood, route/time basis and transit cost alongside price; straight-line distance is not a walking/routing estimate. Combine hotel and activity maps only with verified coordinates.
- **Car/ground/activity:** match dates, passenger/luggage capacity, pickup/drop-off or station, operator, inclusion/exclusion, total fees and cancellation; include transfers, insurance/deposit/age rules and door-to-door burden where relevant.

Retain source, checked-at and provider-observed time, returned query assumptions, cache/freshness basis, limitations and safe source link. Flag incompatible currencies or incomplete terms before scoring. Deduplicate matching properties/itineraries while keeping distinct provider rates. Rank on explicit price/time/location/cancellation/points preferences, show the leading tradeoff and preserve alternatives/rejections. Search results remain quotes/estimates, never holds or confirmations. See [planning guide](PLANNING_GUIDE.md).

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
| KAYAK, Expedia, trivago, Priceline, TripAdvisor | Manual/provider-site or authorized host-tool comparison; website links only where implemented | No direct live adapter, scraping or universal host-coverage claim |

### Provider documentation and eligibility

These primary-source references were checked on 2026-10-13; recheck before configuring a provider or making a travel decision:

- **SerpApi:** [Google Flights API](https://serpapi.com/google-flights-api) documents broader multi-city, filters and follow-up calls than TRIPPY currently implements. The adapter issues one-way/round-trip snapshot searches, uses provider cache and returns at most 20 normalized results; it does not implement multi-city ticket construction or the return-selection/booking flow.
- **Seats.aero:** [Getting Started](https://developers.seats.aero/reference/getting-started-p) permits eligible Pro API access for non-commercial use, with commercial use subject to written agreement. [Cached Search](https://developers.seats.aero/reference/cached-search) is the configured default. TRIPPY requests one date and ten summary rows, omits flight-detail lookups and does not enforce requested party size on cached rows. Verify exact seats and taxes with the program. [Live Search API](https://developers.seats.aero/reference/live-search) requires commercial agreement; its entitlement differs from consumer website/MCP features. TRIPPY opts into exact-query cached fallback and retains provider filters.
- **Rooms.aero:** [Search](https://developers.seats.aero/reference/rooms-search) uses a range of possible check-in dates, with `nights` for stay length. TRIPPY requests up to 50 rows without pagination. [Access guidance](https://developers.seats.aero/reference/rooms-getting-started) explains the shared Seats.aero key and separate quota. The current adapter labels evidence cached and mentions a 21-day horizon; the checked Search reference does not establish that horizon as a universal freshness guarantee. Inspect provider timestamps and verify the actual stay before relying on it.
- **Booking.com:** [Prerequisites](https://developers.booking.com/demand/docs/getting-started/prerequisites) require Managed Affiliate Partner access, a contract, Partner Centre, an API token and affiliate ID. TRIPPY uses `BOOKING_COM_API_KEY`, `BOOKING_COM_AFFILIATE_ID` and `BOOKING_COM_DEMAND_ENV=production|sandbox`, plus request-specific `bookingCityId` and `bookerCountry`. Sandbox results are simulated; a configured credential never establishes partner eligibility or a confirmed reservation.

No direct adapter presently searches live rail, rental-car, coach or ferry inventory. General research can locate operator sources; a human or authorized agent must verify and enter the dated quote. The optimizer core accepts those modes but ranks supplied evidence rather than discovering inventory. Host-local connectors remain separate from website adapters.

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
