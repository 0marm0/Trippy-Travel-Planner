import test from "node:test";
import assert from "node:assert/strict";
import { createNormalizedTrip } from "../src/lib/normalized-trip.ts";
import { createResearchLedger, validateResearchLedger, researchStorageKey, researchFreshness } from "../src/lib/research-ledger.ts";
const trip = (cities = ["Lisbon", "Porto"], start = "2027-05-01") => createNormalizedTrip({ name: "Example trip", start, end: "2027-05-12", cities, origins: ["IAD"], adults: 2, pace: "balanced", flexDays: 2, themes: [] });
test("ledger retains outstanding categories and isolates dates and destinations", () => {
  const t = trip(), ledger = createResearchLedger(t);
  assert.equal(ledger.rows.length, 9);
  assert.equal(ledger.rows.every(row => row.state === "unsearched"), true);
  assert.deepEqual(validateResearchLedger(ledger, t), ledger);
  assert.notEqual(researchStorageKey(t), researchStorageKey(trip(["Tokyo", "Kyoto"])));
  assert.notEqual(researchStorageKey(t), researchStorageKey(trip(undefined, "2027-05-02")));
  assert.throws(() => validateResearchLedger(ledger, trip(["Tokyo"])));
});
test("research requires evidence and never equates tool errors with empty inventory", () => {
  const t = trip(), ledger = createResearchLedger(t);
  ledger.rows[0].state = "researched";
  assert.throws(() => validateResearchLedger(ledger, t));
  Object.assign(ledger.rows[0], { scope: "Two departure dates; direct and one connection; other combinations unsearched", source: "Invented manual comparison", checkedAt: "2027-05-01T12:00:00Z" });
  ledger.rows[1].state = "unsupported"; ledger.rows[1].nextAction = "Obtain eligible award tool access";
  ledger.rows[3].state = "failed"; ledger.rows[3].notes = "Search timed out; availability remains unknown";
  assert.equal(validateResearchLedger(ledger, t).rows[1].state, "unsupported");
  assert.equal(researchFreshness(ledger.rows[0], Date.parse("2027-05-10")), "older than 7 days");
});
test("imports and exports reject unknown fields, private prose and unsafe sources", () => {
  const t = trip();
  for (const value of ["Access token: inventedExampleValue", "API key: inventedExampleValue", "booking reference invented", "api key invented", "loyalty invented", "123456789", "sk-inventedTestValue"]) {
    const ledger = createResearchLedger(t); ledger.rows[0].notes = value; assert.throws(() => validateResearchLedger(ledger, t));
  }
  const extras = createResearchLedger(t); extras.credentials = "invented"; assert.throws(() => validateResearchLedger(extras, t));
  const unsafe = createResearchLedger(t); unsafe.rows[0].sourceUrl = "https://example.org/?token=invented"; assert.throws(() => validateResearchLedger(unsafe, t));
  const missing = createResearchLedger(t); missing.rows.pop(); assert.throws(() => validateResearchLedger(missing, t));
});
