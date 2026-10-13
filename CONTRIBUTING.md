# Contributing to TRIPPY

TRIPPY welcomes focused improvements to manual trip planning, accessibility, privacy, provider-neutral adapters, decision logic, tests, and documentation.

## Contribution principles

1. Start from redacted or invented data. Never use another traveler’s trip, confirmation, inbox, API response, or screenshot as a fixture.
2. Keep sample/manual mode useful with zero keys, paid providers, connectors, or agents.
3. Preserve the difference between an idea, quote, selection, hold, availability observation, and confirmed booking.
4. Add source, checked-at time, coverage/limitation, price/fee basis, and fallback to new external data paths.
5. Do not imply an integration is official, available, complete, or booking-capable without direct evidence.
6. Keep credentials, OAuth material, provider responses, and connector configurations local and untracked.

## Before opening a pull request

Use the Node.js runtime documented in [setup](docs/SETUP.md). Install the committed lockfile without provider credentials:

```bash
npm ci
npm run release:check
```

The release gate includes the ordinary quality checks and reachable-history checks. Use a GitHub-provided no-reply commit email or an invented reserved-domain identity for local test commits; do not put personal email addresses into public commit metadata. Scanners report paths and revision IDs rather than secret values. If a check fails, repair or narrow the candidate before sharing it; never disable the privacy gate to make CI green.

Keep the change narrow and describe:

- the traveler-facing outcome and any decision tradeoff it changes;
- affected data state, source/freshness semantics, and manual fallback;
- privacy/security impact and test coverage; and
- keyboard, mobile, and non-map fallback checks for interaction changes.

Run a representative sample/manual flow for affected interactions: select a city, save an invented planning option, assign it to a day, reload to confirm persistence, and inspect a sanitized export. Research changes should verify an unconfigured provider remains useful through its manual fallback. A production build is not evidence that a browser interaction works.

Read [the architecture](docs/ARCHITECTURE.md) and [module boundaries](docs/MODULARITY.md) before restructuring the planner. `/plan` supports generic validated drafts and agent handoff; the detailed atlas still uses a sample-specific payload. A new schema-valid file does not yet create arbitrary-trip daily itinerary/map/quote-selection views. Keep sample dates, media and correction rules out of general domain modules. Evolve schemas, validation and compatibility together, and test missing records as well as invented destinations.

For generic draft changes, preview an invented trip with different cities and dates, accept it, inspect its JSON and agent brief, and confirm that previewing a rejected replacement does not overwrite the accepted draft. Check privacy failures without printing submitted values, and keep download/clipboard actions explicit. CLI changes must preserve private-directory confinement and refusal to overwrite existing files, including adversarial path and symlink cases.

For Next.js changes, read the relevant installed guides under `node_modules/next/dist/docs/` before using APIs. Preserve generated agent guidance and existing local work by other contributors.

Do not deploy, publish, alter a provider account, make bookings, send email, or mutate a calendar as part of a contribution unless explicitly authorized.

## Integrations and agents

Adapters must be provider-neutral and optional. Use only connectors/MCPs actually installed in the relevant ChatGPT, Codex, Claude, or other host; do not claim that a named provider has an official connector. Prefer read-only, least-privilege access. Gmail and calendar imports must be explicit, narrow, reviewable, and redact raw content and identifiers from all public-facing artifacts.

Provider keys belong in `.env.local` or a deployment secret manager. Never log or request their values. Tests use placeholders, fakes, or invented fixtures; a configuration test may report only redacted presence/status.

## Privacy and security reports

Never attach real confirmations, emails, boarding passes, booking PDFs, API responses, screenshots containing private data, environment files, or local connector configuration to an issue or pull request. If you find a secret or personal-data exposure, follow [SECURITY.md](SECURITY.md) rather than opening a public issue.

Before a release, the release owner must perform the clean-history and artifact checks in [the public release checklist](docs/PUBLIC_RELEASE_CHECKLIST.md). Passing local checks does not authorize publication.

## CI and dependency updates

The verification workflow runs on pull requests, pushes to `main`, and manual dispatch. It checks out full history, uses only read permission, keeps the checkout token out of Git configuration, and runs the same `npm run release:check` command used locally. It does not deploy, upload trip artifacts, connect to a mailbox, or require provider keys. Keep contribution workflows on the `pull_request` event; do not execute contributor code in a privileged `pull_request_target` workflow.

Actions are pinned to reviewed full commit SHAs, following [GitHub's secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use). Dependabot proposes monthly action and npm updates; maintainers must review changes and the full gate before merging. An automated update proposal is not approval to expand permissions or bypass checks.
