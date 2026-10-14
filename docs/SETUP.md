# Set up TRIPPY

TRIPPY starts in sample/manual mode. The visual atlas is currently sample-centered; use [guided onboarding](ONBOARDING.md) for a different trip and [the setup prompt](../prompts/SETUP_GUIDE.md) for agent help. Do this first; live research and private imports are separate, opt-in capabilities.

## Local sample/manual mode

Install Node.js 22 or a newer supported LTS release and npm, then run:

```bash
npm ci
npm run dev
```

Visit [localhost:3000](http://localhost:3000) for the reviewed sample or [the generic planner](http://localhost:3000/plan) for your own dates/cities. No provider/account key is needed. Atlas edits are browser-local; `/plan` previews are in memory, while accepted manual workspaces support explicit browser save/resume/download. Optional encrypted account uploads require a separate selected save action.

Run the standard verification suite before sharing code:

```bash
npm run check
```

## Optional live planning rooms

Open `/collaborate` for a separate reviewed activity/day board. Enable it only when you want to publish that safe planning content. In untracked `.env.local`, set `COLLABORATION_ENABLED=true`. One persistent Node 22.18+/24 server uses ignored `.private/collaboration/rooms.sqlite`; Vercel or multiple servers require `COLLABORATION_DATABASE_URL` configured privately for your own durable Postgres database. Remote or production room creation also requires `COLLABORATION_CREATE_CODE`, privately generated with 16–256 characters and no whitespace. Enter it in the masked creation field; never paste the value in chat or tracked files. No database is provisioned by this setup.

Owners grant/revoke editor and viewer capabilities; editors change activities/days; viewers read. Polling checks revisions every four seconds and conflicting saves preserve the draft for explicit review. This does not create private-trip accounts or sync the atlas, `/plan` or booking data. Manual mode works with rooms disabled. Follow [the complete live setup](LIVE_COLLABORATION.md) for storage, backup and capability limits.

For a self-hosted HTTPS reverse proxy, preserve the public Host. If TLS terminates before a plain-HTTP Node server, `COLLABORATION_TRUST_PROXY=true` is appropriate only when trusted ingress overwrites `X-Forwarded-Proto` with one `http`/`https` value and blocks direct untrusted access. The default is false; forwarded Host is never trusted. Vercel's managed ingress supplies its public scheme. Production room creation always requires the configured creation code, including requests claiming localhost.

## Create your own trip

In `/plan`, enter your dates/cities/origins/travelers/preferences, validate and preview, then accept into the manual workspace. Add route alternatives, day assignments/activities, explicit coordinate pins and previewed stays/transport. Record sourced research/quotes separately. Save/resume explicitly in this browser or download editable/reading copies; no automated search or confirmation occurs. [Formats](EXPORTS.md).

For a local-file workflow:

```bash
npm run trip:init -- --name "Portugal 2027" --start 2027-04-10 --end 2027-04-18 --cities "Lisbon,Porto" --origins "IAD,DCA" --adults 2 --pace balanced --flex-days 2 --themes "food,art"
npm run trip:validate -- .private/trips/portugal-2027/trip.json
npm run schema:check
```

`trip:init` defaults to `.private/trips/<trip-slug>/trip.json`, restricts output to the ignored private trip tree and refuses to overwrite an existing file. `trip:validate` checks the supplied normalized record; without a path it checks the generic example. `schema:check` validates that example too. Use `schema/trip.schema.json` as the contract. Plan at least three materially different routes with the agent before price research; the initializer deliberately leaves route candidates empty. [Onboarding](ONBOARDING.md) explains the remaining limitations.

## Optional user-owned research keys

Only configure a key if you are enabling an adapter in your own environment and it will materially improve the decision. Select modules independently: general search, award research, qualified hotel demand, maps, or a private-local Gmail preview. You may stop after manual setup. Create an ignored local file:

```bash
cp .env.example .env.local
```

Add only placeholders replaced with values you own:

```dotenv
SERPAPI_API_KEY=<your SerpAPI key>
SEATS_AERO_API_KEY=<your Seats.aero key>
```

- `SERPAPI_API_KEY` is for optional general search/discovery research. Create an account and retrieve your key from the official [SerpApi dashboard](https://serpapi.com/manage-api-key).
- `SEATS_AERO_API_KEY` is for optional award-seat research. Check eligibility and generate your personal key from the API tab described in the official [Seats.aero API getting-started guide](https://developers.seats.aero/reference/getting-started-p). Personal partner-API access is conditional for Pro users; commercial use requires written agreement. A personal account is not permission to offer a shared public API-backed service. Access, quotas and permitted uses depend on current eligibility and terms.

Never paste a value into chat, source control, an issue, a screenshot, or a tracked config file. Restart the local server after changing `.env.local`.

These variables activate implemented server-side adapters; they are not sent to the browser. Results disclose source, checked time, freshness basis, limitations, errors, and manual fallbacks. They remain research evidence—not holds, confirmations, or booking instructions. Review [integrations](INTEGRATIONS.md) before enabling one.

Seats.aero defaults to its Pro-compatible cached search. Set `SEATS_AERO_SEARCH_MODE=live` only if you have a separate commercial Live Search agreement. The same account key can expose Rooms.aero award-hotel research subject to its separate quota and cache age. Booking.com Demand requires both a qualified partner API key and affiliate ID; a hotel request also needs a Booking.com numeric city ID. Consumer-site inventory parity is not assumed. Review the official [Booking.com Demand prerequisites](https://developers.booking.com/demand/docs/getting-started/prerequisites) before choosing this module; a consumer Booking.com login does not establish partner API access.

### Protect live quota on a hosted site

When provider keys exist in production, configure two additional server-only values:

```dotenv
TRIPPY_ACCESS_CODE=<a private code you will enter in the app>
TRIPPY_SESSION_SECRET=<at least 32 random characters>
```

Visitors without the code keep the manual workflow but cannot spend live provider quota. This quota gate is not a user account, trip-privacy system, provider license, or per-user billing system. A successful same-origin unlock creates a signed, 12-hour, secure HttpOnly cookie; neither value is stored in browser-readable state. Keep the access code private and use platform rate limiting if the deployment will serve many users.

### Verify configuration without exposing values

Do not echo, print, copy, or ask an agent to reveal a secret. A safe local presence check answers only whether the expected variable is set:

```bash
node --env-file=.env.local -e 'console.log(process.env.SERPAPI_API_KEY ? "SERPAPI_API_KEY: configured" : "SERPAPI_API_KEY: not configured"); console.log(process.env.SEATS_AERO_API_KEY ? "SEATS_AERO_API_KEY: configured" : "SEATS_AERO_API_KEY: not configured");'
```

This loads the local file only for that process and prints no value. An agent should report the same redacted status (`configured`, `not configured`, or `not checked`) and must not request secret text. A status of `configured` does not test validity, account access, quota, or provider availability.

## Optional Gmail preview

Gmail access is a separate explicit opt-in. Configure the Google OAuth values, exact `APP_BASE_URL`, a high-entropy `TRIPPY_GMAIL_SESSION_SECRET`, and only then set `TRIPPY_ENABLE_GMAIL_IMPORT=true`. The app requests Gmail read-only access, returns a bounded redacted candidate preview, stores no message body or durable import, and never mutates the trip. Follow the exact redirect and verification instructions in [Gmail import](GMAIL_IMPORT.md).

## Connectors and MCPs

Connectors belong to the user’s chosen host—not to this repository. ChatGPT, Codex, Claude, and other MCP clients each expose different integrations. Before using one:

1. Confirm the connector/MCP is actually installed and available in that host.
2. Confirm it supports the precise task and geography you need; do not infer an official connector from a provider’s name.
3. Use read-only and least-privilege scopes, narrow date/search ranges, and an explicit user action for private imports.
4. Record source, timestamp, coverage, cost/limits, and fallback for results used in a decision.
5. Keep manual entry available if a connector is absent, limited, stale, or fails.

Seats.aero also documents an [official host MCP](https://developers.seats.aero/reference/getting-started-p); installing and authorizing it in an agent host is separate from configuring the website API adapter. Use only the capabilities and read-only scope available to that session.

See the provider-neutral [connector inventory](INTEGRATIONS.md#provider-neutral-connector-inventory), including Booking.com, Expedia, trivago, Priceline, TripAdvisor, Gmail, maps, rail, rental cars, activities, and calendar.

## Private local trip data

Do not add private trip data to a tracked path. The current private itinerary importer is deliberately development-only and reads a local HTML itinerary outside the repository. If you deliberately use it, set an untracked absolute path and explicit local gate in `.env.local`:

```dotenv
TRIPPY_ITINERARY_PATH=/absolute/path/to/private-itinerary.html
TRIPPY_ALLOW_PRIVATE_LOCAL=true
```

Private files do not become public samples by enabling a gate. Private itinerary endpoints are available only in development on a loopback host with the explicit gate. Production must serve the redacted sample; never set `TRIPPY_ALLOW_PRIVATE_LOCAL=true` in a deployment. Keep raw emails, booking documents, confirmation references, OAuth files, provider responses, and personal data outside the repo.

## Maps

The bundled overview atlas needs no key. City maps use a credential-free default style; hosted tiles still need a network connection and may have availability or terms limits. A custom public style URL may be placed in `.env.local`:

```dotenv
NEXT_PUBLIC_CITY_MAP_STYLE_URL=https://your-map-provider.example/style.json
```

`NEXT_PUBLIC_*` values are exposed to the browser. Never place a private server credential in one. If a map SDK needs a browser key, use a separate key restricted to the intended origins and APIs; keep geocoding/routing server keys server-side. See [map configuration](INTEGRATIONS.md#map-stack).

## Choose hosting you own

Local-private is the no-account default. A user-owned hosted instance may separately enable encrypted accounts and reviewed live rooms; hosting alone enables neither feature nor agent-host connectors. Review eligibility, costs, HTTPS, custody/backups and private gates before authorized deployment. [Accounts](PRIVATE_ACCOUNTS.md) · [Deployment modes](DEPLOYMENT_MODES.md).

## Vercel deployment

Vercel deployment is optional and does not change the public-release gate. It creates an independent website instance; it does not turn the current browser-local app into an authenticated or synchronized private-trip service. See [deployment modes](DEPLOYMENT_MODES.md) for the local-private, agent-connected, personal-cloud, and public-sample boundary.

1. With explicit deployment authorization, sign into your own Vercel account, create a project under your account/team, and import your authorized source checkout. Use the repository root and detected Next.js preset. Verify demo/manual mode on a clean checkout first.
2. Add only needed values in Vercel Project Settings → Environment Variables; never upload `.env.local` or paste secrets into chat. Scope values deliberately to Production, Preview, and/or Development; keep production values separate from local/test credentials. Never prefix private values with `NEXT_PUBLIC_`. These server-side values support only the deployed website's direct implemented adapter calls. They cannot provide a visitor access to an MCP or connector installed in a local ChatGPT, Codex, Claude, or other agent host.
3. Keep `TRIPPY_ALLOW_PRIVATE_LOCAL=false` and do not configure a private itinerary path.
4. Restrict any browser map key to the deployment domains; use server-side secret storage for private provider keys.
5. Redeploy after environment-variable changes. Run `npm run check`, then complete the [public release checklist](PUBLIC_RELEASE_CHECKLIST.md) before any source publication.

The deployment must degrade to manual/sample mode when optional providers are unavailable. It must not expose debug errors, account identifiers, raw provider responses, or private imports. Browser edits remain in that browser's local storage: optional encrypted accounts need separate configuration and explicit save/load; automatic browser-to-server sync and real recovery email remain absent. Do not use a hosted instance for private itinerary, raw mail, booking-document, or confirmation data.

These steps follow the official [Next.js on Vercel guide](https://vercel.com/docs/frameworks/full-stack/nextjs) and [environment-variable guide](https://vercel.com/docs/environment-variables), checked 2026-10-13. Credentials remain yours; the maintainers do not receive them.

## Self-host a redacted website

The existing scripts support a full Next.js Node server:

```bash
npm ci
npm run build
npm start -- --hostname 127.0.0.1 --port 3000
```

Keep private gates disabled. Supply only the needed server environment values through your process manager or host secret store. Do not rely on `.env.local` being transferred to another machine, upload it with build artifacts, or embed private values in container images. A VPS, container platform or other Node-capable host is an operator choice; this repo does not yet ship a Dockerfile or host-specific deployment recipe.

For internet access, configure HTTPS and a reverse proxy, request/body limits, rate limiting, process restart, and secret rotation in infrastructure you control. Test the built app and provider lock before exposing it. Static-file-only hosting is not equivalent: the app uses server route handlers for trip loading, provider access, exports and optional Gmail preview. Self-hosting still serves reviewed redacted data, with per-browser state and no private-trip cloud sync. See the official [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting), checked 2026-10-13.

### Optional post-publication deploy link

Leave `NEXT_PUBLIC_TRIPPY_REPOSITORY_URL` empty while the repository is pre-release. Only after the public source candidate has passed the release checklist and publication is explicitly authorized may it contain the exact public repository URL. It is a public URL used to gate optional deploy-link copy; it is not a secret, does not publish source, and does not configure a provider. A one-click deployment still creates a separate instance whose operator must configure and review its own environment.

## Refresh a public sample

When a private plan changes, do not copy it into source. Build the approved redacted sample deliberately:

```bash
npm run sample:build
npm run sample:validate
npm run privacy:check
```

Inspect the resulting artifact and staged release tree for email addresses, Gmail URLs, confirmation/booking references, record locators, seats, loyalty IDs, keys, tokens, and private notes. A second reviewer must inspect the release artifact before any publication.

## Deployment artifact privacy

The release gate checks Next.js function file traces as well as public bundles. `next.config.ts` excludes ignored private data and environment files from every route trace; `.vercelignore` separately excludes them from local CLI uploads. Run `npm run build:boundary:check` after building and again after creating `.next/standalone` or `.vercel/output` packages. A development-only runtime gate does not make it safe to upload private source files. Never package personal trips or credentials with a hosted deployment.

## Optional encrypted private accounts

Follow [PRIVATE_ACCOUNTS](PRIVATE_ACCOUNTS.md) for `PRIVATE_ACCOUNTS_ENABLED`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `PRIVATE_ACCOUNTS_ENCRYPTION_KEY` and optional user-owned Postgres configuration. Enter values privately in ignored local/server settings; preserve existing environment files. No signup, provider access, database provisioning or deployment occurs just from reading setup. Browser/manual mode remains available with accounts disabled. Check tenant isolation, password-confirmed deletion, revision conflicts and the 20-plan account limit using synthetic local data before an operated launch. Hosted persistence and real password recovery still require separate authorized verification.
