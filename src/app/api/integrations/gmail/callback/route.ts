import { cookies } from "next/headers";

import { requireGmailImportConfig } from "@/lib/imports/gmail/config";
import { equalState, openPrivatePayload, sealPrivatePayload } from "@/lib/imports/gmail/crypto";
import { GMAIL_PRIVATE_HEADERS, gmailCookieOptions } from "@/lib/imports/gmail/http";
import { exchangeAuthorizationCode, type OAuthFlowState } from "@/lib/imports/gmail/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FLOW_COOKIE = "trippy_gmail_flow";
const SESSION_COOKIE = "trippy_gmail_session";

export async function GET(request: Request): Promise<Response> {
  let config;
  try {
    config = requireGmailImportConfig();
  } catch {
    return Response.json({ error: "Not found" }, { status: 404, headers: GMAIL_PRIVATE_HEADERS });
  }

  const cookieStore = await cookies();
  const clearFlow = () => cookieStore.set(FLOW_COOKIE, "", gmailCookieOptions(config, 0, "/api/integrations/gmail/callback"));
  const failure = () => Response.redirect(new URL("/?gmail=error", config.baseUrl), 303);
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const flow = openPrivatePayload<OAuthFlowState>(cookieStore.get(FLOW_COOKIE)?.value, config.sessionSecret, "gmail-oauth-flow");
  clearFlow();

  if (url.searchParams.has("error") || !flow || flow.expiresAt <= Date.now() || code.length < 8 || code.length > 4_096
      || state.length < 20 || state.length > 200 || !equalState(state, flow.state)) {
    return failure();
  }

  try {
    const session = await exchangeAuthorizationCode(config, code, flow.verifier);
    const maxAge = Math.max(60, Math.floor((session.expiresAt - Date.now()) / 1_000));
    cookieStore.set(
      SESSION_COOKIE,
      sealPrivatePayload(session, config.sessionSecret, "gmail-token-session"),
      gmailCookieOptions(config, maxAge, "/api/integrations/gmail"),
    );
    return Response.redirect(new URL("/?gmail=connected", config.baseUrl), 303);
  } catch {
    return failure();
  }
}
