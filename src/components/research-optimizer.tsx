"use client";

import { useMemo, useState } from "react";
import type { TransportOption, Trip2026Payload } from "@/lib/trip-model";
import type { RankedRoute, RouteOptimizationInput } from "@/lib/optimization/route-optimizer";
import GlassSelect from "./glass-select";
import { Icon } from "./planner-icon";
import type { ProviderSearchSeed } from "./integration-center";

type Objective = "balanced" | "price" | "time";
type Mode = TransportOption["mode"];
type Candidate = { option: TransportOption; score: number; cost: number; hours: number };

const modeLabel: Record<Mode, string> = { flight: "Flight", train: "Rail", car: "Car", bus: "Coach" };

function displayCity(id: string) {
  return id === "ring" ? "Nürburgring" : id === "wroclaw" ? "Wrocław" : id === "krakow" ? "Kraków" : id.replace(/^./, (letter) => letter.toUpperCase());
}

function shiftedDate(value: string, delta: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function displayDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

function displayMoney(value: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function rank(option: TransportOption, objective: Objective) {
  const cost = option.low || option.high || 999;
  const hours = option.hours || 24;
  if (objective === "price") return cost + hours * 4;
  if (objective === "time") return hours * 35 + cost * .18;
  return cost * .55 + hours * 18;
}

function candidate(option: TransportOption, objective: Objective): Candidate {
  return { option, score: rank(option, objective), cost: option.low || option.high, hours: option.hours };
}

export default function ResearchOptimizer({ data, selectedTransport, onSearch }: { data: Trip2026Payload; selectedTransport: Record<string, string>; onSearch: (seed: ProviderSearchSeed) => void }) {
  const [legId, setLegId] = useState(data.transport.find((leg) => leg.from === "krakow" && leg.to === "brussels")?.id || data.transport[0]?.id || "");
  const [objective, setObjective] = useState<Objective>("balanced");
  const [dateShift, setDateShift] = useState(0);
  const [modes, setModes] = useState<Mode[]>(["flight", "train", "car", "bus"]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [routeState, setRouteState] = useState<"idle" | "loading" | "complete" | "unavailable">("idle");
  const [routeResults, setRouteResults] = useState<RankedRoute[]>([]);
  const [routeNotice, setRouteNotice] = useState("");
  const leg = data.transport.find((item) => item.id === legId) || data.transport[0];
  const ranked = useMemo(() => leg ? leg.options.filter((option) => modes.includes(option.mode)).map((option) => candidate(option, objective)).sort((a, b) => a.score - b.score) : [], [leg, modes, objective]);
  const baseline = leg?.options.find((option) => option.id === selectedTransport[leg.id]) || leg?.options.find((option) => option.id === leg.recommend) || leg?.options[0];
  const date = leg ? shiftedDate(leg.date, dateShift) : "";
  const isShifted = dateShift !== 0;

  const toggleMode = (mode: Mode) => setModes((current) => current.includes(mode) ? current.length === 1 ? current : current.filter((item) => item !== mode) : [...current, mode]);
  const toggleShortlist = (id: string) => setShortlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  async function optimizeRoute() {
    setRouteState("loading");
    setRouteResults([]);
    setRouteNotice("");
    try {
      const stopIds = new Set(data.stops.map((stop) => stop.id));
      const requestBody: RouteOptimizationInput = {
        stops: data.stops.map((stop) => ({ id: stop.id, name: stop.name, lat: stop.lat, lng: stop.lng, minNights: stop.nights, maxNights: stop.nights })),
        legs: data.transport.filter((transportLeg) => stopIds.has(transportLeg.from) && stopIds.has(transportLeg.to)).flatMap((transportLeg) => transportLeg.options.filter((option) => (option.low > 0 || option.high > 0) && option.hours > 0).map((option) => ({
          id: `${transportLeg.id}:${option.id}`,
          from: transportLeg.from,
          to: transportLeg.to,
          mode: option.mode,
          cash: option.low || option.high,
          durationHours: option.hours,
          source: option.source,
          checkedAt: option.published,
        }))),
        startId: data.stops[0]?.id,
        endId: data.stops.at(-1)?.id,
        allowedModes: modes,
        weights: objective === "price" ? { cost: .66, time: .15, simplicity: .08, reliability: .08, carbon: .03 } : objective === "time" ? { cost: .14, time: .62, simplicity: .11, reliability: .1, carbon: .03 } : { cost: .34, time: .28, simplicity: .16, reliability: .16, carbon: .06 },
        maxResults: 3,
      };
      const response = await fetch("/api/optimizer/route", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const body = await response.json() as { routes?: RankedRoute[]; notice?: string };
      setRouteResults(Array.isArray(body.routes) ? body.routes : []);
      setRouteNotice(typeof body.notice === "string" ? body.notice : "Optimization compares planning evidence only.");
      setRouteState("complete");
    } catch {
      setRouteState("unavailable");
      setRouteNotice("The route optimizer is unavailable. Your existing route and manual comparison remain intact.");
    }
  }

  return <section className="optimizer glass">
    <header className="optimizer-header"><div><span className="eyebrow">Decision lab</span><h2>Compare the route before you commit.</h2><p>Re-rank existing options, model adjacent dates, then send a bounded request to configured sources.</p></div><div className="optimizer-signal"><i /><span><small>Working set</small><b>{ranked.length} comparable option{ranked.length === 1 ? "" : "s"}</b></span></div></header>
    <div className="optimizer-controls">
      <label className="optimizer-leg">Route leg<GlassSelect value={leg?.id || ""} onChange={(event) => setLegId(event.target.value)}>{data.transport.map((item) => <option key={item.id} value={item.id}>{`${displayCity(item.from)} → ${displayCity(item.to)} · ${displayDate(item.date)}`}</option>)}</GlassSelect></label>
      <label>Optimize for<GlassSelect value={objective} onChange={(event) => setObjective(event.target.value as Objective)}><option value="balanced">Balanced value</option><option value="price">Lowest cost</option><option value="time">Shortest practical time</option></GlassSelect></label>
      <label>Date scenario<GlassSelect value={String(dateShift)} onChange={(event) => setDateShift(Number(event.target.value))}><option value="-3">3 days earlier</option><option value="-1">1 day earlier</option><option value="0">Planned date</option><option value="1">1 day later</option><option value="3">3 days later</option></GlassSelect></label>
      <div className="optimizer-mode-control"><span>Modes</span><div>{(["flight", "train", "car", "bus"] as Mode[]).map((mode) => <button key={mode} className={modes.includes(mode) ? "active" : ""} aria-pressed={modes.includes(mode)} onClick={() => toggleMode(mode)}><Icon name={mode === "bus" ? "train" : mode} />{modeLabel[mode]}</button>)}</div></div>
    </div>
    <div className="optimizer-context"><span><small>Comparison date</small><b>{displayDate(date)}</b>{isShifted && <em>Scenario only</em>}</span><span><small>Current baseline</small><b>{baseline?.name || "No baseline"}</b></span><div><button onClick={() => void optimizeRoute()} disabled={routeState === "loading"}><Icon name="route" />{routeState === "loading" ? "Optimizing…" : "Optimize route"}</button><button onClick={() => onSearch({ kind: "cash-flights", origin: displayCity(leg.from), destination: displayCity(leg.to), date })}><Icon name="search" />Search sources</button></div></div>
    {routeState !== "idle" && <section className={`route-scenario-tray state-${routeState}`} aria-live="polite"><header><span><small>Whole-route scenarios</small><b>{routeState === "loading" ? "Building evidence-weighted routes…" : routeResults.length ? `${routeResults.length} candidate routes` : "No route candidates returned"}</b></span>{routeNotice && <p>{routeNotice}</p>}</header>{routeResults.length > 0 && <div>{routeResults.map((route) => <article key={`${route.rank}:${route.orderedStops.map((stop) => stop.id).join("-")}`}><span>#{route.rank}</span><div><b>{route.orderedStops.map((stop) => stop.name).join(" → ")}</b><small>{route.explanation.join(" · ") || "Evidence-weighted route scenario"}</small></div><dl><div><dt>Score</dt><dd>{route.score.toFixed(1)}</dd></div><div><dt>Confidence</dt><dd>{route.confidence}</dd></div><div><dt>Known cost</dt><dd>{displayMoney(route.totals.cash)}</dd></div></dl>{route.missingLegs.length > 0 && <em>{route.missingLegs.length} missing leg{route.missingLegs.length === 1 ? "" : "s"}</em>}</article>)}</div>}</section>}
    <div className="optimizer-results">
      {ranked.length ? ranked.slice(0, 4).map((item, index) => {
        const isBaseline = item.option.id === baseline?.id;
        const saved = shortlist.includes(item.option.id);
        return <article key={item.option.id} className={`${index === 0 ? "leading" : ""} ${saved ? "shortlisted" : ""}`}>
          <div className="optimizer-rank"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
          <div className="optimizer-option-copy"><span>{modeLabel[item.option.mode]}{isBaseline ? " · current baseline" : ""}</span><h3>{item.option.name}</h3><p>{item.option.ride} · {item.option.door}</p><small>{item.option.note}</small></div>
          <div className="optimizer-measures"><span><small>Allowance</small><b>{item.cost ? `${displayMoney(item.option.low)}–${displayMoney(item.option.high)}` : "TBC"}</b></span><span><small>Practical time</small><b>{item.hours ? `${item.hours}h` : "TBC"}</b></span></div>
          <button className="shortlist-button" aria-pressed={saved} onClick={() => toggleShortlist(item.option.id)}>{saved ? "Shortlisted" : "Shortlist"}</button>
        </article>;
      }) : <div className="optimizer-empty"><span><Icon name="route" /></span><h3>No options match this mode set.</h3><p>Turn on another transport mode to restore the comparison.</p></div>}
    </div>
    <footer className="optimizer-limitations"><div><Icon name="check" /><span><b>{shortlist.length} shortlisted</b><small>Local working set · no booking-state change</small></span></div><ul><li>Existing prices are planning ranges, not live quotes.</li><li>Date shifts do not mutate the itinerary.</li><li>Confirmed records stay fixed until explicit review.</li></ul></footer>
  </section>;
}
