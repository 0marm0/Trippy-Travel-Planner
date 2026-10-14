import { AccountError, getAccountSystem, MAX_PRIVATE_PLAN_BYTES } from './system.ts';
export const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };
export function json(value: unknown, status = 200) { return Response.json(value, { status, headers: privateHeaders }); }
export async function handle(operation: () => Promise<Response>) { try { return await operation(); } catch (error) { return json({ error: error instanceof AccountError ? error.message : 'Private storage is unavailable. Your local draft is unchanged.' }, error instanceof AccountError ? error.status : 503); } }
export async function authorized(request: Request) {
  const system = await getAccountSystem();
  const session = await system.auth.api.getSession({ headers: request.headers });
  if (!session) throw new AccountError(401, 'Sign in to access private plans.');
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin !== system.auth.options.baseURL || request.headers.get('sec-fetch-site') === 'cross-site') throw new AccountError(403, 'A same-origin request is required.');
  }
  return { system, owner: session.user.id };
}
export function revision(request: Request) { const match = /^("?)([1-9]\d*)\1$/.exec(request.headers.get('if-match') ?? ''); if (!match || !Number.isSafeInteger(Number(match[2]))) throw new AccountError(428, 'A current If-Match revision is required.'); return Number(match[2]); }
export async function workspaceBody(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AccountError(415, 'Send application/json.');
  const reader = request.body?.getReader(); if (!reader) throw new AccountError(400, 'Workspace required.');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const result = await reader.read(); if (result.done) break; size += result.value.byteLength; if (size > MAX_PRIVATE_PLAN_BYTES) { await reader.cancel(); throw new AccountError(413, 'Workspace is too large.'); } chunks.push(result.value); }
  try { const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 1 || !('workspace' in value)) throw new Error(); return value.workspace; } catch { throw new AccountError(400, 'Send only a workspace object.'); }
}
