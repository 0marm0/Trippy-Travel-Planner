import { authorized, handle, json, workspaceBody } from '@/lib/accounts/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return handle(async () => { const { system, owner } = await authorized(request); return json({ plans: await system.list(owner) }); }); }
export async function POST(request: Request) { return handle(async () => { const { system, owner } = await authorized(request); return json(await system.create(owner, await workspaceBody(request)), 201); }); }
