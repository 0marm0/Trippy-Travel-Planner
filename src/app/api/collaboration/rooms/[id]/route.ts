import { getCollaborationStore } from "@/lib/collaboration/store";
import { body, handle, json, revision, sameOrigin, token } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return handle(async () => { sameOrigin(request); const access = token(request); const { id } = await context.params; const store = await getCollaborationStore(); return json(await store.read(id, access)); });
}
export async function PATCH(request: Request, context: Context) {
  return handle(async () => { const access = token(request), expected = revision(request); const input = await body(request, ["state"]); const { id } = await context.params; const store = await getCollaborationStore(); return json(await store.update(id, access, expected, input.state)); });
}
