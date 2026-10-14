import { authorized, handle, json, revision, workspaceBody } from '@/lib/accounts/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return handle(async () => { const { system, owner } = await authorized(request); return json(await system.read(owner, (await context.params).id)); }); }
export async function PUT(request: Request, context: Context) { return handle(async () => { const { system, owner } = await authorized(request); return json(await system.update(owner, (await context.params).id, revision(request), await workspaceBody(request))); }); }
export async function DELETE(request: Request, context: Context) { return handle(async () => { const { system, owner } = await authorized(request); await system.remove(owner, (await context.params).id, revision(request)); return json({ deleted: true }); }); }
