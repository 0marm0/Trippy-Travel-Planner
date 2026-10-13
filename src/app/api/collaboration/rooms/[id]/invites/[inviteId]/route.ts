import { getCollaborationStore } from "@/lib/collaboration/store";
import { handle, json, sameOrigin, token } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function DELETE(request: Request, context: { params: Promise<{ id: string; inviteId: string }> }) {
  return handle(async () => { sameOrigin(request); const access = token(request); const { id, inviteId } = await context.params; const store = await getCollaborationStore(); return json(await store.revoke(id, access, inviteId)); });
}
