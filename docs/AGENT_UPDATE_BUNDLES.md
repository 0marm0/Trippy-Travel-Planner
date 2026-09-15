# Agent update bundles

TRIPPY update bundles are local files for reviewing proposed planning decisions. Importing a bundle does not directly write workspace state. The browser validates and sanitizes it, compares it with the current workspace, and waits for the traveler to accept or dismiss the visible diff.

The flow is intentionally narrow:

1. An agent produces a `.trippy` or JSON file that conforms to [`schema/trippy-update.schema.json`](../schema/trippy-update.schema.json).
2. [`UpdateInbox`](../src/components/update-inbox.tsx) reads the file in the browser. The raw text is not sent to an API, written to storage, or retained in component state.
3. [`parseTrippyUpdateFile`](../src/lib/trippy-bundle.ts) enforces the 192 KB limit, allowlists fields, checks bounded collection sizes, and removes markup, links, email addresses, confirmation-like details, and credential-like text.
4. `reviewTrippyUpdate` checks every referenced date and ID against the canonical trip scope supplied by the host. Unknown items are filtered and disclosed.
5. Only an explicit **Accept reviewed changes** action invokes the host callback. The inbox never writes `localStorage`, changes normalized trip data itself, or calls a provider.

## Allowed decisions

A bundle may propose only:

- activity-to-date assignments;
- `must`, `should`, or `could` activity priorities;
- saved activity and hotel IDs;
- selected transport option and hotel IDs;
- sanitized research-evidence metadata: canonical subject, evidence kind, source name, checked-at time, summary, and limitations.

Maps may use `null` to clear an existing priority or selection. Arrays are complete replacements when present. Omitted fields remain unchanged.

Research evidence is planning context, never booking authority. Its kinds are `fact`, `quote`, `estimate`, `recommendation`, `manual`, `historic`, and `unavailable`. There is deliberately no `held` or `confirmed` evidence kind.

## Prohibited content and effects

The format cannot represent bookings, holds, confirmations, contact details, seat assignments, loyalty identifiers, provider tokens, secrets, raw provider responses, arbitrary URLs, HTML, email contents, calendar changes, purchases, or messages. Unsupported fields are removed before a parsed bundle is returned. Invalid supported fields block the review.

Accepting a bundle only returns a safe `TrippyWorkspaceState` through a callback. It does not infer or change canonical booking status. Confirmation still requires the repository’s separate private review workflow.

## Host integration

The host owns canonical IDs and state mutation. Build the scope from the trip payload instead of trusting IDs declared by the bundle:

```tsx
import UpdateInbox from "@/components/update-inbox";
import type { TrippyBundleScope, TrippyWorkspaceState } from "@/lib/trippy-bundle";

const scope: TrippyBundleScope = {
  tripId: data.id,
  dates: tripDates,
  activityIds: data.activities.map((item) => item.id),
  transportOptions: Object.fromEntries(
    data.transport.map((leg) => [leg.id, leg.options.map((option) => option.id)]),
  ),
  hotelOptions: Object.fromEntries(
    data.stops.map((stop) => [stop.id, data.hotels.filter((hotel) => hotel.city === stop.id).map((hotel) => hotel.id)]),
  ),
};

<UpdateInbox
  currentState={state}
  scope={scope}
  onAccept={(nextState: TrippyWorkspaceState) => setState(nextState)}
/>
```

The component is standalone and is not mounted automatically. This keeps placement and canonical state ownership with the workspace integrator.

## Minimal update

```json
{
  "format": "trippy-workspace-update",
  "version": 1,
  "kind": "update",
  "bundleId": "route-review-2",
  "tripId": "europe-2026",
  "createdAt": "2026-09-14T12:30:00Z",
  "summary": "Move one activity and select the reviewed train option",
  "changes": {
    "assignments": {
      "2026-09-22": ["museum", "gate"]
    },
    "selectedTransport": {
      "leg-1": "train"
    }
  }
}
```

## Safe export

`buildTrippyWorkspaceBundle` and `serializeTrippyWorkspaceBundle` produce a sanitized `snapshot` from the current state. Both require the same canonical scope and filter anything outside it. `downloadTrippyWorkspaceBundle` is a browser-only convenience that downloads the serialized snapshot; it does not persist the bundle.

Run the focused checks with:

```sh
node --experimental-strip-types --test tests/trippy-bundle.test.mjs
npm run typecheck
npm run lint
```
