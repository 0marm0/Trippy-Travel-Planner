import { validateNormalizedTrip, type NormalizedTrip } from './normalized-trip.ts';
import { hasPrivatePlanningText } from './planning-privacy.ts';
import { safeCollaborationSourceUrl } from './collaboration/schema.ts';

export const quoteKinds = ['cash', 'award', 'transport', 'hotel'] as const;
export type TripQuote = {
  id: string; label: string; kind: typeof quoteKinds[number]; mode: 'flight' | 'rail' | 'car' | 'ferry' | 'bus' | 'stay' | 'other';
  cityId: string; from: string; to: string; startDate: string; endDate: string;
  occupants: number; rooms: number; cabin: string; baggage: string; cancellation: string;
  currency: string; cashAmount: number | null; taxesFees: number | null;
  sourceProgram: string; destinationProgram: string; transferTerms: string;
  destinationPoints: number | null; sourcePoints: number | null; transferRatio: number | null; transferIncrement: number | null; minimumTransfer: number | null; pointValuation: number | null;
  source: string; sourceUrl: string; checkedAt: string; unknowns: string;
};
export type QuoteComparisonData = { version: 1; tripIdentity: string; quotes: TripQuote[] };
export type QuoteMath = { sourcePoints: number | null; sourcePointsLowerBound: number | null; unusedDestinationPoints: number | null; cashOutlay: number | null; pointsValue: number | null; cashEquivalent: number | null; explanation: string[] };
const keys = ['id','label','kind','mode','cityId','from','to','startDate','endDate','occupants','rooms','cabin','baggage','cancellation','currency','cashAmount','taxesFees','sourceProgram','destinationProgram','transferTerms','destinationPoints','sourcePoints','transferRatio','transferIncrement','minimumTransfer','pointValuation','source','sourceUrl','checkedAt','unknowns'];
const publicDomains = ['booking.com','expedia.com','hotels.com','hyatt.com','marriott.com','hilton.com','ihg.com','accor.com','airbnb.com','united.com','aa.com','delta.com','southwest.com','aircanada.com','britishairways.com','airfrance.com','klm.com','lufthansa.com','ana.co.jp','jal.co.jp','singaporeair.com','emirates.com','qatarairways.com','amtrak.com','bahn.de','sncf-connect.com','renfe.com','trenitalia.com','eurostar.com','thetrainline.com','hertz.com','sixt.com','avis.com','enterprise.com','seats.aero','google.com'];
export function safeQuoteSourceUrl(value: string): string {
  if (typeof value !== 'string') throw new Error('Invalid source URL.');
  if (!value) return '';
  const safe = safeCollaborationSourceUrl(value);
  if (!safe) throw new Error('Source URL must be an allowed public HTTPS page without private fields, queries or fragments.');
  const host = new URL(safe).hostname.toLowerCase();
  if (!publicDomains.some(domain => host === domain || host.endsWith(`.${domain}`))) throw new Error('Source domain is not on the public travel source allowlist. Use its name without a link.');
  return safe;
}
function text(value: unknown, max = 160): string {
  if (typeof value !== 'string' || value.length > max || /@|https?:|www\.|mailto\x3a|gmail|[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/i.test(value) || hasPrivatePlanningText(value)) throw new Error('Use safe planning facts only; private identifiers and credentials are forbidden.');
  return value.trim();
}
function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value) throw new Error('Invalid quote dates.');
  return value;
}
function number(value: unknown, max: number): number | null {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) throw new Error('Invalid quote amounts; use null for unknown.');
  return value;
}
export function quoteTripIdentity(trip: NormalizedTrip): string { return JSON.stringify([trip.id, trip.dateWindow, trip.destinations.map(place => [place.id,place.name]), trip.travelers]); }
export function quoteStorageKey(trip: NormalizedTrip): string { return 'trippy.quotes.v1:' + encodeURIComponent(quoteTripIdentity(trip)); }
export function createQuoteComparison(trip: NormalizedTrip): QuoteComparisonData { if (validateNormalizedTrip(trip).length) throw new Error('Invalid trip.'); return { version: 1, tripIdentity: quoteTripIdentity(trip), quotes: [] }; }
export function emptyTripQuote(trip: NormalizedTrip, id: string): TripQuote { return { id, label: '', kind: 'cash', mode: 'flight', cityId: '', from: '', to: '', startDate: trip.dateWindow.earliestDeparture, endDate: trip.dateWindow.latestReturn, occupants: trip.travelers.adults + trip.travelers.childrenAges.length, rooms: 1, cabin: '', baggage: '', cancellation: '', currency: trip.preferences.currency || 'USD', cashAmount: null, taxesFees: null, sourceProgram: '', destinationProgram: '', transferTerms: '', destinationPoints: null, sourcePoints: null, transferRatio: null, transferIncrement: null, minimumTransfer: null, pointValuation: null, source: '', sourceUrl: '', checkedAt: '', unknowns: '' }; }
export function validateQuoteComparison(input: unknown, trip: NormalizedTrip): QuoteComparisonData {
  const fail = () => { throw new Error('Invalid quote comparison for this trip. Current quotes are unchanged.'); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail();
  const data = input as QuoteComparisonData;
  if (Object.keys(data).length !== 3 || !Object.keys(data).every(key => ['version','tripIdentity','quotes'].includes(key)) || data.version !== 1 || data.tripIdentity !== quoteTripIdentity(trip) || !Array.isArray(data.quotes) || data.quotes.length > 300) return fail();
  const quotes = data.quotes.map((raw): TripQuote => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).length !== keys.length || !keys.every(key => Object.hasOwn(raw,key))) return fail();
    if (text(raw.id,64) !== raw.id || !/^[a-z0-9-]{1,64}$/.test(raw.id) || !quoteKinds.includes(raw.kind) || !['flight','rail','car','ferry','bus','stay','other'].includes(raw.mode) || (raw.cityId !== '' && !trip.destinations.some(place => place.id === raw.cityId))) return fail();
    if (!Number.isInteger(raw.occupants) || raw.occupants < 1 || raw.occupants > 40 || !Number.isInteger(raw.rooms) || raw.rooms < 1 || raw.rooms > 20 || !/^[A-Z]{3}$/.test(raw.currency)) return fail();
    const startDate = date(raw.startDate), endDate = date(raw.endDate);
    if (startDate > endDate || startDate < trip.dateWindow.earliestDeparture || endDate > trip.dateWindow.latestReturn || (raw.kind === 'hotel' && (raw.mode !== 'stay' || !raw.cityId || startDate === endDate))) return fail();
    const checkedAt = text(raw.checkedAt, 40);
    if (checkedAt && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(checkedAt) || !Number.isFinite(Date.parse(checkedAt)))) return fail();
    if (checkedAt) date(checkedAt.slice(0,10));
    const quote = { ...raw, label: text(raw.label), from: text(raw.from), to: text(raw.to), cabin: text(raw.cabin), baggage: text(raw.baggage), cancellation: text(raw.cancellation,500), source: text(raw.source), sourceUrl: safeQuoteSourceUrl(raw.sourceUrl), checkedAt, unknowns: text(raw.unknowns,1000), sourceProgram: text(raw.sourceProgram), destinationProgram: text(raw.destinationProgram), transferTerms: text(raw.transferTerms,500), cashAmount: number(raw.cashAmount,10_000_000), taxesFees: number(raw.taxesFees,10_000_000), destinationPoints: number(raw.destinationPoints,100_000_000), sourcePoints: number(raw.sourcePoints,100_000_000), transferRatio: number(raw.transferRatio,100), transferIncrement: number(raw.transferIncrement,100_000_000), minimumTransfer: number(raw.minimumTransfer,100_000_000), pointValuation: number(raw.pointValuation,100) };
    if ([quote.destinationPoints,quote.sourcePoints,quote.transferIncrement,quote.minimumTransfer].some(value => value !== null && !Number.isInteger(value))) return fail();
    if (quote.transferIncrement !== null && quote.transferIncrement <= 0) return fail();
    if (quote.kind === 'award' && transferPlan(quote).conflict) throw new Error('Entered source points do not cover the award or violate known transfer rules.');
    if (!quote.label || !quote.source || (quote.transferRatio !== null && quote.transferRatio <= 0)) return fail();
    if (quote.kind !== 'award' && [quote.destinationPoints, quote.sourcePoints, quote.transferRatio, quote.transferIncrement, quote.minimumTransfer, quote.pointValuation].some(value => value !== null)) throw new Error('Points assumptions apply only to award quotes.');
    return quote;
  });
  if (new Set(quotes.map(quote => quote.id)).size !== quotes.length) return fail();
  return { version: 1, tripIdentity: data.tripIdentity, quotes };
}
function transferPlan(quote: TripQuote) {
  const lowerBound = quote.destinationPoints !== null && quote.transferRatio !== null && quote.transferRatio > 0 ? Math.ceil(quote.destinationPoints / quote.transferRatio) : null;
  const rulesKnown = quote.transferIncrement !== null && quote.transferIncrement > 0 && quote.minimumTransfer !== null;
  const derived = lowerBound !== null && rulesKnown ? Math.ceil(Math.max(lowerBound,quote.minimumTransfer!) / quote.transferIncrement!) * quote.transferIncrement! : null;
  const spent = quote.sourcePoints ?? derived;
  const conflict = spent !== null && ((lowerBound !== null && spent < lowerBound) || (quote.minimumTransfer !== null && spent < quote.minimumTransfer) || (quote.transferIncrement !== null && spent % quote.transferIncrement !== 0));
  const sourcePoints = conflict ? null : spent;
  const unusedDestinationPoints = sourcePoints !== null && quote.transferRatio !== null && quote.destinationPoints !== null ? sourcePoints * quote.transferRatio - quote.destinationPoints : null;
  return { lowerBound, rulesKnown, sourcePoints, unusedDestinationPoints, conflict };
}
export function quoteMath(quote: TripQuote): QuoteMath {
  const explanation: string[] = [];
  const cashOutlay = quote.cashAmount !== null && quote.taxesFees !== null ? quote.cashAmount + quote.taxesFees : null;
  if (cashOutlay === null) explanation.push('Cash base or taxes/fees are unknown; cash outlay cannot be totaled.');
  else explanation.push(`Cash outlay = ${quote.cashAmount} base/co-pay + ${quote.taxesFees} taxes/fees = ${cashOutlay} ${quote.currency}.`);
  if (quote.kind !== 'award') return { sourcePoints: null, sourcePointsLowerBound: null, unusedDestinationPoints: null, cashOutlay, pointsValue: null, cashEquivalent: cashOutlay, explanation };
  explanation.push(`Points path: ${quote.sourceProgram || 'source program unknown'} → ${quote.destinationProgram || 'destination program unknown'}; ${quote.transferTerms || 'transfer terms unknown'}.`);
  const plan = transferPlan(quote);
  const sourcePoints = plan.sourcePoints;
  if (plan.lowerBound !== null) explanation.push(`Source points lower bound = destination points ÷ ${quote.transferRatio}, rounded up = ${plan.lowerBound}. This is not the transferable amount until block and minimum rules are known or actual spend is entered.`);
  if (plan.conflict) explanation.push('Entered source points are insufficient for the award or violate known minimum/block rules; resolve this conflict before comparing.');
  else if (sourcePoints === null) explanation.push('Actual source-point spend unknown. Enter verified source points spent, or provide transfer ratio, minimum transfer and transfer increment to calculate a total. No cash equivalent is inferred from a ratio-only lower bound.');
  else if (quote.sourcePoints !== null) explanation.push(`Source points = ${sourcePoints} (actual spend entered by traveler, including any overtransfer).${!plan.rulesKnown ? ' Minimum or block rules remain unknown; verify eligibility separately.' : ''}`);
  else explanation.push(`Source points = ${sourcePoints}: apply minimum ${quote.minimumTransfer}, then round up to blocks of ${quote.transferIncrement} source points.`);
  if (plan.unusedDestinationPoints !== null) explanation.push(`Unused destination points after this award = ${plan.unusedDestinationPoints}. Full source-point spend is valued; no leftover credit is assumed. Transfer timing, reversibility and eligibility still require verification.`);
  const pointsValue = sourcePoints !== null && quote.pointValuation !== null ? sourcePoints * quote.pointValuation : null;
  if (pointsValue === null) explanation.push('Source-point valuation unknown; no cash equivalent can be calculated.');
  else explanation.push(`Points opportunity cost = ${sourcePoints} × ${quote.pointValuation} ${quote.currency}/source point = ${pointsValue} ${quote.currency}.`);
  const cashEquivalent = cashOutlay !== null && pointsValue !== null ? cashOutlay + pointsValue : null;
  if (cashEquivalent !== null) explanation.push(`Cash equivalent = cash outlay + points opportunity cost = ${cashEquivalent} ${quote.currency}; transfer timing, eligibility and inventory remain unverified.`);
  return { sourcePoints, sourcePointsLowerBound: plan.lowerBound, unusedDestinationPoints: plan.unusedDestinationPoints, cashOutlay, pointsValue, cashEquivalent, explanation };
}
const normalized = (value: string) => value.trim().toLowerCase().replace(/\s+/g,' ');
export function compareQuotes(left: TripQuote, right: TripQuote): { comparable: boolean; reasons: string[]; difference: number | null; valuePerSourcePoint: number | null } {
  const reasons: string[] = [];
  if (left.currency !== right.currency) reasons.push('Currencies differ; no exchange rate is assumed.');
  for (const key of ['mode','cityId','from','to','startDate','endDate','occupants','rooms','cabin','baggage','cancellation'] as const) if (typeof left[key] === 'string' ? normalized(String(left[key])) !== normalized(String(right[key])) : left[key] !== right[key]) reasons.push(`Different ${key} scope.`);
  for (const quote of [left,right]) {
    if (quote.kind === 'award' && (!quote.sourceProgram || !quote.destinationProgram || !quote.transferTerms)) reasons.push('Award programs or transfer terms are unknown.');
    if (!quote.baggage || !quote.cancellation || ((quote.mode === 'flight' || quote.mode === 'stay') && !quote.cabin) || (quote.mode !== 'stay' && (!quote.from || !quote.to)) || !quote.checkedAt || quote.unknowns) reasons.push('Unresolved scope, check time or terms; review unknowns before treating totals as equivalent.');
  }
  const scopeComparable = reasons.length === 0;
  const a = quoteMath(left), b = quoteMath(right);
  if (a.cashEquivalent === null || b.cashEquivalent === null) reasons.push('One or both cash equivalents are unknown.');
  const comparable = reasons.length === 0;
  const award = left.kind === 'award' ? left : right.kind === 'award' ? right : null;
  const cash = left.kind !== 'award' ? left : right.kind !== 'award' ? right : null;
  const awardMath = award ? quoteMath(award) : null, cashMath = cash ? quoteMath(cash) : null;
  const valuePerSourcePoint = scopeComparable && awardMath?.sourcePoints && awardMath.cashOutlay !== null && cashMath?.cashOutlay !== null && cashMath ? (cashMath.cashOutlay - awardMath.cashOutlay) / awardMath.sourcePoints : null;
  return { comparable, reasons: [...new Set(reasons)], difference: comparable ? a.cashEquivalent! - b.cashEquivalent! : null, valuePerSourcePoint };
}
export function quoteFreshness(quote: TripQuote, now = Date.now()): string { if (!quote.checkedAt) return 'No checked time entered'; const age = now - Date.parse(quote.checkedAt); if (age < -300000) return 'Future check time — verify'; return age > 86400000 ? 'Entered check older than 24 hours — refresh' : 'Entered check within 24 hours — availability unverified'; }
