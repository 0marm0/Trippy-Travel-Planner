import type { HotelOffer } from "../lib/trip-model";

export function matchingHotelOffer(offers: HotelOffer[], stay: { checkIn: string; checkOut: string }, adults: number, rooms: number): HotelOffer | undefined {
  return offers.filter((offer) => offer.checkIn === stay.checkIn && offer.checkOut === stay.checkOut && offer.adults === adults && offer.rooms === rooms)
    .sort((left, right) => left.currency.localeCompare(right.currency) || left.total - right.total)[0];
}

/** A matching date alone does not establish a like-for-like price comparison. */
export function hotelComparisonGaps(offers: (HotelOffer | undefined)[]): string[] {
  if (offers.length < 2) return ["Add at least two stays"];
  const gaps: string[] = [];
  if (offers.some((offer) => !offer)) gaps.push("Matching dated quotes missing");
  const present = offers.filter((offer): offer is HotelOffer => Boolean(offer));
  if (new Set(present.map((offer) => offer.currency)).size > 1) gaps.push("Currencies differ; no conversion applied");
  for (const [key, label] of [["roomName", "Room basis"], ["breakfast", "Breakfast"], ["cancellation", "Cancellation"]] as const) {
    if (present.some((offer) => !offer[key])) gaps.push(`${label} unknown`);
    else if (new Set(present.map((offer) => offer[key]?.trim().toLowerCase())).size > 1) gaps.push(`${label} differs`);
  }
  gaps.push("Taxes / fees inclusion unknown", "Recorded quotes require availability recheck");
  return gaps;
}
