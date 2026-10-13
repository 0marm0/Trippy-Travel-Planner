import { collaborationConfiguration } from "@/lib/collaboration/store";
import { creationConfiguration, json } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return json({ ...collaborationConfiguration(), ...creationConfiguration(request) }); }
