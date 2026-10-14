# TRIPPY modular setup guide

Use this with Codex, Claude, ChatGPT or another agent that can access the authorized checkout. Help the user complete only the modules they choose. Read `AGENTS.md`, `CLAUDE.md`, `docs/SETUP.md`, `docs/ONBOARDING.md` and `docs/INTEGRATIONS.md`; verify capability claims against the implementation. Do not access private files or secret values merely to inspect setup.

## Start without credentials

Explain that sample/manual mode needs Node/npm and a browser, with no travel-provider account, Gmail, MCP or key. Install using the lockfile, start the local app, verify the reviewed sample and explain per-browser atlas persistence. Use `/plan` for an arbitrary trip draft: validate, preview, explicitly accept, download JSON and copy the agent brief. Pasted agent JSON follows the same validation/preview/acceptance gate. Explain that this page uploads nothing and clears on reload; `trip:init`/`trip:validate` provide the private-local file alternative. Keep the actual trip’s personal data outside tracked paths.

Ask one compact batch: whether this is a sample or real trip; local-private or a reviewed redacted website; chosen agent host; which actual connectors are available; and whether public research or private imports are authorized. Existing consent applies to its exact scope. Then use `NEW_TRIP_GUIDE.md` for traveler/route questions; do not block planning on optional credentials.

## Offer independent modules

For each selected module explain purpose, owner, minimum permission, current coverage/freshness, plan eligibility, costs/limits, permitted uses and manual fallback:

- General discovery: the user's SerpApi account/key as server-only `SERPAPI_API_KEY`.
- Award flights/hotels: eligible Seats.aero/Rooms.aero access as server-only `SEATS_AERO_API_KEY`; cached and commercial live access differ. A host MCP is a separate opt-in. Personal API access does not authorize commercial/shared-site use.
- Hotel demand: qualified Booking.com Demand access, required affiliate identity and provider city identifiers; a consumer login is insufficient.
- Maps: bundled overview without a key; public tile styles may still require network/terms. Browser keys must be separately origin/API-restricted.
- Gmail: a separately authorized local preview with minimum read-only OAuth scope. Confirm configured availability; show redacted candidates and require approval before any write/state change.
- Other host tools: use only an actually available connector and authorized task; preserve manual entry.

Have the user enter secrets only in ignored `.env.local` or their own host secret settings. Never request secret text in chat, print values, add `NEXT_PUBLIC_` to private keys, or copy host credentials into the website. Report `configured`, `not configured` or `not checked`; configuration alone does not establish valid access. Use bounded authorized test requests only when needed.

## Guide the user through account/key setup

Use the exact [SerpApi](../docs/INTEGRATIONS.md#serpapi-user-owned-account-and-key) and [Seats.aero](../docs/INTEGRATIONS.md#seatsaero-choose-api-or-host-mcp) steps. Give the official account/settings links, explain current eligibility/quotas/permitted uses and let the user enter their own key locally. Create `.env.local` from `.env.example` only when it is absent; preserve existing settings. Never read/print values or ask for them in chat. Restart the server and report redacted configuration status. Within existing research authorization, test one bounded query; state precisely what worked and what remains untested. Leave cached award mode enabled unless separate commercial Live Search access is established.

## Discover and authorize host tools

Inventory tools actually exposed in this host/session before relying on them. Follow [the host guide](../docs/INTEGRATIONS.md#agent-guided-host-setup): directory discovery, publisher/source check, user-selected install/connect, trusted OAuth/sign-in, minimum search/read permissions, session refresh and one bounded tested query. Use official host/provider instructions; never invent an MCP URL or treat an old plugin announcement as current access.

Check KAYAK, Expedia, Booking.com, trivago and any other requested hotel/flight tools individually. Discover rental-car, activity/maps, rail/coach/ferry tools separately; a hotel connection implies none of them. Seats.aero API credentials and host MCP OAuth are different routes. A host listing may vary by account/region and may require no login; use its actual flow rather than asking for a key unnecessarily. Preserve manual/operator-site research for missing, unverified, limited or stale tools.

For every enabled tool record: host/provider, callable search types, authentication/configuration status, tested query and date, coverage/party/currency limits, approved actions, cost/quota information and fallback. Keep host tokens outside the website environment and trip JSON. Do not book, create award alerts, send invitations/email or mutate calendars as part of setup.

## Normalize the comparison

Before ranking, match flight party/seat/cabin/dates or hotel property/room/occupancy/stay dates, full-stay total, currency, mandatory fees and cancellation terms. Evaluate hotel location against selected activities and stations using verified coordinates and travel-time evidence; price alone does not establish value. Keep unknown fees/seat counts/hours explicit, sources/timestamps separate, provider rates deduplicated and alternatives retained. Use [the comparison checklist](../docs/INTEGRATIONS.md#compare-like-for-like-results).

## Hosting the user owns

Local-private is the default for real trips. For a redacted website, offer the user's own Vercel project or a full Next.js Node server on infrastructure they control. Explain current pricing/quotas from official sources before choosing; do not invent a free plan. Static-file hosting cannot replace server APIs.

Complete local checks, sanitized-artifact review and release prerequisites before requesting the separately required deployment/publication approval. When already authorized, use only the exact approved project/source/environment. Never deploy private trip files or `.env.local`; keep private gates off. Hosting alone adds no private-trip accounts, automatic trip sync or access to connectors installed in an agent host. Optional `/collaborate` rooms use explicit persistent SQLite or user-owned Postgres configuration for reviewed share-safe activity/day boards; they are separate from private trip/booking storage and have no authenticated account identity or audit-history ledger. Follow [live collaboration](../docs/LIVE_COLLABORATION.md); implementation does not authorize database provisioning, publishing a board, sending invitations or deployment.

## Handoff

Return the working mode, modules enabled, redacted configuration status, commands completed, tests/results, precise remaining limitations and next trip-planning action. Do not claim publication readiness, a generalized detailed trip atlas, live coverage or confirmed bookings without the evidence required by the repository contract.

For a concrete setup receipt, follow [the acceptance checklist](../docs/AGENT_WORKFLOWS.md#acceptance-checklist). Demonstrate the chosen no-key flow first with sample/invented content, then report each selected integration as configured/tested, configured/untested, unavailable or not requested. State the tested party/cabin/currency and query time. For friends, verify they can reach the same authorized server; loopback on one person's computer is not a remote invitation endpoint. Do not claim a hosted database, remote room or provider path works from local mock tests alone.
