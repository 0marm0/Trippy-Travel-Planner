import { PDFDocument, StandardFonts, rgb, type PDFImage, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import type { TripExportSnapshot, TripPdfIcon, TripPdfOptions } from "./trip-exports.ts";

const PAGE = { width: 595.28, height: 841.89, margin: 31 };
const NAVY = rgb(0.027, 0.086, 0.133);
const GOLD = rgb(0.73, 0.53, 0.25);
const RED = rgb(0.84, 0.12, 0.23);
const GREEN = rgb(0.02, 0.55, 0.42);
const BLUE = rgb(0.02, 0.58, 0.78);

type Palette = { bg: RGB; panel: RGB; card: RGB; text: RGB; muted: RGB; line: RGB; rail: RGB };
type Tone = "confirmed" | "action" | "planned";
type DossierItem = { date: string; kind: TripPdfIcon; status: string; title: string; detail: string; tone: Tone; source: "anchor" | "booking" | "transport" | "hotel" };
type Embedded = Map<string, PDFImage>;

const CITY_COLORS = [
  rgb(0.72, 0.52, 0.25), rgb(0.25, 0.55, 0.76), rgb(0.20, 0.49, 0.70),
  rgb(0.05, 0.55, 0.44), rgb(0.82, 0.49, 0.06), rgb(0.04, 0.60, 0.73),
  rgb(0.25, 0.50, 0.72), rgb(0.45, 0.36, 0.70),
];

function cleanPdfText(value: unknown): string {
  return String(value ?? "").replace(/[–—−]/g, "-").replace(/→/g, " to ").replace(/·/g, " | ")
    .replace(/≈/g, "about ").replace(/€/g, "EUR ").replace(/ł/gi, (c) => c === "Ł" ? "L" : "l")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").trim();
}

function truncate(value: string, font: PDFFont, size: number, width: number): string {
  const source = cleanPdfText(value);
  if (font.widthOfTextAtSize(source, size) <= width) return source;
  let result = source;
  while (result.length && font.widthOfTextAtSize(`${result}...`, size) > width) result = result.slice(0, -1);
  return `${result.trimEnd()}...`;
}

function wrap(value: string, font: PDFFont, size: number, width: number, maxLines = 2): string[] {
  const words = cleanPdfText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
    else { lines.push(line); line = word; }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length && lines.length === maxLines && cleanPdfText(value) !== lines.join(" ")) {
    lines[maxLines - 1] = truncate(lines[maxLines - 1], font, size, width);
  }
  return lines;
}

function parseDate(value: string): Date | null {
  const time = Date.parse(`${value}T12:00:00Z`);
  return Number.isFinite(time) ? new Date(time) : null;
}

function addDays(date: Date, days: number): Date { return new Date(date.getTime() + days * 86_400_000); }
function iso(date: Date): string { return date.toISOString().slice(0, 10); }
function dateLabel(value: string, weekday = false): string {
  const date = parseDate(value);
  if (!date) return cleanPdfText(value).toUpperCase();
  return date.toLocaleDateString("en-US", { weekday: weekday ? "short" : undefined, day: "numeric", month: "short", timeZone: "UTC" }).toUpperCase();
}

function iconFor(value: string, fallback: TripPdfIcon = "activity"): TripPdfIcon {
  if (/transfer|taxi|pickup/i.test(value)) return "car";
  if (/train|rail|station|express|sleeper/i.test(value)) return "train";
  if (/car|drive|rental|road|pickup|transfer|taxi/i.test(value)) return "car";
  if (/hotel|stay|room|lodging|airbnb/i.test(value)) return "hotel";
  if (/flight|fly|airport|airline|\b[A-Z]{2,3}\d{1,4}\b/i.test(value)) return "flight";
  return fallback;
}

/** Explicit booking kind / selected mode takes precedence over place names. */
export function tripPdfIconFor(kind: string, context = ""): TripPdfIcon {
  const explicit = iconFor(kind);
  return explicit === "activity" && !/^(?:activity|experience)$/i.test(kind.trim()) ? iconFor(context) : explicit;
}

function classify(status: string, title = "", detail = ""): Tone {
  if (status === "confirmed" || /^confirmed$/i.test(status)) return "confirmed";
  if (/^(?:recommended|quoted|held)$/i.test(status)) return "planned";
  if (/^(?:missing|tbc|conflict)$/i.test(status)) return "action";
  const value = `${status} ${title} ${detail}`;
  if (/missing|needs? booking|book\b|verify|tbc|conflict|action|cancel|duplicate|ticket first/i.test(value)) return "action";
  return "planned";
}

