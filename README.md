# TRIPPY — Travel Optimizer

Plan a trip around the tradeoffs that matter: route, transport, stays, activities, time, budget, and cash-versus-points. TRIPPY is provider-neutral and useful before you connect anything: clone it, run the redacted sample, or enter your own options manually.

**Live redacted demo:** [trippy-travel-optimizer.vercel.app](https://trippy-travel-optimizer.vercel.app)

> **Pre-release repository.** The sanitized demo is deployed for product testing, but the GitHub repository is still being prepared for eventual public release. Do not create a public remote or publish source until the release checklist passes. Nothing in this project authorizes a booking.

## Start in sample/manual mode — no accounts or keys

Prerequisite: a supported current Node.js release.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no local configuration, TRIPPY opens its tracked, redacted sample. Edits in the browser stay in that browser’s local storage. You can compare manually entered quotes and options without an API key, provider account, Gmail connection, or MCP server.

## What TRIPPY helps you decide

- Compare route candidates across flights, rail, driving, coach, stays, and activities.
- Keep ideas, quotes, selections, holds, and confirmed bookings separate.
- Evaluate cash and points using *your* stated point value, taxes/fees, and constraints.
- Build daily plans while preserving route, timing, location, and unresolved-risk context.
- Inspect the source and checked-at time of external information rather than treating a recommendation as a fact or booking.

## Optional integrations — entirely user-owned

TRIPPY now includes optional server-side adapters for SerpApi research, Seats.aero award flights, Rooms.aero award hotels, and qualified Booking.com Demand accounts. It also includes a private, read-only Gmail booking-candidate preview. Every integration is disabled or safely degraded until you configure it; the complete manual/sample workflow still requires no account or key. Put values only in untracked `.env.local` (or your deployment host’s encrypted secret manager):

```bash
cp .env.example .env.local
```

The core optional research placeholders are:

```dotenv
SERPAPI_API_KEY=<your SerpAPI key>
SEATS_AERO_API_KEY=<your Seats.aero key>
```

Create and manage your own accounts, pay only when the provider or chosen plan requires it, review current provider terms, and never paste a real value into chat, an issue, a screenshot, or a tracked file. A configured variable does **not** prove broad coverage, a current price, availability, or a booking. Live results remain timestamped research evidence and can never become confirmed automatically. See [setup](docs/SETUP.md#optional-user-owned-research-keys), [implementation status](docs/IMPLEMENTATION_STATUS.md), and [integrations](docs/INTEGRATIONS.md).

Expedia, trivago, Priceline, and TripAdvisor remain manual handoffs; TRIPPY does not scrape them or claim private API coverage. For maps, rail, rental cars, activities, calendar data, or any host connector/MCP, configure **only** a tool actually available in your chosen host. Do not assume or claim any named provider has an official connector. Request the least privilege—read-only discovery/import access where possible—and retain manual entry as the fallback.

## Ways to use TRIPPY

| Mode | What it uses | What it does not require |
| --- | --- | --- |
| Manual/sample | Bundled redacted sample or your own manual entries | Keys, paid providers, connectors, agents |
| ChatGPT-guided | A ChatGPT host plus the same normalized trip data | A connector unless you choose one |
| Codex-guided | Codex plus local files/configuration you explicitly provide | Provider credentials or a built-in travel MCP |
| Claude-guided | Claude plus local files/configuration you explicitly provide | Provider credentials or a built-in travel MCP |

Agent guidance must ask before it uses a private connector or live research, state source/freshness/coverage/cost, preserve unknowns, and never infer `booked` from a recommendation or quote. Details: [guided onboarding](docs/ONBOARDING.md) and [connector rules](docs/INTEGRATIONS.md#mcp-and-host-connectors).

## Privacy boundary

The public sample and a real trip are different artifacts. Keep personal trips, raw emails, confirmation documents, OAuth material, provider responses, and local connector configuration outside the repository. Public sample generation is deliberate:

```bash
npm run sample:build
npm run sample:validate
npm run privacy:check
```

The checks are valuable but not proof that a public release is safe; they do not replace a clean-history review and independent artifact review. Read [security and privacy](docs/SECURITY.md) and the [public release checklist](docs/PUBLIC_RELEASE_CHECKLIST.md).

## Local and Vercel deployment

Local development should use `localhost` and untracked `.env.local`. For a Vercel deployment, use Vercel’s project/environment secret settings rather than files, leave private-trip gates disabled, and deploy only the redacted/public artifact after the release gate has passed. Deployment is a separate, explicitly authorized decision. Full instructions: [setup](docs/SETUP.md#vercel-deployment).

## Verify a change

```bash
npm run check
```

This runs linting, type checking, tests, public-sample validation, a production build, and the current-tree privacy preflight. It does not authorize publishing.

For the exact staged source candidate, including reachable Git history, run `npm run release:check`.

## Documentation

- [Local and Vercel setup](docs/SETUP.md)
- [Integrations, coverage, cost, freshness, and fallbacks](docs/INTEGRATIONS.md)
- [Implemented versus planned capabilities](docs/IMPLEMENTATION_STATUS.md)
- [Publication candidate](docs/RELEASE_CANDIDATE.md)
- [Security and privacy](docs/SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [Security reporting](SECURITY.md)
- [Public release checklist](docs/PUBLIC_RELEASE_CHECKLIST.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Agent workflow](AGENTS.md)
