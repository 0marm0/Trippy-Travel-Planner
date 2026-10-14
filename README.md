<p align="center">
  <img src="public/brand/trippy-icon.png" alt="Trippy logo" width="100" />
</p>

# Trippy Travel Planner

**Find better cash and points value. Shape the whole route. Build feasible days. Plan together.**

Trippy connects flight and award research, multi-city route decisions, ground transport, hotel location, things to do, daily itineraries and booking gaps in one planning workflow. Start manually or give an agent your trip brief; keep sources, checked times, alternatives and unknowns attached to the plan.

- **Cash and points flights:** compare fares with award points plus taxes, baggage, positioning and transfer costs. Research flexible dates, alternate airports, gateways, connections and open jaws using supported APIs or your authorized agent tools.
- **Routes between cities:** compare flight, train, car and plausible coach/ferry options by all-in cost, door-to-door time, hotel/station/airport transfers, overnight travel and disruption risk. Rank supplied route alternatives with explicit assumptions.
- **Hotels and bases:** research comparable stay quotes through configured APIs or available host travel connectors; compare total price, room/cancellation terms, points options and location against sights and transport. Choose value across the whole stay, not only the nightly rate.
- **Things to do and editable days:** research a broad city catalogue, map verified locations, cluster activities, assign/reorder days, and plan around hotels, arrivals, reservations, opening hours, luggage and rest.
- **Booking tracking:** keep recommendations, quotes, holds, confirmations, missing bookings and conflicts distinct across flights, rail, rental cars, stays and activities. Review confirmations before changing state.
- **Plan with friends:** optional live rooms let owners invite editors/viewers, add activities, arrange days, revoke access and review conflicting edits. Propose activity/day changes for owner review, vote and discuss pending proposals with access-based pseudonyms. Share-safe rooms use your own durable storage and remain separate from the rich atlas.

**No API keys required to start. Optional research uses your own accounts. An agent discovers the connectors actually available in your host; the website does not inherit their credentials or tools. You review and book with the provider.**

Optional research modules include **SerpApi** for cash flights, hotels and places, **Seats.aero / Rooms.aero** for award leads, and authorized **host MCP/connectors** for additional travel comparisons. Follow [user-owned key and connector setup](docs/INTEGRATIONS.md); provider eligibility and actual host availability apply.

[**Start here: copy the complete setup + trip-planning prompt →**](prompts/START_HERE.md)

[Setup and keys](prompts/SETUP_GUIDE.md) · [Full trip intake and research](prompts/NEW_TRIP_GUIDE.md) · [Connector onboarding](docs/INTEGRATIONS.md) · [Planning guide](docs/PLANNING_GUIDE.md) · [Live collaboration](docs/LIVE_COLLABORATION.md)

> **Beta · private staging repository.** The detailed atlas demonstrates the reviewed Europe 2026 sample. `/plan` accepts your own cities and dates into a separate manual workspace with route alternatives, maps from supplied coordinates, editable days, stays/transport and research evidence. Optional `/collaborate` rooms support live activity/day editing with owner, editor and viewer access on a configured durable server. Optional private accounts store reviewed planning workspaces on your configured server; automatic bookings remain unsupported. [Current capabilities and limits](docs/IMPLEMENTATION_STATUS.md) · [62-feature implementation ledger](docs/BUILD_PROGRESS.md).

## Choose your starting path

| Your goal | Start here | What you get today |
| --- | --- | --- |
| Explore without accounts | Run locally and open `/` | Detailed reviewed sample, editable days, maps and sanitized atlas exports |
| Plan different dates or destinations | Open `/plan` or use `trip:init` | Validated manual workspace, routes, days, activities, explicit map pins and reviewed booking records |
| Research the whole trip | Copy [Start here](prompts/START_HERE.md) | Agent-guided routes, cash/points, stays, city research and booking-gap review within disclosed coverage |
| Add provider searches | Follow [integrations](docs/INTEGRATIONS.md) | Optional server adapters or your agent host's actual tools, using your own eligible accounts |
| Let friends edit days | Follow [live collaboration](docs/LIVE_COLLABORATION.md) | A separate reviewed activity/day board, reconciliation, draft recovery and owner lifecycle controls |
| Operate a hosted instance | Follow [deployment modes](docs/DEPLOYMENT_MODES.md) | Your infrastructure and secrets, with separate authorization before deployment |

