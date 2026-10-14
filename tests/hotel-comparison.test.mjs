import test from "node:test";
import assert from "node:assert/strict";
import { matchingHotelOffer, hotelComparisonGaps } from "../src/components/hotel-comparison.ts";

const stay = { checkIn: "2027-05-02", checkOut: "2027-05-04" };
const quote = (overrides = {}) => ({ ...stay, provider: "Invented source", total: 240, currency: "EUR", adults: 2, rooms: 1, checked: "2027-01-01", url: "https://example.com/stay", roomName: "Double", breakfast: "Included", cancellation: "Refundable", ...overrides });

test("hotel price basis rejects a cheaper quote for different dates, occupancy or rooms", () => {
  const exact = quote();
  const offers = [quote({ total: 10, checkIn: "2027-05-01" }), quote({ total: 20, adults: 1 }), quote({ total: 30, rooms: 2 }), exact];
  assert.equal(matchingHotelOffer(offers, stay, 2, 1), exact);
  assert.equal(matchingHotelOffer(offers, stay, 3, 1), undefined);
  assert.equal(offers[0].total, 10, "matching does not mutate source ordering");
});

test("comparison preserves missing quotes, unknown policies and currency differences", () => {
  const gaps = hotelComparisonGaps([quote(), quote({ currency: "USD", roomName: undefined, cancellation: "Nonrefundable" }), undefined]);
  assert.ok(gaps.includes("Matching dated quotes missing"));
  assert.ok(gaps.includes("Currencies differ; no conversion applied"));
  assert.ok(gaps.includes("Room basis unknown"));
  assert.ok(gaps.includes("Cancellation differs"));
  assert.ok(gaps.includes("Taxes / fees inclusion unknown"));
});

test("aligned recorded terms still require tax and current availability checks", () => {
  assert.deepEqual(hotelComparisonGaps([quote(), quote({ total: 310 })]), ["Taxes / fees inclusion unknown", "Recorded quotes require availability recheck"]);
  assert.deepEqual(hotelComparisonGaps([quote()]), ["Add at least two stays"]);
});
