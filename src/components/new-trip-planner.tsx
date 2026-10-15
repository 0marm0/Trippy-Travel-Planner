"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./planner-icon";
import { createNormalizedTrip, validateNormalizedTrip, type NormalizedTrip } from "@/lib/normalized-trip";
import "./new-trip-planner.css";
import WorkspaceLibrary from "./workspace-library";
import AppearanceControls from "./appearance-controls";
import GenericTripWorkspace from "./generic-trip-workspace";
import { loadWorkspace, removeWorkspace, workspaceKey, parseWorkspaceImport, type GenericWorkspace } from "@/lib/generic-trip-workspace";

const split = (text: string) => text.split(",").map((item) => item.trim()).filter(Boolean);

function PlannerNavigation() {
  return <nav className="planning-navigation" aria-label="Trippy navigation"><Link className="planning-brand" href="/"><span className="planning-brand-mark"><Icon name="globe" /></span><span>TRIPPY<small>Make room for discovery.</small></span></Link><div className="planning-navigation-links"><AppearanceControls /><Link href="/">Sample atlas</Link><Link href="/about">About</Link><Link href="/collaborate"><Icon name="activities" /> Plan together</Link></div></nav>;
}

export default function NewTripPlanner() {
  const [name, setName] = useState("My next trip");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [cities, setCities] = useState("");
  const [origins, setOrigins] = useState("");
  const [adults, setAdults] = useState(2);
  const [flexDays, setFlexDays] = useState(0);
  const [pace, setPace] = useState<NormalizedTrip["preferences"]["pace"]>("balanced");
  const [themes, setThemes] = useState("");
  const [candidate, setCandidate] = useState<NormalizedTrip | null>(null);
  const [restored, setRestored] = useState<GenericWorkspace | null>(null);
  const [accepted, setAccepted] = useState<NormalizedTrip | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [json, setJson] = useState("");
  const [message, setMessage] = useState("");
  const [workspaceJson,setWorkspaceJson] = useState("");
  const [workspacePreview,setWorkspacePreview] = useState<GenericWorkspace | null>(null);
  function preview() {
    const trip = createNormalizedTrip({ name, start, end, cities: split(cities), origins: split(origins), adults, flexDays, pace, themes: split(themes) });
    const issues = validateNormalizedTrip(trip);
    setErrors(issues); setCandidate(issues.length ? null : trip); setMessage("");
  }
  function previewJson() {
    if (json.length > 1_000_000) { setErrors(["JSON is too large; maximum 1 MB"]); setCandidate(null); return; }
    try {
      const trip: unknown = JSON.parse(json);
      const issues = validateNormalizedTrip(trip);
      setErrors(issues); setCandidate(issues.length ? null : trip as NormalizedTrip); setMessage("");
    } catch { setErrors(["Invalid JSON; no data imported"]); setCandidate(null); }
  }
  if (accepted) return <main className="new-trip-page"><PlannerNavigation /><GenericTripWorkspace key={workspaceKey(accepted)} initial={restored || accepted} onClose={() => { setAccepted(null); setRestored(null); }} /></main>;
  return <main className="new-trip-page">
    <PlannerNavigation />
    <header className="planning-intro"><div className="planning-intro-content"><span className="trip-kicker">YOUR CITIES. YOUR DATES. YOUR ACCOUNTS.</span><h1>Start with the trip you want.</h1><p>Create a structured draft, review it, then take it to your agent for route research. No keys or accounts required.</p><div className="planning-intro-tags"><span><Icon name="route" /> Routes that fit you</span><span><Icon name="shield" /> Private by choice</span></div></div><div className="planning-orbit" aria-hidden="true"><Icon name="globe" /><span>YOUR NEXT CHAPTER</span></div></header>
    <p className="trip-local-note">This form runs in your browser. Preview drafts stay in memory. Accepted workspaces can be saved explicitly in this browser or downloaded; there is no server upload or cloud sync. Enter planning facts only—no names, email addresses, booking codes, seats, or API keys.</p>
    <div className="new-trip-actions"><button onClick={() => { try { const saved = loadWorkspace(localStorage); if (saved) { setRestored(saved); setAccepted(saved.trip); } else setMessage("No valid saved workspace found in this browser."); } catch { setMessage("Browser storage is unavailable."); } }}>Resume last saved workspace</button><button onClick={() => { try { const saved = loadWorkspace(localStorage); if (saved) { removeWorkspace(localStorage, saved.trip); setMessage("Last saved workspace removed from this browser."); } else setMessage("No saved workspace found."); } catch { setMessage("Browser storage is unavailable."); } }}>Forget last saved workspace</button></div>
    <WorkspaceLibrary onOpen={saved=>{setRestored(saved);setAccepted(saved.trip);setCandidate(null);setWorkspacePreview(null);}} />
    <form onSubmit={(event) => { event.preventDefault(); preview(); }} className="new-trip-card">
      <div className="planning-card-heading"><span className="planning-section-icon"><Icon name="route" /></span><div><span className="trip-kicker">01 · THE ESSENTIALS</span><h2>Trip frame</h2></div></div><div className="new-trip-fields">
        <label>Trip name<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Adults<input type="number" required min={1} max={20} value={adults} onChange={(event) => setAdults(Number(event.target.value))} /></label>
        <label>Earliest departure<input type="date" required value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>Latest return<input type="date" required value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label>Acceptable home airports<input required maxLength={240} placeholder="IAD, DCA, BWI" value={origins} onChange={(event) => setOrigins(event.target.value)} /></label>
        <label>Cities to include<input required maxLength={800} placeholder="Lisbon, Porto, Madrid" value={cities} onChange={(event) => setCities(event.target.value)} /></label>
        <label>Date flexibility (days)<input type="number" required min={0} max={60} value={flexDays} onChange={(event) => setFlexDays(Number(event.target.value))} /></label>
        <label>Pace<select value={pace} onChange={(event) => setPace(event.target.value as typeof pace)}><option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="packed">Packed</option></select></label>
        <label className="new-trip-wide">Interests<input maxLength={800} placeholder="Food, art, architecture, hiking" value={themes} onChange={(event) => setThemes(event.target.value)} /></label>
      </div><p>The agent will ask about child ages, fixed anchors, budget, cabin, points, access needs, luggage, connection tolerance, cancellations, and rejections before research.</p>
      <button className="trip-primary" type="submit">Preview trip draft</button>
    </form>
    <details className="new-trip-card"><summary>Preview normalized JSON from your agent</summary><p>Paste only a reviewed planning record using Trippy’s trip schema. Preview does not replace your accepted draft.</p><label>Trip JSON<textarea value={json} maxLength={1_000_001} onChange={(event) => setJson(event.target.value)} rows={8} spellCheck={false} /></label><button onClick={previewJson}>Validate and preview JSON</button></details>
    <details className="new-trip-card"><summary>Restore a complete workspace JSON</summary><p>Restore an editable planning copy, including dates, day activities, item evidence, recorded research/quotes and budget selections. Validation and preview happen locally; nothing is uploaded or applied automatically.</p><label>Complete workspace JSON<textarea value={workspaceJson} maxLength={2_000_001} onChange={event=>{setWorkspaceJson(event.target.value);setWorkspacePreview(null);}} rows={6} spellCheck={false}/></label><button onClick={()=>{try{setWorkspacePreview(parseWorkspaceImport(workspaceJson));setErrors([]);}catch(cause){setWorkspacePreview(null);setErrors([cause instanceof Error?cause.message:'Workspace import rejected.']);}}}>Validate workspace for review</button></details>
    {workspacePreview&&<section className="new-trip-card" aria-label="Workspace import preview"><h2>Review complete planning copy</h2><p>{workspacePreview.trip.name} · {workspacePreview.days.length} days · {workspacePreview.activities.length} activities · {workspacePreview.trip.bookings.length} recorded bookings · {workspacePreview.itemEvidence?.length||0} item receipts</p><p>Recorded states are retained as supplied, not independently confirmed. This loads into memory; device/account saving remains a separate choice.</p><details><summary>Inspect complete proposed workspace</summary><pre>{JSON.stringify(workspacePreview,null,2)}</pre></details><button onClick={()=>{setRestored(workspacePreview);setAccepted(workspacePreview.trip);setWorkspacePreview(null);}}>Accept reviewed workspace</button><button onClick={()=>setWorkspacePreview(null)}>Discard workspace preview</button></section>}
    {!!errors.length && <section className="new-trip-errors" role="alert"><h2>Review these fields</h2><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul></section>}
    {candidate && <section className="new-trip-card" aria-label="Proposed normalized trip"><h2>Review before accepting</h2><p>{candidate.name} · {candidate.dateWindow.earliestDeparture} – {candidate.dateWindow.latestReturn} · {candidate.travelers.adults} adults</p><p>{candidate.destinations.map((city) => city.name).join(" → ")}</p><p>City order is input order, not an optimized or booked route. No availability or prices have been researched.</p><details><summary>Inspect every proposed field</summary><pre>{JSON.stringify(candidate, null, 2)}</pre></details><button className="trip-primary" onClick={() => { setRestored(null); setAccepted(candidate); setCandidate(null); setMessage("Draft accepted in this browser session."); }}>Accept this draft</button><button onClick={() => { try { const saved = loadWorkspace(localStorage, candidate); if (saved) { setRestored(saved); setAccepted(saved.trip); setCandidate(null); } else setMessage("No saved workspace matches these trip dates and destinations. Accept this draft to start a new workspace."); } catch { setMessage("Browser storage is unavailable."); } }}>Resume saved version of this trip</button><button onClick={() => setCandidate(null)}>Discard preview</button></section>}
    {message && <p role="status">{message}</p>}
    <footer><p>Optional research uses your own provider accounts and keys. Local hosting and an independent Vercel project are supported; nothing connects to the maintainer’s Vercel account.</p><p>This starting workflow is separate from the detailed 2026 sample atlas. Accept a draft to open its manual routes, maps, day activities, stays, transport and research coverage workspace.</p></footer>
  </main>;
}
