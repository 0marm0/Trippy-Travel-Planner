import { validateQuoteComparison, quoteMath, type QuoteComparisonData } from './trip-quote-comparison.ts';
import { validateResearchLedger, type ResearchLedgerData } from './research-ledger.ts';
import { validateWorkspace, workspaceConflicts, type GenericWorkspace } from './generic-trip-workspace.ts';
import { renderTripHtml, sanitizeTripExportSnapshot, redactPrivateExportText, type TripExportSnapshot, type TripExportScope } from './trip-exports.ts';

const displayTimestamp = (value: string) => value.replace('T', ' ').replace('Z', ' UTC');
const escape = (value: unknown) => redactPrivateExportText(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const nextDate = (value: string) => new Date(Date.parse(value) + 86400000).toISOString().slice(0, 10);

/** One visual dossier for arbitrary validated destinations; never borrows sample data. */
export function buildGenericTripExportSnapshot(workspace: GenericWorkspace): TripExportSnapshot {
  if (validateWorkspace(workspace).length) throw new Error('Unsafe or invalid workspace; HTML export blocked');
  const { trip } = workspace;
  const destinationName = (id: string) => trip.destinations.find(place => place.id === id)?.name || '';
  const activity = (item: GenericWorkspace['activities'][number]) => ({
    title: item.title, description: item.notes, details: `${item.time} · ${item.durationMinutes} minutes${item.notes ? ` · ${item.notes}` : ''}`,
    category: 'Manually scheduled', priority: 'should' as const, image: '',
  });
  const snapshot: TripExportSnapshot = {
    schemaVersion: 1, title: trip.name,
    subtitle: `${trip.travelers.adults} adults · ${trip.preferences.pace} pace · ${trip.preferences.activityThemes.join(', ') || 'Interests to be decided'}`,
    start: trip.dateWindow.earliestDeparture, end: nextDate(trip.dateWindow.latestReturn),
    stops: trip.destinations.map(place => {
      const dates = workspace.days.filter(day => day.placeId === place.id).map(day => day.date).sort();
      return { name: place.name, country: '', checkIn: dates[0] || '', checkOut: dates.length ? nextDate(dates.at(-1)!) : '', nights: dates.filter(date => date < trip.dateWindow.latestReturn).length, stay: 'Accommodation not recorded; country and photography await attributable research.' };
    }),
    days: workspace.days.map((day, index) => ({
      date: day.date, dayNumber: index + 1, city: destinationName(day.placeId), country: '',
      theme: destinationName(day.placeId) || 'Destination to be assigned',
      note: 'Manual planning record. Timing and duration are traveler inputs; allow time for transport, meals, and opening-hour checks.',
      anchors: [...trip.anchors.filter(anchor => anchor.date === day.date).map(anchor => ({ status: 'recommended', label: anchor.label, detail: `${anchor.locked ? 'Fixed planning constraint' : 'Flexible planning anchor'}${anchor.placeId ? ` · ${destinationName(anchor.placeId)}` : ''}; confirmation evidence is separate.` })), ...trip.bookings.filter(booking => booking.kind === 'stay' ? day.date >= booking.startAt.slice(0, 10) && day.date <= booking.endAt.slice(0, 10) : day.date === booking.startAt.slice(0, 10) || day.date === booking.endAt.slice(0, 10)).map(booking => { const detail = workspace.bookingDetails.find(item => item.bookingId === booking.id); return { status: booking.status, kind: booking.kind, label: detail?.label || booking.provider || booking.kind, detail: `${displayTimestamp(booking.startAt)} — ${displayTimestamp(booking.endAt)}${detail?.placeId ? ` · ${destinationName(detail.placeId)}` : ''}${detail?.notes ? ` · ${detail.notes}` : ''} · Recorded state: ${booking.status}. No new provider verification was performed.` }; })],
      activities: workspace.activities.filter(item => item.date === day.date).sort((a, b) => a.time.localeCompare(b.time)).map(activity),
    })),
    catalogue: workspace.activities.map(item => ({ ...activity(item), city: destinationName(item.placeId) })),
    transport: [], hotels: [],
    bookings: trip.bookings.map(booking => {
      const detail = workspace.bookingDetails.find(item => item.bookingId === booking.id);
      const status = ['recommended', 'quoted', 'held', 'confirmed', 'missing', 'conflict'].includes(booking.status) ? booking.status as TripExportSnapshot['bookings'][number]['status'] : 'missing';
      return { kind: booking.kind, date: booking.startAt.slice(0, 10), dateIso: booking.startAt.slice(0, 10), endDate: booking.endAt.slice(0, 10), title: detail?.label || booking.provider || booking.kind, status,
        detail: `${displayTimestamp(booking.startAt)} — ${displayTimestamp(booking.endAt)}${detail?.placeId ? ` · ${destinationName(detail.placeId)}` : ''}${detail?.notes ? ` · ${detail.notes}` : ''} · Recorded state: ${status}. No new provider verification was performed.` };
    }),
  };
  const bounded = sanitizeTripExportSnapshot(snapshot);
  if (bounded.stops.length !== snapshot.stops.length || bounded.catalogue.length !== snapshot.catalogue.length || bounded.bookings.length !== snapshot.bookings.length || bounded.days.some((day, index) => day.activities.length !== snapshot.days[index].activities.length || day.anchors.length !== snapshot.days[index].anchors.length)) throw new Error('HTML export exceeds safe collection limits; no incomplete itinerary was exported');
  return bounded;
}

export function renderGenericItineraryHtml(workspace: GenericWorkspace, options: { visual?: boolean; scope?: TripExportScope; quotes?: QuoteComparisonData; research?: ResearchLedgerData } = {}): string {
  const snapshot = buildGenericTripExportSnapshot(workspace);
  const { trip } = workspace;
  const destinationName = (id: string) => trip.destinations.find(place => place.id === id)?.name || '';
  const selectedRoute = trip.routeCandidates.find(route => route.id === workspace.selectedRouteId);
  const conflicts = workspaceConflicts(workspace);
  const context = `<section class="route-overview" aria-labelledby="planning-context"><p class="section-kicker">Planning context</p><h2 id="planning-context">Decisions and alternatives</h2><p>Origins: ${escape(trip.origins.map(origin => origin.code).join(', '))}. Flexibility: ${trip.dateWindow.flexDays} days. ${selectedRoute ? `Selected planning route: ${escape(selectedRoute.label)}.` : 'No route candidate selected.'}</p><div class="logistics-grid">${trip.routeCandidates.map(route => `<article class="logistics-card"><span>${escape(route.status)}</span><b>${escape(route.label)}</b><p>${escape(route.placeOrder.map(destinationName).join(' → '))}</p>${route.score !== undefined ? `<small>Recorded score: ${route.score}; scoring assumptions below</small>` : ''}<p>${escape(route.scoreReasons?.join(' · ') || 'Scoring and price evidence have not been recorded.')}</p></article>`).join('') || '<p class="empty-state">Route alternatives have not been recorded.</p>'}</div>${conflicts.length ? `<h3>Unresolved conflicts</h3><ul>${conflicts.map(conflict => `<li>${escape(conflict)}</li>`).join('')}</ul>` : ''}<p class="empty-state">Country facts, images, geographic pins, stay comparisons, provider quotes, opening hours, and source freshness require further research. This export preserves the manually entered itinerary.</p></section>`;
  const quotes = options.quotes ? validateQuoteComparison(options.quotes, trip).quotes : [];
  const research = options.research ? validateResearchLedger(options.research, trip).rows : [];
  const evidence = `${quotes.length ? `<section class="route-overview"><p class="section-kicker">Recorded comparisons, not live inventory</p><h2>Cash, points and stay quotes</h2><p>Each amount applies to the stated party and scope. Refresh availability before purchase; no currency conversion or global cheapest claim is made.</p><div class="logistics-grid">${quotes.map(quote => {const math=quoteMath(quote);return `<article class="logistics-card"><h3>${escape(quote.label)}</h3><p>${escape(quote.kind)} · ${escape(quote.from)} → ${escape(quote.to)} · ${quote.occupants} occupants · ${escape(quote.startDate)} — ${escape(quote.endDate)}</p><p>Travel mode: ${escape(quote.mode)} · City: ${escape(destinationName(quote.cityId) || 'Trip-wide / unspecified')} · Room scope: ${quote.mode === 'stay' ? quote.rooms : 'Not applicable'}</p><p>${escape(quote.cabin)} · ${escape(quote.baggage)} · ${escape(quote.cancellation)}</p><p>Cash outlay: ${math.cashOutlay === null ? 'Unknown' : escape(math.cashOutlay+' '+quote.currency)}. Cash equivalent: ${math.cashEquivalent === null ? 'Unknown' : escape(math.cashEquivalent+' '+quote.currency)}.</p>${quote.kind === 'award' ? `<p>${escape(quote.sourceProgram)} → ${escape(quote.destinationProgram)}. Source points spent: ${math.sourcePoints ?? 'Unknown'}. ${escape(quote.transferTerms)}</p>` : ''}<p>${math.explanation.map(escape).join(' ')}</p><p>Source: ${escape(quote.source)} · checked ${escape(quote.checkedAt.replace('T', ' ').replace('Z', ' UTC'))}. ${escape(quote.unknowns)}</p></article>`;}).join('')}</div></section>` : ''}${research.length ? `<section class="route-overview"><p class="section-kicker">Coverage and next decisions</p><h2>Research ledger</h2><div class="logistics-grid">${research.map(row=>`<article class="logistics-card"><h3>${escape(row.label)}</h3><p>${escape(row.state)} · ${escape(row.checkedAt ? row.checkedAt.replace('T', ' ').replace('Z', ' UTC') : 'Unchecked')}</p><p>${escape(row.scope)}</p><p>${escape(row.source)} · ${escape(row.notes)}</p><p>Next: ${escape(row.nextAction || 'Review outstanding coverage')}</p></article>`).join('')}</div></section>` : ''}`;
  return renderTripHtml(snapshot, options).replace('<footer class="footer">', `${context}${evidence}<footer class="footer">`);
}
