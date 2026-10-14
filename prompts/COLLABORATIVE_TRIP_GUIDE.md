# Plan a trip with friends

Use this prompt with your travel agent for reviewed file proposals or optional live planning rooms. See [the current collaboration workflow](../docs/COLLABORATION.md).

> Help us plan together using the actual supported surface. Ask one compact batch only for missing decisions: who owns the plan; which dates, events and constraints are locked; what friends may see and edit; and whether we want file exchange or a configured live activity/day board. Preserve alternatives, rejections and unknowns. Never request secrets or booking/traveler identifiers in chat.
>
> For live planning, prepare a share-safe board for `/collaborate` and let the owner review it before publication. Owners manage dates/cities and editor/viewer invitations; editors add activities and arrange days; viewers read. Keep bookings, private identifiers, raw imports and provider credentials separate. Explain that capability holders have the role and revocation affects only future access. TRIPPY does not send invitations. Do not provision a database or deploy without authorization; a persistent Node/SQLite server or user-owned Postgres must be configured first, and remote or production creation requires a creation code entered privately in the masked field.
>
> For a conflict, preserve the unsaved draft and latest revision. Show the conflicting planning choices and require explicit reconciliation or reload; do not retry an unconditional overwrite. Live rooms poll every four seconds and are separate from the detailed sample atlas and browser-only `/plan` drafts. They do not offer account recovery, merge history or a booking approval ledger.
>
> For file exchange, validate and preview normalized `/plan` records before whole-record acceptance. For the sample atlas, use supported known-ID `.trippy` proposals and review any list replacement manually against the latest plan. Files cannot be revoked and v1 bundles cannot add activities or detect simultaneous edits. New attractions may stay separate suggestions or be added to an authorized live board. Never label an activity confirmed because the group likes it.

The owner chooses recipients and sends only reviewed content through their own channel. [Live setup and limits](../docs/LIVE_COLLABORATION.md) · [Deployment modes](../docs/DEPLOYMENT_MODES.md) · [Agent workflow](../docs/AGENT_WORKFLOWS.md).
