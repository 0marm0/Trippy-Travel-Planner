import { cookies } from "next/headers";

import { requireGmailImportConfig } from "@/lib/imports/gmail/config";
import { openPrivatePayload } from "@/lib/imports/gmail/crypto";
import { GMAIL_PRIVATE_HEADERS, gmailCookieOptions, isSameOriginMutation } from "@/lib/imports/gmail/http";
import { revokeGoogleToken, type GmailTokenSession } from "@/lib/imports/gmail/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE = "trippy_gmail_session";

export async function POST(request: Request): Promise<Response> {
  let config;
  try {
    config = requireGmailImportConfig();
  } catch {
    return Response.json({ error: "Gmail import is not configured" }, { status: 503, headers: GMAIL_PRIVATE_HEADERS });
  }
  if (!isSameOriginMutation(request, config)) {
    return Response.json({ error: "Request not allowed" }, { status: 403, headers: GMAIL_PRIVATE_HEADERS });
  }
  const cookieStore = await cookies();
  const session = openPrivatePayload<GmailTokenSession>(cookieStore.get(SESSION_COOKIE)?.value, config.sessionSecret, "gmail-token-session");
  cookieStore.set(SESSION_COOKIE, "", gmailCookieOptions(config, 0, "/api/integrations/gmail"));
  if (session?.accessToken) await revokeGoogleToken(session.accessToken);
  return Response.json({ connected: false }, { headers: GMAIL_PRIVATE_HEADERS });
}
