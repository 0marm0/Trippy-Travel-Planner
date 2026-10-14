import type { Trip2026Payload, TripActivity } from "./trip-model";
import { createTripPdfReplica } from "./trip-export-pdf.ts";
import { renderTripHtmlReplica, renderTripHtmlCompact } from "./trip-export-html.ts";
import { buildTripLogistics, calendarDates, logisticsItemsForDate } from "./trip-logistics.ts";

export type TripExportState = {
  assignments: Record<string, string[]>;
  activityPriority: Record<string, TripActivity["priority"]>;
  selectedTransport: Record<string, string>;
  selectedHotel: Record<string, string>;
};

export type TripExportTheme = "light" | "dark";
export type TripExportKind = "csv" | "html" | "html-travel" | "html-transit" | "html-hotels" | "pdf-light" | "pdf-dark" | "pdf-visual" | "pdf-transit" | "pdf-hotels";
export type TripExportScope = "all" | "travel" | "transit" | "hotels";
export type TripExportPrivacy = "share-safe" | "private-operational";
export type TripPdfIcon = "flight" | "train" | "car" | "hotel" | "activity";

type ExportActivity = {
  title: string;
  description: string;
  details: string;
  category: string;
  priority: TripActivity["priority"];
  image: string;
};

/**
 * The public activity catalogue is intentionally distinct from daily assignments.
 * It lets the HTML dossier show the full, sanitized city guide without exposing
 * source URLs or private booking data.
 */
type ExportCatalogueActivity = ExportActivity & { city: string };

type ExportDay = {
  date: string;
  dayNumber: number;
  city: string;
  country: string;
  theme: string;
  note: string;
  anchors: Array<{ status: string; label: string; detail: string }>;
  activities: ExportActivity[];
};

export type TripExportSnapshot = {
  schemaVersion: 1;
  title: string;
  subtitle: string;
  start: string;
  end: string;
  stops: Array<{ name: string; country: string; checkIn: string; checkOut: string; nights: number; stay: string }>;
  days: ExportDay[];
  catalogue: ExportCatalogueActivity[];
  transport: Array<{ date: string; from: string; to: string; mode: string; name: string; ride: string; door: string; hours: number; low: number; high: number; note: string }>;
  hotels: Array<{ city: string; name: string; neighborhood: string; tier: string; stars: number; low: number; high: number; why: string; tradeoff: string; image: string }>;
  bookings: Array<{ kind: string; date: string; dateIso: string; endDate: string; title: string; detail: string; status: "recommended" | "quoted" | "held" | "confirmed" | "tbc" | "missing" | "conflict" }>;
};

export type TripPdfOptions = {
  theme: TripExportTheme;
  scope?: TripExportScope;
  visual?: boolean;
  imageLoader?: (url: string) => Promise<Uint8Array | null>;
  icons?: Partial<Record<TripPdfIcon, Uint8Array>>;
};

const MAX_TEXT = 2_000;
const REDACTED = "[private detail removed]";
export const TRIP_EXPORT_IMAGE_HOSTS = new Set([
  "101countriesbefore50.com", "a.storyblok.com", "assets.pclncdn.com", "cdn.prod.website-files.com",
  "commons.wikimedia.org", "dst-cms.frogriot.com", "europe-trip-optimizer.omarmo.chatgpt.site",
  "images.ctfassets.net", "images.hln.be", "images.trvl-media.com", "images.unsplash.com", "images0.persgroep.net",
  "img.fih.io", "imgcy.trivago.com", "mediapool.bmwgroup.com", "s.inyourpocket.com", "s2.tvp.pl",
  "s3.eu-central-1.amazonaws.com", "s3.us-west-004.backblazeb2.com", "s7.dziennik.pl",
  "static.moniteurautomobile.be", "thumb.wikimedia.org", "upload.wikimedia.org", "waymap.pl", "www.admirable-facades.brussels",
  "www.amsterdam-spirit.com", "www.bfgest.de", "www.caldana.it", "www.hocheifel-nuerburgring.de",
  "www.muenchen.travel", "www.swinburne.edu.au", "www.tui.be",
]);