function toneColor(tone: Tone): RGB { return tone === "action" ? RED : tone === "confirmed" ? GREEN : GOLD; }
function toneLabel(tone: Tone, source = ""): string {
  if (/^(?:recommended|quoted|held|missing|conflict)$/i.test(source)) return source.toUpperCase();
  if (tone === "action") return /conflict|duplicate/i.test(source) ? "ACTION" : /tbc|verify/i.test(source) ? "VERIFY" : "BOOK / VERIFY";
  return tone === "confirmed" ? "CONFIRMED" : "PLANNED";
}

function countryKey(country: string): string {
  const key = country.toLowerCase();
  if (/united states|usa|america/.test(key)) return "us";
  if (/german/.test(key)) return "de";
  if (/poland|polish/.test(key)) return "pl";
  if (/belg/.test(key)) return "be";
  if (/netherlands|dutch/.test(key)) return "nl";
  if (/france|french/.test(key)) return "fr";
  if (/ital/.test(key)) return "it";
  if (/spain|spanish/.test(key)) return "es";
  if (/portugal|portuguese/.test(key)) return "pt";
  if (/united kingdom|britain|england/.test(key)) return "gb";
  return "generic";
}

function drawFlag(page: PDFPage, country: string, x: number, y: number, width = 18, height = 11) {
  const key = countryKey(country);
  const white = rgb(1, 1, 1); const black = rgb(.04, .04, .04); const red = rgb(.85, .08, .12);
  const blue = rgb(.05, .25, .55); const yellow = rgb(.97, .78, .08); const green = rgb(.02, .45, .25);
  page.drawRectangle({ x, y, width, height, color: white, borderColor: rgb(.70, .76, .80), borderWidth: .25 });
  if (key === "de") { page.drawRectangle({ x, y: y + height * 2 / 3, width, height: height / 3, color: black }); page.drawRectangle({ x, y: y + height / 3, width, height: height / 3, color: red }); page.drawRectangle({ x, y, width, height: height / 3, color: yellow }); }
  else if (key === "pl") { page.drawRectangle({ x, y, width, height: height / 2, color: red }); }
  else if (key === "be") { page.drawRectangle({ x, y, width: width / 3, height, color: black }); page.drawRectangle({ x: x + width / 3, y, width: width / 3, height, color: yellow }); page.drawRectangle({ x: x + width * 2 / 3, y, width: width / 3, height, color: red }); }
  else if (key === "nl") { page.drawRectangle({ x, y: y + height * 2 / 3, width, height: height / 3, color: red }); page.drawRectangle({ x, y, width, height: height / 3, color: blue }); }
  else if (key === "fr") { page.drawRectangle({ x, y, width: width / 3, height, color: blue }); page.drawRectangle({ x: x + width * 2 / 3, y, width: width / 3, height, color: red }); }
  else if (key === "it") { page.drawRectangle({ x, y, width: width / 3, height, color: green }); page.drawRectangle({ x: x + width * 2 / 3, y, width: width / 3, height, color: red }); }
  else if (key === "es") { page.drawRectangle({ x, y: y + height * .75, width, height: height * .25, color: red }); page.drawRectangle({ x, y, width, height: height * .25, color: red }); page.drawRectangle({ x, y: y + height * .25, width, height: height * .5, color: yellow }); }
  else if (key === "pt") { page.drawRectangle({ x, y, width: width * .4, height, color: green }); page.drawRectangle({ x: x + width * .4, y, width: width * .6, height, color: red }); }
  else if (key === "gb") { page.drawRectangle({ x, y, width, height, color: blue }); page.drawLine({ start: { x, y }, end: { x: x + width, y: y + height }, thickness: 2, color: white }); page.drawLine({ start: { x, y: y + height }, end: { x: x + width, y }, thickness: 2, color: white }); page.drawRectangle({ x: x + width * .42, y, width: width * .16, height, color: red }); page.drawRectangle({ x, y: y + height * .4, width, height: height * .2, color: red }); }
  else if (key === "us") { for (let i = 0; i < 7; i += 1) page.drawRectangle({ x, y: y + i * height / 7, width, height: height / 14, color: red }); page.drawRectangle({ x, y: y + height * .47, width: width * .43, height: height * .53, color: blue }); }
  else { page.drawRectangle({ x, y, width: width / 3, height, color: NAVY }); page.drawRectangle({ x: x + width * 2 / 3, y, width: width / 3, height, color: GOLD }); }
}

async function embedImage(doc: PDFDocument, bytes: Uint8Array): Promise<PDFImage | null> {
  try { return await doc.embedPng(bytes); } catch { try { return await doc.embedJpg(bytes); } catch { return null; } }
}

