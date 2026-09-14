import { cookies } from "next/headers";

import { requireGmailImportConfig } from "@/lib/imports/gmail/config";
import { sealPrivatePayload } from "@/lib/imports/gmail/crypto";
import { GMAIL_PRIVATE_HEADERS, gmailCookieOptions, isSameOriginMutation } from "@/lib/imports/gmail/http";
import { createOAuthFlow } from "@/lib/imports/gmail/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FLOW_COOKIE = "trippy_gmail_flow";

export async function POST(request: Request): Promise<Response> {
  try {
    const config = requireGmailImportConfig();
    if (!isSameOriginMutation(request, config)) {
      return Response.json({ error: "Request not allowed" }, { status: 403, headers: GMAIL_PRIVATE_HEADERS });
    }
    const { authorizationUrl, flow } = createOAuthFlow(config);
    const sealed = sealPrivatePayload(flow, config.sessionSecret, "gmail-oauth-flow");
    const cookieStore = await cookies();
    cookieStore.set(FLOW_COOKIE, sealed, gmailCookieOptions(config, 10 * 60, "/api/integrations/gmail/callback"));
    return Response.json({ authorizationUrl }, { headers: GMAIL_PRIVATE_HEADERS });
  } catch {
    return Response.json({ error: "Gmail import is not configured" }, { status: 503, headers: GMAIL_PRIVATE_HEADERS });
  }
}
