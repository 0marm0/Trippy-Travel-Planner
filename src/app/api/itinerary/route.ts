import { loadPrivateItinerary } from "@/lib/private-itinerary";
import { canServePrivateTripData } from "@/lib/private-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  Vary: "Host",
};

export async function GET(request: Request): Promise<Response> {
  const hostname = new URL(request.url).hostname;
  if (!canServePrivateTripData({ hostname, nodeEnv: process.env.NODE_ENV, explicitGate: process.env.TRIPPY_ALLOW_PRIVATE_LOCAL })) {
    return Response.json({ error: "Not found" }, { status: 404, headers: PRIVATE_HEADERS });
  }

  try {
    return Response.json(await loadPrivateItinerary(), { headers: PRIVATE_HEADERS });
  } catch {
    // Do not disclose the private file path or parse error to an HTTP client.
    return Response.json({ error: "Private itinerary is unavailable" }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
