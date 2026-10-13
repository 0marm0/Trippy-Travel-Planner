"use client";

import { useState } from "react";
import Link from "next/link";
import { agentTripBrief, createNormalizedTrip, validateNormalizedTrip, type NormalizedTrip } from "@/lib/normalized-trip";
import "./new-trip-planner.css";

const split = (text: string) => text.split(",").map((item) => item.trim()).filter(Boolean);
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const [accepted, setAccepted] = useState<NormalizedTrip | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [json, setJson] = useState("");
  const [message, setMessage] = useState("");
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
  async function copyBrief() {
    if (!accepted) return;
    try { await navigator.clipboard.writeText(agentTripBrief(accepted)); setMessage("Agent brief copied. Review it before sharing with your agent."); }
    catch { setMessage("Clipboard unavailable. Copy the brief below."); }
  }
  return <main className="new-trip-page">
    <nav><Link href="/">TRIPPY · Sample atlas</Link><Link href="/about">About Trippy</Link><Link href="/collaborate">Plan together</Link></nav>
    <header><span className="trip-kicker">YOUR CITIES. YOUR DATES. YOUR ACCOUNTS.</span><h1>Start with the trip you want.</h1><p>Create a structured draft, review it, then take it to your agent for route research. No keys or accounts required.</p></header>
    <p className="trip-local-note">This form runs in your browser. Drafts stay in memory until you download or copy them; reload clears them. Enter planning facts only—no names, email addresses, booking codes, seats, or API keys.</p>
    <form onSubmit={(event) => { event.preventDefault(); preview(); }} className="new-trip-card">
      <h2>Trip frame</h2><div className="new-trip-fields">
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
    {!!errors.length && <section className="new-trip-errors" role="alert"><h2>Review these fields</h2><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul></section>}
    {candidate && <section className="new-trip-card" aria-label="Proposed normalized trip"><h2>Review before accepting</h2><p>{candidate.name} · {candidate.dateWindow.earliestDeparture} – {candidate.dateWindow.latestReturn} · {candidate.travelers.adults} adults</p><p>{candidate.destinations.map((city) => city.name).join(" → ")}</p><p>City order is input order, not an optimized or booked route. No availability or prices have been researched.</p><details><summary>Inspect every proposed field</summary><pre>{JSON.stringify(candidate, null, 2)}</pre></details><button className="trip-primary" onClick={() => { setAccepted(candidate); setCandidate(null); setMessage("Draft accepted in this browser session."); }}>Accept this draft</button><button onClick={() => setCandidate(null)}>Discard preview</button></section>}
    {accepted && <section className="new-trip-card"><h2>{accepted.name}: ready for agent planning</h2><p>Ask your agent for at least three materially different routes before price research. This draft has {accepted.routeCandidates.length} recorded candidates and {accepted.bookings.length} booking records.</p><div className="new-trip-actions"><button onClick={() => download(`${accepted.id}-trip.json`, JSON.stringify(accepted, null, 2) + "\n")}>Download planning JSON</button><button onClick={copyBrief}>Copy agent brief</button><button onClick={() => { setAccepted(null); setMessage("Accepted draft cleared."); }}>Clear accepted draft</button></div><details><summary>Review the agent brief</summary><pre>{agentTripBrief(accepted)}</pre></details></section>}
    {message && <p role="status">{message}</p>}
    <footer><p>Optional research uses your own provider accounts and keys. Local hosting and an independent Vercel project are supported; nothing connects to the maintainer’s Vercel account.</p><p>This starting workflow is separate from the detailed 2026 sample atlas. Generic daily itinerary, quote selection, and maps are the next integration layer.</p></footer>
  </main>;
}
