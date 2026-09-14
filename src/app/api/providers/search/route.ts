import { ProviderValidationError, parseProviderSearchRequest, searchProviders, type ProviderSearchResponse } from "@/lib/providers";
import { getProviderAccessState } from "@/lib/providers/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BODY_BYTES = 16_384;
const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return errorResponse("Content-Type must be application/json", 415);
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return errorResponse("Request body is too large", 413);

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return errorResponse("Request body is too large", 413);
    const requestBody: unknown = JSON.parse(raw);
    const search = parseProviderSearchRequest(requestBody);
    const liveAccess = getProviderAccessState(request);
    const providers = await searchProviders(search, request.signal, { allowLive: liveAccess.state === "available" });
    const live = providers.filter((outcome) => outcome.mode === "live");
    const failed = live.filter((outcome) => outcome.status !== "ok").length;
    const succeeded = providers.filter((outcome) => outcome.status === "ok").length;
    const status = live.length === 0 ? "manual" : failed === 0 ? "ok" : succeeded > 0 ? "partial" : "failed";
    const responseBody = {
        requestId: crypto.randomUUID(),
        kind: search.kind,
        status,
        checkedAt: new Date().toISOString(),
        liveAccess,
        providers,
        disclaimer: "Search results are research leads or quotes. They are not holds, confirmations, or booking instructions.",
      } satisfies ProviderSearchResponse;
    return Response.json(responseBody, { headers: PRIVATE_HEADERS });
  } catch (error) {
    if (error instanceof SyntaxError) return errorResponse("Request body must be valid JSON", 400);
    if (error instanceof ProviderValidationError) return errorResponse(error.message, 400);
    return errorResponse("Provider search could not be completed", 500);
  }
}

function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status, headers: PRIVATE_HEADERS });
}
