// Public-safe, user-reviewed corrections are applied before normalization so
// stale imported bundles cannot restore cancelled routes or downgrade bookings
// merely because their private references were redacted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = Record<string, any>;

const inactiveFlight = /\b(?:SAS|SK676|SK1799|CPH|Copenhagen)\b|refunded/i;

const reviewed = {
  inbound: { kind: "Flight", date: "Sep 21–22", title: "Condor DE2039 + JetBlue B61254", detail: "DCA → BOS → FRA · departs 13:15 Sep 21; arrives 05:45 Sep 22", status: "confirmed" },
  ringHotel: { kind: "Hotel", date: "Sep 22–24", title: "Hotel an der Nordschleife", detail: "Adenau · September 22–24 · breakfast included", status: "confirmed" },
  ringDrive: { kind: "Activity", date: "Sep 23", title: "Drivenürburg BMW 120i", detail: "Instructor-guided laps · arrive 15:30–16:00 · track opens 17:00 · deposit status to verify", status: "confirmed" },
  polandFlight: { kind: "Flight", date: "Sep 24", title: "United / Air Dolomiti LH1374", detail: "FRA 12:35 → WRO 14:00", status: "confirmed" },
  wroclawTransfer: { kind: "Car", date: "Sep 24", title: "WRO Airport → Entre Hotel transfer", detail: "Confirmed taxi transfer after LH1374 arrival", status: "confirmed" },
  wroclawHotel: { kind: "Hotel", date: "Sep 24–27", title: "Entre Hotel by Zdrojowa", detail: "Wrocław Old Town · September 24–27", status: "confirmed" },
  krakowHotel: { kind: "Apartment", date: "Sep 27–30", title: "MINT Luxury Apartments at the Main Square", detail: "Kraków Old Town · September 27–30 · confirmed paid stay", status: "confirmed" },
  auschwitz: { kind: "Activity", date: "Sep 29 · 12:00", title: "Auschwitz-Birkenau guided tour", detail: "Confirmed tour · send the organiser the new MINT Luxury Apartments pickup location", status: "needs_booking" },
  krakowFlight: { kind: "Flight", date: "Sep 30", title: "KLM KL1328 + onward connection", detail: "KRK 17:55 → AMS 19:55 → BRU · onward connection confirmed; second-segment timing not supplied", status: "confirmed" },
  brusselsStay: { kind: "Hotel", date: "Sep 30–Oct 2", title: "The Usual Brussels", detail: "Brussels · September 30–October 2 · confirmed stay", status: "confirmed" },
  amsterdamHotel: { kind: "Hotel", date: "Oct 2–3", title: "Room Mate Aitana", detail: "Amsterdam · October 2–3 · one confirmed night", status: "confirmed" },
  amsterdamHotelLater: { kind: "Hotel", date: "Oct 3–5", title: "Avani Museum Quarter Amsterdam", detail: "Amsterdam · October 3–5 · confirmed stay", status: "confirmed" },
  sleeper: { kind: "Train", date: "Oct 5–6", title: "European Sleeper · Amsterdam → Berlin", detail: "Amsterdam Centraal 21:34 → Berlin Gesundbrunnen 06:01", status: "confirmed" },
  berlinHotel: { kind: "Airbnb", date: "Oct 6–9", title: "SANA Berlin Residence · two-bedroom apartment", detail: "Berlin · October 6–9 · confirmed stay", status: "confirmed" },
  berlinMunichTrain: { kind: "Train", date: "Oct 9", title: "Deutsche Bahn · Berlin Hbf → München Hbf", detail: "Confirmed direct rail · Berlin Hbf 13:36 → München Hbf 17:43", status: "confirmed" },
  munichHotel: { kind: "Hotel", date: "Oct 9–12", title: "Pullman Munich", detail: "Munich · October 9–12 · confirmed stay", status: "confirmed" },
  returnFlight: { kind: "Flight", date: "Oct 12", title: "United UA109", detail: "MUC 12:00 → IAD 15:10", status: "confirmed" },
} satisfies Record<string, RawRecord>;

