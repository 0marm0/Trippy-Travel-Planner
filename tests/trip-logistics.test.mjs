import test from "node:test";
import assert from "node:assert/strict";
import { buildTripLogistics, calendarDates, logisticsItemsForDate, transportLegStatus } from "../src/lib/trip-logistics.ts";

const option = (id, mode, name) => ({ id, mode, name, ride: "TBC", door: "TBC", hours: 0, low: 0, high: 0, note: "Planning option" });
const stop = (id, name, flag, checkIn, checkOut) => ({ id, name, country: "", flag, checkIn, checkOut, nights: Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000), lat: 0, lng: 0, stay: "", hero: "" });

function fixture() {
  return {
    id: "europe-2026", dataMode: "sample", title: "Test", subtitle: "", start: "2026-09-21", end: "2026-10-12",
    stops: [
      stop("ring", "Nürburgring", "🇩🇪", "2026-09-22", "2026-09-24"),
      stop("krakow", "Kraków", "🇵🇱", "2026-09-24", "2026-09-27"),
      stop("wroclaw", "Wrocław", "🇵🇱", "2026-09-27", "2026-09-30"),
      stop("brussels", "Brussels", "🇧🇪", "2026-09-30", "2026-10-03"),
      stop("amsterdam", "Amsterdam", "🇳🇱", "2026-10-03", "2026-10-05"),
      stop("berlin", "Berlin", "🇩🇪", "2026-10-05", "2026-10-08"),
      stop("munich", "Munich", "🇩🇪", "2026-10-08", "2026-10-12"),
    ],
    bookings: [
      { kind: "Flight", date: "Sep 21–22", title: "Condor DE2039 + JetBlue B61254", detail: "DCA → BOS → FRA · departs 13:15 Sep 21; arrives 05:45 Sep 22", ref: "Private reference removed", href: "https://private.invalid" },
      { kind: "Hotel", date: "Sep 22–24", title: "Hotel an der Nordschleife", detail: "Adenau", ref: "Private reference removed", href: "" },
      { kind: "Flight", date: "Sep 24", title: "Example EA676", detail: "FRA 15:20 → VIE 16:45 → KRK 19:30", ref: "Private reference removed", href: "" },
      { kind: "Hotel", date: "Sep 24–27", title: "Hotel M4 Boutique", detail: "Kraków", ref: "Private reference removed", href: "" },
      { kind: "Hotel", date: "Sep 27–30", title: "Entre Hotel", detail: "Wrocław", ref: "Private reference removed", href: "" },
      { kind: "Activity", date: "Sep 29 · 12:00", title: "Auschwitz tour", detail: "Hotel M4 Boutique pickup", ref: "Private reference removed", href: "" },
      { kind: "Flight", date: "Sep 30", title: "WRO → AMS replacement flight", detail: "Missing: refunded prior ticket", ref: "Planning item · no private reference", href: "" },
      { kind: "Airbnb", date: "Sep 30–Oct 2", title: "Brussels studio", detail: "Brussels", ref: "Private reference removed", href: "" },
      { kind: "Train", date: "TBC", title: "Euro Sleeper to Berlin", detail: "Booked; confirmation email not yet received", ref: "Planning item · no private reference", href: "" },
      { kind: "Flight", date: "Oct 12", title: "United UA109", detail: "MUC 12:00 → IAD 15:10", ref: "Private reference removed", href: "" },
    ],
    dayAnchors: {
      "2026-09-22": [{ kind: "missing", label: "Road car to Adenau", detail: "FRA pickup still needs booking" }],
      "2026-09-27": [{ kind: "missing", label: "Krakow to Wroclaw train", detail: "Direct train still to book" }],
      "2026-09-30": [{ kind: "missing", label: "AMS to Brussels late connection", detail: "Needed that night" }],
    },
    transport: [
      { id: "frankfurt-ring", from: "frankfurt", to: "ring", date: "2026-09-22", recommend: "car", options: [option("car", "car", "Rental car")] },
      { id: "frankfurt-krakow", from: "frankfurt", to: "krakow", date: "2026-09-24", recommend: "example", options: [option("example", "flight", "Example itinerary")] },
      { id: "krakow-wroclaw", from: "krakow", to: "wroclaw", date: "2026-09-27", recommend: "rail", options: [option("rail", "train", "PKP Intercity")] },
      { id: "amsterdam-brussels", from: "amsterdam", to: "brussels", date: "2026-09-30", recommend: "rail", options: [option("rail", "train", "Eurocity") ] },
      { id: "brussels-amsterdam", from: "brussels", to: "amsterdam", date: "2026-10-03", recommend: "rail", options: [option("rail", "train", "Eurocity") ] },
    ],
    hotels: [{ id: "krakow-m4", city: "krakow", name: "Hotel M4 Boutique", tier: "", neighborhood: "", low: 0, high: 0, stars: 0, flags: [], amenities: [], why: "", tradeoff: "", images: [], offers: [] }],
    activities: [], cityPlans: {}, mapPlaces: {}, clusterGuidance: {},
  };
}

