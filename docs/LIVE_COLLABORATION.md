# Live collaboration

Manual planning and the reviewed public sample work without collaboration configuration or provider accounts. Live collaboration publishes only the reviewed planning board: trip title and dates, cities, activity catalogue, and activity assignments to days. It does not share booking records, booking states, prices, raw email, private trip DTOs, or provider credentials.

## Run on one persistent local server

Use Node 22.18+ or Node 24. Set `COLLABORATION_ENABLED=true` in untracked `.env.local`, then run the app. The Node server persists rooms and hashed access capabilities in ignored `.private/collaboration/rooms.sqlite`. Keep that directory on persistent storage and include it in your private backup process. `COLLABORATION_SQLITE_PATH` may select another database file inside that directory. A restarted server using the same database retains rooms, revisions, and revoked invitations.

SQLite mode serves several browsers connected to that same server. It is intended for one server with a persistent disk, not horizontally scaled instances or ephemeral serverless filesystems. Vercel, AWS Lambda, and Google Functions fail closed in local SQLite mode. Room API responses are private and never cached.

For remote browser access or any production server, configure `COLLABORATION_CREATE_CODE` in the untracked server environment: a privately generated value of 16–256 characters without whitespace. The room creator enters it in a masked field; the browser sends it only as `X-Trippy-Create-Code`. Do not put the value in a link, trip record, screenshot, or tracked file. A remote or production host without a valid configured code denies room creation; existing capability-based rooms remain accessible. Only development/test loopback creation can omit the code when none is configured. Production requires it even if an incoming Host claims localhost. Status reports only whether a code is required and creation is available. Production SQLite paths reject symbolic-link directories/files and verify that storage resolves inside the private collaboration directory.

Origin checks use the validated incoming `Host` authority rather than Next's internal request hostname, so a browser opening `127.0.0.1` is not rejected when Next internally uses `localhost`. Foreign browser origins and cross-site fetch metadata remain blocked. An HTTPS reverse proxy must preserve the public Host. If it terminates TLS before a plain-HTTP Node server, set `COLLABORATION_TRUST_PROXY=true` only when that trusted proxy overwrites `X-Forwarded-Proto` with exactly `https` or `http` and direct untrusted ingress cannot supply it. Vercel's managed ingress supplies that scheme. Forwarded Host and multi-value scheme chains are never trusted.

## User-owned hosted storage

For multiple application instances or a serverless host, configure a user-owned Postgres database using `COLLABORATION_DATABASE_URL` alongside `COLLABORATION_ENABLED=true`. The app creates two namespaced tables for rooms and capabilities. Configure TLS through your database provider's supported connection settings; the app does not disable certificate verification. The database account must have permission to create these tables and read/write them. Database hosting, billing, backups, network controls, and deployment are the operator's responsibility. Implementation does not provision a service or deploy the app.

The Postgres adapter uses transactions, row locks, and conditional updates, with bounded connection, statement, and idle-transaction timeouts. SQLite uses immediate write transactions and serializes transactions inside the running server. Postgres integration requires a configured database; local automated tests exercise SQLite, including restart durability. No hosted database was provisioned or contacted for these tests.

## Share and access

The owner reviews the share-safe board before creating a room. Invitation capabilities grant editor or viewer access; they do not establish a person's identity. Anyone possessing a capability has its role, so share links only with intended recipients. Links carry capabilities in the URL fragment and the browser sends them in the Authorization header, never in query parameters or trip records. The server stores SHA-256 hashes, not plaintext capabilities. Room identifiers alone do not grant access. No email is collected and invitations are not sent automatically.

Owners change the trip frame, create expiring editor/viewer invitations, revoke them, replace owner access and delete rooms. New invitations default to seven days and permit a chosen expiry within 30 days; legacy invitations without an expiry remain valid until revoked. Expiry/revocation is checked during reads and inside write transactions. Editors change activities and day assignments. Viewers read the board. Only owners can list the persisted invitation identifiers and roles; the original invitation token is returned once and cannot be recovered from its hash. Keep the owner capability privately: losing it means losing owner access. Replacing the owner link revokes old owner access and returns the new capability once, while existing editor/viewer invitations retain their roles. Rotation and deletion require the observed revision and an explicit review/approval. An interrupted response can have an unknown outcome; do not blindly retry rotation. Deletion removes the room and all its stored capabilities; subsequent access fails, while already-viewed/local/exported copies cannot be erased. Revocation denies subsequent reads and writes; it cannot erase a copy someone already saw.

