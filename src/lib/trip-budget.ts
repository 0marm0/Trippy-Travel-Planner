import { validateNormalizedTrip, type NormalizedTrip } from './normalized-trip.ts';
import { quoteMath, quoteFreshness, validateQuoteComparison, type QuoteComparisonData, type QuoteMath, type TripQuote } from './trip-quote-comparison.ts';

export type BudgetCurrency = {
  currency: string;
  selectedCount: number;
  knownCashOutlay: number;
  unknownCashCount: number;
  knownPointsValue: number;
  unknownPointsValueCount: number;
  knownCashEquivalent: number;
  unknownEquivalentCount: number;
};
export type BudgetOverlap = { firstId: string; secondId: string; kind: 'stay' | 'transport'; explanation: string };
export type BudgetQuote = { quote: TripQuote; math: QuoteMath; freshness: string; freshnessNeedsReview: boolean; partyMismatch: boolean };
export type TripBudgetSummary = {
  quotes: BudgetQuote[];
  selected: BudgetQuote[];
  currencies: BudgetCurrency[];
  pointsPrograms: { program: string; points: number; quoteCount: number }[];
  unknownPointsCount: number;
  unknownPointsProgramCount: number;
  unknownSelectionCount: number;
  duplicateSelectionCount: number;
  staleOrUndatedCount: number;
  unresolvedTermsCount: number;
  partyMismatchCount: number;
  overlaps: BudgetOverlap[];
};

const stay = (quote: TripQuote) => quote.mode === 'stay' || quote.kind === 'hotel';
function overlaps(left: TripQuote, right: TripQuote): boolean {
  // Stay nights use half-open intervals; transport date-only spans are inclusive.
  return stay(left)
    ? left.startDate < right.endDate && right.startDate < left.endDate
    : left.startDate <= right.endDate && right.startDate <= left.endDate;
}

/** Recorded whole-party amounts, once per selected ID. No FX or inferred coverage. */
export function buildTripBudget(trip: NormalizedTrip, input: QuoteComparisonData, selectedIds: string[], now = Date.now()): TripBudgetSummary {
  if (validateNormalizedTrip(trip).length) throw new Error('A valid normalized trip is required for the budget.');
  const data = validateQuoteComparison(input, trip);
  if (!Array.isArray(selectedIds) || selectedIds.length > 300 || selectedIds.some(id => typeof id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(id)) || !Number.isFinite(now)) throw new Error('Invalid budget selection. Choose recorded quote IDs only.');
  const ids = new Set(selectedIds);
  const available = new Set(data.quotes.map(quote => quote.id));
  const partySize = trip.travelers.adults + trip.travelers.childrenAges.length;
  const quotes: BudgetQuote[] = data.quotes.map(quote => {
    const age = quote.checkedAt ? now - Date.parse(quote.checkedAt) : null;
    return { quote, math: quoteMath(quote), freshness: quoteFreshness(quote, now), freshnessNeedsReview: age === null || age < -300000 || age > 86400000, partyMismatch: quote.occupants !== partySize };
  });
  const selected = quotes.filter(item => ids.has(item.quote.id));
  const currencies = new Map<string, BudgetCurrency>();
  const programs = new Map<string, { program: string; points: number; quoteCount: number }>();
  let unknownPointsCount = 0, unknownPointsProgramCount = 0;
  for (const { quote, math } of selected) {
    const totals = currencies.get(quote.currency) || { currency: quote.currency, selectedCount: 0, knownCashOutlay: 0, unknownCashCount: 0, knownPointsValue: 0, unknownPointsValueCount: 0, knownCashEquivalent: 0, unknownEquivalentCount: 0 };
    totals.selectedCount++;
    if (math.cashOutlay === null) totals.unknownCashCount++; else totals.knownCashOutlay += math.cashOutlay;
    if (math.cashEquivalent === null) totals.unknownEquivalentCount++; else totals.knownCashEquivalent += math.cashEquivalent;
    if (quote.kind === 'award') {
      if (math.pointsValue === null) totals.unknownPointsValueCount++; else totals.knownPointsValue += math.pointsValue;
      if (math.sourcePoints === null) unknownPointsCount++;
      if (!quote.sourceProgram.trim()) unknownPointsProgramCount++;
      else if (math.sourcePoints !== null) {
        const key = quote.sourceProgram.trim().toLocaleLowerCase();
        const program = programs.get(key) || { program: quote.sourceProgram, points: 0, quoteCount: 0 };
        program.points += math.sourcePoints; program.quoteCount++; programs.set(key, program);
      }
    }
    currencies.set(quote.currency, totals);
  }
  const overlapWarnings: BudgetOverlap[] = [];
  for (let first = 0; first < selected.length; first++) for (let second = first + 1; second < selected.length; second++) {
    const a = selected[first].quote, b = selected[second].quote;
    if (stay(a) === stay(b) && overlaps(a, b)) overlapWarnings.push({ firstId: a.id, secondId: b.id, kind: stay(a) ? 'stay' : 'transport', explanation: stay(a) ? 'Stay nights overlap. These may be alternatives or an intentional split stay; review before using the subtotal.' : 'Transport dates overlap. These may be alternatives or connecting legs; date-only evidence cannot resolve the overlap.' });
  }
  return {
    quotes, selected, currencies: [...currencies.values()].sort((a, b) => a.currency.localeCompare(b.currency)),
    pointsPrograms: [...programs.values()], unknownPointsCount, unknownPointsProgramCount,
    unknownSelectionCount: [...ids].filter(id => !available.has(id)).length,
    duplicateSelectionCount: selectedIds.length - ids.size,
    staleOrUndatedCount: selected.filter(item => item.freshnessNeedsReview).length,
    unresolvedTermsCount: selected.filter(({ quote }) => Boolean(quote.unknowns) || !quote.cancellation || !quote.baggage || (['flight', 'stay'].includes(quote.mode) && !quote.cabin) || (quote.mode !== 'stay' && (!quote.from || !quote.to)) || (quote.kind === 'award' && (!quote.sourceProgram || !quote.destinationProgram || !quote.transferTerms))).length,
    partyMismatchCount: selected.filter(item => item.partyMismatch).length,
    overlaps: overlapWarnings,
  };
}
