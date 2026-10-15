import { getCollaborationStore } from '@/lib/collaboration/store';
import { handle, json, sameOrigin, token } from '@/lib/collaboration/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: {params:Promise<{id:string}>}) {
  return handle(async()=>{sameOrigin(request);const access=token(request),{id}=await context.params;return json(await(await getCollaborationStore()).history(id,access));});
}
