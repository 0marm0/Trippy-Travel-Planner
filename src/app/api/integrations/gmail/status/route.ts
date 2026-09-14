import { cookies } from "next/headers";

import { gmailConfigurationStatus, requireGmailImportConfig } from "@/lib/imports/gmail/config";
import { openPrivatePayload } from "@/lib/imports/gmail/crypto";
import { GMAIL_PRIVATE_HEADERS } from "@/lib/imports/gmail/http";
import { hasExactGmailReadOnlyScope, type GmailTokenSession } from "@/lib/imports/gmail/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE = "trippy_gmail_session";

export async function GET(): Promise<Response> {
  const configuration = gmailConfigurationStatus();
  if (!configuration.enabled) {
    return Response.json({ enabled: false, connected: false }, { headers: GMAIL_PRIVATE_HEADERS });
  }
  const config = requireGmailImportConfig();
  const sealed = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = openPrivatePayload<GmailTokenSession>(sealed, config.sessionSecret, "gmail-token-session");
  const connected = Boolean(session && session.expiresAt > Date.now() + 15_000 && hasExactGmailReadOnlyScope(session.scope));
  return Response.json({ enabled: true, connected }, { headers: GMAIL_PRIVATE_HEADERS });
}
