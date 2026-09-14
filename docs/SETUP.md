# Set up TRIPPY

TRIPPY starts in a complete sample/manual mode. Do this first; live research and private imports are separate, opt-in capabilities.

## Local sample/manual mode

Install a supported current Node.js release, then run:

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). No account, API key, Gmail connection, MCP, or paid travel provider is needed. The app loads `examples/trips/2026-europe-sample.json`, a tracked redacted sample; browser changes remain local to the browser.

Run the standard verification suite before sharing code:

```bash
npm run check
```

## Optional user-owned research keys

Only configure a key if you are enabling an adapter in your own environment and it will materially improve the decision. Create an ignored local file:

```bash
cp .env.example .env.local
```

Add only placeholders replaced with values you own:

```dotenv
SERPAPI_API_KEY=<your SerpAPI key>
SEATS_AERO_API_KEY=<your Seats.aero key>
```

- `SERPAPI_API_KEY` is for optional general search/discovery research. Create an account and retrieve your key from the official [SerpApi dashboard](https://serpapi.com/manage-api-key).
- `SEATS_AERO_API_KEY` is for optional award-seat research. Check eligibility and generate your personal key from the API tab described in the official [Seats.aero API getting-started guide](https://developers.seats.aero/reference/getting-started-p). Access, quotas, and permitted uses depend on the user's current plan and Seats.aero terms.

Never paste a value into chat, source control, an issue, a screenshot, or a tracked config file. Restart the local server after changing `.env.local`.

These variables activate implemented server-side adapters; they are not sent to the browser. Results disclose source, checked time, freshness basis, limitations, errors, and manual fallbacks. They remain research evidence—not holds, confirmations, or booking instructions. Review [integrations](INTEGRATIONS.md) before enabling one.

Seats.aero defaults to its Pro-compatible cached search. Set `SEATS_AERO_SEARCH_MODE=live` only if you have a separate commercial Live Search agreement. The same account key can expose Rooms.aero award-hotel research subject to its separate quota and cache age. Booking.com Demand requires both a qualified partner API key and affiliate ID; a hotel request also needs a Booking.com numeric city ID. Consumer-site inventory parity is not assumed.

### Protect live quota on a hosted site

When provider keys exist in production, configure two additional server-only values:

```dotenv
TRIPPY_ACCESS_CODE=<a private code you will enter in the app>
TRIPPY_SESSION_SECRET=<at least 32 random characters>
```

Visitors without the code keep the manual workflow but cannot spend live provider quota. A successful same-origin unlock creates a signed, 12-hour, secure HttpOnly cookie; neither value is stored in browser-readable state. Keep the access code private and use platform rate limiting if the deployment will serve many users.

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

See the provider-neutral [connector inventory](INTEGRATIONS.md#provider-neutral-connector-inventory), including Booking.com, Expedia, trivago, Priceline, TripAdvisor, Gmail, maps, rail, rental cars, activities, and calendar.

## Private local trip data

Do not add private trip data to a tracked path. The current private itinerary importer is deliberately development-only and reads a local HTML itinerary outside the repository. If you deliberately use it, set an untracked absolute path and explicit local gate in `.env.local`:

```dotenv
TRIPPY_ITINERARY_PATH=/absolute/path/to/private-itinerary.html
TRIPPY_ALLOW_PRIVATE_LOCAL=true
```

Private itinerary endpoints are available only in development on a loopback host with the explicit gate. Production must serve the redacted sample; never set `TRIPPY_ALLOW_PRIVATE_LOCAL=true` in a deployment. Keep raw emails, booking documents, confirmation references, OAuth files, provider responses, and personal data outside the repo.

## Maps

The bundled overview atlas needs no key. City maps use a credential-free default style; hosted tiles still need a network connection and may have availability or terms limits. A custom public style URL may be placed in `.env.local`:

```dotenv
NEXT_PUBLIC_CITY_MAP_STYLE_URL=https://your-map-provider.example/style.json
```

`NEXT_PUBLIC_*` values are exposed to the browser. Never place a private server credential in one. If a map SDK needs a browser key, use a separate key restricted to the intended origins and APIs; keep geocoding/routing server keys server-side. See [map configuration](INTEGRATIONS.md#map-stack).

## Vercel deployment

Vercel deployment is optional and does not change the public-release gate.

1. Verify demo/manual mode on a clean checkout.
2. Add only needed values in Vercel Project Settings → Environment Variables; never upload `.env.local` or paste secrets into chat. Scope values deliberately to Production, Preview, and/or Development.
3. Keep `TRIPPY_ALLOW_PRIVATE_LOCAL=false` and do not configure a private itinerary path.
4. Restrict any browser map key to the deployment domains; use server-side secret storage for private provider keys.
5. Redeploy after environment-variable changes. Run `npm run check`, then complete the [public release checklist](PUBLIC_RELEASE_CHECKLIST.md) before any source publication.

The deployment must degrade to manual/sample mode when optional providers are unavailable. It must not expose debug errors, account identifiers, raw provider responses, or private imports.

## Refresh a public sample

When a private plan changes, do not copy it into source. Build the approved redacted sample deliberately:

```bash
npm run sample:build
npm run sample:validate
npm run privacy:check
```

Inspect the resulting artifact and staged release tree for email addresses, Gmail URLs, confirmation/booking references, record locators, seats, loyalty IDs, keys, tokens, and private notes. A second reviewer must inspect the release artifact before any publication.