function collectItems(snapshot: TripExportSnapshot): DossierItem[] {
  const items: DossierItem[] = [];
  for (const day of snapshot.days) for (const anchor of day.anchors) {
    const tone = classify(anchor.status, anchor.label, anchor.detail);
    const booking = snapshot.bookings.find(item => item.title === anchor.label && (item.dateIso || item.date.slice(0, 10)) === day.date);
    const movement = snapshot.transport.find(item => item.date === day.date && (item.name === anchor.label || `${item.from} to ${item.to}` === anchor.label));
    items.push({ date: day.date, kind: tripPdfIconFor(booking?.kind || movement?.mode || "", `${anchor.label} ${anchor.detail}`), status: toneLabel(tone, anchor.status), title: anchor.label, detail: anchor.detail, tone, source: "anchor" });
  }
  for (const booking of snapshot.bookings) {
    const tone = classify(booking.status, booking.title, booking.detail);
    items.push({ date: booking.dateIso || booking.date.slice(0, 10), kind: tripPdfIconFor(booking.kind, `${booking.title} ${booking.detail}`), status: toneLabel(tone, booking.status), title: booking.title, detail: booking.detail, tone, source: "booking" });
  }
  for (const transport of snapshot.transport) {
    items.push({ date: transport.date, kind: tripPdfIconFor(transport.mode, transport.name), status: "PLANNED", title: `${transport.from} to ${transport.to}`, detail: `${transport.name} | ${transport.ride} | selected planning option`, tone: "planned", source: "transport" });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date) || (a.tone === "action" ? -1 : 1));
}

class Dossier {
  readonly pages: PDFPage[] = [];
  readonly pageKinds: Array<{ section: string; descriptor: string }> = [];
  readonly doc: PDFDocument;
  readonly regular: PDFFont;
  readonly bold: PDFFont;
  readonly palette: Palette;
  readonly icons: Map<TripPdfIcon, PDFImage>;
  readonly snapshot: TripExportSnapshot;
  constructor(doc: PDFDocument, regular: PDFFont, bold: PDFFont, palette: Palette, icons: Map<TripPdfIcon, PDFImage>, snapshot: TripExportSnapshot) {
    this.doc = doc; this.regular = regular; this.bold = bold; this.palette = palette; this.icons = icons; this.snapshot = snapshot;
  }

  newPage(section: string, descriptor: string): PDFPage {
    const page = this.doc.addPage([PAGE.width, PAGE.height]);
    this.pages.push(page); this.pageKinds.push({ section, descriptor });
    page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: this.palette.bg });
    page.drawRectangle({ x: 0, y: PAGE.height - 70, width: PAGE.width, height: 70, color: NAVY });
    page.drawRectangle({ x: PAGE.margin, y: PAGE.height - 49, width: 4, height: 25, color: GOLD });
    page.drawText(truncate(this.snapshot.title.toUpperCase(), this.bold, 20, 320), { x: PAGE.margin + 16, y: PAGE.height - 44, size: 20, font: this.bold, color: rgb(1, 1, 1) });
    page.drawText(truncate(`${section.toUpperCase()}  |  ${descriptor.toUpperCase()}`, this.regular, 8.2, 350), { x: PAGE.margin + 16, y: PAGE.height - 58, size: 8.2, font: this.regular, color: rgb(.74, .81, .85) });
    return page;
  }

  sectionRail(page: PDFPage, y: number, title: string, meta: string): number {
    page.drawRectangle({ x: PAGE.margin, y: y - 22, width: PAGE.width - PAGE.margin * 2, height: 22, color: this.palette.rail });
    page.drawRectangle({ x: PAGE.margin, y: y - 22, width: 4, height: 22, color: GOLD });
    page.drawText(title.toUpperCase(), { x: PAGE.margin + 14, y: y - 15, size: 10, font: this.bold, color: rgb(1, 1, 1) });
    page.drawText(truncate(meta.toUpperCase(), this.regular, 6.8, 230), { x: PAGE.width - PAGE.margin - 230, y: y - 14, size: 6.8, font: this.regular, color: rgb(.72, .80, .85) });
    return y - 32;
  }

  icon(page: PDFPage, name: TripPdfIcon, x: number, y: number, size = 14) {
    const icon = this.icons.get(name);
    if (icon) page.drawImage(icon, { x, y, width: size, height: size });
    else page.drawCircle({ x: x + size / 2, y: y + size / 2, size: size / 3, borderColor: BLUE, borderWidth: .8 });
  }

  footer() {
    this.pages.forEach((page, index) => {
      page.drawLine({ start: { x: PAGE.margin, y: 22 }, end: { x: PAGE.width - PAGE.margin, y: 22 }, thickness: .45, color: this.palette.line });
      page.drawText("All times local. Red indicates a booking or verification action.", { x: PAGE.margin, y: 10, size: 6.5, font: this.bold, color: this.palette.text });
      const label = `${index + 1} / ${this.pages.length}`;
      page.drawText(label, { x: PAGE.width - PAGE.margin - this.regular.widthOfTextAtSize(label, 6.5), y: 10, size: 6.5, font: this.regular, color: this.palette.muted });
      const pageLabel = `PAGE ${index + 1} OF ${this.pages.length}`;
      page.drawText(pageLabel, { x: PAGE.width - PAGE.margin - this.bold.widthOfTextAtSize(pageLabel, 7.5), y: PAGE.height - 44, size: 7.5, font: this.bold, color: rgb(.87, .91, .93) });
    });
  }
}

