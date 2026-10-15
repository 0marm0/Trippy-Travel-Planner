# Optional private accounts

`/account` provides signup, signin, signout, reviewed plan loading, sanitized JSON downloads, individual plan deletion and password-confirmed account deletion. `/plan` can save the current workspace as a new encrypted private copy or update a previously loaded copy. Signing in never uploads a draft automatically. Manual and browser planning work with accounts disabled.

Accounts use self-hosted Better Auth 1.7.7 with email/password authentication. Authentication tables contain account email, display name, password hashes and sessions on the user's server; these are never trip fields or exports. Every account-plan endpoint validates the database-backed session, scopes queries to that user, disables caching and requires same-origin writes. Session cookie caching is disabled so revoked sessions cannot bypass a database check. Better Auth rate limits use database storage. A plan ID grants no access.

## User-owned setup

Set these names privately in untracked `.env.local` or the host's secret manager:

- `PRIVATE_ACCOUNTS_ENABLED=true`
- `BETTER_AUTH_URL`: the exact public HTTPS origin, or loopback HTTP for development.
- `BETTER_AUTH_SECRET`: a separate random secret of at least 32 characters.
- `PRIVATE_ACCOUNTS_ENCRYPTION_KEY`: a separate random 32-byte key encoded as 64 hex characters.
- `PRIVATE_ACCOUNTS_DATABASE_URL`: the user's Postgres connection string for Vercel or multiple servers; leave unset only on one persistent full Node server.

Generate keys locally using an appropriate secret manager. Never paste values in chat, commit them, expose them through `NEXT_PUBLIC_*`, reuse another module's key or include them in screenshots. No accounts, hosted database, provider account, billing resource or deployment are provisioned by this implementation.

With Postgres unset, storage is `.private/accounts/accounts.sqlite`. The parent directory and database use restricted permissions, and symlinked ancestry is rejected before opening the database. Use a durable private disk and one server. Serverless environments fail closed without Postgres. Initialization runs Better Auth's official migration API and creates the private-plan table lazily after configuration is valid. Back up the database and both secrets separately in private custody. Losing the encryption key makes stored plans unreadable. Key rotation/migration requires an explicit operator procedure; changing it in place does not rotate existing ciphertext.

## Plan privacy and conflicts

Only valid generic workspaces can be stored. Existing schema/privacy checks exclude email addresses, raw mail, links, credentials, confirmations, booking references, loyalty identifiers and seat assignments. Booking state remains normalized decision data; account storage does not import booking confirmations or alter the specialized 2026 atlas.

Each workspace is AES-256-GCM encrypted with a fresh nonce and authenticated owner/plan identity. Trip names, dates, activities and notes are inside ciphertext. Owner IDs, random plan IDs, revisions and modification times remain database metadata. Encryption protects database copies; the server holding the key can decrypt plans, so this is not end-to-end encryption. Transport security requires HTTPS. Account authentication data is protected by Better Auth's password hashing, session/cookie mechanisms and server/database custody, not the plan encryption key.

Each account can store at most 20 plans. Each serialized UTF-8 workspace is limited to 2,000,000 bytes, giving a maximum 40 MB of planning plaintext per account before AES-GCM/base64 overhead (approximately 53.4 MB of ciphertext text, plus database metadata, WAL and backups). Atomic creation uses a SQLite immediate transaction or a Postgres transaction locking the account row before counting, so concurrent saves cannot exceed the cap. At capacity, new saves return HTTP 429 and preserve the browser draft; delete a stored plan to reclaim a slot. Updates remain within the byte bound.

Enabling accounts also permits email/password enrollment. Better Auth authentication endpoints have database-backed rate limits; plan capacity does not limit the total number of registered users or repeated API traffic. Operators remain responsible for enrollment/access policy, host request limits, total database/disk quotas and private backups before exposing a server. No public deployment or unrestricted-host enrollment is authorized by this implementation.

Updates and deletes require a current `If-Match` revision. Stale writes return HTTP 412 and leave the draft intact. Explicitly preview and accept the current stored version before replacing a draft; no automatic overwrite retry occurs. Downloads revalidate the decrypted workspace and contain sanitized planning data only. Real trip exports still belong in private storage.

Account deletion requires the current password and removes owned plans, authentication records and sessions. Previously exported files, browser drafts, named device snapshots, local scenarios and private backups are outside server deletion; the traveler controls those copies. A failed account deletion can leave an account present after plans were removed; the operation never restores deleted plans.

## Local scenarios and snapshots stay separate

`/plan` → **History** creates reviewed local scenario copies and named device snapshots. Scenario duplication generates a new trip ID/name without creating a new account owner, reservation or confirmation. Booking records/details and booking receipts are excluded by default; an explicit alternative retains the same original recorded bookings and exact states. A downloadable copy receipt records provenance, omissions and unchanged source timestamps. Research, quote and route-scenario identities are rebound only for an otherwise identical trip; this does not refresh their evidence.

Named snapshots store complete validated workspaces separately from account plans, using versioned local-storage keys per trip ID with an eight-snapshot/4 MB bound. Restore previews activity/day/booking/evidence changes, rechecks current workspace and saved-snapshot identity, and requires either a successful safety snapshot of the current open copy or an explicit discard choice. Quota/storage failures preserve the current open workspace. These records are visible to other users of that browser profile; no account session or room capability enters them. Opening a scenario or restoring a snapshot resets automatic local saving and stays in memory until an explicit save. Account save/load, device-library indexing and snapshot storage remain distinct actions. Deleting an account does not remove these browser copies. Evidence: [`workspace-scenarios.ts`](../src/lib/workspace-scenarios.ts), [`workspace-history.ts`](../src/lib/workspace-history.ts), [`workspace-history-tools.tsx`](../src/components/workspace-history-tools.tsx).

## Optional password recovery

Recovery is disabled by default. `createAccountSystem` accepts an optional `sendPasswordReset` transport adapter; a server administrator must implement and explicitly authorize their own private delivery service before enabling recovery. The adapter receives sensitive recipient/reset information and must not log it. No real email transport or outbound message is configured. Synthetic tests use only an in-memory mocked transport and verify reset revokes prior sessions. The current UI does not expose a recovery flow; signin/password-confirmed deletion are supported.

## Evidence and limits

Synthetic SQLite tests exercise actual Better Auth HTTP signup/signin, invalid password/session rejection, logout and revocation, account deletion, recovery through a mocked adapter, tenant-isolated CRUD, stale-write/delete rejection, encrypted-at-rest content, restart persistence, unsafe-record refusal and symlink refusal. Postgres is implemented using the existing `pg` driver but has not been exercised against a user-owned remote database. No hosted persistence, outbound email, provisioning or deployment readiness is claimed.

Official implementation references: [Next.js integration](https://better-auth.com/docs/integrations/next), [SQLite adapters](https://better-auth.com/docs/adapters/sqlite), [user/account lifecycle](https://better-auth.com/docs/concepts/users-accounts).
