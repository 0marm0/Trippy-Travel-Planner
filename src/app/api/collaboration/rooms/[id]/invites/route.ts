import { getCollaborationStore } from "@/lib/collaboration/store";
import { body, handle, json, token } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => { const access = token(request); const input = await body(request, ["role", "expiresAt"]); const { id } = await context.params; const store = await getCollaborationStore(); return json(await store.invite(id, access, input.role, input.expiresAt), 201); });
}
