import { getAccountSystem } from '@/lib/accounts/system';
import { handle, privateHeaders } from '@/lib/accounts/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function authHandler(request: Request) {
  return handle(async () => {
    const system = await getAccountSystem();
    const response = await system.auth.handler(request);
    Object.entries(privateHeaders).forEach(([name, value]) => response.headers.set(name, value));
    return response;
  });
}
export const GET = authHandler;
export const POST = authHandler;
