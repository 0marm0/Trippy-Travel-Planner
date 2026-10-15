import { filterTripExportSnapshot, sanitizeTripExportSnapshot, isBundledTripImage, type TripExportSnapshot, type TripExportScope, type TripExportTheme } from "./trip-exports.ts";

export type ExportPreviewOptions = { scope: TripExportScope; visual: boolean; theme: TripExportTheme; dateRange?: {start:string;end:string} };
export const EXPORT_PREVIEW_HTML_BUDGET = 1_500_000;
const limits = { stops: 40, days: 366, catalogue: 500, transport: 40, hotels: 40, bookings: 100 } as const;
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const validDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;

/** Validate the entire snapshot before scoping, so a narrow export never conceals invalid records. */
export function validateExportPreviewSnapshot(value: unknown): string[] {
  if (!record(value)) return ["The export snapshot is missing."];
  const errors: string[] = [];
  if (value.schemaVersion !== 1 || typeof value.title !== "string" || !value.title.trim() || !validDate(value.start) || !validDate(value.end) || String(value.end) < String(value.start)) errors.push("The trip title, schema or date window is incomplete.");
  for (const [key, limit] of Object.entries(limits)) {
    const items = value[key];
    if (!Array.isArray(items) || items.length > limit || items.some(item => !record(item))) { errors.push(`${key}: invalid collection or export limit exceeded.`); continue; }
    for (const item of items) {
      const required = key === "stops" ? ["name"] : key === "days" ? ["date"] : key === "transport" ? ["date", "from", "to", "mode", "name"] : key === "hotels" ? ["city", "name"] : ["title"];
      if (required.some(field => typeof item[field] !== "string" || !item[field].trim())) errors.push(`${key}: a record is incomplete.`);
      if (key === "stops") {
        if (item.dateBasis !== undefined && item.dateBasis !== "planning-days") errors.push("stops: invalid date basis.");
        if (item.dateBasis === "planning-days" && (!Array.isArray(item.planningDates) || item.planningDates.length > 366 || new Set(item.planningDates).size !== item.planningDates.length || item.planningDates.some((date: unknown)=>!validDate(date)) || item.checkIn !== "" || item.checkOut !== "" || item.nights !== 0)) errors.push("stops: planning days must retain unknown stay dates and nights.");
        if (item.planningDates !== undefined && item.dateBasis !== "planning-days") errors.push("stops: planning dates need an explicit date basis.");
        const unknownDates = item.checkIn === "" && item.checkOut === "" && item.nights === 0;
        if (!unknownDates && (!validDate(item.checkIn) || !validDate(item.checkOut) || item.checkOut <= item.checkIn || typeof item.nights !== "number" || !Number.isInteger(item.nights) || item.nights < 0 || item.nights > 60)) errors.push("stops: invalid stay dates or nights.");
      }
      if ((key === "transport" || key === "days") && !validDate(item.date)) errors.push(`${key}: invalid record date.`);
      if (key === "days") {
        if (!Array.isArray(item.activities) || item.activities.length > 50 || item.activities.some((activity: unknown) => !record(activity) || typeof activity.title !== "string" || !activity.title.trim())) errors.push("days: invalid activity records or export limit exceeded.");
        if (!Array.isArray(item.anchors) || item.anchors.length > 20 || item.anchors.some((anchor: unknown) => !record(anchor) || typeof anchor.label !== "string" || !anchor.label.trim())) errors.push("days: invalid anchor records or export limit exceeded.");
      }
      if (key === "catalogue" && item.priority !== undefined && !["must","should","could","unknown"].includes(String(item.priority))) errors.push("catalogue: invalid activity priority.");
      if (key === "days" && Array.isArray(item.activities) && item.activities.some((activity: unknown)=>record(activity) && activity.priority !== undefined && !["must","should","could","unknown"].includes(String(activity.priority)))) errors.push("days: invalid activity priority.");
      if (key === "bookings" && (!validDate(item.dateIso) || !["recommended", "quoted", "held", "confirmed", "tbc", "missing", "conflict"].includes(String(item.status)))) errors.push("bookings: invalid date or recorded state.");
      for (const field of key === "transport" ? ["hours", "low", "high"] : key === "hotels" ? ["stars", "low", "high"] : []) if (typeof item[field] !== "number" || !Number.isFinite(item[field]) || item[field] < 0) errors.push(`${key}: invalid numeric record.`);
    }
  }
  return [...new Set(errors)];
}

