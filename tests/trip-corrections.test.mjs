import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { applyAuthoritative2026Corrections } from "../src/lib/authoritative-trip-corrections.ts";

const cancelledPattern = /\b(?:SAS|SK676|SK1799|CPH|Copenhagen)\b/i;
const activeSurface = (trip) => JSON.stringify({ bookings: trip.$a, anchors: trip.Ta, plans: { ring: trip.Sa?.ring?.[2], krakow: trip.Sa?.krakow?.[3] }, arrivals: { wroclaw: trip.Aa?.wroclaw, krakow: trip.Aa?.krakow }, legs: { flight: trip._i?.["frankfurt-wroclaw"], krakowFlight: trip._i?.["krakow-brussels"], sleeper: trip._i?.["amsterdam-berlin"] } });

test("authoritative correction removes cancelled routes and restores reviewed active bookings", () => {
  const stale = {
    $a: [{ kind: "Flight", date: "Sep 24", title: "SAS SK676 + SK1799", detail: "FRA → CPH → KRK" }],
    Ta: { "2026-09-24": [{ kind: "flight", label: "SAS SK676 + SK1799", detail: "via Copenhagen" }] },
    Sa: { ring: [{}, {}, { blocks: [{ time: "Afternoon", title: "Fly via Copenhagen", note: "Confirmed SAS SK676 and SK1799" }] }] },
    Aa: { krakow: [{ id: "krk-airport", detail: "Arrival on SK1799" }] },
    _i: {
      "frankfurt-ring": { id: "frankfurt-ring", recommend: "car", options: [] },
      "ring-frankfurt": { id: "ring-frankfurt", recommend: "car", options: [] },
      "wroclaw-krakow": { id: "wroclaw-krakow", recommend: "ic", options: [] },
      "frankfurt-wroclaw": { id: "frankfurt-wroclaw", recommend: "other", options: [] },
      "krakow-brussels": { id: "krakow-brussels", recommend: "other", options: [] },
      "amsterdam-berlin": { id: "amsterdam-berlin", recommend: "ic", options: [] },
      "berlin-munich": { id: "berlin-munich", recommend: "ice", options: [] },
    },
  };
  const corrected = applyAuthoritative2026Corrections(stale);
  assert.equal(stale.$a.length, 1, "input remains unchanged");
  assert.equal(corrected.$a.find((item) => /LH1374/.test(item.title))?.status, "confirmed");
  assert.equal(corrected.$a.find((item) => /European Sleeper/.test(item.title))?.status, "confirmed");
  assert.equal(corrected.$a.find((item) => /KL1328/.test(item.title))?.status, "confirmed");
  assert.equal(corrected.$a.find((item) => /Millou/.test(item.title))?.status, "conflict");
  assert.equal(corrected._i["frankfurt-wroclaw"].recommend, "confirmed-lh1374");
  assert.equal(corrected._i["amsterdam-berlin"].recommend, "confirmed-sleeper");
  assert.equal(corrected._i["krakow-brussels"].recommend, "confirmed-kl1328");
  assert.equal(corrected._i["frankfurt-ring"]?.recommend, "confirmed-carvia-pickup");
  assert.equal(corrected._i["ring-frankfurt"]?.recommend, "confirmed-carvia-return");
  assert.equal(corrected._i["wroclaw-krakow"].recommend, "recommended-pkp-midmorning");
  assert.equal(corrected._i["berlin-munich"].recommend, "confirmed-db-berlin-munich");
  assert.equal(corrected.$a.find((item) => /Pullman Munich/i.test(item.title))?.status, "confirmed");
  assert.equal(corrected.$a.find((item) => /SANA Berlin Residence/i.test(item.title))?.status, "confirmed");
  assert.equal(corrected.$a.find((item) => /CarVia.*Audi RS6/i.test(item.title))?.status, "confirmed");
  assert.match(corrected.Ta["2026-09-30"].find((item) => /KL1328/.test(item.label))?.detail || "", /17:55.*19:55/);
  assert.match(corrected.Ta["2026-09-24"].find((item) => /LH1374/.test(item.label))?.detail || "", /12:35/);
  assert.doesNotMatch(activeSurface(corrected), cancelledPattern);
  assert.deepEqual(applyAuthoritative2026Corrections(corrected), corrected, "correction is idempotent");
});

test("the redacted public sample contains no active cancelled Copenhagen itinerary", async () => {
  const sample = JSON.parse(await readFile(new URL("../examples/trips/2026-europe-sample.json", import.meta.url), "utf8"));
  const corrected = applyAuthoritative2026Corrections(sample);
  assert.doesNotMatch(activeSurface(corrected), cancelledPattern);
  assert.equal(corrected._i["frankfurt-wroclaw"].recommend, "confirmed-lh1374");
  assert.equal(corrected._i["amsterdam-berlin"].recommend, "confirmed-sleeper");
  assert.equal(corrected._i["krakow-brussels"].recommend, "confirmed-kl1328");
  assert.equal(corrected.$a.filter((item) => item.status === "confirmed").length, 15);
  assert.equal(corrected.$a.filter((item) => item.status === "conflict").length, 3);
  const rental = corrected.$a.find((item) => /CarVia.*Audi RS6/i.test(item.title));
  assert.match(rental?.detail || "", /Frankfurt Downtown.*confirmed/i);
  assert.doesNotMatch(JSON.stringify(rental), /46286|569\.45|1,750/);
});
