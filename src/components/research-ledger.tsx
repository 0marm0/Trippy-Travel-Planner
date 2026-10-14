"use client";

import { useState } from "react";
import type { NormalizedTrip } from "@/lib/normalized-trip";
import { createResearchLedger, researchFreshness, researchStates, researchStorageKey, validateResearchLedger, type ResearchLedgerData, type ResearchRow } from "@/lib/research-ledger";
import "./research-ledger.css";

function localTime(value: string) { if (!value) return ""; const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }

export default function ResearchLedger({ trip, initialData, proposedRow, onProposalHandled, onDataChange }: { trip: NormalizedTrip; initialData?: ResearchLedgerData; proposedRow?: ResearchRow | null; onProposalHandled?: () => void; onDataChange?: (data: ResearchLedgerData) => void }) {
  const [ledger, setLedger] = useState(() => initialData ? validateResearchLedger(initialData,trip) : createResearchLedger(trip));
  const [editing, setEditing] = useState<ResearchRow | null>(null);
  const [persist, setPersist] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [json, setJson] = useState("");
  const [preview, setPreview] = useState<ResearchLedgerData | null>(null);
  function accept(next: ResearchLedgerData) {
    try {
      const safe = validateResearchLedger(next, trip);
      if (persist) localStorage.setItem(researchStorageKey(trip), JSON.stringify(safe));
      setLedger(safe); onDataChange?.(safe); setEditing(null); setPreview(null); setError(""); setNotice("Research ledger updated. Coverage describes your recorded work, not an exhaustive provider search."); return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update the ledger."); return false; }
  }
  function restore() {
    try { const raw = localStorage.getItem(researchStorageKey(trip)); if (!raw) { setNotice("No saved research ledger for this trip."); return; } setPreview(validateResearchLedger(JSON.parse(raw), trip)); setNotice("Saved evidence is ready for review before restoring."); }
    catch { setError("Saved research could not be validated. Current evidence is unchanged."); }
  }
  function changePersistence(enabled: boolean) {
    try { if (enabled) localStorage.setItem(researchStorageKey(trip), JSON.stringify(validateResearchLedger(ledger, trip))); else localStorage.removeItem(researchStorageKey(trip)); setPersist(enabled); setNotice(enabled ? "Validated evidence will be saved on this device. This is not encrypted cloud storage." : "Device copy removed. Current evidence remains in this tab."); }
    catch { setError("Device storage is unavailable. Your current evidence remains in this tab."); }
  }
  function download() {
    try { const safe = validateResearchLedger(ledger, trip); const url = URL.createObjectURL(new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "trip-research-ledger.json"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch { setError("Validate evidence before downloading."); }
  }
  const counts = Object.fromEntries(researchStates.map(state => [state, ledger.rows.filter(row => row.state === state).length]));
  return <section className="research-ledger" aria-label="Trip research coverage">
    {proposedRow && <section id="matrix-receipt-review" aria-label="Research matrix receipt review"><h3>Review replacement cash coverage receipt</h3><p>This replaces the cash coverage row only after acceptance. Finish or cancel the current evidence form first.</p><p>{proposedRow.state} · {proposedRow.checkedAt || 'Unchecked'}</p><pre>{proposedRow.scope}</pre><p>{proposedRow.notes}</p><p>Next: {proposedRow.nextAction}</p><button disabled={Boolean(editing)} onClick={()=>{if(accept({...ledger,rows:ledger.rows.map(row=>row.id===proposedRow.id?proposedRow:row)}))onProposalHandled?.();}}>Accept reviewed coverage receipt</button><button onClick={()=>onProposalHandled?.()}>Keep current coverage</button></section>}
    <header><div><p className="research-ledger-kicker">EVIDENCE AND OUTSTANDING WORK</p><h2>Know what has actually been researched.</h2><p>Record dates, airports, gateways, connections, programs and modes searched. Failed or unavailable tools never mean no inventory exists.</p></div><button onClick={download}>Download research ledger</button></header>
    <div className="research-ledger-counts">{researchStates.map(state => <span key={state}><b>{counts[state]}</b> {state}</span>)}</div>
    <p className="research-ledger-note">A checked time is a research receipt, not a guarantee that a quote is still bookable. Refresh availability and terms before deciding or booking.</p>
    <div className="research-ledger-storage"><label><input type="checkbox" checked={persist} onChange={event => changePersistence(event.target.checked)} /> Save validated evidence on this device</label><button onClick={restore}>Review saved research</button></div>
    {error && <p role="alert" className="research-ledger-error">{error}</p>}{notice && <p role="status">{notice}</p>}
    <div className="research-ledger-rows">{ledger.rows.map(row => <article key={row.id}><div><h3>{row.label}</h3><p><span>{row.state}</span> · {researchFreshness(row)}</p>{row.scope && <p><b>Coverage:</b> {row.scope}</p>}{row.source && <p><b>Source:</b> {row.source}{row.sourceUrl && <> · <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">Source page ↗</a></>}</p>}{row.notes && <p>{row.notes}</p>}{row.nextAction && <p><b>Next:</b> {row.nextAction}</p>}</div><button onClick={() => { setEditing({ ...row }); setError(""); }}>Update {row.category} evidence{row.cityId ? ` for ${trip.destinations.find(city => city.id === row.cityId)?.name}` : ""}</button></article>)}</div>
    {editing && <form className="research-ledger-form" onSubmit={event => { event.preventDefault(); accept({ ...ledger, rows: ledger.rows.map(row => row.id === editing.id ? editing : row) }); }}><h3>{editing.label}</h3><label>Evidence state<select value={editing.state} onChange={event => setEditing({ ...editing, state: event.target.value as ResearchRow["state"] })}>{researchStates.map(state => <option key={state}>{state}</option>)}</select></label><label>Search scope<textarea aria-label="Search scope" maxLength={1000} value={editing.scope} onChange={event => setEditing({ ...editing, scope: event.target.value })} placeholder="Dates, airports, connections, modes and unsearched combinations" /></label><label>Source or tool<input maxLength={160} value={editing.source} onChange={event => setEditing({ ...editing, source: event.target.value })} /></label><label>Public source URL<input type="url" maxLength={500} value={editing.sourceUrl} onChange={event => setEditing({ ...editing, sourceUrl: event.target.value })} placeholder="HTTPS page without private query parameters" /></label><label>Checked at<input type="datetime-local" value={localTime(editing.checkedAt)} onChange={event => setEditing({ ...editing, checkedAt: event.target.value ? new Date(event.target.value).toISOString() : "" })} /></label><label>Findings and limitations<textarea aria-label="Findings and limitations" maxLength={1000} value={editing.notes} onChange={event => setEditing({ ...editing, notes: event.target.value })} /></label><label>Next action<textarea aria-label="Next action" maxLength={1000} value={editing.nextAction} onChange={event => setEditing({ ...editing, nextAction: event.target.value })} /></label><div><button type="submit">Validate and save evidence</button><button type="button" onClick={() => setEditing(null)}>Cancel evidence edit</button></div></form>}
    <details><summary>Import a reviewed research ledger</summary><label>Research ledger JSON<textarea aria-label="Research ledger JSON" maxLength={250001} value={json} onChange={event => setJson(event.target.value)} /></label><button onClick={() => { try { if (json.length > 250000) throw new Error("Ledger is too large."); setPreview(validateResearchLedger(JSON.parse(json), trip)); setError(""); } catch { setPreview(null); setError("Invalid research ledger. Current evidence is unchanged."); } }}>Validate and preview evidence</button></details>
    {preview && <section className="research-ledger-preview"><h3>Review incoming research</h3><p>Applying this record replaces this trip’s current research ledger. It does not change bookings or import provider credentials.</p><pre>{JSON.stringify(preview.rows, null, 2)}</pre><button onClick={() => accept(preview)}>Accept reviewed research</button><button onClick={() => setPreview(null)}>Discard research preview</button></section>}
  </section>;
}
