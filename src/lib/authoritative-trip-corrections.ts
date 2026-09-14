// Public-safe, user-reviewed corrections are applied before normalization so
// stale imported bundles cannot restore cancelled routes or downgrade bookings
// merely because their private references were redacted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = Record<string, any>;

const inactiveFlight = /\b(?:SAS|SK676|SK1799|CPH|Copenhagen|KL1328)\b|refunded/i;

const reviewed = {
  inbound: { kind: "Flight", date: "Sep 21–22", title: "Condor DE2039 + JetBlue B61254", detail: "DCA → BOS → FRA · departs 13:15 Sep 21; arrives 05:45 Sep 22", status: "confirmed" },
  ringHotel: { kind: "Hotel", date: "Sep 22–24", title: "Hotel an der Nordschleife", detail: "Adenau · September 22–24 · breakfast included", status: "confirmed" },
  ringDrive: { kind: "Activity", date: "Sep 23", title: "Drivenürburg BMW 120i", detail: "Instructor-guided laps · arrive 15:30–16:00 · track opens 17:00 · deposit status to verify", status: "confirmed" },
  polandFlight: { kind: "Flight", date: "Sep 24", title: "United / Air Dolomiti LH1374", detail: "FRA 12:35 → WRO 14:00", status: "confirmed" },
  wroclawTransfer: { kind: "Car", date: "Sep 24", title: "WRO Airport → Entre Hotel transfer", detail: "Confirmed taxi transfer after LH1374 arrival", status: "confirmed" },
  wroclawHotel: { kind: "Hotel", date: "Sep 24–27", title: "Entre Hotel by Zdrojowa", detail: "Wrocław Old Town · September 24–27", status: "confirmed" },
  krakowHotel: { kind: "Hotel", date: "Sep 27–30", title: "Hotel M4 Boutique", detail: "Kraków · September 27–30 · Morsztynowska 4", status: "confirmed" },
  duplicateHotel: { kind: "Hotel", date: "Sep 27–30", title: "Millou Aparthotel · duplicate hold", detail: "Confirmed overlapping Kraków hold; choose or cancel against Hotel M4 Boutique", status: "conflict" },
  auschwitz: { kind: "Activity", date: "Sep 29 · 12:00", title: "Auschwitz-Birkenau guided tour", detail: "12:00 pickup at Hotel M4 Boutique", status: "confirmed" },
  brusselsStay: { kind: "Airbnb", date: "Sep 30–Oct 2", title: "Stylish studio with private balcony near Grand Place", detail: "Brussels · check-in after 16:00 · checkout by 10:00", status: "confirmed" },
  sleeper: { kind: "Train", date: "Oct 5–6", title: "European Sleeper · Amsterdam → Berlin", detail: "Amsterdam Centraal 21:34 → Berlin Gesundbrunnen 06:01", status: "confirmed" },
  returnFlight: { kind: "Flight", date: "Oct 12", title: "United UA109", detail: "MUC 12:00 → IAD 15:10", status: "confirmed" },
} satisfies Record<string, RawRecord>;

function mergeReviewed(existing: RawRecord[], record: RawRecord, pattern: RegExp) {
  const prior = existing.find((item) => pattern.test(`${item.title || ""} ${item.detail || ""}`));
  return { ...(prior || { href: "" }), ...record };
}

function confirmedFlightOption() {
  return {
    id: "confirmed-lh1374", mode: "flight", name: "United / Air Dolomiti LH1374 · FRA → WRO",
    ride: "FRA 12:35 → WRO 14:00", door: "Confirmed flight; allow airport and hotel-transfer time",
    hours: 1.42, low: 0, high: 0, note: "Confirmed September 24, 2026. Sensitive transaction metadata excluded.",
  };
}

function confirmedSleeperOption() {
  return {
    id: "confirmed-sleeper", mode: "train", name: "European Sleeper · Amsterdam → Berlin",
    ride: "Amsterdam Centraal 21:34 → Berlin Gesundbrunnen 06:01", door: "Confirmed overnight train",
    hours: 8.45, low: 279.99, high: 279.99, note: "Confirmed for October 5, 2026.",
  };
}