function reviewedCarRental(privateMode: boolean): RawRecord {
  return {
    kind: "Car",
    date: "Sep 22–24",
    title: "CarVia · Audi RS6 rental",
    detail: privateMode
      ? "Frankfurt Downtown · pickup 10:00 Sep 22 · return 10:00 Sep 24 · Audi RS6 · 500 km included · €569.45 incl. VAT · €1,750 deductible · confirmed"
      : "Frankfurt Downtown · pickup 10:00 Sep 22 · return 10:00 Sep 24 · Audi RS6 · 500 km included · confirmed",
    status: "confirmed",
  };
}

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

function confirmedKrakowBrusselsOption() {
  return {
    id: "confirmed-kl1328", mode: "flight", name: "KLM KL1328 + onward connection · KRK → AMS → BRU",
    ride: "KRK 17:55 → AMS 19:55 → BRU", door: "Planning allowance ≈6½h; onward segment timing was not supplied",
    hours: 6.5, low: 0, high: 0, note: "Confirmed for September 30, 2026. Seat, booking class, price and private reference excluded.",
  };
}

function confirmedCarOption(direction: "pickup" | "return") {
  const pickup = direction === "pickup";
  return {
    id: `confirmed-carvia-${direction}`,
    mode: "car",
    name: pickup ? "CarVia · Audi RS6 · Frankfurt Downtown pickup" : "CarVia · Audi RS6 · Frankfurt Downtown return",
    ride: "~163 km · 1h45–2h30",
    door: pickup ? "Collect after FRA arrival; allow pickup, rest and traffic buffer" : "Refuel, return downtown and preserve the FRA check-in buffer",
    hours: pickup ? 3.75 : 2.9,
    low: 0,
    high: 0,
    note: "Confirmed September 22–24, 2026. Private confirmation and financial details are excluded from the share-safe record.",
  };
}

function recommendedWroclawKrakowOption() {
  return {
    id: "recommended-pkp-midmorning",
    mode: "train",
    name: "PKP Intercity · direct mid-morning target",
    ride: "Target 10:10 → 13:03 · direct · recheck Sunday timetable",
    door: "~3½–4h hotel-to-hotel including checkout and station buffers",
    hours: 2.9,
    low: 15,
    high: 45,
    note: "Recommended window for Sunday September 27: use a direct Wrocław Główny → Kraków Główny IC/EIP service. This is a planning target, not a ticket or guaranteed schedule; confirm the exact Sunday departure before purchase.",
    source: "https://www.intercity.pl/en/",
  };
}

function confirmedBerlinMunichOption() {
  return {
    id: "confirmed-db-berlin-munich",
    mode: "train",
    name: "Deutsche Bahn · Berlin Hbf → München Hbf",
    ride: "Berlin Hbf 13:36 → München Hbf 17:43 · direct",
    door: "Confirmed direct rail; allow Berlin checkout and Munich hotel-transfer time",
    hours: 4.12,
    low: 0,
    high: 0,
    note: "Confirmed for October 9, 2026. Private order, payment and passenger information are excluded from the share-safe record.",
    source: "https://int.bahn.de/en",
  };
}

