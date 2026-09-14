import { cookies } from "next/headers";

import { fetchGmailMessages } from "@/lib/imports/gmail/client";
import { requireGmailImportConfig } from "@/lib/imports/gmail/config";
import { openPrivatePayload } from "@/lib/imports/gmail/crypto";
import { GMAIL_PRIVATE_HEADERS, isSameOriginMutation, readBoundedJson } from "@/lib/imports/gmail/http";
import { buildNarrowTravelQuery, GmailPreviewInputError, parseGmailPreviewRequest } from "@/lib/imports/gmail/input";
import { hasExactGmailReadOnlyScope, type GmailTokenSession } from "@/lib/imports/gmail/oauth";
import { buildImportCandidates } from "@/lib/imports/gmail/parser";
import { containsForbiddenMailData } from "@/lib/imports/gmail/redaction";

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

  const sealed = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = openPrivatePayload<GmailTokenSession>(sealed, config.sessionSecret, "gmail-token-session");
  if (!session || session.expiresAt <= Date.now() + 15_000 || !hasExactGmailReadOnlyScope(session.scope)) {
    return Response.json({ error: "Gmail is not connected" }, { status: 401, headers: GMAIL_PRIVATE_HEADERS });
  }

  try {
    const input = parseGmailPreviewRequest(await readBoundedJson(request));
    const query = buildNarrowTravelQuery(input);
    const messages = await fetchGmailMessages(session.accessToken, query, input.maxMessages);
    const candidates = buildImportCandidates(messages, input.existing, config.sessionSecret);
    const payload = {
      candidates,
      review: {
        required: true,
        tripMutationPerformed: false,
        persistence: "none",
        instruction: "Review each candidate and apply approved facts manually; email is not booking authority.",
      },
    };
    if (containsForbiddenMailData(payload)) throw new Error("Response safety invariant failed");
    return Response.json(payload, { headers: GMAIL_PRIVATE_HEADERS });
  } catch (error) {
    if (error instanceof GmailPreviewInputError || error instanceof SyntaxError) {
      return Response.json({ error: "Provide a valid, narrow travel search" }, { status: 400, headers: GMAIL_PRIVATE_HEADERS });
    }
    return Response.json({ error: "Gmail preview is temporarily unavailable" }, { status: 503, headers: GMAIL_PRIVATE_HEADERS });
  }
}
