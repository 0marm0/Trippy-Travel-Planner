import { getCollaborationStore } from "@/lib/collaboration/store";
import { body, handle, json, revision, token } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const access = token(request), expected = revision(request);
    const input = await body(request, ["suggestionId", "action", "value"]);
    if (typeof input.suggestionId !== "string" || typeof input.action !== "string" || typeof input.value !== "string") return json({ error: "Required suggestion action fields must be strings." }, 400);
    const { id } = await context.params;
    return json(await (await getCollaborationStore()).interactSuggestion(id, access, expected, input.suggestionId, input.action, input.value));
  });
}
