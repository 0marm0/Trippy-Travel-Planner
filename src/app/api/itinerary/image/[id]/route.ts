import { loadPrivateItineraryImage } from "@/lib/private-itinerary";
import { canServePrivateTripData } from "@/lib/private-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  Vary: "Host",
};

type ImageRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: ImageRouteContext): Promise<Response> {
  const hostname = new URL(request.url).hostname;
  if (!canServePrivateTripData({ hostname, nodeEnv: process.env.NODE_ENV, explicitGate: process.env.TRIPPY_ALLOW_PRIVATE_LOCAL })) {
    return new Response(null, { status: 404, headers: PRIVATE_HEADERS });
  }

  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/.test(id)) {
    return new Response(null, { status: 404, headers: PRIVATE_HEADERS });
  }

  try {
    const image = await loadPrivateItineraryImage(id);
    if (!image) return new Response(null, { status: 404, headers: PRIVATE_HEADERS });

    return new Response(Buffer.from(image.base64, "base64"), {
      headers: { ...PRIVATE_HEADERS, "Content-Type": image.contentType },
    });
  } catch {
    return new Response(null, { status: 404, headers: PRIVATE_HEADERS });
  }
}
