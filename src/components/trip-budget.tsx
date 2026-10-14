"use client";

import type { NormalizedTrip } from '@/lib/normalized-trip';
import type { QuoteComparisonData } from '@/lib/trip-quote-comparison';
import { buildTripBudget, type TripBudgetSummary } from '@/lib/trip-budget';
import './trip-budget.css';

type Props = { trip: NormalizedTrip; quotes: QuoteComparisonData; selectedIds: string[]; onSelectionChange: (ids: string[]) => void };
const amount = (value: number, currency: string) => `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)} ${currency}`;

export default function TripBudget({ trip, quotes, selectedIds, onSelectionChange }: Props) {
  let budget: TripBudgetSummary;
  try { budget = buildTripBudget(trip, quotes, selectedIds); }
  catch { return <section className="trip-budget" aria-label="Trip budget"><h3>Selected quote budget</h3><p role="alert">Budget evidence or selections do not validate for this trip. Review the quote records before calculating a budget.</p><button type="button" onClick={() => onSelectionChange([])}>Clear budget selection</button></section>; }
  const selected = new Set(selectedIds);
  const labels = new Map(budget.quotes.map(({ quote }) => [quote.id, quote.label]));
  return <section className="trip-budget" aria-label="Trip budget">
    <header><div><h3>Selected quote budget</h3><p>Choose the quotes you intend to combine. Alternatives stay separate until you select them.</p></div><span>{budget.selected.length} selected / {budget.quotes.length} recorded</span>{selectedIds.length > 0 && <button type="button" onClick={() => onSelectionChange([])}>Clear selection</button>}</header>
    <p className="trip-budget-note">Recorded amounts cover the quoted party and rooms once; no multiplication or currency conversion is applied. This subtotal excludes unrecorded costs and bookings and does not establish a complete trip budget or current inventory.</p>
    {(budget.unknownSelectionCount > 0 || budget.duplicateSelectionCount > 0) && <div className="trip-budget-warning" role="status"><p>{budget.unknownSelectionCount} unavailable selected IDs excluded · {budget.duplicateSelectionCount} duplicate selections counted once.</p><button type="button" onClick={() => onSelectionChange(budget.selected.map(item => item.quote.id))}>Keep only unique recorded selections</button></div>}
    {budget.selected.length > 0 ? <>
      <div className="trip-budget-table-scroll"><table className="trip-budget-totals"><caption>Partial subtotals by currency · only entries with a known amount contribute to that column</caption><thead><tr><th scope="col">Currency / quotes</th><th scope="col">Known cash outlay</th><th scope="col">Known points opportunity cost</th><th scope="col">Known cash + points equivalent</th></tr></thead><tbody>{budget.currencies.map(row => <tr key={row.currency}><th scope="row">{row.currency}<small>{row.selectedCount} selected</small></th><td>{amount(row.knownCashOutlay, row.currency)}<small>{row.unknownCashCount} quote outlays unknown</small></td><td>{amount(row.knownPointsValue, row.currency)}<small>{row.unknownPointsValueCount} award valuations unknown</small></td><td>{amount(row.knownCashEquivalent, row.currency)}<small>{row.unknownEquivalentCount} quote equivalents unknown</small></td></tr>)}</tbody></table></div>
      <p className="trip-budget-note">Cash outlay = base/co-pay + taxes/fees. Points opportunity cost uses the entered source-point spend and valuation in that quote’s currency. Equivalent = cash outlay + points opportunity cost; values with missing components are excluded from the relevant subtotal.</p>
      <div className="trip-budget-review" role="status"><span>{budget.staleOrUndatedCount} stale, undated or future checks</span><span>{budget.unresolvedTermsCount} quotes with unresolved terms</span><span>{budget.partyMismatchCount} party-size mismatches</span><span>{budget.unknownPointsCount} unknown point spends</span><span>{budget.unknownPointsProgramCount} unknown source programs</span></div>
      {(budget.pointsPrograms.length > 0 || budget.unknownPointsCount > 0) && <details><summary>Source points by program</summary><ul>{budget.pointsPrograms.map(row => <li key={row.program}>{row.program}: {row.points.toLocaleString()} source points across {row.quoteCount} quotes</li>)}</ul><p>Programs are kept separate. Unknown spend or unknown program is excluded; transfer eligibility, balances and timing still require verification.</p></details>}
      {budget.overlaps.length > 0 && <details className="trip-budget-warning" open><summary>Review {budget.overlaps.length} potential overlaps before using these subtotals</summary><ul>{budget.overlaps.map(warning => <li key={`${warning.firstId}:${warning.secondId}`}><b>{labels.get(warning.firstId)} / {labels.get(warning.secondId)}</b>: {warning.explanation}</li>)}</ul><p>Both explicit selections remain in the arithmetic. Their combined cost has not been validated as one itinerary.</p></details>}
    </> : <p className="trip-budget-empty">No budget quotes selected. Nothing is automatically added from the alternatives.</p>}
    <div className="trip-budget-checklist" role="group" aria-label="Select quotes for the budget">
      {budget.quotes.map(({ quote, math, freshness, partyMismatch }) => <article key={quote.id} className={selected.has(quote.id) ? 'is-selected' : ''}>
        <label className="trip-budget-choice"><input type="checkbox" checked={selected.has(quote.id)} onChange={event => onSelectionChange(event.target.checked ? [...new Set([...selectedIds, quote.id])] : selectedIds.filter(id => id !== quote.id))} /><span><b>{quote.label}</b><small>{quote.mode} · {quote.startDate} → {quote.endDate} · {quote.occupants} travelers · {quote.rooms} rooms{partyMismatch ? ' · party differs from trip' : ''}</small></span></label>
        <div className="trip-budget-quote-amount"><b>{math.cashOutlay === null ? 'Cash outlay unknown' : amount(math.cashOutlay, quote.currency)}</b><small>{quote.cashAmount === null ? 'Base/co-pay unknown' : `${amount(quote.cashAmount, quote.currency)} base/co-pay`} + {quote.taxesFees === null ? 'taxes/fees unknown' : `${amount(quote.taxesFees, quote.currency)} taxes/fees`}</small>{quote.kind === 'award' && <small>{math.sourcePoints === null ? 'Source points unknown' : `${math.sourcePoints.toLocaleString()} source points`} · {math.cashEquivalent === null ? 'Equivalent unknown' : `${amount(math.cashEquivalent, quote.currency)} equivalent`}</small>}</div>
        <div className="trip-budget-source">{quote.sourceUrl ? <a href={quote.sourceUrl} target="_blank" rel="noreferrer">{quote.source} ↗</a> : <span>{quote.source}</span>}<small>{quote.checkedAt || 'No checked time'}</small><small>{freshness}</small></div>
        <details className="trip-budget-quote-details"><summary>Math, scope & unknowns</summary><p>{quote.from || 'Origin unknown'} → {quote.to || 'Destination unknown'}{quote.cityId ? ` · ${trip.destinations.find(place => place.id === quote.cityId)?.name || 'City unknown'}` : ''}</p><p>Cabin / room: {quote.cabin || 'Unknown'} · Baggage / meal basis: {quote.baggage || 'Unknown'} · Cancellation: {quote.cancellation || 'Unknown'}</p><ul>{math.explanation.map(line => <li key={line}>{line}</li>)}</ul>{quote.unknowns && <p>Recorded unknowns: {quote.unknowns}</p>}</details>
      </article>)}
      {budget.quotes.length === 0 && <p className="trip-budget-empty">Record a sourced cash, transport, hotel or award quote in the comparison tool to start this checklist.</p>}
    </div>
  </section>;
}