function calendarRange(snapshot: TripExportSnapshot): Date[] {
  const start = parseDate(snapshot.start); const end = parseDate(snapshot.end);
  if (!start || !end) return [];
  const first = addDays(start, -start.getUTCDay());
  const inclusiveEnd = addDays(end, -1);
  const last = addDays(inclusiveEnd, 6 - inclusiveEnd.getUTCDay());
  const count = Math.min(42, Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1);
  return Array.from({ length: count }, (_, index) => addDays(first, index));
}

function stopForDate(snapshot: TripExportSnapshot, date: string) {
  return snapshot.stops.find((stop) => date >= stop.checkIn && date < stop.checkOut);
}

function drawCalendar(dossier: Dossier, page: PDFPage, y: number, items: DossierItem[]): number {
  y = dossier.sectionRail(page, y, "Month at a glance", "city windows | movements | fixed anchors");
  const dates = calendarRange(dossier.snapshot); const weeks = Math.max(1, Math.ceil(dates.length / 7));
  const x = PAGE.margin; const width = PAGE.width - PAGE.margin * 2; const cellW = width / 7; const gridH = Math.min(305, 55 * weeks); const cellH = gridH / weeks;
  ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach((name, index) => page.drawText(name, { x: x + index * cellW + 5, y: y - 8, size: 6.5, font: dossier.bold, color: dossier.palette.muted }));
  const gridTop = y - 26;
  dates.forEach((date, index) => {
    const row = Math.floor(index / 7); const col = index % 7; const dateIso = iso(date);
    const cx = x + col * cellW; const cy = gridTop - (row + 1) * cellH;
    if (row % 2 === 1) page.drawRectangle({ x: cx, y: cy, width: cellW, height: cellH, color: dossier.palette.panel });
    page.drawRectangle({ x: cx, y: cy, width: cellW, height: cellH, borderColor: dossier.palette.line, borderWidth: .45 });
    const dateText = date.getUTCDate() === 1 || index === 0 ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).toUpperCase() : String(date.getUTCDate());
    page.drawText(dateText, { x: cx + 5, y: cy + cellH - 12, size: 7.5, font: dossier.bold, color: dossier.palette.text });
    const dayItems = items.filter((item) => item.date === dateIso).slice(0, 2);
    dayItems.forEach((item, itemIndex) => {
      const itemY = cy + cellH - 27 - itemIndex * 17;
      dossier.icon(page, item.kind, cx + 5, itemY - 1, 9);
      page.drawText(truncate(item.title, dossier.bold, 5.8, cellW - 21), { x: cx + 17, y: itemY + 3, size: 5.8, font: dossier.bold, color: item.tone === "planned" ? BLUE : toneColor(item.tone) });
      page.drawText(truncate(item.status, dossier.regular, 4.8, cellW - 21), { x: cx + 17, y: itemY - 4, size: 4.8, font: dossier.regular, color: item.tone === "action" ? RED : dossier.palette.muted });
    });
    const stop = stopForDate(dossier.snapshot, dateIso);
    if (stop) {
      const stopIndex = dossier.snapshot.stops.indexOf(stop); const color = CITY_COLORS[stopIndex % CITY_COLORS.length];
      page.drawRectangle({ x: cx + 4, y: cy + 5, width: cellW - 8, height: 8, color });
      drawFlag(page, stop.country, cx + 6, cy + 6.2, 10, 5.8);
      page.drawText(truncate(stop.name.toUpperCase(), dossier.bold, 5.6, cellW - 27), { x: cx + 19, y: cy + 7, size: 5.6, font: dossier.bold, color: rgb(1, 1, 1) });
    }
  });
  return gridTop - gridH - 28;
}

