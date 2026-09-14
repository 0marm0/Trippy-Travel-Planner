import { getProviderHealth, type ProviderHealthResponse } from "@/lib/providers";
import { getProviderAccessState } from "@/lib/providers/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
};

export function GET(request: Request): Response {
  const responseBody = {
      checkedAt: new Date().toISOString(),
      liveAccess: getProviderAccessState(request),
      providers: getProviderHealth(),
      note: "Configuration status is redacted. No credential value is returned or validated against a provider by this route.",
    } satisfies ProviderHealthResponse;
  return Response.json(responseBody, { headers: PRIVATE_HEADERS });
}