export function buildExportPreviewSummary(input: TripExportSnapshot, options: ExportPreviewOptions, html: string) {
  const errors = validateExportPreviewSnapshot(input);
  if (errors.length) throw new Error(errors.join(" "));
  const snapshot = filterTripExportSnapshot(sanitizeTripExportSnapshot(input), options.scope);
  // Inventory counts refer to unique candidate assets, not guaranteed rendered or successfully loaded images.
  const images = new Set(options.visual ? [...snapshot.stops.map(item => item.image), ...snapshot.hotels.map(item => item.image), ...snapshot.catalogue.map(item => item.image), ...snapshot.days.flatMap(day => day.activities.map(item => item.image))].filter((image): image is string => !!image) : []);
  const photos = { local: 0, external: 0, embedded: 0 };
  for (const image of images) {
    if (image.startsWith("data:image/")) photos.embedded += 1;
    else if (image.startsWith("/")) photos.local += 1;
    else if (/^https:\/\//.test(image)) photos.external += 1;
  }
  const htmlBytes = new TextEncoder().encode(html).byteLength;
  return { counts: { stops: snapshot.stops.length, days: snapshot.days.length, activities: snapshot.days.reduce((count, day) => count + day.activities.length, 0), catalogue: snapshot.catalogue.length, transport: snapshot.transport.length, hotels: snapshot.hotels.length, bookings: snapshot.bookings.length }, photos, htmlBytes, overBudget: htmlBytes > EXPORT_PREVIEW_HTML_BUDGET };
}

/** Scripts, navigation and writes remain blocked even after linked image loading is explicitly enabled. */
export function sandboxExportPreviewHtml(html: string, loadLinkedImages = false, appOrigin = ""): string {
  let localOrigin = "";
  let imageOrigin = "";
  try {
    const url = new URL(appOrigin);
    const isLoopback = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (!url.username && !url.password && url.pathname === "/" && !url.search && !url.hash && (url.protocol === "https:" || isLoopback)) imageOrigin = url.origin;
    if (imageOrigin && isLoopback) localOrigin = ` ${imageOrigin}`;
  } catch { /* No untrusted base or plaintext origin is authorized. */ }
  if (loadLinkedImages && imageOrigin) {
    // srcdoc is opaque under an empty sandbox. Resolve only the renderer's
    // canonical bundled photo paths in this preview, without adding a base tag
    // or changing the reading-copy HTML passed to downloads.
    html = html.replace(/<img\b[^>]*>/gi, tag => tag.replace(/(\s(?:src|data-fallback)\s*=\s*)(["'])([^"']*)\2/gi, (attribute, prefix: string, quote: string, value: string) => isBundledTripImage(value) ? `${prefix}${quote}${imageOrigin}${value}${quote}` : attribute));
  }
  const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:${loadLinkedImages ? ` https:${localOrigin}` : ""}; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">`;
  return /<head(?:\s[^>]*)?>/i.test(html) ? html.replace(/<head(?:\s[^>]*)?>/i, match => `${match}${policy}`) : `${policy}${html}`;
}

export const PREVIEW_PHOTO_LIMITS = { count: 40, individualBytes: 1_000_000, totalBytes: 8_000_000, concurrency: 3 } as const;
export type PreviewPhotoResult = { html: string; candidates: number; embedded: number; failed: number; omitted: number; bytesRead: number; embeddedBytes: number };

/** Explicit opt-in only: fetch approved same-app photos in the parent origin, never inside the opaque iframe. */
export async function embedSandboxPreviewPhotos(html: string, appOrigin: string, fetcher: typeof fetch, signal: AbortSignal): Promise<PreviewPhotoResult> {
  const origin = new URL(appOrigin);
  if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash || !(origin.protocol === "https:" || (origin.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)))) throw new Error("A trusted app origin is required for local photo previews.");
  const paths = [...new Set([...html.matchAll(/<img\b[^>]*>/gi)].flatMap(([tag]) => [...tag.matchAll(/\ssrc\s*=\s*(["'])([^"']*)\1/gi)].map(match => match[2]).filter(isBundledTripImage)))];
  const selected = paths.slice(0, PREVIEW_PHOTO_LIMITS.count);
  const embedded = new Map<string, string>();
  let cursor = 0, bytesRead = 0, embeddedBytes = 0, failed = 0, omitted = paths.length - selected.length, budgetExhausted = false;
  const aborted = () => { if (signal.aborted) throw new DOMException("Photo preview cancelled", "AbortError"); };
  await Promise.all(Array.from({ length: Math.min(PREVIEW_PHOTO_LIMITS.concurrency, selected.length) }, async () => {
    while (cursor < selected.length) {
      aborted();
      const path = selected[cursor++];
      if (budgetExhausted) { omitted++; continue; }
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      try {
        const response = await fetcher(`${origin.origin}${path}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]), credentials: "omit", redirect: "error", referrerPolicy: "no-referrer" });
        aborted();
        const mime = response.headers.get("content-type")?.split(";", 1)[0].toLowerCase();
        if (!response.ok || !["image/webp", "image/png", "image/jpeg"].includes(mime || "") || Number(response.headers.get("content-length") || 0) > PREVIEW_PHOTO_LIMITS.individualBytes || !response.body) { await response.body?.cancel(); failed++; continue; }
        reader = response.body.getReader();
        const chunks: Uint8Array[] = []; let size = 0;
        while (true) {
          aborted();
          const part = await reader.read();
          aborted();
          if (part.done) break;
          if (budgetExhausted || bytesRead + part.value.byteLength > PREVIEW_PHOTO_LIMITS.totalBytes) { budgetExhausted = true; await reader.cancel(); omitted++; break; }
          if (size + part.value.byteLength > PREVIEW_PHOTO_LIMITS.individualBytes) { await reader.cancel(); failed++; size = PREVIEW_PHOTO_LIMITS.individualBytes + 1; break; }
          bytesRead += part.value.byteLength;
          size += part.value.byteLength;
          chunks.push(part.value);
        }
        if (budgetExhausted || size > PREVIEW_PHOTO_LIMITS.individualBytes) continue;
        if (!size) { failed++; continue; }
        if (typeof createImageBitmap === "function") {
          const source = new Uint8Array(size); let offset = 0;
          for (const chunk of chunks) { source.set(chunk, offset); offset += chunk.length; }
          const decoded = await createImageBitmap(new Blob([source], { type: mime })); decoded.close();
          aborted();
        }
        let binary = "";
        for (const chunk of chunks) for (let offset = 0; offset < chunk.length; offset += 8192) binary += String.fromCharCode(...chunk.subarray(offset, offset + 8192));
        embedded.set(path, `data:${mime};base64,${btoa(binary)}`); embeddedBytes += size;
      } catch { aborted(); failed++; }
      finally { reader?.releaseLock(); }
    }
  }));
  aborted();
  const preview = replaceSandboxLocalPhotos(html, embedded);
  omitted = paths.length - embedded.size - failed;
  return { html: preview, candidates: paths.length, embedded: embedded.size, failed, omitted, bytesRead, embeddedBytes };
}

/** Neutral local-photo placeholders while loading, after failure, or without opt-in. */
export function maskSandboxLocalPhotos(html: string): string { return replaceSandboxLocalPhotos(html, new Map()); }
function replaceSandboxLocalPhotos(html: string, embedded: Map<string, string>): string {
  return html.replace(/<img\b[^>]*>/gi, tag => {
    const source = /\ssrc\s*=\s*(["'])([^"']*)\1/i.exec(tag)?.[2];
    if (!source || !isBundledTripImage(source)) return tag;
    const data = embedded.get(source);
    if (data) return tag.replace(/(\ssrc\s*=\s*)(["'])([^"']*)\2/i, (_attribute, prefix: string, quote: string) => `${prefix}${quote}${data}${quote}`);
    return /\bhero-cover\b/.test(tag) ? "" : '<span role="img" aria-label="Photo unavailable in this preview" style="display:block;background:#17304a;color:#b8cee3;padding:12px">Photo unavailable in preview</span>';
  });
}
