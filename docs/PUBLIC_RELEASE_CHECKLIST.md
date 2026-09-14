# Public release checklist

This is a blocking release gate, not authority to publish, deploy, make a repository public, or create a remote. Mark an item complete only from the exact proposed release artifact, not from a local assumption.

## Product and fallback behavior

- [ ] A clean checkout starts and supports sample/manual planning with zero keys, providers, connectors, or agents.
- [ ] Route, dates, transport, stays, activities, map/list fallbacks, and daily itinerary behavior are accurate and accessible.
- [ ] Ideas, quotes, selections, holds, availability observations, and confirmed bookings remain visibly distinct; `booked` needs a reviewed confirmation record.
- [ ] Cash, points, taxes/fees, traveler valuation, timestamps, source/coverage limits, and unknown/stale states are clear.
- [ ] Optional provider failures preserve manual entry and do not expose account data, raw errors, or private responses.
- [ ] Gmail/file import is explicit, scoped, read-only, reviewable, and cannot automatically change itinerary or booking state.

## Credentials, privacy, and data rights

- [ ] `.env.example` has placeholders only; `.env.local`, secrets, OAuth files/tokens, local connector configuration, sessions, and private data are ignored and absent from the release artifact.
- [ ] No API keys, email addresses, Gmail URLs/message IDs, confirmation/booking references, record locators, loyalty IDs, seat assignments, raw emails/files, or personal trip data appear in files, logs, screenshots, exports, source maps, bundles, or generated assets.
- [ ] Public samples were created deliberately, pass `npm run sample:validate` and `npm run privacy:check`, and have a human redaction review.
- [ ] OAuth/import behavior uses least privilege, explains consent/retention/deletion/disconnect, and does not request send/delete access for read-only extraction.
- [ ] Public/story export has a redaction preview and omits private fields and source references.
- [ ] Terms, attribution, and redistribution rights are documented for every enabled provider, map/tile service, photo, font, icon, and sample-data source.

## Connectors and deployments

- [ ] Each enabled connector/MCP was verified as available in its target host; no provider is represented as having an official connector without provider documentation.
- [ ] Each integration documents its purpose, scope, source timestamp, geography/inventory coverage, cost/quota, cache/freshness behavior, limitations, and manual fallback.
- [ ] Provider/server keys remain server-side. Any browser-visible map token is separate and restricted to exact deployed domains/APIs.
- [ ] Production configuration leaves `TRIPPY_ALLOW_PRIVATE_LOCAL=false`, has no private itinerary path, and uses host secret settings rather than `.env.local`.
- [ ] Vercel/local environment settings and deployment URLs have been reviewed for unintended public access, debug endpoints, and private artifacts.

## Repository and review readiness

- [ ] Intended Git history is clean: no personal repository ancestry, secrets, private artifacts, or unsuitable assets remain reachable.
- [ ] CI/release verification runs lint, type checks, tests, build, sample validation, privacy checks, and a dedicated history-aware secret scan.
- [ ] Keyboard, contrast, reduced motion, mobile, print/export, offline/provider-failure, and map-list fallback flows are tested.
- [ ] README, setup, security reporting, contributing guidance, licenses, dependency/vulnerability policy, and privacy disclosures are current.
- [ ] An independent reviewer inspected staged files, history, generated artifacts, deployment settings, and this checklist.
- [ ] A named release owner separately authorizes publishing after all blocking items pass.

## Decision

- `READY` — every applicable blocker is complete, independently reviewed, and separate publication authorization exists.
- `READY_FOR_OWNER_REVIEW` — automated and independent technical gates have no known blocker, but publication remains unauthorized until the owner reviews the exact candidate and explicitly approves it.
- `NOT_READY` — ordinary work remains; do not publish.
- `BLOCKED` — an external dependency or decision prevents completion.

**Current status: `READY_FOR_OWNER_REVIEW`.** The exact local candidate passes lint, type checks, 43 tests, sample validation, a production build, current-tree privacy checks, and a history scan that includes commit metadata. A bounded independent audit found and prompted removal of inherited personal Git metadata. The production Vercel home and redacted provider-health endpoint return successfully. The repository has no remote and has not been published. Owner review and a new explicit publication approval are still mandatory.