export function applyAuthoritative2026Corrections(source: RawRecord): RawRecord {
  const raw = { ...source };
  const sourceBookings = Array.isArray(source.$a) ? source.$a as RawRecord[] : [];
  const bookings = sourceBookings.filter((item) => !inactiveFlight.test(`${item.title || ""} ${item.detail || ""}`) && !/WRO\s*→\s*AMS replacement/i.test(item.title || ""));
  const specifications: Array<[RawRecord, RegExp]> = [
    [reviewed.inbound, /DE2039|B61254/i], [reviewed.ringHotel, /Hotel an der Nordschleife/i],
    [reviewed.ringDrive, /Driven[uü]rburg/i], [reviewed.polandFlight, /LH1374/i],
    [reviewed.wroclawTransfer, /WRO Airport.*Entre|taxi.*LH1374/i], [reviewed.wroclawHotel, /Entre Hotel/i],
    [reviewed.krakowHotel, /Hotel M4 Boutique/i], [reviewed.duplicateHotel, /Millou Aparthotel/i],
    [reviewed.auschwitz, /Auschwitz-Birkenau/i], [reviewed.brusselsStay, /Grand Place|Rue du March/i],
    [reviewed.sleeper, /(?:Euro|European) Sleeper/i], [reviewed.returnFlight, /UA109/i],
  ];
  raw.$a = specifications.map(([record, pattern]) => mergeReviewed(bookings, record, pattern));

  raw.Ta = {
    "2026-09-22": [
      { kind: "flight", label: "Arrive FRA 05:45", detail: "Condor DE2039 via Boston" },
      { kind: "missing", label: "FRA rental car", detail: "Frankfurt Airport → Nürburgring · collect after landing; return before LH1374 on September 24" },
      { kind: "hotel", label: "Hotel an der Nordschleife", detail: "Confirmed September 22–24" },
    ],
    "2026-09-23": [{ kind: "activity", label: "Drivenürburg BMW 120i", detail: "Confirmed session · arrive 15:30–16:00 · track opens 17:00" }],
    "2026-09-24": [
      { kind: "missing", label: "Ring → FRA rental return", detail: "Nürburgring → Frankfurt Airport · return with sufficient LH1374 check-in buffer" },
      { kind: "flight", label: "LH1374 · FRA → WRO", detail: "Confirmed · 12:35–14:00" },
      { kind: "car", label: "WRO Airport → Entre Hotel transfer", detail: "Confirmed taxi after arrival" },
      { kind: "hotel", label: "Entre Hotel by Zdrojowa", detail: "Confirmed Wrocław stay · September 24–27" },
    ],
    "2026-09-27": [
      { kind: "missing", label: "Wrocław → Kraków train", detail: "Direct PKP Intercity still to book" },
      { kind: "hotel", label: "Hotel M4 Boutique", detail: "Confirmed Kraków stay · September 27–30" },
    ],
    "2026-09-29": [{ kind: "activity", label: "Auschwitz-Birkenau guided tour", detail: "Confirmed · 12:00 pickup at Hotel M4 Boutique" }],
    "2026-09-30": [
      { kind: "missing", label: "Kraków → Brussels transport", detail: "Final carrier and departure time still need selection" },
      { kind: "hotel", label: "Stylish studio with private balcony near Grand Place", detail: "Confirmed Brussels stay through October 2 · check-in after 16:00" },
    ],
    "2026-10-02": [{ kind: "missing", label: "Brussels night · October 2", detail: "Current confirmed stay ends before this final Brussels night" }],
    "2026-10-03": [
      { kind: "missing", label: "Brussels → Amsterdam rail", detail: "Direct rail still to book" },
      { kind: "missing", label: "Amsterdam hotel", detail: "Stay for October 3–5 still to book" },
    ],
    "2026-10-05": [{ kind: "train", label: "European Sleeper · Amsterdam → Berlin", detail: "Confirmed · Amsterdam Centraal 21:34 → Berlin Gesundbrunnen 06:01" }],
    "2026-10-06": [{ kind: "missing", label: "Berlin hotel", detail: "Stay after the overnight train through October 9 still to book" }],
    "2026-10-09": [
      { kind: "missing", label: "Berlin → Munich train", detail: "Direct ICE still to book" },
      { kind: "missing", label: "Munich hotel", detail: "Stay for October 9–12 still to book" },
    ],
    "2026-10-12": [
      { kind: "missing", label: "Munich hotel → MUC transfer", detail: "Airport transfer timing still to arrange" },
      { kind: "flight", label: "UA109 · MUC → IAD", detail: "Confirmed · 12:00–15:10" },
    ],
  };

  const plans = { ...(source.Sa || {}) };
  if (Array.isArray(plans.ring) && plans.ring[2]) {
    plans.ring = [...plans.ring];
    plans.ring[2] = {
      ...plans.ring[2],
      theme: "Return car and fly to Wrocław",
      blocks: [
        { time: "Morning", title: "Nürburgring → Frankfurt Airport", note: "Refuel, complete the rental return and preserve the flight check-in buffer." },
        { time: "Midday", title: "United / Air Dolomiti LH1374 · FRA → WRO", note: "Confirmed flight, 12:35–14:00." },
        { time: "Afternoon", title: "WRO airport transfer and Entre Hotel check-in", note: "Confirmed taxi and Wrocław hotel." },
      ],
    };
  }
  if (Array.isArray(plans.berlin) && plans.berlin[3]) {
    plans.berlin = [...plans.berlin];
    plans.berlin[3] = {
      ...plans.berlin[3],
      theme: "Flexible Berlin day",
      note: "Keep the final Berlin day flexible for a priority museum, neighborhood, or recovery time before the next morning's train.",
      blocks: [
        { time: "Morning", title: "Museum Island or a saved priority", note: "Choose one major museum and reserve only if it remains a top priority." },
        { time: "Afternoon", title: "Classic Remise or neighborhood walk", note: "Use the open block for a saved automotive stop or an unhurried neighborhood." },
        { time: "Evening", title: "Flexible Berlin night", note: "Keep a nearby backup and protect the next morning's departure." },
      ],
    };
  }
  raw.Sa = plans;

  const places = { ...(source.Aa || {}) };
  if (Array.isArray(places.wroclaw)) places.wroclaw = places.wroclaw.map((place: RawRecord) => place.id === "wro-airport" ? { ...place, detail: "Confirmed LH1374 arrival at 14:00" } : place);
  if (Array.isArray(places.krakow)) places.krakow = places.krakow.map((place: RawRecord) => place.id === "krk-airport" ? { ...place, detail: "Departure airport for the September 30 transport leg" } : place);
  raw.Aa = places;

  const transport = { ...(source._i || {}) };
  for (const obsolete of ["frankfurt-krakow", "krakow-wroclaw", "wroclaw-amsterdam", "amsterdam-brussels", "krakow-amsterdam"]) delete transport[obsolete];
  if (transport["frankfurt-wroclaw"]) {
    const options = (transport["frankfurt-wroclaw"].options || []).filter((option: RawRecord) => option.id !== "confirmed-lh1374");
    transport["frankfurt-wroclaw"] = { ...transport["frankfurt-wroclaw"], recommend: "confirmed-lh1374", options: [confirmedFlightOption(), ...options] };
  }
  if (transport["amsterdam-berlin"]) {
    const options = (transport["amsterdam-berlin"].options || []).filter((option: RawRecord) => option.id !== "confirmed-sleeper");
    transport["amsterdam-berlin"] = { ...transport["amsterdam-berlin"], recommend: "confirmed-sleeper", options: [confirmedSleeperOption(), ...options] };
  }
  raw._i = transport;
  return raw;
}