function drawDecisionDeck(dossier: Dossier, page: PDFPage, y: number, items: DossierItem[]): number {
  const seen = new Set<string>(); const unique = items.filter((item) => { const key = cleanPdfText(item.title).toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; });
  const shown = unique.filter((item) => item.tone !== "planned").slice(0, 8);
  const fallback = unique.filter((item) => item.tone === "planned").slice(0, Math.max(0, 8 - shown.length));
  const rows = [...shown, ...fallback].slice(0, 8);
  y = dossier.sectionRail(page, y, "Decision deck", `${rows.length} key logistics | red requires action`);
  const rowH = Math.min(35, Math.max(27, (y - 30) / Math.max(1, rows.length)));
  for (const item of rows) {
    const top = y; const color = toneColor(item.tone);
    page.drawRectangle({ x: PAGE.margin, y: top - rowH + 3, width: PAGE.width - PAGE.margin * 2, height: rowH - 5, color: dossier.palette.card });
    dossier.icon(page, item.kind, PAGE.margin + 12, top - rowH + 10, 11);
    page.drawText(item.status, { x: PAGE.margin + 34, y: top - 15, size: 5.8, font: dossier.bold, color });
    page.drawText(truncate(item.title, dossier.bold, 8, 255), { x: PAGE.margin + 96, y: top - 13, size: 8, font: dossier.bold, color: dossier.palette.text });
    page.drawText(truncate(item.detail || dateLabel(item.date), dossier.regular, 5.8, 382), { x: PAGE.margin + 96, y: top - 23, size: 5.8, font: dossier.regular, color: dossier.palette.muted });
    y -= rowH;
  }
  return y;
}

