import { collaborationConfiguration } from "@/lib/collaboration/store";
import { creationConfiguration, handle, json } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return handle(async () => json({ ...collaborationConfiguration(), ...creationConfiguration(request) })); }