export function applyAuthoritative2026Corrections(source: RawRecord, { privateMode = false }: { privateMode?: boolean } = {}): RawRecord {
  const raw = { ...source };
  const sourceBookings = Array.isArray(source.$a) ? source.$a as RawRecord[] : [];
  const bookings = sourceBookings.filter((item) => !inactiveFlight.test(`${item.title || ""} ${item.detail || ""}`) && !/WRO\s*→\s*AMS replacement/i.test(item.title || ""));
  const specifications: Array<[RawRecord, RegExp]> = [
    [reviewed.inbound, /DE2039|B61254/i], [reviewed.ringHotel, /Hotel an der Nordschleife/i], [reviewedCarRental(privateMode), /CarVia|Audi RS6/i],
    [reviewed.ringDrive, /Driven[uü]rburg/i], [reviewed.polandFlight, /LH1374/i],
    [reviewed.wroclawTransfer, /WRO Airport.*Entre|taxi.*LH1374/i], [reviewed.wroclawHotel, /Entre Hotel/i],
    [reviewed.krakowHotel, /MINT Luxury Apartments|Hotel M4 Boutique|Millou Aparthotel|Academia Apartments/i],
    [reviewed.auschwitz, /Auschwitz-Birkenau/i], [reviewed.krakowFlight, /KL1328|KRK.*AMS.*BRU/i], [reviewed.brusselsStay, /The Usual Brussels|Grand Place|Rue du March/i], [reviewed.amsterdamHotel, /Room Mate Aitana/i], [reviewed.amsterdamHotelLater, /Avani Museum Quarter Amsterdam/i],
    [reviewed.sleeper, /(?:Euro|European) Sleeper/i], [reviewed.berlinHotel, /SANA Berlin Residence/i], [reviewed.berlinMunichTrain, /Berlin Hbf.*M.nchen Hbf|Deutsche Bahn.*M.nchen/i], [reviewed.munichHotel, /Pullman Munich/i], [reviewed.returnFlight, /UA109/i],
  ];
  raw.$a = specifications.map(([record, pattern]) => mergeReviewed(bookings, record, pattern));

  raw.Ta = {
    "2026-09-22": [
      { kind: "flight", label: "Arrive FRA 05:45", detail: "Condor DE2039 via Boston" },
      { kind: "car", label: "CarVia · Audi RS6 pickup", detail: "Confirmed · Frankfurt Downtown 10:00 · 500 km included" },
      { kind: "hotel", label: "Hotel an der Nordschleife", detail: "Confirmed September 22–24" },
    ],
    "2026-09-23": [{ kind: "activity", label: "Drivenürburg BMW 120i", detail: "Confirmed session · arrive 15:30–16:00 · track opens 17:00" }],
    "2026-09-24": [
      { kind: "car", label: "CarVia · Audi RS6 return", detail: "Confirmed · Frankfurt Downtown by 10:00; refuel and preserve the LH1374 check-in buffer" },
      { kind: "flight", label: "LH1374 · FRA → WRO", detail: "Confirmed · 12:35–14:00" },
      { kind: "car", label: "WRO Airport → Entre Hotel transfer", detail: "Confirmed taxi after arrival" },
      { kind: "hotel", label: "Entre Hotel by Zdrojowa", detail: "Confirmed Wrocław stay · September 24–27" },
    ],
    "2026-09-27": [
      { kind: "missing", label: "Wrocław → Kraków train", detail: "Direct PKP Intercity still to book · recommended mid-morning Wrocław Główny → Kraków Główny target" },
      { kind: "hotel", label: "MINT Luxury Apartments at the Main Square", detail: "Confirmed paid Kraków Old Town stay · September 27–30" },
    ],
    "2026-09-29": [{ kind: "missing", label: "Auschwitz-Birkenau pickup update", detail: "Tour is confirmed for 12:00; send the organiser the new MINT Luxury Apartments pickup location" }],
    "2026-09-30": [
      { kind: "flight", label: "KLM KL1328 · Kraków → Amsterdam → Brussels", detail: "Confirmed · KRK 17:55 → AMS 19:55; onward Brussels connection confirmed, timing not supplied" },
      { kind: "hotel", label: "The Usual Brussels", detail: "Confirmed Brussels stay · September 30–October 2 · replaces the canceled Airbnb" },
    ],
    "2026-10-02": [
      { kind: "missing", label: "Brussels → Amsterdam rail", detail: "Direct rail still to book · must be October 2 to bridge the confirmed Brussels and Amsterdam stays" },
      { kind: "hotel", label: "Room Mate Aitana", detail: "Confirmed Amsterdam stay · October 2–3 · check-in from 15:00" },
    ],
    "2026-10-03": [
      { kind: "hotel", label: "Avani Museum Quarter Amsterdam", detail: "Confirmed Amsterdam stay · October 3–5" },
    ],
    "2026-10-05": [{ kind: "train", label: "European Sleeper · Amsterdam → Berlin", detail: "Confirmed · Amsterdam Centraal 21:34 → Berlin Gesundbrunnen 06:01" }],
    "2026-10-06": [{ kind: "hotel", label: "SANA Berlin Residence", detail: "Confirmed Berlin stay · October 6–9" }],
    "2026-10-09": [
      { kind: "train", label: "Deutsche Bahn · Berlin Hbf → München Hbf", detail: "Confirmed direct rail · 13:36–17:43" },
      { kind: "hotel", label: "Pullman Munich", detail: "Confirmed Munich stay · October 9–12" },
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
      theme: "Berlin checkout and confirmed Munich rail",
      note: "Use the morning for a nearby priority, then protect the confirmed 13:36 Berlin Hbf departure.",
      blocks: [
        { time: "Morning", title: "Museum Island or a saved priority", note: "Choose one major museum and reserve only if it remains a top priority." },
        { time: "Afternoon", title: "Classic Remise or neighborhood walk", note: "Use the open block for a saved automotive stop or an unhurried neighborhood." },
        { time: "13:36", title: "Deutsche Bahn · Berlin Hbf → München Hbf", note: "Confirmed direct rail to München Hbf, arriving 17:43." },
      ],
    };
  }
  if (Array.isArray(plans.krakow) && plans.krakow[3]) {
    plans.krakow = [...plans.krakow];
    plans.krakow[3] = {
      ...plans.krakow[3],
      theme: "Podgórze and confirmed evening flight",
      note: "Keep the day light enough to protect the confirmed KLM connection through Amsterdam.",
      blocks: [
        { time: "Morning", id: "schindler", note: "Timed ticket; pair geographically with Podgórze only if the reservation leaves a safe airport buffer." },
        { time: "Late morning", id: "podgorze", note: "Ghetto Heroes Square and a short district walk." },
        { time: "Afternoon", title: "Hotel → KRK Airport", note: "Collect luggage and preserve the airline check-in buffer." },
        { time: "17:55", title: "KLM KL1328 · KRK → AMS", note: "Confirmed arrival at Amsterdam Schiphol at 19:55, then continue on the confirmed Brussels connection." },
      ],
      extras: ["rynek"],
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
  if (transport["krakow-brussels"]) {
    const options = (transport["krakow-brussels"].options || []).filter((option: RawRecord) => option.id !== "confirmed-kl1328");
    transport["krakow-brussels"] = { ...transport["krakow-brussels"], recommend: "confirmed-kl1328", options: [confirmedKrakowBrusselsOption(), ...options] };
  }
  if (transport["frankfurt-ring"]) {
    const options = (transport["frankfurt-ring"].options || []).filter((option: RawRecord) => option.id !== "confirmed-carvia-pickup");
    transport["frankfurt-ring"] = { ...transport["frankfurt-ring"], recommend: "confirmed-carvia-pickup", options: [confirmedCarOption("pickup"), ...options] };
  }
  if (transport["ring-frankfurt"]) {
    const options = (transport["ring-frankfurt"].options || []).filter((option: RawRecord) => option.id !== "confirmed-carvia-return");
    transport["ring-frankfurt"] = { ...transport["ring-frankfurt"], recommend: "confirmed-carvia-return", options: [confirmedCarOption("return"), ...options] };
  }
  if (transport["wroclaw-krakow"]) {
    const options = (transport["wroclaw-krakow"].options || []).filter((option: RawRecord) => option.id !== "recommended-pkp-midmorning");
    transport["wroclaw-krakow"] = { ...transport["wroclaw-krakow"], recommend: "recommended-pkp-midmorning", options: [recommendedWroclawKrakowOption(), ...options] };
  }
  if (transport["berlin-munich"]) {
    const options = (transport["berlin-munich"].options || []).filter((option: RawRecord) => option.id !== "recommended-ice-midmorning" && option.id !== "confirmed-db-berlin-munich");
    transport["berlin-munich"] = { ...transport["berlin-munich"], recommend: "confirmed-db-berlin-munich", options: [confirmedBerlinMunichOption(), ...options] };
  }
  raw._i = transport;
  return raw;
}
