import { NextResponse } from "next/server";
import { loadCurrentTrip } from "@/lib/current-trip";
import { canServePrivateTripData } from "@/lib/private-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const hostname = new URL(request.url).hostname;
    const allowPrivate = canServePrivateTripData({ hostname, nodeEnv: process.env.NODE_ENV, explicitGate: process.env.TRIPPY_ALLOW_PRIVATE_LOCAL });
    return NextResponse.json(await loadCurrentTrip({ allowPrivate }), { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "The 2026 trip data could not be loaded." }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
