# Help friends plan together

Use this prompt with your travel agent when several people want to suggest or edit an itinerary. See [the phased collaboration plan](../docs/COLLABORATION.md) for future implementation contracts.

> Help us plan this trip together using TRIPPY's AGENTS.md and new-trip workflow. Establish our current mode and what this installation actually supports. Keep one reviewed current plan and preserve suggestions, rejections and unresolved conflicts. Do not publish, invite people, send messages, access private bookings or spend on research without the relevant authorization. Manual planning must work without keys.
>
> Ask one compact batch only for missing decisions: who will review the final plan; which friends should see what; which dates/events/budget constraints are locked; what changes friends may propose; and whether we want local file exchange or future hosted sharing. Do not request secrets or document/booking identifiers.
>
> Preview the exact redacted planning content intended for friends. Keep raw emails, links, booking references, confirmation numbers, seats, loyalty IDs, contact addresses and credentials outside the shared record. Redaction does not make our real itinerary public sample data.
>
> Each friend's suggestion should state the activity, city, proposed day/time, reason, duration/cost assumptions, source and checked-at time where relevant, alternatives and conflicts. Distinguish researched facts, quotes, estimates and recommendations. A suggested activity or selected stay is not a booking.
>
> Show the current plan and each proposed change together. Preserve conflicting suggestions and ask for a choice only when necessary. Do not overwrite another person's work silently. Present additions, removals and moves for review before changing the normalized record. Use the current schema, validate the result, and retain a decision receipt in the supported local/private location. Never imply that file author names are verified accounts.

## Walkthrough using what works today

1. **Start the shared discussion.** Create a generic draft in `/plan`, preview it and accept it. Download the accepted planning JSON locally. Reloading `/plan` clears its session; keep your own approved copy. This draft records the trip outline, not a fully editable daily activity atlas.
2. **Decide what friends need.** Review dates, destinations and preferences before sending anything yourself. Send only approved sanitized planning content. TRIPPY does not create a protected shared link or send the file for you.
3. **Collect suggestions.** Friends can return plain-language ideas or agent-proposed normalized drafts. A generic draft can be validated and previewed in `/plan`; whole-record acceptance needs manual comparison with the current draft. New activities are separate suggestions until the generic activity/editor milestone is implemented.
4. **For the existing sample atlas, exchange supported decisions.** Where workspace bundle download is exposed, download the sanitized `.trippy` snapshot and retain a copy locally. Friends using the same catalogue can propose day assignments, priorities and existing hotel/transport selections. Preview their returned bundle in the update inbox. Current v1 cannot add activities, rewrite dates/cities or infer bookings.
5. **Review against the latest plan.** Watch especially for a day list, saved-items list or research-evidence list replacing your latest list. Current bundles do not detect stale revisions or merge simultaneous edits. Accept only the changes you have reviewed; if the proposal needs partial reconciliation, prepare a narrower corrected proposal and preview again. Discarding a preview leaves the plan unchanged.
6. **Share the agreed copy yourself.** Tell friends which version is current and what remains unresolved. A downloaded file is a copy and cannot be revoked. Browser-local atlas choices are not a hosted backup.

For example, one friend suggests a museum while another suggests a food walk during the same afternoon. Retain both proposals and their timing/cost evidence. Show the overlap, choose one or adjust the schedule, then save the accepted plan. Do not label either activity confirmed because the group prefers it.

## Experience after the future milestones

With the generic editor and versioned proposals, friends will be able to add their own activities, move them between days and return a proposal tied to the copy they received. The owner will see “original / current / proposed” for conflicts and accept a combined plan. These controls are planned, not available just because a `.trippy` file exists.

With authorized hosted groups, the owner will invite authenticated viewers or editors, choose whether activity edits require review, and revoke future access. Friends will see revision/history and clear conflict prompts across devices. Private booking details will remain separately protected. A shareable website instance alone does not provide these capabilities. See [deployment modes](../docs/DEPLOYMENT_MODES.md).
