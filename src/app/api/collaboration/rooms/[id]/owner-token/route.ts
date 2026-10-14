import { getCollaborationStore } from "@/lib/collaboration/store";
import { body, handle, json, revision, token } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => { const access = token(request), expected = revision(request); await body(request, []); const { id } = await context.params; const store = await getCollaborationStore(); return json(await store.rotateOwner(id, access, expected)); });
}
