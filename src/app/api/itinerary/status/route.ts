import { canServePrivateTripData } from "@/lib/private-access";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const enabled = canServePrivateTripData({ hostname: new URL(request.url).hostname, nodeEnv: process.env.NODE_ENV, explicitGate: process.env.TRIPPY_ALLOW_PRIVATE_LOCAL });
  return Response.json({ enabled }, { headers: { "Cache-Control": "private, no-store" } });
}
