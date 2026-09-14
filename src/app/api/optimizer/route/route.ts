import { optimizeRoutes, type RouteOptimizationInput } from "@/lib/optimization/route-optimizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = {
  "Cache-Control": "no-store, private",
  "Content-Type": "application/json; charset=utf-8",
};

export async function POST(request: Request): Promise<Response> {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 250_000) return Response.json({ error: "The optimization request is too large." }, { status: 413, headers: HEADERS });
  try {
    const body = await request.json() as RouteOptimizationInput;
    return Response.json({ routes: optimizeRoutes(body), generatedAt: new Date().toISOString(), notice: "Planning comparison only. Recheck live fares, schedules, transfer rules, and availability before booking." }, { headers: HEADERS });
  } catch (error) {
    const message = error instanceof Error && error.message.length <= 180 ? error.message : "The route request is invalid.";
    return Response.json({ error: message }, { status: 400, headers: HEADERS });
  }
}