function cleanText(value: unknown, max = MAX_TEXT): string {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Remove private identifiers while preserving dates, routes and flight numbers. */
export function redactPrivateExportText(value: unknown): string {
  let text = cleanText(value);
  text = text.replace(/\bBearer\s+[A-Z0-9_.~+\/-]{12,}|\b(?:sk-|ghp_|github_pat_|AIza|ya29\.)[A-Z0-9_-]{12,}/gi, REDACTED);
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, REDACTED);
  text = text.replace(/https?:\/\/\S+/gi, REDACTED);
  text = text.replace(/\b(?:confirmation|booking|reservation|record|ticket)\s*(?:number|no\.?|#|code|reference|ref|locator)?\s*[:#-]?\s*[A-Z0-9-]{4,}\b/gi, REDACTED);
  text = text.replace(/\b(?:PNR|record locator|booking ref(?:erence)?|loyalty(?: number| id)?|member(?: number| id)?|frequent flyer|seat)\s*[:#-]?\s*[A-Z0-9-]{2,}\b/gi, REDACTED);
  text = text.replace(/\b(?=[A-Z0-9]{5,9}\b)(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*\d)[A-Z0-9]+\b/g, (token) => /^(?:[A-Z]{2,3}|[A-Z]\d|\d[A-Z])\d{1,4}$/.test(token) ? token : REDACTED);
  return text.replace(/(?:\s*\[private detail removed\]){2,}/g, ` ${REDACTED}`).trim();
}

export function isBundledTripImage(value: string): boolean {
  return /^\/guide-images\/[a-f0-9]{12,64}\.webp$/.test(value) || /^\/media\/[a-z0-9][a-z0-9-]*\.webp$/.test(value);
}

function safeImage(value: unknown): string {
  if (typeof value === "string" && isBundledTripImage(value)) return value;
  try {
    const parsed = new URL(cleanText(value, 2_048));
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || !TRIP_EXPORT_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) return "";
    if ([...parsed.searchParams.keys()].some((key) => /token|key|auth|signature|credential|email|ref|confirm/i.test(key))) return "";
    if (exportImageHasPrivateData(parsed.href)) return "";
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(decodeURIComponent(parsed.href))) return "";
    parsed.hash = "";
    return parsed.href;
  } catch {
    return "";
  }
}

function number(value: unknown, min = 0, max = 1_000_000): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : 0;
}

/** Decode nested values before retaining or fetching an image URL. */
export function exportImageHasPrivateData(value: string): boolean {
  try {
    let decoded = value.normalize("NFKC");
    for (let depth = 0; depth < 8; depth++) { const next = decodeURIComponent(decoded).normalize("NFKC"); if (next === decoded) break; decoded = next; }
    if (/%[a-f0-9]{2}/i.test(decoded)) return true;
    const labels = decoded.replace(/[_-]+/g, " ");
    if (/\b(?:sk-|ghp_|github_pat_|AIza|ya29\.)[a-z0-9_-]{12,}/i.test(decoded)) return true;
    return /\b(?:api\s*key|access\s*token|client\s*secret|oauth|bearer|password|secret|token|confirmation|pnr|booking\s*(?:reference|number|code)|record\s*locator|loyalty|seat\s*(?:assignment|number|\d+[a-z]))\b|\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|mail\.google\.|mailto\x3a|\b(?:sk-|ghp_|github_pat_|AIza|ya29\.)[a-z0-9_-]{12,}/i.test(labels);
  } catch { return true; }
}

export function buildTripExportSnapshot(data: Trip2026Payload, state: TripExportState, privacy: TripExportPrivacy = "share-safe"): TripExportSnapshot {
  // Legacy callers may request private-operational; every downloadable artifact
  // still uses the same redaction boundary. Private details stay in local display.
  void privacy;
  const bookingText = redactPrivateExportText;
  const logistics = buildTripLogistics(data, state.selectedTransport);
  const dates = calendarDates(logistics);
  const activityById = new Map(data.activities.map((activity) => [activity.id, activity]));
  const stops = data.stops.map((stop) => ({
    name: redactPrivateExportText(stop.name).slice(0, 160), country: redactPrivateExportText(stop.country).slice(0, 100),
    checkIn: cleanText(stop.checkIn, 10), checkOut: cleanText(stop.checkOut, 10), nights: number(stop.nights, 0, 60), stay: redactPrivateExportText(stop.stay),
  }));
  const days = dates.map((date, index): ExportDay => {
    const stop = data.stops.find((item) => date >= item.checkIn && date < item.checkOut)
      ?? (date >= (data.stops.at(-1)?.checkOut ?? "9999-12-31") ? data.stops.at(-1) : undefined);
    const stopIndex = stop ? Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${stop.checkIn}T12:00:00Z`)) / 86_400_000) : 0;
    const plan = stop ? data.cityPlans[stop.id]?.[stopIndex] : undefined;
    const seen = new Set<string>();
    const activities = (state.assignments[date] ?? []).flatMap((id): ExportActivity[] => {
      if (seen.has(id)) return [];
      seen.add(id);
      const activity = activityById.get(id);
      if (!activity) return [];
      return [{
        title: redactPrivateExportText(activity.title).slice(0, 240), description: redactPrivateExportText(activity.description),
        details: redactPrivateExportText(activity.details), category: redactPrivateExportText(activity.category).slice(0, 120),
        priority: state.activityPriority[id] ?? activity.priority, image: safeImage(activity.image || stop?.hero),
      }];
    });
    return {
      date, dayNumber: index + 1, city: redactPrivateExportText(stop?.name).slice(0, 160), country: redactPrivateExportText(stop?.country).slice(0, 100),
      theme: redactPrivateExportText(plan?.theme || stop?.name).slice(0, 240), note: redactPrivateExportText(plan?.note),
      anchors: logisticsItemsForDate(logistics, date).slice(0, 20).map((item) => ({
        status: cleanText(item.status === "confirmed" ? "Confirmed" : item.status === "conflict" ? "Conflict - resolve" : item.status === "tbc" ? "Verify / TBC" : "Needs booking", 40),
        label: redactPrivateExportText(item.title), detail: redactPrivateExportText(item.detail),
      })),
      activities,
    };
  });

  const catalogue = data.activities.slice(0, 500).map((activity): ExportCatalogueActivity => {
    const stop = data.stops.find((item) => item.id === activity.city);
    return {
      city: redactPrivateExportText(stop?.name || activity.city).slice(0, 160),
      title: redactPrivateExportText(activity.title).slice(0, 240),
      description: redactPrivateExportText(activity.description),
      details: redactPrivateExportText(activity.details),
      category: redactPrivateExportText(activity.category).slice(0, 120),
      priority: state.activityPriority[activity.id] ?? activity.priority,
      image: safeImage(activity.image || stop?.hero),
    };
  });

  const transport = data.transport.flatMap((leg) => {
    const chosen = leg.options.find((option) => option.id === state.selectedTransport[leg.id])
      ?? leg.options.find((option) => option.id === leg.recommend) ?? leg.options[0];
    if (!chosen) return [];
    return [{
      date: cleanText(leg.date, 10), from: redactPrivateExportText(leg.from).slice(0, 100), to: redactPrivateExportText(leg.to).slice(0, 100), mode: redactPrivateExportText(chosen.mode).slice(0, 30),
      name: redactPrivateExportText(chosen.name).slice(0, 240), ride: redactPrivateExportText(chosen.ride).slice(0, 100), door: redactPrivateExportText(chosen.door).slice(0, 100), hours: number(chosen.hours, 0, 200),
      low: number(chosen.low), high: number(chosen.high), note: redactPrivateExportText(chosen.note),
    }];
  });

  const hotels = data.stops.flatMap((stop) => {
    const hotel = data.hotels.find((item) => item.city === stop.id && item.id === state.selectedHotel[stop.id]);
    if (!hotel) return [];
    return [{
      city: redactPrivateExportText(stop.name).slice(0, 160), name: redactPrivateExportText(hotel.name).slice(0, 240), neighborhood: redactPrivateExportText(hotel.neighborhood).slice(0, 160),
      tier: redactPrivateExportText(hotel.tier).slice(0, 100), stars: number(hotel.stars, 0, 5), low: number(hotel.low), high: number(hotel.high),
      why: redactPrivateExportText(hotel.why), tradeoff: redactPrivateExportText(hotel.tradeoff), image: safeImage(hotel.images[0]),
    }];
  });

  return {
    schemaVersion: 1,
    title: redactPrivateExportText(data.title).slice(0, 240), subtitle: redactPrivateExportText(data.subtitle).slice(0, 240), start: cleanText(logistics.start, 10), end: cleanText(logistics.end, 10),
    stops, days, catalogue, transport, hotels,
    // ref and href are intentionally never copied into the export model.
    bookings: data.bookings.slice(0, 100).map((booking, index) => {
      const item = logistics.items.find((candidate) => candidate.id.startsWith(`booking:${index}:`));
      return {
      kind: bookingText(booking.kind), date: cleanText(booking.date, 40),
      dateIso: cleanText(item?.date, 10), endDate: cleanText(item?.endDate, 10),
      title: bookingText(booking.title), detail: bookingText(booking.detail),
      status: booking.status === "confirmed" || booking.status === "missing" || booking.status === "conflict" ? booking.status : "tbc",
      };
    }),
  };
}

/** Rebuild untrusted JSON through the same narrow export schema and limits. */
export function sanitizeTripExportSnapshot(value: unknown): TripExportSnapshot {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const array = (key: string, max: number) => Array.isArray(source[key]) ? (source[key] as unknown[]).slice(0, max) : [];
  const record = (item: unknown) => item && typeof item === "object" ? item as Record<string, unknown> : {};
  const priority = (value: unknown): TripActivity["priority"] => value === "must" || value === "should" ? value : "could";
  return {
    schemaVersion: 1,
    title: redactPrivateExportText(source.title).slice(0, 240), subtitle: redactPrivateExportText(source.subtitle).slice(0, 240), start: redactPrivateExportText(source.start).slice(0, 10), end: redactPrivateExportText(source.end).slice(0, 10),
    stops: array("stops", 40).map(record).map((item) => ({ name: redactPrivateExportText(item.name).slice(0, 160), country: redactPrivateExportText(item.country).slice(0, 100), checkIn: redactPrivateExportText(item.checkIn).slice(0, 10), checkOut: redactPrivateExportText(item.checkOut).slice(0, 10), nights: number(item.nights, 0, 60), stay: redactPrivateExportText(item.stay) })),
    days: array("days", 366).map(record).map((item) => ({
      date: redactPrivateExportText(item.date).slice(0, 10), dayNumber: number(item.dayNumber, 1, 366), city: redactPrivateExportText(item.city).slice(0, 160), country: redactPrivateExportText(item.country).slice(0, 100), theme: redactPrivateExportText(item.theme).slice(0, 240), note: redactPrivateExportText(item.note),
      anchors: (Array.isArray(item.anchors) ? item.anchors : []).slice(0, 20).map(record).map((anchor) => ({ status: redactPrivateExportText(anchor.status).slice(0, 40), label: redactPrivateExportText(anchor.label), detail: redactPrivateExportText(anchor.detail) })),
      activities: (Array.isArray(item.activities) ? item.activities : []).slice(0, 50).map(record).map((activity) => ({ title: redactPrivateExportText(activity.title).slice(0, 240), description: redactPrivateExportText(activity.description), details: redactPrivateExportText(activity.details), category: redactPrivateExportText(activity.category).slice(0, 120), priority: priority(activity.priority), image: safeImage(activity.image) })),
    })),
    catalogue: array("catalogue", 500).map(record).map((activity) => ({ city: redactPrivateExportText(activity.city).slice(0, 160), title: redactPrivateExportText(activity.title).slice(0, 240), description: redactPrivateExportText(activity.description), details: redactPrivateExportText(activity.details), category: redactPrivateExportText(activity.category).slice(0, 120), priority: priority(activity.priority), image: safeImage(activity.image) })),
    transport: array("transport", 40).map(record).map((item) => ({ date: redactPrivateExportText(item.date).slice(0, 10), from: redactPrivateExportText(item.from).slice(0, 100), to: redactPrivateExportText(item.to).slice(0, 100), mode: redactPrivateExportText(item.mode).slice(0, 30), name: redactPrivateExportText(item.name).slice(0, 240), ride: redactPrivateExportText(item.ride).slice(0, 100), door: redactPrivateExportText(item.door).slice(0, 100), hours: number(item.hours, 0, 200), low: number(item.low), high: number(item.high), note: redactPrivateExportText(item.note) })),
    hotels: array("hotels", 40).map(record).map((item) => ({ city: redactPrivateExportText(item.city).slice(0, 160), name: redactPrivateExportText(item.name).slice(0, 240), neighborhood: redactPrivateExportText(item.neighborhood).slice(0, 160), tier: redactPrivateExportText(item.tier).slice(0, 100), stars: number(item.stars, 0, 5), low: number(item.low), high: number(item.high), why: redactPrivateExportText(item.why), tradeoff: redactPrivateExportText(item.tradeoff), image: safeImage(item.image) })),
    bookings: array("bookings", 100).map(record).map((item) => ({ kind: redactPrivateExportText(item.kind), date: redactPrivateExportText(item.date).slice(0, 40), dateIso: redactPrivateExportText(item.dateIso).slice(0, 10), endDate: redactPrivateExportText(item.endDate).slice(0, 10), title: redactPrivateExportText(item.title), detail: redactPrivateExportText(item.detail), status: item.status === "confirmed" || item.status === "missing" || item.status === "conflict" || item.status === "recommended" || item.status === "quoted" || item.status === "held" ? item.status : "tbc" })),
  };
}

function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^\s*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function renderTripCsv(snapshot: TripExportSnapshot): string {
  snapshot = sanitizeTripExportSnapshot(snapshot);
  const rows: unknown[][] = [["row_type", "date", "city_or_route", "status", "priority", "title", "details", "cost_low", "cost_high"]];
  for (const day of snapshot.days) {
    if (!day.activities.length) rows.push(["day", day.date, day.city, "Unscheduled", "", day.theme, day.note, "", ""]);
    for (const activity of day.activities) rows.push(["activity", day.date, day.city, "Planned", activity.priority, activity.title, `${activity.category} - ${activity.details || activity.description}`, "", ""]);
    for (const anchor of day.anchors) rows.push(["anchor", day.date, day.city, anchor.status, "", anchor.label, anchor.detail, "", ""]);
  }
  for (const item of snapshot.transport) rows.push(["transport", item.date, `${item.from} to ${item.to}`, "Selected planning option", "", item.name, `${item.mode}; ${item.ride}; ${item.door}; ${item.note}`, item.low, item.high]);
  for (const hotel of snapshot.hotels) rows.push(["hotel", "", hotel.city, "Selected planning option", "", hotel.name, `${hotel.neighborhood}; ${hotel.tier}; ${hotel.why}; Tradeoff: ${hotel.tradeoff}`, hotel.low, hotel.high]);
  for (const booking of snapshot.bookings) rows.push(["booking", booking.date, booking.kind, booking.status, "", booking.title, booking.detail, "", ""]);
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export function filterTripExportSnapshot(input: TripExportSnapshot, scope: TripExportScope = "all"): TripExportSnapshot {
  const snapshot = sanitizeTripExportSnapshot(input);
  if (scope === "all") return snapshot;
  const transit = /flight|train|rail|airport|car\b|driv|transfer|ferry|bus|coach|departure|arrival/i;
  const stay = /hotel|stay|lodging|check.?in|check.?out/i;
  type LogisticsCategory = "transit" | "hotels" | "other";
  // A hotel may be the endpoint of a transfer, never its booking category.
  const categoryForKind = (kind: string): LogisticsCategory => transit.test(kind) ? "transit" : stay.test(kind) ? "hotels" : "other";
  const keepsCategory = (category: LogisticsCategory) => category !== "other" && (scope === "travel" || scope === category);
  const keepBooking = (booking: TripExportSnapshot["bookings"][number]) => keepsCategory(categoryForKind(booking.kind));
  const anchorCategory = (anchor: TripExportSnapshot["days"][number]["anchors"][number], date: string): LogisticsCategory => {
    const booking = snapshot.bookings.find(item => item.title === anchor.label && (item.dateIso || item.date.slice(0, 10)) === date);
    if (booking) return categoryForKind(booking.kind);
    const movement = snapshot.transport.find(item => item.date === date && (item.name === anchor.label || `${item.from} to ${item.to}` === anchor.label));
    if (movement) return "transit";
    // Legacy anchors lack kind metadata. Explicit modes/transfers outrank place
    // names; general arrival/check-in language still belongs to a hotel stay.
    if (/flight|train|rail|car\b|driv|transfer|ferry|bus|coach/i.test(anchor.label)) return "transit";
    if (stay.test(anchor.label)) return "hotels";
    return transit.test(anchor.label) ? "transit" : "other";
  };
  return {
    ...snapshot, title: `${snapshot.title} · ${scope === "transit" ? "Transit brief" : scope === "hotels" ? "Hotel brief" : "Travel brief"}`,
    catalogue: [],
    transport: scope === "hotels" ? [] : snapshot.transport,
    hotels: scope === "transit" ? [] : snapshot.hotels,
    bookings: snapshot.bookings.filter(keepBooking),
    stops: snapshot.stops.map(stop => scope === "transit" ? { ...stop, stay: "" } : stop),
    days: snapshot.days.map(day => ({ ...day, activities: [], note: "", theme: scope === "transit" ? "Transport and arrival context" : scope === "hotels" ? "Stay and check-in context" : "Travel essentials", anchors: day.anchors.filter(anchor => keepsCategory(anchorCategory(anchor, day.date))) })),
  };
}

export function renderTripHtml(snapshot: TripExportSnapshot, { theme = "dark", visual = true, privacy = "share-safe", scope = "all" }: { theme?: TripExportTheme; visual?: boolean; privacy?: TripExportPrivacy; scope?: TripExportScope } = {}): string {
  void privacy;
  const safe = filterTripExportSnapshot(snapshot, scope);
  return visual ? renderTripHtmlReplica(safe, { theme, visual }) : renderTripHtmlCompact(safe, { theme, scope });
}

export async function createTripPdf(snapshotInput: TripExportSnapshot, options: TripPdfOptions): Promise<Uint8Array> {
  return createTripPdfReplica(filterTripExportSnapshot(snapshotInput, options.scope), options);
}

export function tripExportFilename(kind: TripExportKind): string {
  if (kind.startsWith("html-")) return `trippy-2026-${kind.slice(5)}-brief.html`;
  if (kind === "pdf-transit" || kind === "pdf-hotels") return `trippy-2026-${kind.slice(4)}-brief.pdf`;
  return kind === "csv" ? "trippy-2026-itinerary.csv" : kind === "html" ? "trippy-2026-visual-dossier.html" : kind === "pdf-visual" ? "trippy-2026-visual-dossier.pdf" : `trippy-2026-itinerary-${kind === "pdf-light" ? "light" : "dark"}.pdf`;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = filename; link.style.display = "none"; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** Client integration: one call per menu action; every format uses the same snapshot. */
export async function downloadTripExport(data: Trip2026Payload, state: TripExportState, kind: TripExportKind, privacy: TripExportPrivacy = "share-safe"): Promise<void> {
  const effectivePrivacy = privacy === "private-operational" && data.dataMode === "private" ? privacy : "share-safe";
  const snapshot = buildTripExportSnapshot(data, state, effectivePrivacy);
  const privateName = effectivePrivacy === "private-operational" ? `trippy-2026-private-operational.${kind === "csv" ? "csv" : "html"}` : tripExportFilename(kind);
  if (kind === "csv") return saveBlob(new Blob([renderTripCsv(snapshot)], { type: "text/csv;charset=utf-8" }), privateName);
  if (kind === "html" || kind.startsWith("html-")) {
    const scope: TripExportScope = kind === "html-transit" ? "transit" : kind === "html-hotels" ? "hotels" : kind === "html-travel" ? "travel" : "all";
    let html = renderTripHtml(snapshot, { privacy: effectivePrivacy, visual: kind === "html", scope });
    const images = kind === "html" ? [...new Set([...snapshot.catalogue.map((item) => item.image), ...snapshot.days.flatMap((day) => day.activities.map((item) => item.image)), ...snapshot.hotels.map((hotel) => hotel.image)].filter(isBundledTripImage))] : [];
    // Embed reviewed bundled photos so a downloaded dossier works independently
    // of localhost or the maintainer's website. Never embed arbitrary URLs.
    for (let offset = 0; offset < images.length; offset += 8) {
      const embedded = await Promise.all(images.slice(offset, offset + 8).map(async (image) => {
        try {
          const response = await fetch(image, { credentials: "omit", signal: AbortSignal.timeout(10_000) });
          if (!response.ok || Number(response.headers.get("content-length")) > 8_000_000) return null;
          const blob = await response.blob();
          if (blob.size > 8_000_000 || blob.type !== "image/webp") return null;
          const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob);
          });
          return { image, data };
        } catch { return null; }
      }));
      for (const result of embedded) if (result) html = html.replaceAll(result.image, result.data);
    }
    return saveBlob(new Blob([html], { type: "text/html;charset=utf-8" }), privateName);
  }
  const response = await fetch("/api/exports/trip-pdf", {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ snapshot, theme: kind === "pdf-dark" ? "dark" : "light", visual: kind === "pdf-visual", scope: kind === "pdf-transit" ? "transit" : kind === "pdf-hotels" ? "hotels" : "all" }),
  });
  if (!response.ok) { const body = await response.json().catch(() => ({})) as { error?: string }; throw new Error(body.error || "The PDF export could not be created."); }
  saveBlob(await response.blob(), tripExportFilename(kind));
}
