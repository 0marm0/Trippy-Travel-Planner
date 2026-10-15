import { getCollaborationStore } from '@/lib/collaboration/store';
import { body, handle, json, sameOrigin, token } from '@/lib/collaboration/http';
import { CollaborationError } from '@/lib/collaboration/schema';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return handle(async () => { sameOrigin(request); const access = token(request), { id } = await context.params; return json(await (await getCollaborationStore()).presence(id, access)); });
}
export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const access = token(request), input = await body(request, ['present']);
    if (typeof input.present !== 'boolean') throw new CollaborationError(400, 'Presence requires an explicit boolean choice.');
    const { id } = await context.params;
    return json(await (await getCollaborationStore()).presence(id, access, input.present));
  });
}
