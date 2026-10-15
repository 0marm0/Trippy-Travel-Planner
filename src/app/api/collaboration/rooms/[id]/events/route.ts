import { getCollaborationStore } from '@/lib/collaboration/store';
import { handle, sameOrigin, token } from '@/lib/collaboration/http';
import { collaborationEventResponse } from '@/lib/collaboration/events';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return handle(async () => { sameOrigin(request); const access = token(request), { id } = await context.params, store = await getCollaborationStore(); return collaborationEventResponse(request, () => store.presence(id, access)); });
}
