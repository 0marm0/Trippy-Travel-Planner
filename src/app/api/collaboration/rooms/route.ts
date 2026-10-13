import { getCollaborationStore } from "@/lib/collaboration/store";
import { authorizeRoomCreation, body, handle, json } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return handle(async () => { authorizeRoomCreation(request); const input = await body(request, ["state"]); const store = await getCollaborationStore(); return json(await store.create(input.state), 201); });
}
