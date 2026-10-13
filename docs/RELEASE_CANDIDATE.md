# Publication candidate

This document describes the exact local source candidate. It is not authorization to create a remote repository or make anything public.

## Included

- The redacted 2026 Europe sample and the generic city-break example.
- Manual planning, route, map, itinerary, hotel, activity, research, export, onboarding, and connector surfaces.
- Optional server-side SerpAPI, Seats.aero, Rooms.aero, Booking.com, and read-only Gmail adapters.
- Zero-key manual fallbacks, provider limitations, privacy controls, tests, and CI.
- Generic `/plan` draft/review/agent-handoff, private-local trip initializer and shared schema validation.
- Reviewed bundled photos, metadata stripping, exact media inventory and portable photo exports.

## Excluded by Git ignore rules

- `.private/` and all local traveler data.
- Every `.env` variant except `.env.example`.
- OAuth clients, tokens, email/calendar files, keys, certificates, and local MCP configuration.
- Vercel project state, build caches, browser recordings, screenshots, generated exports, and local QA output.

## Candidate gate

Run:

```bash
npm ci
npm run release:check
```

The release gate verifies lint, types, unit tests, sample structure, a production build, the current-tree privacy rules, staged filenames, credential-shaped staged values, commit author/committer email metadata, all reachable Git history, reviewed media, production dependency advisories, and private-file exclusions in build traces. GitHub secret scanning and a separate human review remain required.

Current dated findings and limitations are in [the release report](RELEASE_REPORT.md).

## Publication boundary

Before publication, inspect `git status --short`, `git diff --cached --stat`, and the staged file list. The owner approved creating the private staging repository on 2026-10-13 after reviewing the preceding candidate. The private remote is `0marm0/Trippy-Travel-Planner`; pushing the verified updated source is in scope. Public visibility and deployment require separate explicit authorization.
