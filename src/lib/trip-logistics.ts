import type { BookingRecord, Trip2026Payload, TripStop, TransportLeg } from "./trip-model";

export type LogisticsKind = "flight" | "train" | "car" | "stay" | "activity";
export type LogisticsStatus = "confirmed" | "missing" | "tbc" | "conflict";
export type LogisticsItem = {
  id: string;
  date?: string;
  endDate?: string;
  endExclusive?: boolean;
  kind: LogisticsKind;
  status: LogisticsStatus;
  title: string;
  detail: string;
  source: "booking" | "anchor" | "route" | "coverage" | "conflict";
};
export type TripLogistics = {
  start: string;
  end: string;
  items: LogisticsItem[];
  missing: LogisticsItem[];
  exceptions: LogisticsItem[];
};

const monthNumbers: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseBookingDates(value: string, year: number): { date?: string; endDate?: string } {
  if (/tbc/i.test(value)) return {};
  const text = value.replace(/\s*·.*$/, "").trim();
  const crossMonth = text.match(/^([A-Za-z]{3})\s+(\d{1,2})\s*[–-]\s*([A-Za-z]{3})\s+(\d{1,2})$/);
  if (crossMonth) return { date: iso(year, monthNumbers[crossMonth[1].toLowerCase()], Number(crossMonth[2])), endDate: iso(year, monthNumbers[crossMonth[3].toLowerCase()], Number(crossMonth[4])) };
  const sameMonth = text.match(/^([A-Za-z]{3})\s+(\d{1,2})\s*[–-]\s*(\d{1,2})$/);
  if (sameMonth) return { date: iso(year, monthNumbers[sameMonth[1].toLowerCase()], Number(sameMonth[2])), endDate: iso(year, monthNumbers[sameMonth[1].toLowerCase()], Number(sameMonth[3])) };
  const single = text.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  return single ? { date: iso(year, monthNumbers[single[1].toLowerCase()], Number(single[2])) } : {};
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function kindFor(value: string): LogisticsKind {
  if (/train|rail|sleeper|intercity|eurostar/i.test(value)) return "train";
  if (/transfer|taxi|pickup|car|ring|road|rental|drive/i.test(value)) return "car";
  if (/hotel|airbnb|stay/i.test(value)) return "stay";
  if (/flight|airport|\b[A-Z]{2}\d{2,4}\b|\b(?:FRA|CPH|KRK|WRO|AMS|MUC|IAD|DCA|BOS)\b/.test(value)) return "flight";
  return "activity";
}

function bookingStatus(booking: Pick<BookingRecord, "date" | "title" | "detail" | "status" | "ref">): LogisticsStatus {
  if (booking.status) return booking.status;
  const text = `${booking.date} ${booking.title} ${booking.detail}`;
  if (/missing:/i.test(text)) return "missing";
  if (/\bTBC\b|not yet received|awaiting confirmation/i.test(text)) return "tbc";
  if (/planning item|no private reference|unknown/i.test(booking.ref)) return "tbc";
  return booking.ref.trim() ? "confirmed" : "tbc";
}

function kindForBooking(booking: Pick<BookingRecord, "kind" | "title" | "detail">): LogisticsKind {
  if (/hotel|airbnb|stay/i.test(booking.kind)) return "stay";
  if (/train|rail/i.test(booking.kind)) return "train";
  if (/ring|car/i.test(booking.kind)) return "car";
  if (/flight/i.test(booking.kind)) return "flight";
  if (/activity/i.test(booking.kind)) return "activity";
  return kindFor(`${booking.title} ${booking.detail}`);
}

function aliases(stopOrId: TripStop | string) {
  const id = typeof stopOrId === "string" ? stopOrId : stopOrId.id;
  const name = typeof stopOrId === "string" ? stopOrId : stopOrId.name;
  const values: Record<string, string[]> = {
    frankfurt: ["frankfurt", "fra"], ring: ["ring", "nurburgring", "adenau"], krakow: ["krakow", "krk"],
    wroclaw: ["wroclaw", "wro"], brussels: ["brussels", "bru"], amsterdam: ["amsterdam", "ams"],
    berlin: ["berlin", "ber"], munich: ["munich", "muc"],
  };
  return [...new Set([id, name, ...(values[id] || [])].filter(Boolean).map(normalize))];
}

function hasEndpoint(text: string, endpoint: TripStop | string) {
  const haystack = ` ${normalize(text)} `;
  return aliases(endpoint).some((alias) => haystack.includes(` ${alias} `));
}

function itemMatchesLeg(item: LogisticsItem, leg: TransportLeg, stops: TripStop[]) {
  if (!item.date || item.date !== leg.date) return false;
  const from = stops.find((stop) => stop.id === leg.from) || leg.from;
  const to = stops.find((stop) => stop.id === leg.to) || leg.to;
  return hasEndpoint(`${item.title} ${item.detail}`, from) && hasEndpoint(`${item.title} ${item.detail}`, to);
}

function sameLogisticsIdentity(left: LogisticsItem, right: LogisticsItem, data: Trip2026Payload) {
  if (left.kind !== right.kind) return false;
  if (right.status === "missing" && left.status !== "missing") return false;
  const leftTitle = normalize(left.title);
  const rightTitle = normalize(right.title);
  if (leftTitle.length >= 8 && rightTitle.length >= 8 && (leftTitle.includes(rightTitle) || rightTitle.includes(leftTitle))) return true;
  if (left.kind === "flight") {
    const text = (item: LogisticsItem) => `${item.title} ${item.detail}`;
    const values = (value: string, pattern: RegExp) => new Set(value.toUpperCase().match(pattern) || []);
    const overlaps = (a: Set<string>, b: Set<string>) => [...a].some((value) => b.has(value));
    const numbersMatch = overlaps(values(text(left), /\b[A-Z]{2}\d{2,4}\b/g), values(text(right), /\b[A-Z]{2}\d{2,4}\b/g));
    const airportMatches = overlaps(values(text(left), /\b[A-Z]{3}\b/g), values(text(right), /\b[A-Z]{3}\b/g));
    const timeMatches = overlaps(values(text(left), /\b\d{1,2}:\d{2}\b/g), values(text(right), /\b\d{1,2}:\d{2}\b/g));
    if (numbersMatch || airportMatches && timeMatches) return true;
  }
  return data.transport.some((leg) => left.date === leg.date && right.date === leg.date && itemMatchesLeg(left, leg, data.stops) && itemMatchesLeg(right, leg, data.stops));
}

function addDays(date: string, count: number) {
  return new Date(Date.parse(`${date}T12:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
}

function datesUntil(start: string, end: string) {
  const result: string[] = [];
  for (let date = start; date < end; date = addDays(date, 1)) result.push(date);
  return result;
}

export function calendarDates(logistics: Pick<TripLogistics, "start" | "end">) {
  return [...datesUntil(logistics.start, logistics.end), logistics.end];
}

export function logisticsItemsForDate(logistics: TripLogistics, date: string) {
  return logistics.items.filter((item) => {
    if (!item.date) return false;
    if (!item.endDate) return item.date === date;
    return date >= item.date && (item.endExclusive ? date < item.endDate : date <= item.endDate);
  });
}

export function transportLegStatus(logistics: TripLogistics, leg: TransportLeg, stops: TripStop[]): LogisticsStatus {
  const matching = logistics.items.filter((item) => itemMatchesLeg(item, leg, stops) || item.id === `route:${leg.id}` || item.id.startsWith(`conflict:${leg.id}:`));
  if (matching.some((item) => item.status === "conflict")) return "conflict";
  if (matching.some((item) => item.status === "missing")) return "missing";
  if (matching.some((item) => item.status === "tbc")) return "tbc";
  return "confirmed";
}

function itemForAnchor(date: string, anchor: { kind: string; label: string; detail: string }, legs: TransportLeg[], stops: TripStop[]): LogisticsItem {
  const text = `${anchor.label} ${anchor.detail}`;
  const matchingLeg = legs.find((leg) => leg.date === date && itemMatchesLeg({ id: "probe", date, kind: "activity", status: "missing", title: anchor.label, detail: anchor.detail, source: "anchor" }, leg, stops));
  const plannedMode = matchingLeg?.options.find((option) => option.id === matchingLeg.recommend)?.mode;
  return {
    id: `anchor:${date}:${normalize(anchor.label)}`,
    date,
    kind: anchor.kind === "hotel" ? "stay" : anchor.kind === "flight" ? "flight" : anchor.kind === "activity" ? "activity" : anchor.kind === "train" ? "train" : anchor.kind === "car" ? "car" : anchor.kind === "missing" && plannedMode ? (plannedMode === "bus" ? "train" : plannedMode) : kindFor(text),
    status: anchor.kind === "missing" ? "missing" : "tbc",
    title: anchor.label,
    detail: anchor.detail,
    source: "anchor",
  };
}

function bookingConflict(item: LogisticsItem, data: Trip2026Payload) {
  if (!item.date || item.kind === "stay" || item.kind === "flight") return false;
  const routeStop = data.stops.find((stop) => item.date! >= stop.checkIn && item.date! < stop.checkOut);
  if (!routeStop) return false;
  const text = `${item.title} ${item.detail}`;
  const referencedHotel = data.hotels.find((hotel) => normalize(text).includes(normalize(hotel.name)));
  if (referencedHotel) return referencedHotel.city !== routeStop.id;
  const referencedStay = data.bookings.find((booking) => /hotel|airbnb|stay/i.test(booking.kind) && normalize(text).includes(normalize(booking.title)));
  const referencedStop = referencedStay && data.stops.find((stop) => hasEndpoint(`${referencedStay.title} ${referencedStay.detail}`, stop));
  return Boolean(referencedStop && referencedStop.id !== routeStop.id);
}

export function buildTripLogistics(data: Trip2026Payload, selectedTransport: Record<string, string> = {}): TripLogistics {
  const year = Number(data.end.slice(0, 4));
  const bookingItems = data.bookings.map((booking, index): LogisticsItem => {
    const range = parseBookingDates(booking.date, year);
    const kind = kindForBooking(booking);
    const item: LogisticsItem = {
      id: `booking:${index}:${normalize(booking.title)}`,
      ...range,
      endExclusive: kind === "stay" && Boolean(range.endDate),
      kind,
      status: bookingStatus(booking),
      title: booking.title,
      detail: booking.detail,
      source: "booking",
    };
    if (bookingConflict(item, data)) {
      item.status = "conflict";
      item.detail = `${item.detail} · Conflicts with the route location on this date.`;
    }
    if (item.kind === "flight" && item.status === "confirmed") {
      const [routeSummary, ...notes] = item.detail.split(/\s*·\s*/);
      // Expand a compact booked-flight summary only from a uniquely matching,
      // explicitly confirmed source schedule, never from a recommendation.
      if (/^[A-Z]{3} \d{1,2}:\d{2}(?:\s*→\s*[A-Z]{3} \d{1,2}:\d{2})+$/.test(routeSummary)) {
        const airports = (value: string) => [...new Set(value.match(/\b[A-Z]{3}\b/g) || [])].join(",");
        const schedules = data.transport.filter((leg) => itemMatchesLeg(item, leg, data.stops)).flatMap((leg) => leg.options).filter((option) => option.mode === "flight" && /^Confirmed\b/i.test(option.note) && airports(option.ride) === airports(routeSummary) && (option.ride.match(/\d{1,2}:\d{2}/g) || []).length > (routeSummary.match(/\d{1,2}:\d{2}/g) || []).length);
        if (schedules.length === 1) item.detail = [schedules[0].ride, ...notes].join(" · ");
      }
    }
    return item;
  });

  const anchorItems = Object.entries(data.dayAnchors).flatMap(([date, anchors]) => anchors.map((anchor) => itemForAnchor(date, anchor, data.transport, data.stops))).filter((anchor) => !bookingItems.some((booking) => logisticsItemOccurs(booking, anchor.date!) && sameLogisticsIdentity(booking, anchor, data)));
  const items: LogisticsItem[] = [...bookingItems, ...anchorItems];

  for (const leg of data.transport) {
    const selected = leg.options.find((option) => option.id === selectedTransport[leg.id]) || leg.options.find((option) => option.id === leg.recommend);
    const kind: LogisticsKind = selected?.mode === "flight" ? "flight" : selected?.mode === "car" ? "car" : "train";
    const alreadyCovered = items.some((item) => item.status === "confirmed" && item.kind === kind && itemMatchesLeg(item, leg, data.stops));
    const alreadyMissing = items.some((item) => item.status === "missing" && itemMatchesLeg(item, leg, data.stops));
    if (!alreadyCovered && !alreadyMissing) items.push({
      id: `route:${leg.id}`,
      date: leg.date,
      kind,
      status: "missing",
      title: `${kind === "flight" ? "Flight" : kind === "car" ? "Car" : "Train"} not confirmed · ${displayEndpoint(leg.from, data.stops)} → ${displayEndpoint(leg.to, data.stops)}`,
      detail: selected ? `${selected.name} is a planning selection only; no confirmed booking record is attached.` : "No confirmed booking record is attached.",
      source: "route",
    });
  }

  const confirmedStays = items.filter((item) => item.kind === "stay" && item.status === "confirmed");
  const confirmedOvernightTransport = items.filter((item) => (item.kind === "train" || item.kind === "flight") && item.status === "confirmed" && item.date && item.endDate);
  for (const stop of data.stops) {
    const hasExplicitMissingStay = items.some((item) => item.kind === "stay" && item.status === "missing" && item.source === "anchor" && item.date && item.date >= stop.checkIn && item.date < stop.checkOut);
    if (hasExplicitMissingStay) continue;
    const uncovered = datesUntil(stop.checkIn, stop.checkOut).filter((date) => !confirmedStays.some((stay) => {
      const matchedHotel = data.hotels.find((hotel) => normalize(`${stay.title} ${stay.detail}`).includes(normalize(hotel.name)));
      return logisticsItemOccurs(stay, date) && (matchedHotel?.city === stop.id || hasEndpoint(`${stay.title} ${stay.detail}`, stop));
    }) && !confirmedOvernightTransport.some((transport) => transport.date === date && hasEndpoint(`${transport.title} ${transport.detail}`, stop)));
    for (let index = 0; index < uncovered.length;) {
      const start = uncovered[index];
      let end = addDays(start, 1);
      while (uncovered[index + 1] === end) { index += 1; end = addDays(end, 1); }
      items.push({ id: `coverage:${stop.id}:${start}`, date: start, endDate: end, endExclusive: true, kind: "stay", status: "missing", title: `Stay not confirmed · ${stop.flag} ${stop.name}`, detail: `${formatShort(start)}–${formatShort(end)} · No confirmed accommodation record covers ${end === addDays(start, 1) ? "this night" : "these nights"}.`, source: "coverage" });
      index += 1;
    }
  }

  for (const leg of data.transport) {
    for (const option of leg.options.filter((candidate) => /conflict/i.test(candidate.note))) {
      items.push({ id: `conflict:${leg.id}:${option.id}`, date: leg.date, kind: option.mode === "flight" ? "flight" : option.mode === "car" ? "car" : "train", status: "conflict", title: `Source conflict · ${option.name}`, detail: option.note, source: "conflict" });
    }
  }

  items.sort((left, right) => (left.date || "9999").localeCompare(right.date || "9999") || left.status.localeCompare(right.status));
  const datedStarts = items.flatMap((item) => item.date ? [item.date] : []);
  const start = [data.start, ...datedStarts].sort()[0];
  return { start, end: data.end, items, missing: items.filter((item) => item.status === "missing"), exceptions: items.filter((item) => item.status === "tbc" || item.status === "conflict") };
}

function logisticsItemOccurs(item: LogisticsItem, date: string) {
  if (!item.date) return false;
  if (!item.endDate) return item.date === date;
  return date >= item.date && (item.endExclusive ? date < item.endDate : date <= item.endDate);
}

function displayEndpoint(id: string, stops: TripStop[]) {
  if (id === "frankfurt") return "Frankfurt";
  return stops.find((stop) => stop.id === id)?.name || id.replace(/^./, (letter) => letter.toUpperCase());
}

function formatShort(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}
