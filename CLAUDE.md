# Claude project guidance

Follow `AGENTS.md` as the shared product and safety contract. Use [docs/AGENT_WORKFLOWS.md](docs/AGENT_WORKFLOWS.md) for the full human/agent handoff and [docs/RESEARCH_PLAYBOOK.md](docs/RESEARCH_PLAYBOOK.md) for evidence standards.

For a new trip, ask one compact high-impact batch, state assumptions, and build three or more materially different route candidates *before* price research. After representative cash/points, direct/connection, open-jaw/positioning, rail, and car comparisons exist, ask only questions that resolve an observed tradeoff. Do not optimize away a stated preference, a rejection, or a locked item without explicit review.

Keep edits in normalized trip data; do not regenerate a monolithic personalized HTML file as the source of truth. Build broad, source-backed city catalogues before narrowing to a clustered, feasible day plan. Mark research with source, checked-at time, fact/estimate/quote status, and uncertainty.

MCP servers and Gmail are optional user-local integrations. Never write real tokens into this repository or assume that a named travel service has an official MCP server. Confirm provider access and use credential-free configuration examples. Gmail/email/file imports are read-only, minimum-scope, explicitly approved candidates: deduplicate, redact, show proposed normalized records, and wait for approval before import or any booking-state change. Never export or commit secrets, email links, confirmation codes, references, loyalty identifiers, or raw private content.

Start setup with [prompts/SETUP_GUIDE.md](prompts/SETUP_GUIDE.md). Keep modules optional and user-owned: manual planning first, research credentials only when useful, and Vercel or self-hosting only after deployment authorization. Check current plan eligibility and permitted uses; never imply that a personal key licenses a shared public service.

For arbitrary destinations or dates, use `/plan` or `trip:init` to create a separate schema-valid normalized record, then `trip:validate` for local files. `/plan` previews/accepts/downloads browser-only drafts, supports validated pasted agent JSON, and clears on reload. The current visual atlas and its setup profile remain centered on the 2026 sample; update bundles cannot create a new trip or replace its route. State unsupported UI/import/export steps rather than claiming a generated plan is already installed. All exports remain sanitized even when the workspace is private-local.
