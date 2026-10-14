import { accountConfiguration } from '@/lib/accounts/config';
import { authorized, handle, json } from '@/lib/accounts/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return handle(async () => { const config = accountConfiguration(); if (!config.ready) return json({ ready: false, message: config.message }); const { system } = await authorized(request); const session = await system.auth.api.getSession({ headers: request.headers }); return json({ ready: true, signedIn: true, name: session?.user.name, resetAvailable: Boolean(system.auth.options.emailAndPassword?.sendResetPassword) }); }); }
