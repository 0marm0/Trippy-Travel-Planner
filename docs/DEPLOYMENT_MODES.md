# Deployment modes

Choose a mode based on where the app runs and where your data and credentials may live. These modes are deliberately separate: a hosted site is not an agent host, and a public sample is not a private-trip service.

| Mode | Best for | Where state lives today | Credentials and connectors |
| --- | --- | --- | --- |
| Local-private | Your own planning on one computer | That browser's local storage | `.env.local`; any MCP or host connector stays on that computer/agent host |
| Agent-connected | A guided planning session on your computer | The same local browser state and files you explicitly share | The agent host may use only connectors actually installed there, with explicit consent |
| Personal cloud | Running your own website instance | Each visitor browser's local storage; no shared account or database | Deployment-environment secrets make only direct website-to-provider calls |
| Public sample | Demonstrations and evaluation | Bundled redacted sample plus each visitor's browser state | No private trip material, host MCP, or implied live connector access |

## First run

Start local-private unless you have a reason to host a redacted sample:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000` for the sample atlas, or `/plan` for an arbitrary normalized trip draft. Atlas edits persist only in that browser; `/plan` uploads nothing and clears on reload unless you download its planning JSON. Enter or import only authorized data. Clearing site data, changing browsers or moving devices does not transfer the trip.

When the explicit localhost private-data gate loads a private trip file, operational confirmation details may be displayed locally. Every export must still strip email addresses, email links, seats, confirmation/booking references, record locators, loyalty identifiers, tokens and secrets. A private label is not permission to include those fields in a downloadable artifact. Keep original booking documents in private-local custody.

For a guided session, keep the app local and tell the agent which data sources it may access. An MCP credential, installed connector, or OAuth session belongs to that host. It is not packaged with TRIPPY, uploaded to Vercel, or made available to other visitors.

## Personal cloud and public sample

A Vercel or self-hosted deployment is an independent instance operated by the person who creates it. Hosting accounts, billing, domains and environment secrets belong to that operator. Configure only that instance's environment variables in its secret manager. Server-side deployment credentials can support the website's implemented, direct provider calls; they cannot expose or relay an MCP connector from ChatGPT, Codex, Claude, or another local host.

The atlas has browser-local-storage persistence; `/plan` drafts have no persistence until downloaded. Neither provides authenticated accounts or a durable database. A hosted deployment therefore is **not** private-trip sync: it has no user identity, cross-device trip history, shared household workspace, durable approval ledger, or server-side trip recovery. Do not treat it as a place to host raw email, booking files, confirmation details, or a personal itinerary. Keep private-local gates off in every deployment.

Public sample deployments must contain only reviewed, redacted sample material. They must not promise that any provider, Gmail path, or host connector is available. Optional adapters may be unconfigured, locked, limited, stale, or unavailable; manual entry remains the fallback.

## Hosting choice

| Choice | Prerequisites | Operator responsibility |
| --- | --- | --- |
| Local-private | Node/npm and a browser | Private files, local secrets and sanitized exports |
| Your Vercel project | Your Vercel account and an authorized source checkout | Project ownership, environment scoping, quota control and provider permitted uses |
| Your Node server | A Node-capable host and HTTPS/reverse proxy | Deployment, patching, process recovery, access/rate limits and secret storage |

Vercel is optional. The existing `build`/`start` scripts run the full Next.js server; static hosting alone cannot run its APIs. Neither hosted option provides authenticated private-trip storage. Specific host prices and plan limits must be checked when choosing. Follow [setup](SETUP.md#choose-hosting-you-own) and the official [Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) or [self-hosting](https://nextjs.org/docs/app/guides/self-hosting) guide (checked 2026-10-13).

## One-click deploy after publication

This repository is pre-release. Do not expose a clone/deploy link before the source release is authorized and the public-release checklist has passed. After publication, an optional UI or landing-page deploy link may be enabled only by setting `NEXT_PUBLIC_TRIPPY_REPOSITORY_URL` to the reviewed public repository URL. Leaving it empty keeps the link absent.

That value is public browser configuration, not a secret, and it does not publish a repository, deploy an instance, or prove connector availability. A one-click flow creates a new independent deployment; its operator must still choose environment variables, review the privacy boundary, and validate the result.

## Path to authenticated sync — not implemented

Authenticated storage is a future product phase, not a configuration switch. Before accepting private cloud trips, implement and independently review these phases:

1. **Identity and ownership:** authenticated accounts, per-user and shared-workspace authorization, and explicit device/session management.
2. **Durable trip storage:** encrypted-at-rest normalized trip records, per-user key/secrets handling, backup/recovery, and safe local-to-account migration with explicit user confirmation.
3. **Private import workflow:** a durable review/approve/reject ledger, retention/deletion controls, audit records, replay protection, and no automatic booking-state mutation.
4. **Sync operations:** versioning, conflict handling, export/delete controls, cross-device tests, observability that excludes sensitive content, and a privacy/security review before enabling hosted private data.

Until those phases are complete, local-private is the only mode intended for private trip data.