There is no public room directory, account login, booking action, calendar action, or export endpoint. Capability access is separate from the existing local trip planner's data and permissions. The public sample endpoint explicitly calls `loadCurrentTrip({ allowPrivate: false })` and projects only catalogue fields and reviewed day assignments to known retained activities; it never uses the private-data gate. Metadata reports retained catalogue items, scheduled activities/days, and omitted catalogue items. Duplicate or unavailable activity assignments are omitted.

## Conflicts and privacy

Every write requires the last observed revision through `If-Match`. A stale write returns HTTP 412 and the latest safe state. The UI preserves its board and unfinished activity form; saves pause until explicit review. Reconciliation compares original, local and latest states by field/entity and ordered day assignments. Conflicts require choices; compatible independent edits have editable suggestions. Another revision or local change invalidates the review. Final validation rejects deleted references, duplicate assignments and out-of-range dates, then the owner/editor explicitly saves the chosen draft. There is no unconditional overwrite or automatic retry.

With consent, device recovery stores only a validated board plus its base/revision under a room-specific key. Reload offers review before restoration; disabling retention removes the copy. Access capabilities stay in the separate session flow, and unfinished forms/import text/creation codes are excluded. Other users of the same browser may see retained boards. Header-link/unload warnings help preserve edits but are not a guarantee for every browser-history navigation.

Validated board JSON can be downloaded and previewed/imported by an owner or in a local board before sharing. The generic workspace’s “Prepare shared activity board” projects cities, manual coordinates, activities and day assignments into this format. Bookings, research, account identities and tokens never transfer. Review the replacement board before applying it; creating/publishing a room remains a separate approval. File handoff does not establish ongoing synchronization with the generic workspace or atlas.

The schema bounds strings, cities, activities, day assignments, dates, and request size; checks referential integrity; rejects unsupported fields; and blocks common personal identifiers, email addresses, mail links, credentials, and booking-reference labels. Activity images permit only local reviewed media paths. Attributable source links permit HTTPS without userinfo, query parameters, or fragments. These checks cannot recognize every private fact expressed in prose. Review all notes and titles before publishing and never enter confirmation codes, traveler email addresses, seats, loyalty details, or secrets into the collaboration board.

This implementation offers polling, persistent room state, explicit reconciliation, consent-based local recovery, expiring/revocable invitations and reviewed owner rotation/deletion. It has no presence, owner-capability recovery, automatic merge, audit history, end-to-end encryption or automatic room expiry. Optional private accounts are a separate module; they do not recover a lost room capability. See [private accounts](PRIVATE_ACCOUNTS.md). A public internet operator should supply request throttling and storage retention controls appropriate to the deployment; the app does not pretend the capability model is an enterprise identity system.

## API

All room requests use `Authorization: Bearer <capability>`, apart from room creation. JSON bodies reject unknown fields. Mutations reject cross-origin browser requests. No route accepts capability query parameters.

| Method and path | Request | Result |
| --- | --- | --- |
| `GET /api/collaboration/status` | none | Safe configured mode, explanatory message, `creationCodeRequired`, `creationAvailable` |
| `GET /api/collaboration/sample` | none | `{ state, metadata }` from the reviewed public sample |
| `POST /api/collaboration/rooms` | `{ state }`, creation-code header when required | `{ roomId, ownerToken, revision, state }` |
| `GET /api/collaboration/rooms/[id]` | capability | `{ roomId, role, revision, state }`; owners also receive invitation inventory |
| `PATCH /api/collaboration/rooms/[id]` | capability, `If-Match`, `{ state }` | Updated revision, or 412 with latest safe snapshot |
| `POST /api/collaboration/rooms/[id]/invites` | owner capability, `{ role: "editor" \| "viewer", expiresAt?: ISO UTC }` | `{ inviteId, token, role, expiresAt }` |
| `DELETE /api/collaboration/rooms/[id]/invites/[inviteId]` | owner capability | `{ revoked: true }` |
| `POST /api/collaboration/rooms/[id]/owner-token` | Owner capability, `If-Match`, `{}` | New one-time owner token and incremented revision; old owner denied |
| `DELETE /api/collaboration/rooms/[id]` | Owner capability, `If-Match` | Deletes room/capabilities; stale access denied |

Run `node --experimental-strip-types --test tests/collaboration.test.mjs` to exercise roles, stale concurrent edits, revocation, disk persistence, token hashing, privacy projections, request constraints and serverless fail-closed configuration using invented records. `tests/reconciliation.test.mjs` and `tests/room-lifecycle.test.mjs` additionally exercise choices/reference conflicts, credential-free recovery, invitation expiry, rotation and deletion. Hosted Postgres remains untested against a user-owned database.
