import type { GmailImportConfig } from "./config.ts";

export const GMAIL_PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export function isSameOriginMutation(request: Request, config: GmailImportConfig): boolean {
  const origin = request.headers.get("origin");
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (!origin || contentType !== "application/json") return false;
  try {
    return new URL(origin).origin === config.baseUrl.origin;
  } catch {
    return false;
  }
}

export function gmailCookieOptions(config: GmailImportConfig, maxAge: number, path: string) {
  return {
    httpOnly: true,
    secure: config.baseUrl.protocol === "https:",
    sameSite: "lax" as const,
    path,
    maxAge,
    priority: "high" as const,
  };
}

export async function readBoundedJson(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > 16_384) throw new Error("Request too large");
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > 16_384) throw new Error("Request too large");
  return JSON.parse(text) as unknown;
}
