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

```bash
npm install
npm run check
```

Keep the change narrow and describe:

- the traveler-facing outcome and any decision tradeoff it changes;
- affected data state, source/freshness semantics, and manual fallback;
- privacy/security impact and test coverage; and
- keyboard, mobile, and non-map fallback checks for interaction changes.

Do not deploy, publish, alter a provider account, make bookings, send email, or mutate a calendar as part of a contribution unless explicitly authorized.

## Integrations and agents

Adapters must be provider-neutral and optional. Use only connectors/MCPs actually installed in the relevant ChatGPT, Codex, Claude, or other host; do not claim that a named provider has an official connector. Prefer read-only, least-privilege access. Gmail and calendar imports must be explicit, narrow, reviewable, and redact raw content and identifiers from all public-facing artifacts.

Provider keys belong in `.env.local` or a deployment secret manager. Never log or request their values. Tests use placeholders, fakes, or invented fixtures; a configuration test may report only redacted presence/status.

## Privacy and security reports

Never attach real confirmations, emails, boarding passes, booking PDFs, API responses, screenshots containing private data, environment files, or local connector configuration to an issue or pull request. If you find a secret or personal-data exposure, follow [SECURITY.md](SECURITY.md) rather than opening a public issue.

Before a release, the release owner must perform the clean-history and artifact checks in [the public release checklist](docs/PUBLIC_RELEASE_CHECKLIST.md). Passing local checks does not authorize publication.