test("calendar includes the US departure and keeps detailed flight facts", () => {
  const logistics = buildTripLogistics(fixture());
  assert.equal(logistics.start, "2026-09-21");
  assert.equal(calendarDates(logistics).length, 22);
  const departure = logisticsItemsForDate(logistics, "2026-09-21").find((item) => item.kind === "flight");
  assert.equal(departure?.status, "confirmed");
  assert.match(`${departure?.title} ${departure?.detail}`, /DE2039.*B61254.*DCA.*BOS.*FRA.*13:15.*05:45/);
  assert.doesNotMatch(JSON.stringify(logistics), /Private reference removed|private\.invalid/);
});

test("reviewed status survives reference redaction and overrides ambiguous wording", () => {
  const data = fixture();
  data.bookings[0].status = "confirmed";
  data.bookings[0].ref = "";
  data.bookings[0].detail += " · verification note retained";
  const item = buildTripLogistics(data).items.find((entry) => entry.title.includes("DE2039"));
  assert.equal(item?.status, "confirmed");
});

test("a uniquely confirmed schedule supplies the missing connection departure, but a recommendation cannot", () => {
  const data = fixture();
  const flight = data.transport.find((leg) => leg.id === "frankfurt-krakow").options[0];
  flight.ride = "FRA 15:20 → VIE 16:45; VIE 18:00 → KRK 19:30";
  assert.doesNotMatch(buildTripLogistics(data).items.find((item) => item.title === "Example EA676").detail, /18:00/);
  flight.note = "Confirmed September 24, 2026.";
  assert.match(buildTripLogistics(data).items.find((item) => item.title === "Example EA676").detail, /VIE 18:00/);
});

test("recommendations never close missing transport or stay coverage", () => {
  const data = fixture();
  const logistics = buildTripLogistics(data);
  assert.equal(transportLegStatus(logistics, data.transport[0], data.stops), "missing");
  assert.equal(transportLegStatus(logistics, data.transport[1], data.stops), "confirmed");
  assert.equal(transportLegStatus(logistics, data.transport[4], data.stops), "missing");
  assert(logistics.missing.some((item) => item.kind === "stay" && item.date === "2026-10-02" && /Brussels/.test(item.title)));
  assert(logistics.missing.some((item) => item.kind === "train" && item.date === "2026-10-03"));
});

test("TBC and contradictory records remain visibly distinct from confirmed", () => {
  const logistics = buildTripLogistics(fixture());
  const sleeper = logistics.exceptions.find((item) => /Sleeper/.test(item.title));
  const pickup = logistics.exceptions.find((item) => /Auschwitz/.test(item.title));
  assert.equal(sleeper?.status, "tbc");
  assert.equal(sleeper?.date, undefined);
  assert.equal(pickup?.status, "conflict");
  assert.match(pickup?.detail || "", /Conflicts with the route location/);
});

test("a same-day confirmed item never hides an unrelated missing item of the same mode", () => {
  const data = fixture();
  data.bookings.push({ kind: "Ring", date: "Sep 22", title: "Confirmed driving session", detail: "Nürburgring track activity", ref: "Private reference removed", href: "" });
  const logistics = buildTripLogistics(data);
  assert(logistics.missing.some((item) => item.title === "Road car to Adenau"));
});
