# Optional Gmail booking-candidate preview

TRIPPY works in sample and manual mode without Gmail. Gmail access is optional, private, read-only, and disabled until the operator explicitly configures it. Email evidence never updates trip truth or changes a booking state.

## Security model

- The integration requests only `https://www.googleapis.com/auth/gmail.readonly`. Google classifies this as a restricted scope; a public production app may require OAuth verification and an appropriate data-handling assessment. Do not replace it with the broader `https://mail.google.com/` scope.
- OAuth starts only from a same-origin JSON `POST`. The callback validates a 256-bit state value in constant time and uses PKCE S256. The short-lived flow cookie and access-token cookie are AES-256-GCM encrypted, authenticated, purpose-bound, `HttpOnly`, `SameSite=Lax`, and `Secure` on HTTPS. Vercel must use HTTPS; loopback HTTP is permitted for local development.
- The flow requests online access only. No refresh token is requested or persisted. The encrypted token cookie expires with the access token (normally about one hour), after which the user reconnects.
- API responses are private and `no-store`. The preview is capped at 20 messages and the query is always constrained to recent travel-message subject terms. User text is quoted and search operators are rejected.
- Raw bodies, sender/recipient addresses, Gmail links, Gmail message IDs, confirmation codes, booking references, loyalty identifiers, seats, OAuth tokens, and secrets are used only transiently on the server when required. They are not returned, logged, exported, or persisted.
- Message content is untrusted input. Parsing extracts a small normalized fact set and applies a final private-data invariant before returning a response.

## Configure localhost or Vercel

1. In a user-owned Google Cloud project, enable the Gmail API, configure the OAuth consent screen, and create a Web application OAuth client.
2. Add the exact authorized redirect URI:
   - Local: `http://localhost:3000/api/integrations/gmail/callback`
   - Vercel: `https://your-approved-domain.example/api/integrations/gmail/callback`
3. Copy `.env.example` to untracked `.env.local` for localhost, or use encrypted Vercel environment variables. Set `APP_BASE_URL` to the exact origin, set the two Google OAuth values, and set a unique high-entropy `TRIPPY_GMAIL_SESSION_SECRET` of at least 32 characters. Do not paste values into source, chat, issues, screenshots, or build logs.
4. Set `TRIPPY_ENABLE_GMAIL_IMPORT=true` only after all values and the redirect URI are ready. Restart or redeploy.

`APP_BASE_URL` must be HTTPS except for `localhost`, `127.0.0.1`, or `::1`. It cannot contain credentials, a path, query, or fragment. Preview deployment domains need their own exact configured origin and redirect URI; do not derive the redirect from untrusted request headers.

## HTTP contract

All endpoints use the Node.js runtime and return `Cache-Control: no-store, private`.

- `GET /api/integrations/gmail/status` returns only `{ enabled, connected }`.
- `POST /api/integrations/gmail/start` requires same-origin `Origin` and `Content-Type: application/json`. It returns an authorization URL and sets the encrypted flow cookie. The client navigates to that URL only after an explicit user action.
- `GET /api/integrations/gmail/callback` validates state/PKCE, exchanges the one-time code server-side, stores only an encrypted short-lived access-token session, and redirects to `/?gmail=connected` or `/?gmail=error` without provider details.
- `POST /api/integrations/gmail/preview` requires the same origin and an active session. Its body is:

```json
{
  "searchTerm": "Paris museum",
  "after": "2026-09-01",
  "before": "2026-10-01",
  "maxMessages": 10,
  "existing": [
    {
      "kind": "flight",
      "startDate": "2026-09-22",
      "originCode": "SFO",
      "destinationCode": "JFK",
      "provider": "United Airlines"
    }
  ]
}
```

`searchTerm`, either date, and `existing` may be omitted. With no `after`, the server limits the query to the last year. A supplied date window can span at most two years. `maxMessages` is 1–20. Existing facts are sanitized comparison inputs only and are not stored.

The response contains normalized candidates with an opaque per-source ID; kind; generic title; recognized provider; dates; airport codes; an optional flight number; `missing` or `conflict` as the suggested state; confidence plus reasons; duplicate indication; and field-level conflict indices. It also states that explicit review is required, no mutation occurred, and persistence is `none`.

- `POST /api/integrations/gmail/disconnect` requires the same origin, clears the local token cookie, and attempts provider revocation. Local disconnection succeeds even if the provider is unavailable.

## Deliberate limitation

This is a stateless, single-browser private preview—not a durable multi-user import system. Serverless instances do not retain message data, and the application has no database-backed user/session/approval ledger. Consequently, there is no “approve and write” endpoint, no background refresh, no cross-device history, and no durable replay prevention beyond the encrypted, expiring, cleared flow cookie. Add those capabilities only with a real authenticated database design, explicit retention/deletion policy, per-user key/session handling, audit records, and a separately reviewed trip-mutation workflow.