**Supported now:** the sample atlas, a generic manual workspace, recorded quote/research evidence, sanitized exports, configured live boards and optional encrypted accounts. **New in this build:** compact hotel rows and three-property shortlists, dated route allocations, per-item evidence, undo/redo, a device trip library, complete workspace imports, selected-quote budget subtotals, bounded cash-flight research and a preview export studio. Arbitrary trips also have a read-only detailed city/day preview. **Next:** full editable atlas parity, broader research automation and verified hosted/provider operation. Comprehensive research is an agent workflow with a coverage ledger; the website does not automatically search every date, connection or program.

## See the app

[Route map](#overall-route) · [Flight comparisons](#flight-comparisons) · [Transport](#transport-options) · [Itinerary builder](#itinerary-builder) · [Collaborative editing](#collaborative-editing) · [City maps](#city-maps) · [Hotels](#hotels-and-location) · [All screenshots](docs/SCREENSHOTS.md)

### Overall route

**The complete route in one workspace:** flights, trains, driving, city order and booking gaps. These are screenshots of the working app using the reviewed public sample.

![Trippy overall Europe route with flight, train and driving layers](public/screenshots/route.webp)

### Itinerary builder

Assign activities to days, drag or move them up/down, change priorities and dates, and keep arrival/stay logistics alongside the plan. The map and catalogue stay connected to your selected city.

![Daily itinerary map and activity catalogue](public/screenshots/itinerary.webp)

![Editable day cards with priorities, date selectors and reorder controls](public/screenshots/itinerary-editor.webp)

### Collaborative editing

Open [`/collaborate`](docs/LIVE_COLLABORATION.md) to prepare a board, review its share-safe content, and create an owner-controlled room. Friends with editor links can add activities and edit days; viewers follow along. Owners can revoke invitations. Revision checks preserve drafts when edits collide. Enable persistent local SQLite or your own PostgreSQL for Vercel; see the [setup](docs/LIVE_COLLABORATION.md) and [agent collaboration prompt](prompts/COLLABORATIVE_TRIP_GUIDE.md).

![Shared activity catalogue and editable day assignments](public/screenshots/collaboration-editor.webp)

Pending activity/day proposals now support owner review, access-based votes and comments without exposing booking records.

![Owner and editor proposal discussion](public/screenshots/collaboration-discussion.webp)

<details>
<summary>Owner invitation and revocation controls</summary>

![Owner controls for editor/viewer invitations and revocation](public/screenshots/collaboration-invitations.webp)

</details>

Rooms share activities and day assignments separately from the full atlas's hotels, bookings and flight research. Hosting a room does not provide private-trip identity accounts or automatically connect an agent's travel tools.

### Your own workspace and reading copies

The generic workspace uses your cities and dates, manual coordinates, editable days and recorded evidence. These local QA screenshots use invented planning records, not real traveler confirmations or live quotes.

![Generic manual workspace with arbitrary trip days and routes](public/screenshots/generic-workspace.webp)

![Export studio with photo-led reading preview](public/screenshots/export-studio.webp)

![Photographic itinerary dossier overview](public/screenshots/visual-export-overview.webp)

![Visual itinerary reading export with city and day chapters](public/screenshots/visual-export.webp)

Conflicting edits open an explicit comparison of your original draft, local changes and the latest shared board. Review each choice before saving; recovery tools preserve unfinished work.

[Rich and compact export formats](docs/EXPORTS.md) · [Implemented modules and limits](docs/IMPLEMENTATION_STATUS.md)

### Flight comparisons

Compare cash and points assumptions, taxes and positioning costs beside the flight route and alternatives. This screenshot uses illustrative manual inputs, not live fares.

![Cash and points flight comparison workbench](public/screenshots/flight-comparison.webp)

### Transport options

Compare flight, rail and driving alternatives by travel time and planning allowance. Flights are blue, trains yellow and cars purple; booking status remains a separate label.

![Multimodal transport option comparisons](public/screenshots/transport-comparison.webp)

### Daily travel and stays

Keep the selected day’s activities, arrivals, hotel context and unresolved logistics together.

![Daily itinerary with travel and stay logistics](public/screenshots/daily-logistics.webp)

![Compact hotel rows with property photos and comparison controls](public/screenshots/hotel-stays.webp)

### City maps

Mapped sights, stays, airports and stations where coordinates are available.

<table>
<tr>
<td width="50%"><a href="public/screenshots/city-berlin.webp"><img src="public/screenshots/city-berlin.webp" alt="Berlin city map with attraction and station markers" width="440" /></a><br /><b>Berlin</b> · Sights and station context</td>
<td width="50%"><a href="public/screenshots/city-amsterdam.webp"><img src="public/screenshots/city-amsterdam.webp" alt="Amsterdam city map with sights, station and airport markers" width="440" /></a><br /><b>Amsterdam</b> · Sights and arrival context</td>
</tr>
</table>

<details>
<summary><b>See maps for all seven sample cities</b></summary>

**Nürburgring places map**

![Nürburgring places map](public/screenshots/city-nurburgring.webp)

**Wrocław places map**

![Wrocław places map](public/screenshots/city-wroclaw.webp)

**Kraków places map**

![Kraków places map](public/screenshots/city-krakow.webp)

**Brussels places map**

![Brussels places map](public/screenshots/city-brussels.webp)

**Amsterdam places map**

![Amsterdam places map](public/screenshots/city-amsterdam.webp)

**Berlin places map**

![Berlin places map](public/screenshots/city-berlin.webp)

**Munich places map**

![Munich places map](public/screenshots/city-munich.webp)

</details>

### Hotels and location

Map layers, stay dates, location fit, filters and provider evidence.

![Hotel comparison workspace with Berlin hotel, transit and attraction map](public/screenshots/hotels.webp)

[**Explore all 28 app screenshots →**](docs/SCREENSHOTS.md) · Route research, transport, activities, Decide/Travel modes, new-trip setup and collaboration.

Screenshots show historical sample evidence, not current prices or live availability. Map/provider credits and photo terms remain attached to their content. The **156 bundled travel photos** are available in the [separate photo gallery](docs/PHOTO_GALLERY.md). [Media provenance](docs/MEDIA.md).

## What you can plan

| Decision | How Trippy helps | What still needs verification |
| --- | --- | --- |
| Cash or points flights | Research fares and award leads; compare cash, points, fees, cabin and your valuation | Party size, bookable seats, complete segments, baggage, transfer timing, cancellation and final price |
| Multi-city route | Compare city order, gateways/open jaws, night allocations and supplied transport alternatives | Connections, dated timetables, locked anchors, border/visa constraints and missing legs |
| Between cities | Compare flight, rail, car and coach options in the sample workspace; research ferry and other operators manually or with your agent | Door-to-door transfers, station/airport access, check-in buffers, parking, insurance and operating dates |
| Hotels and bases | Compare location, cost, amenities and proximity to the day plan | Exact stay dates, room/occupancy basis, total fees and cancellation terms |
| Attractions and activities | Keep a broad catalogue, priorities, sources and geographic context before narrowing it | Opening hours, closures, timed tickets, travel time, accessibility and weather alternatives |
| Daily itinerary | Assign activities to days, reorder them, and keep hotel/station/airport logistics visible | Feasible timing, transit buffers, fatigue and conflicts |
| Booking progress | Distinguish recommendations, quotes, holds, confirmations, missing items and conflicts | Confirmation comes from a traveler-reviewed record, never a search result |
| Sharing | Export sanitized files or use optional live activity/day rooms with revocable editor/viewer invitations | Files remain copies; rooms require durable server storage and reviewed safe content; private booking records stay separate |

Trippy ranks **the alternatives and evidence you supply**. It does not guarantee the cheapest possible itinerary across every airline, loyalty program, rail operator or booking site. Missing price, tax, availability or timetable data remains unknown.

## Start in five minutes

Use Node.js **22.18+ within 22.x**, or **24.x**, and npm. The lockfile keeps installation reproducible.

```bash
git clone https://github.com/0marm0/Trippy-Travel-Planner.git
cd Trippy-Travel-Planner
npm ci
npm run dev:local
```

During private staging, cloning requires access to this repository. Open [localhost:3000](http://localhost:3000) for the sample atlas, [localhost:3000/plan](http://localhost:3000/plan) for your own draft, or [localhost:3000/about](http://localhost:3000/about) for the product introduction.

Manual/sample planning needs no provider account, paid plan, Gmail access, agent or deployment account. Atlas edits stay in that browser’s local storage. `/plan` previews stay in memory. Accepted workspaces can be explicitly saved/resumed in this browser, with dates/destinations isolated, or downloaded. Optional account storage adds explicit server save/load on your configured instance; browser edits do not sync automatically.

The [existing redacted demo](https://trippy-travel-optimizer.vercel.app) may lag this source. It was not redeployed as part of repository preparation and is separate from your own instance.

## Plan your own trip with an agent

1. Open `/plan`, enter cities, origins, dates, travelers, flexibility, pace and interests, then preview and accept the draft. Open the accepted manual workspace, then save/download its trip and itinerary records and use the current agent brief.
2. Give your agent [the new-trip guide](prompts/NEW_TRIP_GUIDE.md). It asks about fixed anchors, trip length, required/optional/rejected cities, budget/cabin, points programs and balances, transfer rules, access needs, luggage, ground modes, overnight/connection tolerance, cancellations and must-dos.
3. Review **at least three materially different routes before price research**: change city order/nights, gateways or open jaws, or regional transport strategy. If your hard constraints prevent three routes, the agent explains that instead of inventing options.
4. Research representative travel dates, compare complete cash and award assumptions, and resolve observed tradeoffs. Keep rejected alternatives and unknowns.
5. Research city catalogues and cluster sights geographically. Build feasible days around the hotel, arrival station/airport, timed tickets, rest and transit buffers.
6. Verify the choices before locking them. Book with the provider, then review the confirmation separately. Search, email parsing and a suggested link never confirm a booking automatically.

For a private-local file workflow:

```bash
npm run trip:init -- --name "Portugal 2027" --start 2027-04-10 --end 2027-04-18 --cities "Lisbon,Porto" --origins "IAD,DCA" --adults 2 --pace balanced --flex-days 2 --themes "food,art"
npm run trip:validate -- .private/trips/portugal-2027/trip.json
```

The initializer only writes beneath ignored `.private/trips/`, rejects symlink escapes and refuses to overwrite an existing file. Keep real itinerary drafts and downloads private-local. See [onboarding](docs/ONBOARDING.md) and [the data model](docs/TRIP_DATA_MODEL.md).

## Add cash and points research

Start without keys. Add an integration when it will help answer a concrete question:

```bash
test -e .env.local || cp .env.example .env.local
```

Enter your own values **directly in that ignored local file**, or in your own host’s secret settings. Never paste them into chat, a public issue, a screenshot or tracked code.

| Need | Implemented adapter | Your configuration and eligibility | Fallback |
| --- | --- | --- | --- |
| Cash flight fares | SerpApi Google Flights research | `SERPAPI_API_KEY`; your account/quota and permitted use | Manual fare comparisons and booking-provider checks |
| Award flight leads | Seats.aero Cached Search | `SEATS_AERO_API_KEY`; eligible personal API access, `SEATS_AERO_SEARCH_MODE=cached` | Manual loyalty-program search |
| Commercial award live search | Seats.aero Live Search | Separate approved commercial agreement; explicit `SEATS_AERO_SEARCH_MODE=live` | Cached/manual research with freshness limits |
| Cash hotels and place discovery | SerpApi Hotels/Maps/web research | Your SerpApi account/key | Manual stay, attraction and operator research |
| Award hotels | Rooms.aero | Your eligible Seats.aero API key and applicable coverage/quota | Manual hotel-program comparison |
| Partner hotel inventory | Booking.com Demand | Eligible partner account, `BOOKING_COM_API_KEY`, `BOOKING_COM_AFFILIATE_ID`, request-specific city ID | Manual consumer-site comparison |
| Rail, coach, ferry, rental cars and activities | Manual entry or an installed, user-authorized host connector | Verify the tool exists, its scope, costs and coverage | Official operator/site research |

Configured keys do not prove account access, broad coverage or live availability. Personal provider access does not automatically authorize a commercial or shared public service. Each result retains a source, checked time and limitation. Production quota spending is gated by your server-side `TRIPPY_ACCESS_CODE` and `TRIPPY_SESSION_SECRET`; those are not multi-user trip accounts.

The Connections interface is a bounded starter: cash searches currently use one adult/economy/EUR, awards one seat with `program: "any"`, and hotels one adult/room/night. Its Sort selector is not wired to ranking. Use the [validated API request examples](docs/PLANNING_GUIDE.md#3-search-cash-flights), agent research or manual comparisons for your actual party/cabin/currency. Cached award summaries do not guarantee enough seats or complete taxes.

Read [the complete planning guide](docs/PLANNING_GUIDE.md) for request examples, provider limits and official sources; [setup](docs/SETUP.md) covers configuration and [integrations](docs/INTEGRATIONS.md) describes permissions, coverage, freshness and failures.

## Compare real trip value

Use equivalent travelers, cabin, baggage and booking terms. Label per-person versus party totals. In one disclosed currency:

```text
Cash option = fare + required extras + positioning/transfers + extra lodging
Award cash = taxes/surcharges + transfer/purchase fees + required extras + positioning/transfers + extra lodging
Award effective cost = award cash + points × your value per point
Redemption value per point = (equivalent cash option − award cash) / points
```

Use currency units per point for effective cost: for example, $0.012 per point means 1.2 cents. Multiply redemption value by 100 to express cents per point. Value the source points actually consumed after any transfer ratio or bonus; show foregone benefits separately without double counting. Unknown fees stay unknown.

For an **invented illustration**, a $900 cash option versus 50,000 points + $150 gives 1.5 cents per point. At your valuation of 1.2 cents, the award’s effective cost is $750; at 1.8 cents it is $1,050. Neither wins without considering availability, time, flexibility and transfer constraints. These are comparison assumptions, not current prices or an automated transfer recommendation.

For an open jaw, compare the whole quoted ticket against separate one-way legs. Include positioning, airport/station transfers, bags, extra nights and connection protection. For ground travel, include hotel-to-hotel time, luggage, parking/tolls/insurance, late arrivals and lost sightseeing time. The current optimizer scores supplied evidence; it does not validate every schedule or prove a global minimum.

## Turn the route into days

Build a broad city catalogue, then choose a hotel/base and group activities by neighborhood. Keep required sights, optional discoveries and rejected ideas separate. Check operating days and hours from attributable sources; leave unsourced travel time as an estimate.

Plan arrival and departure days around the actual station/airport and hotel. Add transfer and check-in buffers, timed-entry reservations, meals, rest, luggage storage, accessibility needs and weather alternatives. A nearby activity may work better on arrival day than a cheaper attraction across town.

The sample atlas demonstrates detailed city catalogues and hotel/transport views. Your generic workspace separately supports manual routes, explicit coordinate maps, day activities and reviewed stay/transport records. Its research ledger records scope/source/time and outstanding work; recorded quote comparisons disclose party, currency, taxes, cancellation and points/transfer assumptions. It does not search inventory or geocode places automatically. [Detailed workflow](docs/PLANNING_GUIDE.md#7-choose-hotels-and-build-days-geographically).

## Track what still needs booking

Use the canonical states **`recommended`, `quoted`, `held`, `confirmed`, `missing`, `conflict`**. A selection does not make a quote held or confirmed. Reverify fare, availability and conditions before booking; review imported candidates before any state change.

Private booking documents and identifiers stay outside shared records. Optional Gmail is a **private-local, read-only candidate preview** with separate consent; it does not silently import, send mail or mutate calendars. [Gmail workflow](docs/GMAIL_IMPORT.md).

## Share with friends

For reading, choose the rich visual HTML itinerary or compact travel, transit and hotel HTML/PDF briefs; existing atlas light/dark/visual modes and CSV remain available. Prepared bundled photos can be embedded in HTML dossiers and supported visual PDF exports. Generic plans retain their own entered records without inheriting sample photos. [Export formats and offline limits](docs/EXPORTS.md).

For edits, exchange a normalized `/plan` JSON draft or a supported `.trippy` workspace proposal. The owner validates and previews the proposed record or supported workspace changes, then accepts or rejects them. `/plan` previews the whole record; comparison with the previous draft is manual. Current atlas bundles reference existing activities/options; they cannot add new attractions, detect concurrent edits or provide live shared state. A downloaded file cannot be revoked after a friend receives it.

For live planning, use “Prepare shared activity board” in your generic workspace, then import/preview that JSON in `/collaborate`; you can also prepare a fresh board or load the reviewed public sample. Configure durable storage and review the exact safe board before creating a room. Owners can grant editor or viewer capabilities and revoke future access; editors can add activities and arrange days. The browser checks for changes every four seconds. Revision conflicts preserve drafts and offer field/entity/day reconciliation with explicit choices against the latest revision. Optional consent-based device recovery retains a validated board and base revision, excluding unfinished forms and credentials. Owners can expire/revoke invitations, replace the owner link and delete a room. This board remains separate from the sample atlas and generic workspace after handoff, and excludes bookings, research and private identifiers. [Live setup and limits](docs/LIVE_COLLABORATION.md) · [Collaboration workflow](docs/COLLABORATION.md) · [Agent prompt](prompts/COLLABORATIVE_TRIP_GUIDE.md).

A practical live-room handoff is: **review board → create room → keep owner link private → create an editor or viewer invitation → send it yourself to the intended friend**. Each friend needs access to the same running server; a localhost link on your computer cannot reach their computer. Use an authorized HTTPS hosting setup for remote friends. Keep owner access privately: there is no account-based recovery if it is lost. Test a sample edit, a conflicting save and revocation before relying on the room for a real group.

## Run it on your own infrastructure

| Choice | Good starting use | Ownership and limits |
| --- | --- | --- |
| Local Node app | Private planning and authorized host-local agents/connectors | Your computer and local files; use loopback; no hosting account required |
| Your Vercel project | A reviewed redacted demo or independent instance | Your Vercel account, billing, project, domains and server secrets; no maintainer account access |
| Your Node server | Self-hosting on infrastructure you control | You operate HTTPS, updates and process management; no Vercel dependency |

Vercel is optional. Live rooms require `COLLABORATION_ENABLED=true` and persistent SQLite on one Node server, or your own Postgres database on Vercel/multiple servers. Remote room creation also requires a server-owned creation code. No hosted database has been provisioned; rooms remain separate from optional private-trip accounts. Keep private-trip/Gmail gates disabled on public instances and never upload `.private/` or `.env.local`. [Live room setup](docs/LIVE_COLLABORATION.md) · [Hosting setup](docs/SETUP.md#vercel-deployment) · [Deployment modes](docs/DEPLOYMENT_MODES.md).

## Optional private accounts

Manual/browser planning works without sign-in. On an explicitly configured server, `/account` or the workspace’s Private account section supports signup/signin, previewed load, explicit encrypted save/update, sanitized export and deletion. Upload happens only when you select a private save action. Plans use tenant-qualified access, AES-256-GCM encryption and revision checks; each account may store up to 20 plans.

Use your own persistent Node/SQLite or Postgres, authentication secret and encryption key. Account deletion requires the current password and removes server-owned plans and sessions; local drafts, exports and backups remain your responsibility. Real password recovery and its email transport are not wired. Hosted Postgres/provider access has not been privately validated, and enabling accounts does not grant travel connector access. [Private account setup and limits](docs/PRIVATE_ACCOUNTS.md).

## Extend the modules

- **Trip data:** `schema/trip.schema.json` and shared normalized-trip creation/validation.
- **Research:** typed provider adapters, validation, normalization, timeouts and manual fallbacks.
- **Optimization:** explainable ranking of supplied route/leg alternatives with explicit missing evidence.
- **Presentation:** sample compatibility adapter, atlas views, generic manual workspace and `/about` introduction.
- **Interchange:** sanitized exports and reviewed workspace proposals.
- **Live planning:** a bounded share-safe activity/day schema, hashed role capabilities, durable SQLite/Postgres adapters and transactional revision checks.
- **Media:** private originals → approved metadata-free derivatives → manifest/hash validation.

See [architecture](docs/ARCHITECTURE.md), [modularity](docs/MODULARITY.md), [collaboration](docs/COLLABORATION.md), and [contributing](CONTRIBUTING.md). New trips, providers, activity editors and storage backends should extend these contracts instead of hardcoding another personal itinerary into the UI.

## Privacy, licensing and verification

Keep personal data, raw messages, booking references, loyalty identifiers, seat assignments and secrets outside samples, screenshots, shared files and Git history. The public sample is a deliberate redaction transform; private originals are not copied into the repository.

```bash
npm run check
npm run release:check
```

The release gate includes lint, types, tests, schema/sample validation, a production build, deployment-file boundary checks, privacy, media, reachable history and production dependency audit. Run the artifact boundary check again after creating a standalone/Vercel deployment package. Independent review and explicit authorization remain required for public publication or deployment.

**Code:** [MIT](LICENSE). **Photos, maps and provider content:** separate terms, not blanket MIT. The owner confirms that licenses for the existing photos have been acquired; the media inventory records that attestation while per-photo license/attribution records are deferred. [Security](docs/SECURITY.md) · [Media](docs/MEDIA.md) · [Release report](docs/RELEASE_REPORT.md).

## Documentation

[Product and premium UI roadmap](docs/PRODUCT_ROADMAP.md) · proposed next steps, dependencies and acceptance checks.

[Planning guide](docs/PLANNING_GUIDE.md) · [Setup](docs/SETUP.md) · [Onboarding](docs/ONBOARDING.md) · [Integrations](docs/INTEGRATIONS.md) · [Current implementation](docs/IMPLEMENTATION_STATUS.md) · [Export formats](docs/EXPORTS.md) · [Private accounts](docs/PRIVATE_ACCOUNTS.md) · [Architecture](docs/ARCHITECTURE.md) · [Collaboration](docs/COLLABORATION.md) · [Agent workflow](docs/AGENT_WORKFLOWS.md) · [Research playbook](docs/RESEARCH_PLAYBOOK.md) · [Gallery](docs/PHOTO_GALLERY.md) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md)
