import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createTripPdf, sanitizeTripExportSnapshot, TRIP_EXPORT_IMAGE_HOSTS, type TripPdfIcon } from "@/lib/trip-exports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
const MAX_BODY_BYTES = 1_500_000;
const MAX_IMAGE_BYTES = 8_000_000;
const MAX_REDIRECTS = 4;
const ICON_FILES: Record<TripPdfIcon, string> = { flight: "flights.png", train: "train-rail.png", car: "car.png", hotel: "hotel-bed.png", activity: "star-activities.png" };

function permittedImageUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || !TRIP_EXPORT_IMAGE_HOSTS.has(url.hostname.toLowerCase())) return null;
    if ([...url.searchParams.keys()].some((key) => /token|key|auth|signature|credential|email|ref|confirm/i.test(key))) return null;
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(decodeURIComponent(url.href))) return null;
    url.hash = "";
    return url;
  } catch { return null; }
}

async function loadImage(value: string): Promise<Uint8Array | null> {
  let url = permittedImageUrl(value);
  if (!url) return null;
  const signal = AbortSignal.timeout(10_000);
  let response: Response | null = null;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    // Manual redirects ensure every destination is approved before any request is made.
    response = await fetch(url, { redirect: "manual", signal, headers: { Accept: "image/avif,image/webp,image/jpeg,image/png" } });
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location || redirects === MAX_REDIRECTS) return null;
    url = permittedImageUrl(new URL(location, url).href);
    if (!url) return null;
  }
  const contentType = String(response?.headers.get("content-type") || "").toLowerCase().split(";", 1)[0];
  if (!response?.ok || !(contentType.startsWith("image/") || contentType === "application/octet-stream")) return null;
  const declaredSize = Number(response.headers.get("content-length") || 0);
  if (declaredSize > MAX_IMAGE_BYTES) return null;
  const source = await readLimitedBody(response.body, MAX_IMAGE_BYTES);
  if (!source) return null;
  const jpeg = await sharp(source).rotate().resize({ width: 1_000, height: 700, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer();
  return new Uint8Array(jpeg);
}

async function readLimitedBody(stream: ReadableStream<Uint8Array> | null, limit: number): Promise<Buffer | null> {
  if (!stream) return null;
  const reader = stream.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), size);
  } finally { reader.releaseLock(); }
}

let iconPromise: Promise<Partial<Record<TripPdfIcon, Uint8Array>>> | undefined;
function loadIcons(): Promise<Partial<Record<TripPdfIcon, Uint8Array>>> {
  iconPromise ??= Promise.all(Object.entries(ICON_FILES).map(async ([name, filename]) => {
    const source = await readFile(join(process.cwd(), "public", "icons", filename));
    // Trim source padding in memory and keep the public assets byte-for-byte unchanged.
    const png = await sharp(source).trim().resize(112, 112, { fit: "contain" }).png().toBuffer();
    return [name as TripPdfIcon, new Uint8Array(png)] as const;
  })).then((entries) => Object.fromEntries(entries));
  return iconPromise;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const declaredSize = Number(request.headers.get("content-length") || 0);
    if (declaredSize > MAX_BODY_BYTES) return Response.json({ error: "The itinerary is too large to export." }, { status: 413, headers: PRIVATE_HEADERS });
    const rawBody = await readLimitedBody(request.body, MAX_BODY_BYTES);
    if (!rawBody) return Response.json({ error: "The itinerary is too large to export." }, { status: 413, headers: PRIVATE_HEADERS });
    const body = JSON.parse(rawBody.toString("utf8")) as { snapshot?: unknown; theme?: unknown; visual?: unknown };
    const snapshot = sanitizeTripExportSnapshot(body.snapshot);
    if (!snapshot.title || !snapshot.start || !snapshot.end) return Response.json({ error: "The itinerary export is incomplete." }, { status: 400, headers: PRIVATE_HEADERS });
    const bytes = await createTripPdf(snapshot, { theme: body.theme === "light" ? "light" : "dark", visual: body.visual === true, imageLoader: body.visual === true ? loadImage : undefined, icons: await loadIcons() });
    return new Response(Buffer.from(bytes), {
      headers: { ...PRIVATE_HEADERS, "Content-Type": "application/pdf", "Content-Length": String(bytes.byteLength), "Content-Disposition": `attachment; filename="${body.visual === true ? "trippy-2026-visual-dossier.pdf" : `trippy-2026-itinerary-${body.theme === "light" ? "light" : "dark"}.pdf`}"` },
    });
  } catch {
    return Response.json({ error: "The PDF export could not be created." }, { status: 500, headers: PRIVATE_HEADERS });
  }
}
