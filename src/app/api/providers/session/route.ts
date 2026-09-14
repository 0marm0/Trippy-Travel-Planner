import {
  clearProviderSessionCookie,
  createProviderSession,
  environmentAccessConfig,
  providerAccessConfigured,
  providerRateLimitKey,
  providerSessionOriginAllowed,
  providerSessionCookie,
  verifyProviderAccessCode,
} from "@/lib/providers/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = {
  "Cache-Control": "no-store, private",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1_000;
const attemptsByClient = new Map<string, number[]>();

export async function POST(request: Request): Promise<Response> {
  const config = environmentAccessConfig();
  if (!providerSessionOriginAllowed(request, config.nodeEnv)) return safeError("Cross-origin access is not allowed", 403);
  if (!providerAccessConfigured(config)) return safeError("Private provider access is not configured", 503);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return safeError("Content-Type must be application/json", 415);

  const now = Date.now();
  pruneAttempts(now);
  const rateLimitKey = providerRateLimitKey(request);
  const attempts = attemptsByClient.get(rateLimitKey) ?? [];
  if (attempts.length >= MAX_ATTEMPTS) return safeError("Too many access attempts. Try again later.", 429);

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 1_024) return safeError("Invalid access request", 400);
    const body: unknown = JSON.parse(raw);
    if (!isAccessBody(body) || !verifyProviderAccessCode(body.accessCode, config)) {
      attemptsByClient.set(rateLimitKey, [...attempts, now]);
      return safeError("Access denied", 401);
    }
    attemptsByClient.delete(rateLimitKey);
    const token = createProviderSession(config.sessionSecret!);
    return Response.json(
      { status: "authenticated", expiresInSeconds: 12 * 60 * 60 },
      { headers: { ...HEADERS, "Set-Cookie": providerSessionCookie(token, config.nodeEnv === "production") } },
    );
  } catch {
    return safeError("Invalid access request", 400);
  }
}

export function DELETE(request: Request): Response {
  const config = environmentAccessConfig();
  if (!providerSessionOriginAllowed(request, config.nodeEnv)) return safeError("Cross-origin access is not allowed", 403);
  return Response.json(
    { status: "signed-out" },
    { headers: { ...HEADERS, "Set-Cookie": clearProviderSessionCookie(config.nodeEnv === "production") } },
  );
}

function pruneAttempts(now: number): void {
  for (const [key, attempts] of attemptsByClient) {
    const recent = attempts.filter((attempt) => now - attempt < WINDOW_MS);
    if (recent.length) attemptsByClient.set(key, recent);
    else attemptsByClient.delete(key);
  }
  if (attemptsByClient.size > 2_000) {
    const oldest = attemptsByClient.keys().next().value;
    if (oldest) attemptsByClient.delete(oldest);
  }
}

function isAccessBody(value: unknown): value is { accessCode: string } {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 1 && typeof (value as { accessCode?: unknown }).accessCode === "string";
}

function safeError(message: string, status: number): Response {
  return Response.json({ error: message }, { status, headers: HEADERS });
}
