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

## Hosting the user owns

Local-private is the default for real trips. For a redacted website, offer the user's own Vercel project or a full Next.js Node server on infrastructure they control. Explain current pricing/quotas from official sources before choosing; do not invent a free plan. Static-file hosting cannot replace server APIs.

Complete local checks, sanitized-artifact review and release prerequisites before requesting the separately required deployment/publication approval. When already authorized, use only the exact approved project/source/environment. Never deploy private trip files or `.env.local`; keep private gates off. Hosting adds no accounts, cloud trip sync, durable approval ledger or access to connectors installed in an agent host.

## Handoff

Return the working mode, modules enabled, redacted configuration status, commands completed, tests/results, precise remaining limitations and next trip-planning action. Do not claim publication readiness, a generalized detailed trip atlas, live coverage or confirmed bookings without the evidence required by the repository contract.
