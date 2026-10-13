import { CollaborationError } from "./schema.ts";
import { createHash, timingSafeEqual } from "node:crypto";

export const collaborationHeaders = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
export function json(value: unknown, status = 200) {
  const revision = value && typeof value === "object" && "revision" in value ? String(value.revision) : undefined;
  return Response.json(value, { status, headers: { ...collaborationHeaders, ...(revision ? { ETag: `"${revision}"` } : {}) } });
}
export async function handle(operation: () => Promise<Response>) {
  try { return await operation(); } catch (error) {
    if (error instanceof CollaborationError) return json({ error: error.message, ...(error.latest ?? {}) }, error.status);
    // Provider errors can include connection strings. Never expose or log them.
    return json({ error: "Collaboration storage is unavailable. Your local draft is unchanged." }, 503);
  }
}
export function token(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!/^Bearer [a-zA-Z0-9_-]{43}$/.test(header)) throw new CollaborationError(401, "A room capability is required.");
  return header.slice(7);
}
export function revision(request: Request) {
  const value = request.headers.get("if-match") ?? "";
  if (!/^(?:[1-9]\d*|"[1-9]\d*")$/.test(value)) throw new CollaborationError(428, "A current If-Match revision is required.");
  const number = Number(value.replaceAll('"', ""));
  if (!Number.isSafeInteger(number)) throw new CollaborationError(400, "Invalid revision.");
  return number;
}
export function sameOrigin(request: Request) {
  const url = new URL(request.url);
  if (url.search) throw new CollaborationError(400, "Query parameters are not supported.");
  const origin = request.headers.get("origin");
  if ((origin && origin !== url.origin) || request.headers.get("sec-fetch-site") === "cross-site") throw new CollaborationError(403, "Cross-origin collaboration requests are not allowed.");
}
export function creationConfiguration(request: Request, env = process.env) {
  const hostname = new URL(request.url).hostname;
  const loopback = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
  const creationCodeRequired = !loopback || Boolean(env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME || env.FUNCTION_TARGET || env.COLLABORATION_CREATE_CODE);
  const code = env.COLLABORATION_CREATE_CODE;
  const valid = typeof code === "string" && code.length >= 16 && code.length <= 256 && !/\s/.test(code);
  return { creationCodeRequired, creationAvailable: !creationCodeRequired || valid };
}
export function authorizeRoomCreation(request: Request, env = process.env) {
  sameOrigin(request);
  const config = creationConfiguration(request, env);
  if (!config.creationAvailable) throw new CollaborationError(503, "Room creation requires a configured server creation code.");
  if (!config.creationCodeRequired) return;
  const supplied = request.headers.get("x-trippy-create-code") ?? "";
  if (supplied.length < 16 || supplied.length > 256 || /\s/.test(supplied)) throw new CollaborationError(403, "Room creation code is required or invalid.");
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(hash(supplied), hash(env.COLLABORATION_CREATE_CODE!))) throw new CollaborationError(403, "Room creation code is required or invalid.");
}
export async function body(request: Request, allowedKeys: string[]) {
  sameOrigin(request);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new CollaborationError(415, "Send application/json.");
  const limit = 512 * 1024;
  if (Number(request.headers.get("content-length")) > limit) throw new CollaborationError(413, "Shared plan is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new CollaborationError(400, "A request body is required.");
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.byteLength;
    if (length > limit) { await reader.cancel(); throw new CollaborationError(413, "Shared plan is too large."); }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new CollaborationError(400, "Invalid JSON."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.keys(parsed).some(key => !allowedKeys.includes(key))) throw new CollaborationError(400, "Unsupported request fields.");
  return parsed as Record<string, unknown>;
}