function ledgerItems(snapshot: TripExportSnapshot, stopIndex: number, items: DossierItem[]): DossierItem[] {
  const stop = snapshot.stops[stopIndex];
  const seen = new Set<string>();
  const within = items.filter((item) => {
    if (assignedStopIndex(snapshot, item) !== stopIndex || item.source === "transport" || (item.source !== "booking" && item.tone !== "action")) return false;
    const key = `${cleanPdfText(item.title).toLowerCase()}|${item.date}|${item.status}|${item.detail}|${item.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const hotels = snapshot.hotels.filter((hotel) => hotel.city.toLowerCase() === stop.name.toLowerCase()).map((hotel): DossierItem => ({ date: stop.checkIn, kind: "hotel", status: "PLANNED", title: hotel.name, detail: `${hotel.neighborhood} | selected planning option`, tone: "planned", source: "hotel" }));
  return [...hotels, ...within].sort((left, right) => (left.kind === "hotel" ? -1 : right.kind === "hotel" ? 1 : left.tone === "action" ? -1 : right.tone === "action" ? 1 : 0));
}

function assignedStopIndex(snapshot: TripExportSnapshot, item: DossierItem): number {
  if (!snapshot.stops.length || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return -1;
  const exact = snapshot.stops.findIndex((stop) => item.date >= stop.checkIn && item.date < stop.checkOut);
  if (exact >= 0) return exact;
  const following = snapshot.stops.findIndex((stop) => item.date < stop.checkIn);
  return following >= 0 ? following : snapshot.stops.length - 1;
}

function ledgerGroups(snapshot: TripExportSnapshot, items: DossierItem[]) {
  const groups = snapshot.stops.map((stop, index) => ({ stop, index, rows: ledgerItems(snapshot, index, items) }));
  const unassigned = items.filter((item) => assignedStopIndex(snapshot, item) < 0);
  if (unassigned.length) groups.push({ stop: { name: "Unassigned / TBC", country: "", checkIn: snapshot.start, checkOut: snapshot.end, nights: 0, stay: "" }, index: snapshot.stops.length, rows: unassigned });
  return groups;
}

function groupHeight(count: number): number { return 31 + Math.max(1, count) * 36 + 10; }

function drawLedger(dossier: Dossier, allItems: DossierItem[]) {
  const colGap = 22; const colW = (PAGE.width - PAGE.margin * 2 - colGap) / 2;
  let page: PDFPage; let columns: Array<{ x: number; y: number }>;
  const newLedgerPage = (continued = false) => {
    page = dossier.newPage("Operational ledger", continued ? "transport and accommodation | continued" : "transport and accommodation");
    dossier.sectionRail(page, 744, continued ? "Travel and hotel ledger - continued" : "Travel and hotel ledger", "chronological | red requires action");
    columns = [{ x: PAGE.margin, y: 704 }, { x: PAGE.margin + colW + colGap, y: 704 }];
  };
  newLedgerPage();
  const overflow: DossierItem[] = [];
  ledgerGroups(dossier.snapshot, allItems).forEach(({ stop, index, rows: sourceRows }) => {
    let rows = sourceRows.length ? sourceRows : [{ date: stop.checkIn, kind: "hotel" as const, status: "PLANNED", title: stop.stay || "Stay not selected", detail: "Planning details not recorded", tone: "planned" as const, source: "hotel" as const }];
    let continued = false;
    while (rows.length) {
      let column = columns[0].y >= columns[1].y ? 0 : 1;
      if (columns[column].y - groupHeight(rows.length) < 45 && columns[1 - column].y - groupHeight(rows.length) >= 45) column = 1 - column;
      let capacity = Math.floor((columns[column].y - 45 - 41) / 36);
      if (capacity < 1) { newLedgerPage(true); column = 0; capacity = Math.floor((columns[column].y - 45 - 41) / 36); }
      const chunk = rows.slice(0, capacity); rows = rows.slice(chunk.length);
      const { x } = columns[column]; let y = columns[column].y; const color = CITY_COLORS[index % CITY_COLORS.length];
      page.drawRectangle({ x, y: y - 25, width: colW, height: 25, color });
      drawFlag(page, stop.country, x + 11, y - 18, 16, 9.5);
      page.drawText(truncate(`${stop.name.toUpperCase()}${continued ? " (CONT.)" : ""}`, dossier.bold, 8.5, colW - 88), { x: x + 34, y: y - 16, size: 8.5, font: dossier.bold, color: rgb(1, 1, 1) });
      const range = `${dateLabel(stop.checkIn)}-${dateLabel(stop.checkOut)}`;
      page.drawText(truncate(range, dossier.bold, 5.5, 55), { x: x + colW - 62, y: y - 16, size: 5.5, font: dossier.bold, color: rgb(.96, .98, 1) });
      y -= 32;
      for (const item of chunk) {
        const detail = item.detail || dateLabel(item.date); const titleLines = wrap(item.title, dossier.bold, 7.5, colW - 77, 1_000); const detailLines = wrap(detail, dossier.regular, 5.3, colW - 42, 1_000);
        if (titleLines.length > 1 || detailLines.length > 2) overflow.push(item);
        page.drawRectangle({ x, y: y - 31, width: colW, height: 31, color: dossier.palette.card });
        page.drawRectangle({ x, y: y - 31, width: 3, height: 31, color: toneColor(item.tone) });
        dossier.icon(page, item.kind, x + 10, y - 23, 11);
        page.drawText(truncate(item.title, dossier.bold, 7.5, colW - 77), { x: x + 32, y: y - 13, size: 7.5, font: dossier.bold, color: item.tone === "action" ? RED : dossier.palette.text });
        const statusWidth = dossier.bold.widthOfTextAtSize(item.status, 4.8);
        page.drawText(item.status, { x: x + colW - statusWidth - 8, y: y - 12, size: 4.8, font: dossier.bold, color: toneColor(item.tone) });
        detailLines.slice(0, 2).forEach((line, lineIndex) => page.drawText(line, { x: x + 32, y: y - 23 - lineIndex * 7, size: 5.3, font: dossier.regular, color: item.tone === "action" ? RED : dossier.palette.muted }));
        y -= 36;
      }
      columns[column].y = y - 10; continued = true;
    }
  });
  // The supplied operational design intentionally keeps the normal itinerary
  // to a compact five-page scan. Only unusually crowded exports receive a
  // full-text continuation appendix.
  if (overflow.length) drawLedgerAppendix(dossier, overflow);
}

function drawLedgerAppendix(dossier: Dossier, items: DossierItem[]) {
  if (!items.length) return;
  let page: PDFPage | null = null; let y = 0;
  const nextPage = () => {
    page = dossier.newPage("Logistics details", "full text for ledger rows");
    y = dossier.sectionRail(page, 744, "Logistics details appendix", "continued text from the operational ledger");
  };
  for (const item of items) {
    const lines = wrap(`${dateLabel(item.date)} | ${item.status} | ${item.title} | ${item.detail}`, dossier.regular, 7.2, PAGE.width - PAGE.margin * 2 - 24, 1_000);
    let cursor = 0;
    while (cursor < lines.length) {
      if (!page || y < 62) nextPage();
      const available = Math.max(1, Math.floor((y - 45) / 9)); const chunk = lines.slice(cursor, cursor + available);
      const current = page!; const height = chunk.length * 9 + 12;
      current.drawRectangle({ x: PAGE.margin, y: y - height + 4, width: PAGE.width - PAGE.margin * 2, height: height - 4, color: dossier.palette.card });
      current.drawRectangle({ x: PAGE.margin, y: y - height + 4, width: 3, height: height - 4, color: toneColor(item.tone) });
      chunk.forEach((line, index) => current.drawText(line, { x: PAGE.margin + 12, y: y - 12 - index * 9, size: 7.2, font: dossier.regular, color: dossier.palette.text }));
      y -= height; cursor += chunk.length;
    }
  }
}

function dayTone(day: TripExportSnapshot["days"][number]): Tone {
  const tones = day.anchors.map((anchor) => classify(anchor.status, anchor.label, anchor.detail));
  return tones.includes("action") ? "action" : tones.includes("confirmed") ? "confirmed" : "planned";
}

function dayTitle(day: TripExportSnapshot["days"][number]): string {
  const titles = [...day.anchors.map((anchor) => anchor.label), ...day.activities.map((activity) => activity.title)];
  return titles.join(" + ") || day.theme || day.city || "Open day";
}

function dayDetail(day: TripExportSnapshot["days"][number]): string {
  if (day.anchors.length) return day.anchors.map((anchor) => anchor.detail).filter(Boolean).join(" | ") || day.note;
  const activity = day.activities[0]; return activity?.details || activity?.description || day.note || "No fixed activities scheduled";
}

function drawDailyRow(dossier: Dossier, page: PDFPage, day: TripExportSnapshot["days"][number], y: number, color: RGB, visual: boolean, images: Embedded): number {
  const image = visual ? images.get(day.activities[0]?.image || "") : undefined;
  const height = image ? 70 : 44; const tone = dayTone(day);
  page.drawRectangle({ x: PAGE.margin, y: y - height, width: PAGE.width - PAGE.margin * 2, height: height - 4, color: dossier.palette.card });
  page.drawRectangle({ x: PAGE.margin, y: y - height, width: 3, height: height - 4, color });
  page.drawText(dateLabel(day.date, true), { x: PAGE.margin + 16, y: y - 17, size: 8.2, font: dossier.bold, color: dossier.palette.text });
  page.drawText(toneLabel(tone, day.anchors.map((a) => a.status).join(" ")), { x: PAGE.margin + 16, y: y - 32, size: 5.2, font: dossier.bold, color: toneColor(tone) });
  let textX = PAGE.margin + 133; let textW = PAGE.width - PAGE.margin - textX - 10;
  if (image) {
    const box = { x: PAGE.margin + 120, y: y - height + 5, width: 74, height: height - 14 };
    const scale = Math.min(box.width / image.width, box.height / image.height);
    page.drawImage(image, { x: box.x + (box.width - image.width * scale) / 2, y: box.y + (box.height - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
    textX = PAGE.margin + 204; textW = PAGE.width - PAGE.margin - textX - 10;
  }
  page.drawText(truncate(dayTitle(day), dossier.bold, 8.5, textW), { x: textX, y: y - 17, size: 8.5, font: dossier.bold, color: dossier.palette.text });
  wrap(dayDetail(day), dossier.regular, 6.2, textW, image ? 3 : 2).forEach((line, index) => page.drawText(line, { x: textX, y: y - 31 - index * 8, size: 6.2, font: dossier.regular, color: dossier.palette.muted }));
  return y - height - 4;
}

function drawDaily(dossier: Dossier, visual: boolean, images: Embedded) {
  let page: PDFPage | null = null; let y = 0; let groups = 0; let pageIndex = -1;
  const populatedStopCount = dossier.snapshot.stops.filter((stop) => dossier.snapshot.days.some((day) => day.city.toLowerCase() === stop.name.toLowerCase() || (day.date >= stop.checkIn && day.date < stop.checkOut))).length;
  const newDailyPage = (descriptor: string) => { page = dossier.newPage(visual ? "Visual daily plan" : "Daily plan", descriptor); y = 744; groups = 0; pageIndex += 1; };
  dossier.snapshot.stops.forEach((stop, stopIndex) => {
    const days = dossier.snapshot.days.filter((day) => day.city.toLowerCase() === stop.name.toLowerCase() || (day.date >= stop.checkIn && day.date < stop.checkOut));
    if (!days.length) return;
    const rowHeight = visual && days.some((day) => day.activities[0]?.image && images.has(day.activities[0].image)) ? 74 : 48;
    const needed = 38 + days.length * rowHeight + 17;
    const operationalGroupLimit = populatedStopCount === 7 ? (pageIndex <= 0 ? 3 : 2) : 3;
    if (!page || groups >= (visual ? 2 : operationalGroupLimit) || y - needed < 36) newDailyPage(stop.name);
    const current = page!; const color = CITY_COLORS[stopIndex % CITY_COLORS.length];
    current.drawRectangle({ x: PAGE.margin, y: y - 35, width: PAGE.width - PAGE.margin * 2, height: 35, color });
    drawFlag(current, stop.country, PAGE.margin + 16, y - 24, 20, 12);
    current.drawText(truncate(stop.name.toUpperCase(), dossier.bold, 12, 330), { x: PAGE.margin + 44, y: y - 21, size: 12, font: dossier.bold, color: rgb(1, 1, 1) });
    current.drawText(truncate(`${dateLabel(stop.checkIn)}-${dateLabel(stop.checkOut)}`, dossier.bold, 6.2, 90), { x: PAGE.margin + 44, y: y - 31, size: 6.2, font: dossier.bold, color: rgb(.97, .99, 1) });
    current.drawText(visual ? "ACTIVITIES + FIXED ANCHORS" : "DAY-BY-DAY PRIORITIES", { x: PAGE.width - PAGE.margin - 114, y: y - 21, size: 5.5, font: dossier.regular, color: rgb(.90, .95, .98) });
    y -= 42;
    for (const day of days) y = drawDailyRow(dossier, current, day, y, color, visual, images);
    y -= 11; groups += 1;
  });
  if (!page) {
    page = dossier.newPage("Daily plan", "no scheduled days");
    page.drawText("No daily itinerary has been scheduled.", { x: PAGE.margin, y: 720, size: 12, font: dossier.regular, color: dossier.palette.muted });
  }
}

async function loadVisualImages(doc: PDFDocument, snapshot: TripExportSnapshot, options: TripPdfOptions): Promise<Embedded> {
  const result: Embedded = new Map();
  if (!options.visual || !options.imageLoader) return result;
  const urls = [...new Set(snapshot.days.flatMap((day) => day.activities.map((activity) => activity.image).filter(Boolean)))].slice(0, 60);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(4, urls.length) }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try { const bytes = await options.imageLoader!(url); if (bytes) { const image = await embedImage(doc, bytes); if (image) result.set(url, image); } } catch { /* Missing imagery must not break the itinerary. */ }
    }
  }));
  return result;
}

export async function createTripPdfReplica(snapshotInput: TripExportSnapshot, options: TripPdfOptions): Promise<Uint8Array> {
  const { sanitizeTripExportSnapshot } = await import("./trip-exports.ts");
  const snapshot = sanitizeTripExportSnapshot(snapshotInput);
  const doc = await PDFDocument.create();
  doc.setTitle(`${snapshot.title} - ${options.visual ? "visual dossier" : "operational itinerary"}`);
  doc.setAuthor("TRIPPY Travel Optimizer");
  doc.setSubject("Sanitized itinerary dossier without private booking references");
  doc.setCreator("TRIPPY Travel Optimizer");
  const regular = await doc.embedFont(StandardFonts.Helvetica); const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const icons = new Map<TripPdfIcon, PDFImage>();
  for (const [name, bytes] of Object.entries(options.icons ?? {}) as Array<[TripPdfIcon, Uint8Array | undefined]>) {
    if (!bytes) continue; const image = await embedImage(doc, bytes); if (image) icons.set(name, image);
  }
  const dark = options.theme === "dark";
  const palette: Palette = dark
    ? { bg: rgb(.01, .055, .09), panel: rgb(.035, .105, .16), card: rgb(.045, .14, .20), text: rgb(.96, .98, .99), muted: rgb(.62, .72, .79), line: rgb(.14, .27, .34), rail: rgb(.02, .08, .12) }
    : { bg: rgb(.995, .995, .99), panel: rgb(.94, .96, .97), card: rgb(.94, .96, .97), text: rgb(.045, .11, .17), muted: rgb(.34, .43, .51), line: rgb(.76, .82, .86), rail: NAVY };
  const dossier = new Dossier(doc, regular, bold, palette, icons, snapshot);
  const items = collectItems(snapshot); const images = await loadVisualImages(doc, snapshot, options);
  const overview = dossier.newPage(options.visual ? "Visual travel dossier" : "Operational itinerary", `${dateLabel(snapshot.start)} - ${dateLabel(snapshot.end)}`);
  const y = drawCalendar(dossier, overview, 744, items);
  drawDecisionDeck(dossier, overview, y, items);
  drawLedger(dossier, items);
  drawDaily(dossier, options.visual === true, images);
  dossier.footer();
  return doc.save({ useObjectStreams: true });
}
