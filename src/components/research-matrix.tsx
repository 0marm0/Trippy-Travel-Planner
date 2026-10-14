"use client";

import { useEffect, useRef, useState } from "react";
import type { NormalizedTrip } from "@/lib/normalized-trip";
import type { ResearchRow } from "@/lib/research-ledger";
import { matrixCoverageReceipt, prepareResearchMatrix, reduceResearchMatrix, runResearchMatrix, type MatrixInput, type MatrixState } from "@/lib/research-matrix";
import "./research-matrix.css";

export default function ResearchMatrix({ trip, onRecord }: { trip: NormalizedTrip; onRecord: (row: ResearchRow) => void }) {
  const [input, setInput] = useState<MatrixInput>(() => ({ origins: trip.origins.filter(item => item.kind === "airport").map(item => item.code).join(", "), destinations: "", dates: "", adults: String(trip.travelers.adults), cabin: "", currency: trip.preferences.currency || "" }));
  const [matrix, setMatrix] = useState<MatrixState | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); }, []);
  function edit(field: keyof MatrixInput, value: string) {
    controller.current?.abort(); generation.current++;
    setRunning(false); setMatrix(null); setMessage(""); setInput(previous => ({ ...previous, [field]: value }));
  }
  function prepare() {
    controller.current?.abort(); generation.current++;
    try { const prepared = prepareResearchMatrix(trip, input); setMatrix({ ...prepared, generation: generation.current }); setMessage("Prepared only. No provider requests have been sent."); }
    catch (error) { setMatrix(null); setMessage(error instanceof Error ? error.message : "Review the query inputs."); }
  }
  async function run() {
    if (!matrix || running) return;
    controller.current?.abort();
    const active = new AbortController(); controller.current = active;
    const currentGeneration = ++generation.current;
    const activeMatrix: MatrixState = { ...matrix, generation: currentGeneration, rows: matrix.rows.map(row => ({ ...row, outcome: { status: "pending", count: 0, checkedAt: "", freshness: "unknown", limitations: [] } })) };
    setMatrix(activeMatrix); setRunning(true); setMessage("");
    await runResearchMatrix(activeMatrix, fetch, action => {
      if (controller.current !== active || active.signal.aborted || generation.current !== currentGeneration) return;
      setMatrix(previous => previous ? reduceResearchMatrix(previous, action) : previous);
    }, active.signal);
    if (controller.current === active && !active.signal.aborted && generation.current === currentGeneration) { setRunning(false); setMessage("Run finished. Review per-query outcomes before recording coverage."); }
  }
  function cancel() {
    controller.current?.abort(); controller.current = null; generation.current++;
    setMatrix(previous => previous ? reduceResearchMatrix(previous, { type: "cancel" }) : previous);
    setRunning(false); setMessage("Stopped. Already sent requests may consume provider quota; no retries were made. Pending/in-flight results are cancelled, not empty.");
  }
  return <section className="research-matrix" aria-label="Bounded cash-flight research matrix"><header><h3>Compare exact dates and airports</h3><p>Prepare a bounded one-way cash-flight matrix without keys. Running uses the configured SerpApi adapter and may consume your provider allowance. No requests run in the background.</p></header>
    <fieldset disabled={running}><legend>Query basis</legend><div className="research-matrix-inputs"><label>Origins (IATA list)<input value={input.origins} onChange={event => edit("origins", event.target.value)} placeholder="AAA, BBB" /></label><label>Destinations (IATA list)<input value={input.destinations} onChange={event => edit("destinations", event.target.value)} placeholder="CCC, DDD" /></label><label>Exact dates (comma-separated)<input value={input.dates} onChange={event => edit("dates", event.target.value)} placeholder={`${trip.dateWindow.earliestDeparture}, ${trip.dateWindow.latestReturn}`} /></label><label>Adults<input type="number" min="1" max="9" value={input.adults} onChange={event => edit("adults", event.target.value)} /></label><label>Cabin<select value={input.cabin} onChange={event => edit("cabin", event.target.value)}><option value="">Choose cabin</option><option value="economy">Economy</option><option value="premium-economy">Premium economy</option><option value="business">Business</option><option value="first">First</option></select></label><label>Currency<input maxLength={3} value={input.currency} onChange={event => edit("currency", event.target.value.toUpperCase())} placeholder="Choose currency" /></label></div><p>Dates must remain inside {trip.dateWindow.earliestDeparture}–{trip.dateWindow.latestReturn}. At most 24 distinct route/date queries; duplicate inputs are removed and same-airport legs excluded.</p><button type="button" onClick={prepare}>Prepare query matrix</button></fieldset>
    {matrix && <><p><b>{matrix.rows.length} prepared queries</b> · at most two concurrent API requests · no retries, pagination or follow-up calls. Running again repeats the prepared queries. Provider upstream behavior and cache/quota terms remain separate.</p><div className="research-matrix-actions"><button type="button" disabled={running} onClick={() => void run()}>Run prepared queries</button>{running && <button type="button" onClick={cancel}>Stop searches</button>}<button type="button" disabled={running || !matrix.rows.some(row => !["pending", "running", "cancelled"].includes(row.outcome.status))} onClick={() => { try { const row = matrixCoverageReceipt(trip, matrix); onRecord(row); setMessage("Coverage replacement requested. Query results were not added as quotes or bookings."); } catch { setMessage("Coverage could not be recorded. Finish/cancel this current-trip run and review its outcomes first."); } }}>Record coverage — replace current cash-flight receipt</button></div>
      <div className="research-matrix-results"><table><caption>Exact query coverage · results are research leads, not inventory guarantees</caption><thead><tr><th scope="col">Route / date</th><th scope="col">Outcome</th><th scope="col">Returned evidence</th><th scope="col">Freshness / limits</th></tr></thead><tbody>{matrix.rows.map(row => <tr key={row.id}><th scope="row">{row.request.origin} → {row.request.destination}<small>{row.request.departureDate} · {row.request.adults} adults · {row.request.cabin} · {row.request.currency}</small></th><td>{row.outcome.status}</td><td>{row.outcome.status === "found" ? `${row.outcome.count} returned leads` : "No comparable quote count"}{row.outcome.lowest && <small>Lowest returned {row.outcome.lowest.amount} {row.outcome.lowest.currency} / {row.outcome.lowest.unit}; fees/party basis require source verification</small>}</td><td>{row.outcome.checkedAt || "Provider check time unknown"}<small>{row.outcome.freshness}</small>{row.outcome.providerCheckedAt && <small>Provider observed {row.outcome.providerCheckedAt}</small>}{row.outcome.limitations.map((note, index) => <small key={index}>{note}</small>)}</td></tr>)}</tbody></table></div></>}
    <p>Only exact one-way cash queries are covered. Awards, round trips/through-ticket open jaws, lodging and other transport modes are unsearched. Empty is meaningful only for successful queried scope; failed, unconfigured, locked and cancelled rows remain unknown. Child pricing and live inventory eligibility are not verified. Coverage recording replaces one existing cash ledger row only; quotes and bookings require separate review.</p>{message && <p role="status">{message}</p>}
  </section>;
}
