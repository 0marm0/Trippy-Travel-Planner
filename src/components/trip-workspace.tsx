/* eslint-disable @next/next/no-img-element */
"use client";

import GlassSelect from "./glass-select";
import BrandMark from "./brand-mark";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { Icon } from "./planner-icon";
import TripOverview, { LogisticsIcon } from "./trip-overview";
import IntegrationCenter, { type ProviderSearchSeed } from "./integration-center";
import ResearchOptimizer from "./research-optimizer";
import DecisionMode, { type DecisionModeItem } from "./decision-mode";
import TravelMode from "./travel-mode";
import DeploymentCenter, { type WorkspaceMode } from "./deployment-center";
import UpdateInbox from "./update-inbox";
import type { TrippyBundleScope, TrippyWorkspaceState } from "@/lib/trippy-bundle";
import { buildTripLogistics, logisticsItemsForDate, transportLegStatus, type LogisticsItem, type LogisticsKind } from "@/lib/trip-logistics";
import { downloadTripExport, type TripExportKind, type TripExportPrivacy } from "@/lib/trip-exports";
import "./premium.css";
import "./release.css";
import "./elevation.css";
import type { MapSegment } from "./geographic-map";
import type { Point } from "@/lib/planner";
import type { BookingRecord, CityDayPlan, TransportLeg, Trip2026Payload, TripActivity, TripHotel, TripStop } from "@/lib/trip-model";

const GeographicMap = dynamic(() => import("./geographic-map"), { ssr: false, loading: () => <div className="map-skeleton">Opening the atlas…</div> });
const LegacyTripWorkspace = dynamic(() => import("./legacy-trip-workspace"), { ssr: false });

type View = "route" | "transport" | "cities" | "itinerary" | "hotels" | "activities" | "research";
type ExperienceMode = "plan" | "decide" | "travel";
type Priority = TripActivity["priority"];
type WorkspaceState = {
  assignments: Record<string, string[]>;
  activityPriority: Record<string, Priority>;
  savedActivities: string[];
  selectedTransport: Record<string, string>;
  savedHotels: string[];
  selectedHotel: Record<string, string>;
  researchEvidence?: TrippyWorkspaceState["researchEvidence"];
};
type SetupProfile = {
  origin: string;
  adults: number;
  rooms: number;
  pace: "relaxed" | "balanced" | "full";
  dealPriority: "overall" | "cash" | "points" | "direct";
  dateFlexibility: "fixed" | "three" | "seven";
  cityFlexibility: "fixed" | "swap" | "open";
  groundModes: string[];
  reprice: boolean;
  privateImports: boolean;
};

const storageKey = "trippy.europe-2026.v1";
const setupKey = "trippy.europe-2026.setup.v1";
const experienceKey = "trippy.europe-2026.experience.v1";
const workspaceModeKey = "trippy.workspace-mode.v1";
const emptyState: WorkspaceState = { assignments: {}, activityPriority: {}, savedActivities: [], selectedTransport: {}, savedHotels: [], selectedHotel: {} };
const defaultSetup: SetupProfile = { origin: "Washington area", adults: 1, rooms: 1, pace: "balanced", dealPriority: "overall", dateFlexibility: "fixed", cityFlexibility: "fixed", groundModes: ["flight", "train"], reprice: true, privateImports: false };
const routeCityIds = ["ring", "krakow", "wroclaw", "brussels", "amsterdam", "berlin", "munich"];
const countryFlag: Record<string, string> = { frankfurt: "🇩🇪", ring: "🇩🇪", krakow: "🇵🇱", wroclaw: "🇵🇱", brussels: "🇧🇪", amsterdam: "🇳🇱", berlin: "🇩🇪", munich: "🇩🇪" };

function FallbackImage({ preferred, fallback, alt = "", ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { preferred: string; fallback?: string }) {
  const [current, setCurrent] = useState(preferred);
  return <img {...props} alt={alt} src={current} onError={() => setCurrent((value) => value !== fallback && fallback ? fallback : "/photo-placeholder.svg")} />;
}
function TripImage({ src, fallback, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }) {
  const preferred = typeof src === "string" && src ? src : fallback || "/photo-placeholder.svg";
  return <FallbackImage key={preferred} preferred={preferred} fallback={fallback} {...props} />;
}
const tabs: Array<{ id: View; label: string; icon: string }> = [
  { id: "route", label: "Route & dates", icon: "route" }, { id: "transport", label: "Transport", icon: "train" },
  { id: "cities", label: "Cities & sights", icon: "pin" }, { id: "itinerary", label: "Daily itinerary", icon: "itinerary" },
  { id: "hotels", label: "Hotels & days", icon: "stays" }, { id: "activities", label: "All activities", icon: "activities" },
  { id: "research", label: "Flights & research", icon: "flight" },
];

function isoDays(start: string, count: number) { return Array.from({ length: count }, (_, index) => new Date(Date.parse(`${start}T12:00:00Z`) + index * 86400000).toISOString().slice(0, 10)); }
function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) { return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" }); }
function money(value: number, currency = "EUR") { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
function defaultAssignments(payload: Trip2026Payload) {
  const result: Record<string, string[]> = {};
  payload.stops.forEach((stop) => isoDays(stop.checkIn, stop.nights).forEach((date, index) => { result[date] = (payload.cityPlans[stop.id]?.[index]?.blocks || []).flatMap((block) => block.id ? [block.id] : []); }));
  return result;
}
function cityForDate(stops: TripStop[], date: string) { return stops.find((stop) => date >= stop.checkIn && date < stop.checkOut) || (date < stops[0].checkIn ? stops[0] : stops.at(-1)!); }
function activityPhoto(activity: TripActivity, stop?: TripStop) { return activity.image || stop?.hero || ""; }
function displayCity(id: string) { return id === "ring" ? "Nürburgring" : id === "wroclaw" ? "Wrocław" : id === "krakow" ? "Kraków" : id.replace(/^./, (letter) => letter.toUpperCase()); }

export default function TripWorkspace() {
  const [trip, setTrip] = useState<"2026" | "2025">("2026");
  if (trip === "2025") return <div className="trip-era-wrap"><TripEraSwitch value={trip} onChange={setTrip} /><LegacyTripWorkspace /></div>;
  return <Trip2026Workspace setTrip={setTrip} />;
}

function TripEraSwitch({ value, onChange }: { value: "2026" | "2025"; onChange: (value: "2026" | "2025") => void }) {
  return <label className="trip-switch"><span>Workspace</span><GlassSelect aria-label="Workspace" value={value} onChange={(event) => onChange(event.target.value as "2026" | "2025")}><option value="2026">2026 Europe Trip</option><option value="2025">2025 Europe Trip</option></GlassSelect></label>;
}

function Trip2026Workspace({ setTrip }: { setTrip: (value: "2026" | "2025") => void }) {
  const [data, setData] = useState<Trip2026Payload | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("route");
  const [experience, setExperience] = useState<ExperienceMode>("plan");
  const [city, setCity] = useState("ring");
  const [state, setState] = useState<WorkspaceState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [carPanel, setCarPanel] = useState<"rentals" | "ring" | "museums" | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [deploymentOpen, setDeploymentOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("agent");
  const [travelDate, setTravelDate] = useState<string | undefined>();
  const [offlineReady, setOfflineReady] = useState(false);
  const [searchSeed, setSearchSeed] = useState<ProviderSearchSeed | undefined>();
  const [theme, setTheme] = useState<"black" | "blue">("black");
  const [itineraryDate, setItineraryDate] = useState<string | undefined>();
  const [setup, setSetup] = useState<SetupProfile>(defaultSetup);

  const switchView = (next: View) => {
    setExperience("plan");
    setView(next);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${next}`);
  };
  const switchExperience = (next: ExperienceMode) => {
    setExperience(next);
    localStorage.setItem(experienceKey, next);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${next === "plan" ? view : next}`);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/trips/2026", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The 2026 trip could not be loaded.");
      const payload = body as Trip2026Payload;
      setData(payload);
      try {
        const saved = localStorage.getItem(storageKey);
        const savedSetup = localStorage.getItem(setupKey);
        setTheme(localStorage.getItem("trippy.appearance.v1") === "blue" ? "blue" : "black");
        const savedExperience = localStorage.getItem(experienceKey);
        if (savedExperience === "decide" || savedExperience === "travel") setExperience(savedExperience);
        const savedWorkspaceMode = localStorage.getItem(workspaceModeKey);
        if (["agent", "local", "cloud", "sample"].includes(savedWorkspaceMode || "")) setWorkspaceMode(savedWorkspaceMode as WorkspaceMode);
        setState(saved ? { ...emptyState, ...JSON.parse(saved) } : { ...emptyState, assignments: defaultAssignments(payload) });
        if (savedSetup) setSetup({ ...defaultSetup, ...JSON.parse(savedSetup) });
      }
      catch { setState({ ...emptyState, assignments: defaultAssignments(payload) }); }
      setHydrated(true);
    }).catch((reason) => { if (reason.name !== "AbortError") setError(reason.message); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    const syncViewFromHash = () => {
      const requested = window.location.hash.slice(1);
      if (requested === "decide" || requested === "travel") setExperience(requested);
      else if (tabs.some((tab) => tab.id === requested)) { setExperience("plan"); setView(requested as View); }
    };
    syncViewFromHash();
    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(storageKey, JSON.stringify(state)); }, [state, hydrated]);

  const activityById = useMemo(() => new Map(data?.activities.map((activity) => [activity.id, activity]) || []), [data]);
  const assignedIds = useMemo(() => new Set(Object.values(state.assignments).flat()), [state.assignments]);
  const selectedOptions = useMemo(() => data?.transport.map((leg) => leg.options.find((option) => option.id === state.selectedTransport[leg.id]) || leg.options.find((option) => option.id === leg.recommend) || leg.options[0]).filter(Boolean) || [], [data, state.selectedTransport]);
  const transportLow = selectedOptions.reduce((sum, option) => sum + (option?.low || 0), 0);
  const transportHigh = selectedOptions.reduce((sum, option) => sum + (option?.high || 0), 0);
  const transportHours = selectedOptions.reduce((sum, option) => sum + (option?.hours || 0), 0);
  const bundleScope = useMemo<TrippyBundleScope>(() => ({
    tripId: data?.id || "europe-2026",
    dates: data ? isoDays(data.start, Math.floor((Date.parse(`${data.end}T12:00:00Z`) - Date.parse(`${data.start}T12:00:00Z`)) / 86400000) + 1) : [],
    activityIds: data?.activities.map((activity) => activity.id) || [],
    transportOptions: Object.fromEntries(data?.transport.map((leg) => [leg.id, leg.options.map((option) => option.id)]) || []),
    hotelOptions: Object.fromEntries(data?.stops.map((stop) => [stop.id, data.hotels.filter((hotel) => hotel.city === stop.id).map((hotel) => hotel.id)]) || []),
  }), [data]);

  const toggleSavedActivity = (id: string) => setState((current) => ({ ...current, savedActivities: current.savedActivities.includes(id) ? current.savedActivities.filter((item) => item !== id) : [...current.savedActivities, id] }));
  const addToDate = (id: string, date: string) => setState((current) => ({ ...current, assignments: { ...Object.fromEntries(Object.entries(current.assignments).map(([key, ids]) => [key, ids.filter((item) => item !== id)])), [date]: [...(current.assignments[date] || []).filter((item) => item !== id), id] } }));
  const removeFromDate = (id: string, date: string) => setState((current) => ({ ...current, assignments: { ...current.assignments, [date]: (current.assignments[date] || []).filter((item) => item !== id) } }));
  const moveWithinDate = (id: string, date: string, delta: number) => setState((current) => { const list = [...(current.assignments[date] || [])]; const index = list.indexOf(id); const next = Math.max(0, Math.min(list.length - 1, index + delta)); if (index < 0 || next === index) return current; list.splice(index, 1); list.splice(next, 0, id); return { ...current, assignments: { ...current.assignments, [date]: list } }; });
  const setPriority = (id: string, priority: Priority) => setState((current) => ({ ...current, activityPriority: { ...current.activityPriority, [id]: priority } }));
  const saveSetup = (next: SetupProfile) => { setSetup(next); localStorage.setItem(setupKey, JSON.stringify(next)); };
  const openConnections = (seed?: ProviderSearchSeed) => { setSearchSeed(seed); setConnectionsOpen(true); setSettingsOpen(false); setExportOpen(false); };

  if (error) return <main className="fatal-state"><h1>2026 Europe Trip</h1><p>{error}</p><p>Run the private importer, then reload this workspace.</p></main>;
  if (!data) return <main className="loading-workspace"><BrandMark alt="TRIPPY" className="trippy-brand-loader" />Loading the 2026 atlas…</main>;

  const openDecision = (decision: DecisionModeItem) => {
    if (decision.kind === "stay") switchView("hotels");
    else switchView("transport");
  };

  return <div className="premium-shell" data-theme={theme} data-experience={experience}>
    <header className="premium-header glass">
      <div className="brand-lockup"><span className="brand-orb trippy-brand-frame"><BrandMark /></span><div><strong>TRIPPY</strong><small>Travel intelligence</small></div></div>
      <TripEraSwitch value="2026" onChange={setTrip} />
      <div className="header-trip-context"><span><Icon name="calendar" /><small>Travel window</small><b>{formatDate(data.start)}–{formatDate(data.end)}</b></span><span className="header-route-anchor"><Icon name="route" /><small>Route</small><b>🇩🇪 Frankfurt <i>→</i> 🇩🇪 Munich</b></span><span className="header-alert"><Icon name="train" /><small>Open booking</small><b>BRU → AMS rail</b></span></div>
      <div className="header-actions">
        <button className="quiet-button command-trigger" aria-label="Open trip commands" aria-haspopup="dialog" onClick={() => setCommandOpen(true)}><Icon name="search" /><span>Jump</span><kbd>⌘K</kbd></button>
        <button className="quiet-button connection-trigger" aria-label="Open Connections" aria-haspopup="dialog" onClick={() => openConnections()}><span className="connection-pulse" /><Icon name="globe" /><span>Connections</span></button>
        <button className="quiet-button setup-trigger" onClick={() => { setDeploymentOpen(true); setSettingsOpen(false); setExportOpen(false); }}><Icon name="shield" /><span>Launch</span></button>
        <div className="settings-wrap"><button className="quiet-button icon-button" aria-label="Appearance settings" aria-expanded={settingsOpen} onClick={() => { setSettingsOpen(!settingsOpen); setExportOpen(false); }}><Icon name="globe" /></button>{settingsOpen && <div className="settings-menu glass" onKeyDown={(event) => event.key === "Escape" && setSettingsOpen(false)}><div className="menu-label">Appearance</div><div className="theme-options">{(["black", "blue"] as const).map((value) => <button key={value} aria-pressed={theme === value} className={theme === value ? "active" : ""} onClick={() => { setTheme(value); localStorage.setItem("trippy.appearance.v1", value); }}><i className={value} /><span>{value === "black" ? "Obsidian" : "Midnight blue"}</span>{theme === value && <span>✓</span>}</button>)}</div><div className="settings-divider" /><button className="settings-setup" onClick={() => { setSettingsOpen(false); setSetupOpen(true); }}><Icon name="settings" /><span>Trip setup & preferences</span><Icon name="arrow" width="14" /></button><button className="settings-setup" onClick={() => { setSettingsOpen(false); setDeploymentOpen(true); }}><Icon name="shield" /><span>Deployment & privacy</span><Icon name="arrow" width="14" /></button><small>{setup.adults} traveler{setup.adults === 1 ? "" : "s"} · {setup.pace} pace · {setup.origin}</small></div>}</div>
        <div className="export-wrap"><button className="quiet-button export-trigger" aria-label="Export trip" aria-expanded={exportOpen} onClick={() => { setExportOpen(!exportOpen); setSettingsOpen(false); }}><Icon name="download" /><span>Export</span><Icon name="chevron" width="13" /></button>{exportOpen && <ExportMenu data={data} state={state} close={() => setExportOpen(false)} />}</div>
      </div>
    </header>
    <ExperienceBar experience={experience} switchExperience={switchExperience} />
    {experience === "plan" && <nav className="workspace-tabs glass" aria-label="Trip planning sections">{tabs.map((tab) => <button key={tab.id} className={view === tab.id ? "active" : ""} aria-current={view === tab.id ? "page" : undefined} onClick={() => { switchView(tab.id); setSettingsOpen(false); setExportOpen(false); }}><Icon name={tab.icon} /><span>{tab.label}</span>{tab.id === "activities" ? <em>{data.activities.length}</em> : null}</button>)}</nav>}
    <main className="workspace-main">
      {experience === "plan" && view === "route" && <RouteView data={data} state={state} openDay={(date) => { setItineraryDate(date); switchView("itinerary"); }} low={transportLow} high={transportHigh} hours={transportHours} assigned={assignedIds.size} openTransport={() => switchView("transport")} openCity={(id) => { setCity(id); switchView("cities"); }} setCarPanel={setCarPanel} />}
      {experience === "plan" && view === "transport" && <TransportView data={data} state={state} setState={setState} low={transportLow} high={transportHigh} hours={transportHours} />}
      {experience === "plan" && view === "cities" && <CitiesView data={data} city={city} setCity={setCity} state={state} toggleSaved={toggleSavedActivity} addToDate={addToDate} />}
      {experience === "plan" && view === "itinerary" && <ItineraryView initialDate={itineraryDate} data={data} state={state} activityById={activityById} addToDate={addToDate} removeFromDate={removeFromDate} moveWithinDate={moveWithinDate} setPriority={setPriority} toggleSaved={toggleSavedActivity} reset={() => setState((current) => ({ ...current, assignments: defaultAssignments(data), activityPriority: {} }))} />}
      {experience === "plan" && view === "hotels" && <HotelsView data={data} state={state} setup={setup} setState={setState} />}
      {experience === "plan" && view === "activities" && <AllActivitiesView data={data} state={state} toggleSaved={toggleSavedActivity} addToDate={addToDate} />}
      {experience === "plan" && view === "research" && <ResearchView data={data} state={state} openConnections={openConnections} />}
      {experience === "decide" && <DecisionMode data={data} state={{ selectedTransport: state.selectedTransport, selectedHotels: state.selectedHotel }} onOpenDecision={openDecision} onOpenTransport={() => switchView("transport")} onOpenStay={(id) => { if (id) setCity(id); switchView("hotels"); }} onRefreshData={() => openConnections()} />}
      {experience === "travel" && <TravelMode data={data} state={{ today: new Date().toISOString().slice(0, 10), selectedDate: travelDate, selectedCity: city, selectedTransport: state.selectedTransport, offlineReady }} onSelectDate={setTravelDate} onSelectCity={setCity} onOpenMap={({ date, cityId }) => { setTravelDate(date); setItineraryDate(date); if (cityId) setCity(cityId); switchView("itinerary"); }} onExport={() => setExportOpen(true)} onPrepareOffline={() => setOfflineReady(true)} onOpenDecisionMode={() => switchExperience("decide")} onOpenEmergencyCard={() => setExportOpen(true)} />}
    </main>
    <footer className="premium-footer"><span>TRIPPY · 2026 Europe Trip</span><span className={`data-mode ${data.dataMode}`}>{data.dataMode === "private" ? "Private local workspace · confirmations stay local" : "Redacted public sample · no booking references or secrets"}</span></footer>
    <MobileDock experience={experience} view={view} switchExperience={switchExperience} navigate={switchView} more={() => setCommandOpen(true)} />
    {commandOpen && <CommandPalette current={view} experience={experience} navigate={(next) => { switchView(next); setCommandOpen(false); }} switchExperience={(next) => { switchExperience(next); setCommandOpen(false); }} setup={() => { setCommandOpen(false); setSetupOpen(true); }} connections={() => { setCommandOpen(false); openConnections(); }} deploy={() => { setCommandOpen(false); setDeploymentOpen(true); }} inbox={() => { setCommandOpen(false); setInboxOpen(true); }} close={() => setCommandOpen(false)} />}
    {setupOpen && <SetupWizard data={data} initial={setup} save={(next) => { saveSetup(next); setSetupOpen(false); }} close={() => setSetupOpen(false)} />}
    {deploymentOpen && <DeploymentCenter current={workspaceMode} onChoose={(next) => { setWorkspaceMode(next); localStorage.setItem(workspaceModeKey, next); setDeploymentOpen(false); }} onOpenInbox={() => { setDeploymentOpen(false); setInboxOpen(true); }} onClose={() => setDeploymentOpen(false)} />}
    {inboxOpen && <div className="inbox-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setInboxOpen(false)}><div className="inbox-dialog glass"><button className="drawer-close" onClick={() => setInboxOpen(false)} aria-label="Close update inbox"><Icon name="close" /></button><UpdateInbox currentState={state} scope={bundleScope} onAccept={(next) => setState(next as WorkspaceState)} /></div></div>}
    {carPanel && <CarPanel kind={carPanel} data={data} close={() => setCarPanel(null)} />}{connectionsOpen && <IntegrationCenter open onClose={() => setConnectionsOpen(false)} seed={searchSeed} />}
  </div>;
}

function ExperienceBar({ experience, switchExperience }: { experience: ExperienceMode; switchExperience: (mode: ExperienceMode) => void }) {
  const modes: Array<{ id: ExperienceMode; label: string; note: string; icon: string }> = [
    { id: "plan", label: "Plan", note: "Build & research", icon: "route" },
    { id: "decide", label: "Decide", note: "Resolve what matters", icon: "check" },
    { id: "travel", label: "Travel", note: "Use it on the road", icon: "pin" },
  ];
  return <nav className="experience-bar glass" aria-label="TRIPPY experience mode">{modes.map((mode) => <button key={mode.id} className={experience === mode.id ? "active" : ""} aria-current={experience === mode.id ? "page" : undefined} onClick={() => switchExperience(mode.id)}><span><Icon name={mode.icon} /></span><div><b>{mode.label}</b><small>{mode.note}</small></div></button>)}</nav>;
}

function MobileDock({ experience, view, switchExperience, navigate, more }: { experience: ExperienceMode; view: View; switchExperience: (mode: ExperienceMode) => void; navigate: (view: View) => void; more: () => void }) {
  return <nav className="mobile-dock glass" aria-label="Mobile trip navigation"><button className={experience === "plan" && view === "route" ? "active" : ""} onClick={() => navigate("route")}><Icon name="route" /><span>Plan</span></button><button className={experience === "plan" && view === "itinerary" ? "active" : ""} onClick={() => navigate("itinerary")}><Icon name="itinerary" /><span>Days</span></button><button className={experience === "decide" ? "active" : ""} onClick={() => switchExperience("decide")}><Icon name="check" /><span>Decide</span></button><button className={experience === "travel" ? "active" : ""} onClick={() => switchExperience("travel")}><Icon name="pin" /><span>Travel</span></button><button onClick={more} aria-label="Open all trip tools"><Icon name="settings" /><span>More</span></button></nav>;
}

function CommandPalette({ current, experience, navigate, switchExperience, setup, connections, deploy, inbox, close }: { current: View; experience: ExperienceMode; navigate: (view: View) => void; switchExperience: (mode: ExperienceMode) => void; setup: () => void; connections: () => void; deploy: () => void; inbox: () => void; close: () => void }) {
  const [query, setQuery] = useState("");
  const visible = tabs.filter((tab) => `${tab.label} ${tab.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="command-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className="command-palette glass" role="dialog" aria-modal="true" aria-labelledby="command-title"><header><span><Icon name="search" /></span><input autoFocus id="command-title" aria-label="Search trip sections" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && visible[0]) navigate(visible[0].id); }} placeholder="Jump to a trip workspace…" /><kbd>ESC</kbd></header><div className="command-list"><small>Modes</small>{(["plan", "decide", "travel"] as ExperienceMode[]).map((mode) => <button key={mode} className={experience === mode ? "active" : ""} onClick={() => switchExperience(mode)}><span><Icon name={mode === "plan" ? "route" : mode === "decide" ? "check" : "pin"} /></span><b>{displayCity(mode)} mode</b>{experience === mode ? <em>Current</em> : <Icon name="arrow" />}</button>)}<small>Planning workspaces</small>{visible.map((tab) => <button key={tab.id} className={experience === "plan" && current === tab.id ? "active" : ""} onClick={() => navigate(tab.id)}><span><Icon name={tab.icon} /></span><b>{tab.label}</b>{experience === "plan" && current === tab.id ? <em>Current</em> : <Icon name="arrow" />}</button>)}{!visible.length ? <p>No matching workspace</p> : null}</div><footer><button onClick={setup}><Icon name="settings" />Trip setup</button><button onClick={connections}><Icon name="globe" />Connections</button><button onClick={inbox}><Icon name="activities" />Update inbox</button><button onClick={deploy}><Icon name="shield" />Deploy</button></footer></section></div>;
}

function SetupWizard({ data, initial, save, close }: { data: Trip2026Payload; initial: SetupProfile; save: (profile: SetupProfile) => void; close: () => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(initial);
  const steps = ["Trip frame", "Route freedom", "Travel style", "Privacy"];
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);
  const toggleMode = (mode: string) => setDraft((current) => ({ ...current, groundModes: current.groundModes.includes(mode) ? current.groundModes.filter((item) => item !== mode) : [...current.groundModes, mode] }));
  return <div className="setup-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className="setup-wizard glass" role="dialog" aria-modal="true" aria-labelledby="setup-title" aria-describedby="setup-privacy"><aside><span className="brand-orb trippy-brand-frame"><BrandMark /></span><p>TRIPPY setup</p>{steps.map((label, index) => <button key={label} className={step === index ? "active" : index < step ? "complete" : ""} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}><i>{index < step ? "✓" : index + 1}</i><span>{label}</span></button>)}<small id="setup-privacy">Your planning profile stays in this browser. Private imports require the explicit local-only gate.</small></aside><div className="setup-stage"><div className="setup-progress" aria-label={`Setup progress: step ${step + 1} of ${steps.length}`}><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><button className="drawer-close" onClick={close} aria-label="Close setup" autoFocus><Icon name="close" /></button>{step === 0 && <><span className="eyebrow">01 · Trip frame</span><h2 id="setup-title">Start with the constraints that change the route.</h2><p>Confirmed dates stay visible; flexibility tells the optimizer when it may compare adjacent travel days.</p><div className="setup-fields"><label>Home airport or metro<input value={draft.origin} onChange={(event) => setDraft({ ...draft, origin: event.target.value })} placeholder="e.g. IAD, DCA, BWI" autoComplete="off" /></label><label>Travelers<input type="number" min="1" max="12" value={draft.adults} onChange={(event) => setDraft({ ...draft, adults: Math.max(1, Number(event.target.value) || 1) })} /></label><label>Rooms<input type="number" min="1" max="8" value={draft.rooms} onChange={(event) => setDraft({ ...draft, rooms: Math.max(1, Number(event.target.value) || 1) })} /></label><label>Current trip dates<span className="read-only-field">{formatDate(data.start)}–{formatDate(data.end, { day: "numeric", month: "short", year: "numeric" })}</span></label><label>Date flexibility<GlassSelect value={draft.dateFlexibility} onChange={(event) => setDraft({ ...draft, dateFlexibility: event.target.value as SetupProfile["dateFlexibility"] })}><option value="fixed">Confirmed dates are fixed</option><option value="three">Compare ±3 days</option><option value="seven">Compare ±7 days</option></GlassSelect></label></div></>}{step === 1 && <><span className="eyebrow">02 · Route freedom</span><h2 id="setup-title">Which cities may move when prices change?</h2><p>The imported route remains intact. This controls whether future searches may suggest swaps or a different order.</p><div className="setup-route">{data.stops.map((stop, index) => <span key={stop.id}><i>{index + 1}</i><b>{stop.flag} {stop.name}</b><small>{stop.nights} nights</small></span>)}</div><div className="choice-cards">{[["fixed", "Keep every city and order", "Optimize only transport and timing."], ["swap", "Allow city substitutions", "Suggest a stronger nearby city when value improves."], ["open", "Optimize the whole route", "Permit reorder, removal and insertion suggestions."]].map(([value, label, note]) => <button key={value} className={draft.cityFlexibility === value ? "active" : ""} onClick={() => setDraft({ ...draft, cityFlexibility: value as SetupProfile["cityFlexibility"] })}><b>{label}</b><small>{note}</small></button>)}</div></>}{step === 2 && <><span className="eyebrow">03 · Travel style</span><h2 id="setup-title">Define what “best” means before searching.</h2><div className="setup-fields"><label>Daily pace<GlassSelect value={draft.pace} onChange={(event) => setDraft({ ...draft, pace: event.target.value as SetupProfile["pace"] })}><option value="relaxed">Relaxed · 2–3 anchors</option><option value="balanced">Balanced · 3–4 anchors</option><option value="full">Full · 4–6 anchors</option></GlassSelect></label><label>Deal priority<GlassSelect value={draft.dealPriority} onChange={(event) => setDraft({ ...draft, dealPriority: event.target.value as SetupProfile["dealPriority"] })}><option value="overall">Best overall value</option><option value="cash">Lowest cash</option><option value="points">Best points value</option><option value="direct">Fewest connections</option></GlassSelect></label></div><fieldset><legend>Ground and regional modes to compare</legend>{[["flight", "Flights"], ["train", "Trains"], ["car", "Rental car"], ["coach", "Coach"]].map(([value, label]) => <label key={value}><input type="checkbox" checked={draft.groundModes.includes(value)} onChange={() => toggleMode(value)} />{label}</label>)}</fieldset><label className="wizard-check"><input type="checkbox" checked={draft.reprice} onChange={(event) => setDraft({ ...draft, reprice: event.target.checked })} /><span><b>Re-rank when live prices arrive</b><small>Keep confirmed bookings fixed and flag only material improvements.</small></span></label></>}{step === 3 && <><span className="eyebrow">04 · Privacy boundary</span><h2 id="setup-title">Choose what this browser may import.</h2><div className="privacy-choice"><button className={!draft.privateImports ? "active" : ""} onClick={() => setDraft({ ...draft, privateImports: false })}><Icon name="route" /><b>Public sample mode</b><small>No confirmation codes, booking references, email addresses or API keys.</small></button><button className={draft.privateImports ? "active" : ""} onClick={() => setDraft({ ...draft, privateImports: true })}><Icon name="mail" /><b>Private local imports</b><small>Personal bookings may load only on localhost with the explicit private-data switch.</small></button></div><p className="privacy-note">Selecting private imports does not upload or publish data. Server access remains disabled unless the local environment gate is also enabled.</p></>}<footer><button onClick={step === 0 ? close : () => setStep((current) => current - 1)}>{step === 0 ? "Cancel" : "Back"}</button><span>{steps[step]} · {step + 1} of {steps.length}</span>{step < steps.length - 1 ? <button className="primary" onClick={() => setStep((current) => current + 1)}>Continue <Icon name="arrow" /></button> : <button className="primary" onClick={() => save(draft)}>Save planning profile</button>}</footer></div></section></div>;
}

function RouteView({ data, state, openDay, low, high, hours, assigned, openTransport, openCity, setCarPanel }: { data: Trip2026Payload; state: WorkspaceState; openDay: (date: string) => void; low: number; high: number; hours: number; assigned: number; openTransport: () => void; openCity: (id: string) => void; setCarPanel: (value: "rentals" | "ring" | "museums") => void }) {
  const [layers, setLayers] = useState({ flight: true, train: true, drive: true, cities: true });
  const points: Point[] = useMemo(() => [{ id: "frankfurt", name: "🇩🇪 Frankfurt Airport", lat: 50.0379, lng: 8.5622, category: "airport", number: 1 }, ...data.stops.map((stop, index) => ({ id: stop.id, name: `${stop.flag} ${stop.name}`, lat: stop.lat, lng: stop.lng, category: "city", number: index + 2 }))], [data.stops]);
  const logistics = useMemo(() => buildTripLogistics(data, state.selectedTransport), [data, state.selectedTransport]);
  const segments: MapSegment[] = useMemo(() => data.transport.map((leg): MapSegment => { const mode = (leg.options.find((option) => option.id === state.selectedTransport[leg.id]) || leg.options.find((option) => option.id === leg.recommend))?.mode; return { from: leg.from, to: leg.to, kind: mode === "car" ? "drive" : mode === "flight" ? "flight" : "train", status: transportLegStatus(logistics, leg, data.stops) }; }).filter((segment) => segment.kind !== "other" && layers[segment.kind]), [data.transport, data.stops, state.selectedTransport, layers, logistics]);
  return <><section className="hero-map glass"><div className="map-hero-heading"><div><span className="eyebrow">Europe · 21 days · 7 stops</span><h1>Your 2026 route</h1></div><button className="map-open-booking" onClick={openTransport}><i /><span><small>Needs booking</small><b>Brussels → Amsterdam rail · 3 Oct</b></span><Icon name="arrow" /></button></div><div className="layer-controls" aria-label="Route map layers">{(["flight", "train", "drive", "cities"] as const).map((layer) => <button key={layer} className={layers[layer] ? "on" : ""} aria-pressed={layers[layer]} onClick={() => setLayers((current) => ({ ...current, [layer]: !current[layer] }))}><Icon name={layer === "drive" ? "car" : layer === "cities" ? "pin" : layer} />{layer === "drive" ? "Car" : layer === "cities" ? "City stops" : displayCity(layer)}</button>)}</div><GeographicMap points={layers.cities ? points : points.filter((point) => point.category === "airport")} connect segments={segments} label="2026 Europe route" onSelect={(id) => routeCityIds.includes(id) && openCity(id)} fitKey={JSON.stringify(layers)} /></section>
    <section className="metric-row"><article className="glass"><span>Selected transport</span><strong>{money(low)}–{money(high)}</strong><small>Planning allowance · live fares to verify</small></article><article className="glass"><span>Estimated transit</span><strong>≈ {Math.round(hours)} hours</strong><small>Practical hotel-to-hotel time</small></article><article className="glass"><span>Activities placed</span><strong>{assigned}</strong><small>Across the working daily plan</small></article></section>
    <section className="route-ribbon glass">{data.stops.map((stop, index) => <button key={stop.id} onClick={() => openCity(stop.id)}><span>{String(index + 1).padStart(2, "0")}</span><b>{stop.flag} {stop.name}</b><small>{formatDate(stop.checkIn)}–{formatDate(stop.checkOut)} · {stop.nights}n</small></button>)}</section>
    <TripOverview data={data} assignments={state.assignments} priorities={state.activityPriority} selectedTransport={state.selectedTransport} selectedHotels={state.selectedHotel} onDay={openDay} />
    <details className="route-notes glass"><summary>Route notes <Icon name="chevron" width="14" /></summary><div><p><b>30 September · KRK → AMS → Brussels</b> KLM KL1328 and the onward connection are confirmed; second-segment timing is not in the share-safe record.</p><p><b>3 October · Brussels → Amsterdam</b> Direct rail still needs booking. European Sleeper is confirmed for 5 October; preserve the Berlin arrival buffer.</p><button className="text-button" onClick={openTransport}>Compare transport <Icon name="arrow" width="14" /></button></div></details>
    <section className="addon-row"><span>Automotive add-ons</span><button onClick={() => setCarPanel("rentals")}><Icon name="car" />Autobahn & rentals</button><button onClick={() => setCarPanel("ring")}><Icon name="activities" />Ring driving</button><button onClick={() => setCarPanel("museums")}><Icon name="cities" />Car museums</button></section><BookingsStrip data={data} /></>;
}

function TransportView({ data, state, setState, low, high, hours }: { data: Trip2026Payload; state: WorkspaceState; setState: React.Dispatch<React.SetStateAction<WorkspaceState>>; low: number; high: number; hours: number }) {
  const logistics = useMemo(() => buildTripLogistics(data, state.selectedTransport), [data, state.selectedTransport]);
  return <section className="view-stack"><header className="page-heading"><h2>Compare transport</h2><p>Confirmed bookings and open route decisions</p></header><div className="transport-summary glass"><span><small>Selected allowance</small><strong>{money(low)}–{money(high)}</strong></span><span><small>Practical time</small><strong>≈ {Math.round(hours)}h</strong></span><span><small>Unbooked hinge</small><strong>BRU → AMS rail</strong></span></div><div className="transport-list">{data.transport.map((leg, index) => <TransportLegCard key={leg.id} leg={leg} index={index} status={transportLegStatus(logistics, leg, data.stops)} selected={state.selectedTransport[leg.id] || leg.recommend} choose={(id) => setState((current) => ({ ...current, selectedTransport: { ...current.selectedTransport, [leg.id]: id } }))} />)}</div></section>;
}
function TransportLegCard({ leg, index, selected, status, choose }: { leg: TransportLeg; index: number; selected: string; status: LogisticsItem["status"]; choose: (id: string) => void }) {
  const statusText = status === "confirmed" ? "Confirmed record" : status === "missing" ? "Needs booking" : status === "conflict" ? "Conflict" : "TBC";
  return <article className={`transport-leg glass status-${status}`}><header><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{countryFlag[leg.from]} {displayCity(leg.from)} <Icon name="arrow" width="16" /> {countryFlag[leg.to]} {displayCity(leg.to)}</h3><small>{formatDate(leg.date, { weekday: "short", day: "numeric", month: "short" })}</small></div><em className={`leg-status status-${status}`}>{statusText}</em></header><div className="transport-options">{leg.options.map((option) => <label key={option.id} className={selected === option.id ? "selected" : ""}><input type="radio" name={leg.id} checked={selected === option.id} onChange={() => choose(option.id)} /><span className={`mode-icon ${option.mode}`}><LogisticsIcon kind={(option.mode === "bus" ? "train" : option.mode) as LogisticsKind} width={22} /></span><span className="option-copy"><b>{option.name}</b><small>{option.ride} · {option.door}</small><p>{option.note}</p></span><span className="option-price"><b>{option.low || option.high ? `${money(option.low)}–${money(option.high)}` : option.id === "replacement-flight" ? "Price TBC" : "Calculator"}</b><small>{option.hours > 0 ? `${option.hours}h practical` : "Timing TBC"}</small></span></label>)}</div></article>;
}

function CitiesView({ data, city, setCity, state, toggleSaved, addToDate }: { data: Trip2026Payload; city: string; setCity: (id: string) => void; state: WorkspaceState; toggleSaved: (id: string) => void; addToDate: (id: string, date: string) => void }) {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("all"); const [priority, setTier] = useState<Priority | "all">("all"); const [selected, setSelected] = useState<TripActivity | null>(null);
  const stop = data.stops.find((item) => item.id === city) || data.stops[0];
  const all = data.activities.filter((activity) => activity.city === city);
  const categories = [...new Set(all.map((activity) => activity.category))];
  const visible = all.filter((activity) => (category === "all" || activity.category === category) && (priority === "all" || activity.priority === priority) && `${activity.title} ${activity.description}`.toLowerCase().includes(query.toLowerCase()));
  const photos = all.filter((activity) => activity.image).slice(0, 6);
  const selectedHotel = data.hotels.find((hotel) => hotel.id === state.selectedHotel[city]);
  const nearbyPlaces = (data.mapPlaces[city] || []).filter((place) => Math.abs(place.lat - stop.lat) < 1.1 && Math.abs(place.lng - stop.lng) < 1.4);
  const points: Point[] = [...nearbyPlaces.map((place) => ({ id: place.id, name: place.title, lat: place.lat, lng: place.lng, category: place.layer })), ...(selectedHotel?.lat && selectedHotel.lng ? [{ id: selectedHotel.id, name: selectedHotel.name, lat: selectedHotel.lat, lng: selectedHotel.lng, category: "hotel" }] : []), ...all.flatMap((activity) => activity.lat && activity.lng ? [{ id: activity.id, name: activity.title, lat: activity.lat, lng: activity.lng, category: `activity-${activity.priority}` }] : [])];
  return <section className="view-stack"><header className="page-heading split"><div><h2>Explore each city</h2></div><label className="search-box"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this city" /></label></header><CityRail data={data} city={city} setCity={setCity} />
    <div className="photo-filmstrip">{photos.map((activity) => <button key={activity.id} onClick={() => setSelected(activity)}><TripImage src={activityPhoto(activity, stop)} fallback={stop.hero} alt="" /><span>{activity.title}</span></button>)}</div>
    <article className="city-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.9),rgba(0,0,0,.1)),url("${stop.hero}")` }}><span>{formatDate(stop.checkIn)} → {formatDate(stop.checkOut)}</span><h2>{stop.flag} {stop.name}</h2><p><b>Best base:</b> {stop.stay}</p></article>
    <div className="city-map-layout"><div className="glass city-map-card"><GeographicMap points={points} focus={selected?.id} onSelect={(id) => { const activity = all.find((item) => item.id === id); if (activity) setSelected(activity); }} fitKey={`${city}:${points.length}`} label={`${stop.name} places map`} basemap="city" /><details className="map-notes"><summary>Local tips</summary><p>{data.clusterGuidance[city]}</p></details></div><div className="glass city-map-aside"><strong>{all.length} ideas</strong><p>{points.filter((point) => String(point.category).startsWith("activity")).length} with map locations</p><button className="quiet-button" onClick={() => setTier("must")}>Focus must-do</button></div></div>
    <div className="filter-bars"><div><button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>All <em>{all.length}</em></button>{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item} <em>{all.filter((activity) => activity.category === item).length}</em></button>)}</div><div>{(["all", "must", "should", "could"] as const).map((item) => <button key={item} className={priority === item ? "active" : ""} onClick={() => setTier(item)}>{item === "all" ? "All ideas" : item === "must" ? "Must do" : item === "should" ? "Should do" : "Could do"} <em>{item === "all" ? all.length : all.filter((activity) => activity.priority === item).length}</em></button>)}</div></div>
    <div className="results-line"><span>{visible.length} places shown</span><span>★ {all.filter((activity) => activity.priority === "must").length} must-do</span></div><ActivityGrid activities={visible} stop={stop} state={state} toggleSaved={toggleSaved} open={setSelected} addToDate={addToDate} />
    {selected && <ActivityDrawer activity={selected} stop={stop} dates={isoDays(stop.checkIn, stop.nights)} saved={state.savedActivities.includes(selected.id)} toggleSaved={() => toggleSaved(selected.id)} addToDate={addToDate} close={() => setSelected(null)} />}
  </section>;
}

function CityRail({ data, city, setCity }: { data: Trip2026Payload; city: string; setCity: (id: string) => void }) {
  return <div className="city-rail">{data.stops.map((stop) => <button key={stop.id} className={city === stop.id ? "active" : ""} onClick={() => setCity(stop.id)}><b>{stop.flag} {stop.name}</b><small>{data.activities.filter((activity) => activity.city === stop.id).length} ideas · {stop.nights} nights</small></button>)}</div>;
}

function ActivityGrid({ activities, stop, state, toggleSaved, open, addToDate }: { activities: TripActivity[]; stop: TripStop; state: WorkspaceState; toggleSaved: (id: string) => void; open: (activity: TripActivity) => void; addToDate: (id: string, date: string) => void }) {
  const dates = isoDays(stop.checkIn, stop.nights);
  return <div className="activity-grid">{activities.map((activity) => <article key={activity.id} className={`activity-card glass tier-${activity.priority}`}><button className="photo-button" onClick={() => open(activity)}><TripImage src={activityPhoto(activity, stop)} fallback={stop.hero} alt="" /><span className={`tier-pill ${activity.priority}`}>{activity.priority === "must" ? "Must do" : activity.priority === "should" ? "Should do" : "Could do"}</span>{activity.closed && <span className="closed-pill">Unavailable</span>}</button><div><span className="card-kicker">{activity.category}</span><h3>{activity.title}</h3><p>{activity.description}</p><small>{activity.details}</small><div className="card-actions"><button onClick={() => toggleSaved(activity.id)} className={state.savedActivities.includes(activity.id) ? "saved" : ""}>{state.savedActivities.includes(activity.id) ? "Saved" : "Save"}</button><GlassSelect aria-label={`Add ${activity.title} to a day`} defaultValue="" onChange={(event) => { if (event.target.value) addToDate(activity.id, event.target.value); event.target.value = ""; }}><option value="">Add to day</option>{dates.map((date) => <option key={date} value={date}>{formatDate(date, { weekday: "short", day: "numeric", month: "short" })}</option>)}</GlassSelect><button onClick={() => open(activity)}>Details</button></div></div></article>)}</div>;
}

function ItineraryView({ initialDate, data, state, activityById, addToDate, removeFromDate, moveWithinDate, setPriority, reset, toggleSaved }: { data: Trip2026Payload; state: WorkspaceState; activityById: Map<string, TripActivity>; addToDate: (id: string, date: string) => void; removeFromDate: (id: string, date: string) => void; moveWithinDate: (id: string, date: string, delta: number) => void; setPriority: (id: string, priority: Priority) => void; reset: () => void; toggleSaved: (id: string) => void; initialDate?: string }) {
  const dates = isoDays(data.start, Math.round((Date.parse(data.end) - Date.parse(data.start)) / 86400000) + 1); const [activeDate, setActiveDate] = useState(initialDate || dates[0]); const [density, setDensity] = useState<"compact" | "detailed">("detailed"); const [showArrivals, setShowArrivals] = useState(false); const [resetOpen, setResetOpen] = useState(false); const [mapActivity, setMapActivity] = useState<TripActivity | null>(null);
  const logistics = useMemo(() => buildTripLogistics(data, state.selectedTransport), [data, state.selectedTransport]);
  const activeStop = cityForDate(data.stops, activeDate);
  const assigned = new Set(Object.values(state.assignments).flat());
  const unplaced = data.activities.filter((activity) => activity.city === activeStop.id && !assigned.has(activity.id));
  const selectedHotel = data.hotels.find((hotel) => hotel.id === state.selectedHotel[activeStop.id]);
  const mappedActivities = data.activities.filter((activity) => activity.city === activeStop.id && activity.lat && activity.lng);
  const arrivalPoints: Point[] = (data.mapPlaces[activeStop.id] || []).map((place) => ({ id: place.id, name: place.title, lat: place.lat, lng: place.lng, category: place.layer }));
  const itineraryPoints: Point[] = [
    ...arrivalPoints.filter((place) => !selectedHotel || place.category !== "hotel"),
    ...(selectedHotel?.lat && selectedHotel.lng ? [{ id: selectedHotel.id, name: selectedHotel.name, lat: selectedHotel.lat, lng: selectedHotel.lng, category: "hotel" }] : []),
    ...mappedActivities.map((activity) => ({ id: activity.id, name: activity.title, lat: activity.lat!, lng: activity.lng!, category: `activity-${state.activityPriority[activity.id] || activity.priority}` })),
  ];
  return <section className={`view-stack itinerary-view density-${density}`}>
    <div className="builder-city-rail">{data.stops.map((stop) => <button key={stop.id} className={activeStop.id === stop.id ? "active" : ""} onClick={() => setActiveDate(stop.checkIn)}><b>{stop.flag} {stop.name}</b><small>{formatDate(stop.checkIn)}–{formatDate(stop.checkOut)}</small></button>)}</div>
    <section className="itinerary-city-map glass"><div className={`itinerary-map-grid ${showArrivals ? "with-arrivals" : ""}`}><div className="itinerary-primary-map"><GeographicMap points={itineraryPoints} onSelect={(id) => { const activity = activityById.get(id); if (activity) setMapActivity(activity); }} fitKey={activeStop.id} label={`${activeStop.name} itinerary map`} basemap="city" cityCenter={{ lat: activeStop.lat, lng: activeStop.lng }} /></div>{showArrivals && <aside><header><b>Arrivals & stay</b></header><GeographicMap points={[...arrivalPoints, ...(selectedHotel?.lat && selectedHotel.lng ? [{ id: selectedHotel.id, name: selectedHotel.name, lat: selectedHotel.lat, lng: selectedHotel.lng, category: "hotel" }] : [])]} connect showLegend={false} fitKey={`${activeStop.id}:arrival`} label={`${activeStop.name} arrival map`} basemap="city" /></aside>}</div></section>
    <div className="builder-toolbar"><div className="day-shortcuts">{dates.filter((date) => cityForDate(data.stops, date).id === activeStop.id).map((date) => <button key={date} aria-pressed={activeDate === date} className={activeDate === date ? "active" : ""} onClick={() => { setActiveDate(date); document.getElementById(`day-${date}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{formatDate(date, { weekday: "short", day: "numeric" })}</button>)}</div><div className="builder-controls"><button aria-pressed={showArrivals} className={showArrivals ? "active" : ""} onClick={() => setShowArrivals(!showArrivals)}><Icon name="flight" width="14" />Arrivals</button><button onClick={() => setDensity(density === "compact" ? "detailed" : "compact")}>{density === "compact" ? "Show details" : "Compact"}</button><button onClick={() => setResetOpen(!resetOpen)}>Reset</button></div></div>
    {resetOpen && <div className="reset-confirm glass"><span>Restore recommended days and priorities? Your saved ideas and hotels will stay.</span><button onClick={() => { reset(); setResetOpen(false); }}>Restore</button><button onClick={() => setResetOpen(false)}>Cancel</button></div>}
    <div className="itinerary-builder"><div className="day-board">{dates.filter((date) => cityForDate(data.stops, date).id === activeStop.id).map((date) => { const planIndex = Math.round((Date.parse(date) - Date.parse(activeStop.checkIn)) / 86400000); return <DayColumn key={date} tripStart={data.start} date={date} stop={activeStop} plan={planIndex >= 0 ? data.cityPlans[activeStop.id]?.[planIndex] : undefined} ids={state.assignments[date] || []} logistics={logisticsItemsForDate(logistics, date)} activityById={activityById} state={state} active={activeDate === date} choose={() => setActiveDate(date)} onDrop={(id) => addToDate(id, date)} remove={removeFromDate} move={moveWithinDate} setPriority={setPriority} allDates={dates} addToDate={addToDate} />; })}</div>
      <aside className="catalogue glass"><header><h3>Ideas to add <span>{unplaced.length}</span></h3><label>Add to<GlassSelect aria-label="Catalogue destination day" value={activeDate} onChange={(event) => setActiveDate(event.target.value)}>{dates.filter((date) => cityForDate(data.stops, date).id === activeStop.id).map((date) => <option key={date} value={date}>{formatDate(date)}</option>)}</GlassSelect></label></header>{(["must", "should", "could"] as Priority[]).map((tier) => <section key={tier}><h4>{tier === "must" ? "Must do" : tier === "should" ? "Should do" : "Could do"}</h4>{unplaced.filter((activity) => (state.activityPriority[activity.id] || activity.priority) === tier).map((activity) => <div key={activity.id} className="catalogue-item" draggable onDragStart={(event) => event.dataTransfer.setData("text/trippy-activity", activity.id)}><TripImage src={activityPhoto(activity, activeStop)} fallback={activeStop.hero} alt="" /><span><b>{activity.title}</b><small>{activity.details}</small></span><button aria-label={`Add ${activity.title}`} onClick={() => addToDate(activity.id, activeDate)}><Icon name="plus" /></button></div>)}</section>)}</aside></div>
    <>{mapActivity && <ActivityDrawer activity={{ ...mapActivity, priority: state.activityPriority[mapActivity.id] || mapActivity.priority }} stop={data.stops.find((item) => item.id === mapActivity.city) || activeStop} dates={dates.filter((date) => cityForDate(data.stops, date).id === activeStop.id)} saved={state.savedActivities.includes(mapActivity.id)} toggleSaved={() => toggleSaved(mapActivity.id)} addToDate={addToDate} close={() => setMapActivity(null)} />}</><details className="gmail-import glass"><summary><span><Icon name="mail" />Confirmed and TBC imports</span><small>{data.bookings.length} records · review before changing the plan</small></summary><BookingsTable data={data} /></details>
  </section>;
}

function DayColumn({ tripStart, date, stop, plan, ids, logistics, activityById, state, active, choose, onDrop, remove, move, setPriority, allDates, addToDate }: { tripStart: string; date: string; stop: TripStop; plan?: CityDayPlan; ids: string[]; logistics: LogisticsItem[]; activityById: Map<string, TripActivity>; state: WorkspaceState; active: boolean; choose: () => void; onDrop: (id: string) => void; remove: (id: string, date: string) => void; move: (id: string, date: string, delta: number) => void; setPriority: (id: string, priority: Priority) => void; allDates: string[]; addToDate: (id: string, date: string) => void }) {
  const logisticsLabel = (item: LogisticsItem) => item.status === "confirmed" ? "Confirmed" : item.status === "missing" ? "Needs booking" : item.status === "conflict" ? "Conflict" : "TBC";
  return <article id={`day-${date}`} className={`day-column glass ${active ? "active" : ""}`} onClick={choose} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("text/trippy-activity"); if (id) onDrop(id); }}><header><div><span>Day {Math.round((Date.parse(date) - Date.parse(tripStart)) / 86400000) + 1}</span><h3>{formatDate(date, { weekday: "short", day: "numeric", month: "short" })}</h3></div><b>{stop.flag} {date < stop.checkIn ? `Next: ${stop.name}` : plan?.theme || stop.name}</b></header>{plan?.note && <p className="day-intent">{plan.note}</p>}<div className="anchor-list">{logistics.map((item) => <div key={item.id} className={`anchor status-${item.status}`}><LogisticsIcon kind={item.kind} width={18} /><span>{logisticsLabel(item)}</span><b>{item.title}</b><small>{item.detail}</small></div>)}</div><div className="scheduled-list">{ids.map((id, index) => { const activity = activityById.get(id); if (!activity) return null; const tier = state.activityPriority[id] || activity.priority; return <div key={id} className={`scheduled-card tier-${tier}`} draggable onDragStart={(event) => event.dataTransfer.setData("text/trippy-activity", activity.id)}><span className="drag-handle">⠿</span><TripImage src={activityPhoto(activity, stop)} fallback={stop.hero} alt="" /><div><span className={`tier-pill ${tier}`}>{tier}</span><b>{activity.title}</b><small>{activity.details}</small><div><GlassSelect aria-label={`Priority for ${activity.title}`} value={tier} onChange={(event) => setPriority(id, event.target.value as Priority)}><option value="must">Must do</option><option value="should">Should do</option><option value="could">Could do</option></GlassSelect><GlassSelect aria-label={`Day for ${activity.title}`} value={date} onChange={(event) => addToDate(id, event.target.value)}>{allDates.map((day) => <option key={day} value={day}>{formatDate(day)}</option>)}</GlassSelect><button disabled={index === 0} onClick={() => move(id, date, -1)}>Up</button><button disabled={index === ids.length - 1} onClick={() => move(id, date, 1)}>Down</button><button aria-label={`Remove ${activity.title} from day`} onClick={() => remove(id, date)}><Icon name="close" width="12" /></button></div></div></div>; })}</div><div className="drop-zone">Drop activities here</div></article>;
}

function HotelsView({ data, state, setup, setState }: { data: Trip2026Payload; state: WorkspaceState; setup: SetupProfile; setState: React.Dispatch<React.SetStateAction<WorkspaceState>> }) {
  const [city, setCity] = useState("ring"); const [query, setQuery] = useState(""); const [filter, setFilter] = useState("all");
  const stop = data.stops.find((item) => item.id === city) || data.stops[0];
  const cityHotels = data.hotels.filter((hotel) => hotel.city === city);
  const visible = cityHotels.filter((hotel) => `${hotel.name} ${hotel.neighborhood} ${hotel.why}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || filter === "saved" && state.savedHotels.includes(hotel.id) || filter === "selected" && state.selectedHotel[city] === hotel.id || hotel.flags.includes(filter) || hotel.tier.toLowerCase().replaceAll(" ", "-") === filter));
  const points: Point[] = visible.flatMap((hotel) => hotel.lat && hotel.lng ? [{ id: hotel.id, name: hotel.name, lat: hotel.lat, lng: hotel.lng, category: "hotel" }] : []);
  return <section className="view-stack"><header className="page-heading"><h2>Find your stay</h2><p>Private rooms · saved rates show their original dates</p></header><div className="hotel-city-tabs"><button className={city === "all" ? "active" : ""} onClick={() => setCity("all")}><b>All hotels</b><small>{data.hotels.length}</small></button>{data.stops.map((item) => <button key={item.id} className={city === item.id ? "active" : ""} onClick={() => setCity(item.id)}><b>{item.flag} {item.name}</b><small>{data.hotels.filter((hotel) => hotel.city === item.id).length}</small></button>)}</div>
    {city === "all" ? <div className="all-hotel-overview">{data.stops.map((item) => <button className="glass" key={item.id} onClick={() => setCity(item.id)}><span>{formatDate(item.checkIn)}–{formatDate(item.checkOut)}</span><h3>{item.flag} {item.name}</h3><p>{data.hotels.filter((hotel) => hotel.city === item.id).length} private-room hotels</p></button>)}</div> : <><div className="hotel-console glass"><label className="search-box"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, neighborhood or why" /></label><div>{[["all", "All"], ["recommended", "Recommended"], ["exceptional-value", "Exceptional value"], ["best-location", "Best location"], ["luxury", "Luxury"], ["saved", "Saved"], ["selected", "Selected stay"]].map(([id, label]) => <button key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}</div></div><div className="hotel-map-layout"><div className="glass"><header><h3>{stop.flag} {stop.name} <small>{visible.length} stays</small></h3></header><GeographicMap points={points} focus={state.selectedHotel[city]} fitKey={`${city}:${visible.length}`} label={`${stop.name} hotels map`} basemap="city" /></div><aside className="glass"><span className="eyebrow">Exact stay</span><h3>{formatDate(stop.checkIn)}–{formatDate(stop.checkOut)}</h3><p>{stop.nights} nights · {setup.adults} {setup.adults === 1 ? "adult" : "adults"} · {setup.rooms} {setup.rooms === 1 ? "room" : "rooms"}</p><small>Map coordinates are provider-verified where available.</small></aside></div><div className="hotel-grid">{visible.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} stop={stop} adults={setup.adults} rooms={setup.rooms} selected={state.selectedHotel[city] === hotel.id} saved={state.savedHotels.includes(hotel.id)} select={() => setState((current) => ({ ...current, selectedHotel: { ...current.selectedHotel, [city]: hotel.id } }))} save={() => setState((current) => ({ ...current, savedHotels: current.savedHotels.includes(hotel.id) ? current.savedHotels.filter((id) => id !== hotel.id) : [...current.savedHotels, hotel.id] }))} />)}</div></>}
  </section>;
}

function HotelCard({ hotel, stop, adults, rooms, selected, saved, select, save }: { hotel: TripHotel; stop: TripStop; adults: number; rooms: number; selected: boolean; saved: boolean; select: () => void; save: () => void }) {
  const offer = [...hotel.offers].sort((a, b) => a.total - b.total)[0]; const currentDates = offer && offer.checkIn === stop.checkIn && offer.checkOut === stop.checkOut;
  const fit = Math.min(9.6, 6.2 + (hotel.flags.includes("best-location") ? 1.4 : 0) + (hotel.flags.includes("recommended") ? .7 : 0) + (hotel.rating ? Math.max(0, hotel.rating - 8) * .35 : 0));
  const links = [["Booking", offer?.url || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${hotel.name} ${stop.name}`)}&checkin=${stop.checkIn}&checkout=${stop.checkOut}&group_adults=${adults}&no_rooms=${rooms}`], ["Priceline", `https://www.priceline.com/stay/search/hotels/${encodeURIComponent(hotel.name)}?check-in=${stop.checkIn}&check-out=${stop.checkOut}&adults=${adults}&rooms=${rooms}`], ["Expedia", `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(`${hotel.name} ${stop.name}`)}&startDate=${stop.checkIn}&endDate=${stop.checkOut}&adults=${adults}&rooms=${rooms}`], ["Direct", hotel.official || `https://www.google.com/search?q=${encodeURIComponent(`${hotel.name} official hotel`)}`], ["Map", `https://www.google.com/maps/search/?api=1&query=${hotel.lat && hotel.lng ? `${hotel.lat},${hotel.lng}` : encodeURIComponent(`${hotel.name} ${stop.name}`)}`]];
  return <article className={`hotel-card glass ${selected ? "selected" : ""}`}><div className="hotel-photo"><TripImage src={hotel.images[0]} fallback={stop.hero} alt="" /><span className={offer && currentDates ? "live" : "recheck"}>{offer && currentDates ? `Rate · ${offer.provider}` : "Recheck rate"}</span><button className={saved ? "saved" : ""} onClick={save} aria-label={saved ? "Remove saved hotel" : "Save hotel"}>♡</button></div><div className="hotel-body"><span className="card-kicker">{stop.flag} {stop.name} · {hotel.neighborhood}</span><div className="rating-line"><h3>{hotel.name}</h3>{hotel.rating && <b>★ {hotel.rating.toFixed(1)} · {hotel.reviews?.toLocaleString()} reviews</b>}</div><div className="amenity-row"><span>{hotel.stars}★</span>{hotel.amenities.slice(0, 5).map((amenity) => <span key={amenity}>{amenity}</span>)}</div><p>{hotel.why}</p><details className="hotel-details"><summary>Details & location</summary><p className="tradeoff">{hotel.tradeoff}</p><div className="fit-box"><span><small>Itinerary fit</small><strong>{fit.toFixed(1)}/10</strong></span><ul><li>{hotel.neighborhood}</li><li>{hotel.lat ? "Coordinate checked" : "Neighborhood assessed"}</li><li>Compare cancellation and final transit</li></ul></div></details><div className="stay-proof"><b>{formatDate(stop.checkIn)}–{formatDate(stop.checkOut)}</b><small>{stop.nights} nights · {adults} {adults === 1 ? "adult" : "adults"} · {rooms} {rooms === 1 ? "room" : "rooms"}</small></div><div className="price-line"><span><small>{offer ? currentDates ? "Current total" : "Historical snapshot" : "Researched range"}</small><strong>{offer ? money(offer.total, offer.currency) : `${money(hotel.low)}–${money(hotel.high)} / night`}</strong></span>{offer && <span><small>Per-night</small><strong>{money(offer.nightly || offer.total / stop.nights, offer.currency)}</strong></span>}</div><div className="hotel-actions"><button className={selected ? "selected" : ""} onClick={select}>{selected ? "Selected stay" : "Select stay"}</button><button onClick={save}>{saved ? "Saved" : "Save"}</button></div><div className="provider-links">{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div></div></article>;
}

function AllActivitiesView({ data, state, toggleSaved, addToDate }: { data: Trip2026Payload; state: WorkspaceState; toggleSaved: (id: string) => void; addToDate: (id: string, date: string) => void }) {
  const [query, setQuery] = useState(""); const [city, setCity] = useState("route"); const [category, setCategory] = useState("all"); const [priority, setTier] = useState<Priority | "all">("all"); const [savedOnly, setSavedOnly] = useState(false); const [selected, setSelected] = useState<TripActivity | null>(null);
  const routeSet = new Set(data.stops.map((stop) => stop.id)); const categories = [...new Set(data.activities.map((activity) => activity.category))].sort();
  const visible = data.activities.filter((activity) => (city === "all" || city === "route" && routeSet.has(activity.city) || activity.city === city) && (category === "all" || activity.category === category) && (priority === "all" || activity.priority === priority) && (!savedOnly || state.savedActivities.includes(activity.id)) && `${activity.title} ${activity.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="view-stack"><header className="page-heading"><h2>Activities</h2></header><div className="global-filters glass"><label className="search-box"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all activities" /></label><GlassSelect value={city} onChange={(event) => setCity(event.target.value)}><option value="route">2026 route cities</option><option value="all">All imported destinations</option>{[...new Set(data.activities.map((activity) => activity.city))].sort().map((id) => <option key={id} value={id}>{displayCity(id)}</option>)}</GlassSelect><GlassSelect value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</GlassSelect><GlassSelect value={priority} onChange={(event) => setTier(event.target.value as Priority | "all")}><option value="all">All priorities</option><option value="must">Must do</option><option value="should">Should do</option><option value="could">Could do</option></GlassSelect><label className="check-control"><input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} />Saved only</label></div><div className="results-line"><strong>{visible.length} matches</strong><span>{data.activities.length} total activities</span></div><div className="global-activity-grid">{visible.map((activity) => { const stop = data.stops.find((item) => item.id === activity.city) || data.stops[0]; return <article key={activity.id} className={`mini-activity glass tier-${activity.priority}`}><TripImage src={activityPhoto(activity, stop)} fallback={stop.hero} alt="" /><div><span className={`tier-pill ${activity.priority}`}>{activity.priority}</span><small>{displayCity(activity.city)} · {activity.category}</small><h3>{activity.title}</h3><p>{activity.description}</p><div><button onClick={() => toggleSaved(activity.id)}>{state.savedActivities.includes(activity.id) ? "Saved" : "Save"}</button>{routeSet.has(activity.city) && <GlassSelect defaultValue="" onChange={(event) => { if (event.target.value) addToDate(activity.id, event.target.value); event.target.value = ""; }}><option value="">Add to day</option>{isoDays(stop.checkIn, stop.nights).map((date) => <option key={date} value={date}>{formatDate(date)}</option>)}</GlassSelect>}<button onClick={() => setSelected(activity)}>Details</button></div></div></article>; })}</div>{selected && <ActivityDrawer activity={selected} stop={data.stops.find((item) => item.id === selected.city) || data.stops[0]} dates={[]} saved={state.savedActivities.includes(selected.id)} toggleSaved={() => toggleSaved(selected.id)} addToDate={addToDate} close={() => setSelected(null)} />}</section>;
}

function FlightValueWorkbench() {
  const [directCash, setDirectCash] = useState("");
  const [connectionCash, setConnectionCash] = useState("");
  const [awardPoints, setAwardPoints] = useState("");
  const [awardTaxes, setAwardTaxes] = useState("");
  const [positioningCost, setPositioningCost] = useState("");
  const direct = Number(directCash) || 0;
  const connection = Number(connectionCash) || 0;
  const points = Number(awardPoints) || 0;
  const taxes = Number(awardTaxes) || 0;
  const positioning = Number(positioningCost) || 0;
  const validCash = [direct, connection].filter((value) => value > 0);
  const bestCash = validCash.length ? Math.min(...validCash) : 0;
  const awardCash = taxes + positioning;
  const centsPerPoint = points > 0 && bestCash > awardCash ? ((bestCash - awardCash) * 100) / points : 0;
  const recommendation = !bestCash
    ? "Add live cash quotes to compare"
    : points > 0 && centsPerPoint >= 1.5
      ? `Award leads at ${centsPerPoint.toFixed(2)}¢ per point`
      : direct > 0 && (!connection || direct <= connection + 75)
        ? "Direct cash leads after convenience"
        : "Connecting cash is the current value lead";
  return <section className="value-workbench glass"><header><div><span className="eyebrow">Cash vs points workbench</span><h3>Compare Kraków → Brussels options.</h3></div><strong>{recommendation}</strong></header><div className="value-inputs"><label>Direct cash fare · EUR<input inputMode="decimal" value={directCash} onChange={(event) => setDirectCash(event.target.value)} placeholder="Live quote" /></label><label>Connecting cash fare · EUR<input inputMode="decimal" value={connectionCash} onChange={(event) => setConnectionCash(event.target.value)} placeholder="Live quote" /></label><label>Award price · points<input inputMode="numeric" value={awardPoints} onChange={(event) => setAwardPoints(event.target.value)} placeholder="Points" /></label><label>Award taxes · EUR<input inputMode="decimal" value={awardTaxes} onChange={(event) => setAwardTaxes(event.target.value)} placeholder="Taxes" /></label><label>Transfer / positioning · EUR<input inputMode="decimal" value={positioningCost} onChange={(event) => setPositioningCost(event.target.value)} placeholder="Extra cost" /></label></div><footer><span><small>Best cash</small><b>{bestCash ? money(bestCash) : "Awaiting quote"}</b></span><span><small>Award cash cost</small><b>{points ? money(awardCash) : "Awaiting award"}</b></span><span><small>Redemption value</small><b>{centsPerPoint ? `${centsPerPoint.toFixed(2)}¢ / point` : "—"}</b></span><p>Use comparable cabin and baggage terms. Values are planning inputs, not live fares, and stay in this browser session.</p></footer></section>;
}

function ResearchView({ data, state, openConnections }: { data: Trip2026Payload; state: WorkspaceState; openConnections: (seed?: ProviderSearchSeed) => void }) {
  const flights = data.transport.filter((leg) => leg.options.some((option) => option.mode === "flight"));
  const airports = [
    { id: "frankfurt", name: "Frankfurt", lat: 50.0379, lng: 8.5622, category: "airport" as const },
    { id: "wroclaw", name: "Wrocław", lat: 51.1027, lng: 16.8858, category: "airport" as const },
    { id: "krakow", name: "Kraków", lat: 50.0777, lng: 19.7848, category: "airport" as const },
    { id: "brussels", name: "Brussels", lat: 50.9014, lng: 4.4844, category: "airport" as const },
  ];
  return <section className="view-stack">
    <header className="page-heading research-heading"><div><span className="eyebrow">Research & optimization</span><h2>Turn uncertainty into a decision.</h2><p>Compare route, date and mode scenarios without blurring estimates, live quotes or confirmed bookings.</p></div><button className="research-connection-button" onClick={() => openConnections({ kind: "hotels", query: "Amsterdam", date: "2026-10-03" })}><span className="connection-pulse" /><Icon name="globe" />Open Connections</button></header>
    <ResearchOptimizer data={data} selectedTransport={state.selectedTransport} onSearch={openConnections} />
    <div className="flight-builder-grid">
      <article className="glass status-confirmed"><span className="eyebrow">Confirmed route</span><h3>KLM KL1328 + onward Brussels connection · September 30</h3><p>KRK 17:55 → AMS 19:55 is confirmed, followed by the confirmed Brussels connection. The second-segment timing remains private or was not supplied to the share-safe record.</p></article>
      <article className="glass"><span className="eyebrow">Confirmed Poland arrival</span><h3>FRA → WRO · LH1374</h3><p>September 24 · 12:35–14:00.</p></article>
      <article className="glass"><span className="eyebrow">Confirmed overnight rail</span><h3>Amsterdam → Berlin · European Sleeper</h3><p>October 5 · 21:34–06:01 · couchette.</p></article>
      <article className="glass"><span className="eyebrow">Confirmed return</span><h3>MUC → IAD · UA109</h3><p>October 12 · 12:00–15:10 · economy.</p></article>
    </div>
    <FlightValueWorkbench />
    <div className="flight-map glass"><header><span className="eyebrow">Flight builder map</span><h3>Confirmed flight path</h3></header><GeographicMap connect points={airports} segments={[{ from: "frankfurt", to: "wroclaw", kind: "flight", status: "confirmed" }, { from: "krakow", to: "brussels", kind: "flight", status: "confirmed" }]} label="2026 flight routes" /></div>
    <h3 className="subsection-title">Flight-capable alternatives by leg</h3>
    <div className="research-list">{flights.map((leg) => <article className="glass" key={leg.id}><header><b>{countryFlag[leg.from]} {displayCity(leg.from)} → {countryFlag[leg.to]} {displayCity(leg.to)}</b><span>{formatDate(leg.date)}</span></header>{leg.options.filter((option) => option.mode === "flight").map((option) => <div key={option.id}><strong>{option.name}</strong><span>{option.low || option.high ? `${money(option.low)}–${money(option.high)}` : "Booked / price private"} · {option.door}</span><p>{option.note}</p></div>)}</article>)}</div>
    <BookingsStrip data={data} />
  </section>;
}

function BookingsStrip({ data }: { data: Trip2026Payload }) {
  const confirmed = data.bookings.filter((booking) => booking.status === "confirmed").length;
  const conflicts = data.bookings.filter((booking) => booking.status === "conflict").length;
  return <section className="bookings-strip glass"><header><h2>Bookings <span>{data.bookings.length}</span></h2><small>{confirmed} confirmed{conflicts ? ` · ${conflicts} conflict` : ""}</small></header><BookingsTable data={data} /></section>;
}
function BookingRow({ booking, logistics }: { booking: BookingRecord; logistics: LogisticsItem }) {
  const label = logistics.status === "confirmed" ? "Confirmed" : logistics.status === "missing" ? "Needs booking" : logistics.status === "conflict" ? "Conflict" : "Awaiting details";
  const content = <><span><LogisticsIcon kind={logistics.kind} width={18} />{booking.kind}<small>{booking.date}</small></span><b>{booking.title}</b><p>{booking.detail}</p><em>{label}</em></>;
  return booking.href ? <a className={`booking-row kind-${booking.kind.toLowerCase()} status-${logistics.status}`} href={booking.href} target="_blank" rel="noreferrer">{content}</a> : <div className={`booking-row kind-${booking.kind.toLowerCase()} status-${logistics.status}`}>{content}</div>;
}
function BookingsTable({ data }: { data: Trip2026Payload }) { const logistics = buildTripLogistics(data); return <div className="bookings-table">{data.bookings.map((booking, index) => <BookingRow key={`${booking.date}:${booking.title}`} booking={booking} logistics={logistics.items.find((item) => item.id.startsWith(`booking:${index}:`))!} />)}</div>; }

function ActivityDrawer({ activity, stop, dates, saved, toggleSaved, addToDate, close }: { activity: TripActivity; stop: TripStop; dates: string[]; saved: boolean; toggleSaved: () => void; addToDate: (id: string, date: string) => void; close: () => void }) {
  return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><aside className="detail-drawer glass"><button className="drawer-close" onClick={close}><Icon name="close" /></button><TripImage src={activityPhoto(activity, stop)} fallback={stop.hero} alt="" /><span className={`tier-pill ${activity.priority}`}>{activity.priority}</span><span className="card-kicker">{stop.flag} {stop.name} · {activity.category}</span><h2>{activity.title}</h2><p>{activity.description}</p><strong>{activity.details}</strong>{activity.fit && <p><b>Fit:</b> {activity.fit}</p>}{activity.access && <p><b>Access:</b> {activity.access}</p>}<div className="drawer-actions"><button onClick={toggleSaved}>{saved ? "Saved" : "Save activity"}</button>{dates.length > 0 && <GlassSelect defaultValue="" onChange={(event) => { if (event.target.value) addToDate(activity.id, event.target.value); event.target.value = ""; }}><option value="">Add to itinerary</option>{dates.map((date) => <option key={date} value={date}>{formatDate(date, { weekday: "short", day: "numeric", month: "short" })}</option>)}</GlassSelect>}{activity.url && <a href={activity.url} target="_blank" rel="noreferrer">Official source ↗</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activity.title} ${stop.name}`)}`} target="_blank" rel="noreferrer">Map ↗</a></div>{activity.imageCredit && <small>Photo: {activity.imageCredit}</small>}</aside></div>;
}

function CarPanel({ kind, data, close }: { kind: "rentals" | "ring" | "museums"; data: Trip2026Payload; close: () => void }) {
  const automotive = data.activities.filter((activity) => activity.category === "Automotive" || /car|BMW|Mercedes|Porsche|ring|circuit|Autobahn/i.test(activity.title));
  const filtered = kind === "ring" ? automotive.filter((activity) => activity.city === "ring") : kind === "museums" ? automotive.filter((activity) => /museum|welt|remise|autoworld|motorworld/i.test(activity.title)) : automotive.filter((activity) => /rent|drive|Autobahn|road|lap/i.test(`${activity.title} ${activity.description}`));
  const mapped: Point[] = filtered.flatMap((activity) => activity.lat && activity.lng ? [{ id: activity.id, name: activity.title, lat: activity.lat, lng: activity.lng, category: `activity-${activity.priority}` }] : []);
  return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><aside className="car-drawer glass"><button className="drawer-close" onClick={close}><Icon name="close" /></button><span className="eyebrow">Automotive add-on</span><h2>{kind === "rentals" ? "Autobahn & rentals" : kind === "ring" ? "Ring driving" : "Car museums"}</h2><p>Separate from the core city and flight plan.</p><div className="car-panel-summary"><span><small>Matching ideas</small><b>{filtered.length}</b></span><span><small>Destinations</small><b>{new Set(filtered.map((activity) => activity.city)).size}</b></span><span><small>Mapped precisely</small><b>{mapped.length}</b></span></div>{mapped.length > 0 && <div className="car-panel-map"><GeographicMap points={mapped} fitKey={`${kind}:${mapped.length}`} label={`${kind} automotive map`} basemap="city" /></div>}<div className="car-panel-list">{filtered.map((activity) => <a key={activity.id} href={activity.url || `https://www.google.com/search?q=${encodeURIComponent(activity.title)}`} target="_blank" rel="noreferrer"><TripImage src={activity.image} fallback={data.stops.find((stop) => stop.id === activity.city)?.hero} alt="" /><span><b>{activity.title}</b><small>{displayCity(activity.city)} · {activity.details}</small></span></a>)}</div></aside></div>;
}

function ExportMenu({ data, state, close }: { data: Trip2026Payload; state: WorkspaceState; close: () => void }) {
  const [busy, setBusy] = useState<TripExportKind | null>(null);
  const [failure, setFailure] = useState("");
  async function run(kind: TripExportKind, privacy: TripExportPrivacy = "share-safe") {
    setBusy(kind); setFailure("");
    try { await downloadTripExport(data, state, kind, privacy); setBusy(null); close(); }
    catch (error) { setFailure(error instanceof Error ? error.message : "Export failed. Please try again."); setBusy(null); }
  }
  const options: Array<[TripExportKind, string, string]> = [["pdf-light", "Operational PDF", "Light"], ["pdf-dark", "Operational PDF", "Dark"], ["pdf-visual", "Visual dossier", "PDF"], ["html", "Visual dossier", "HTML"], ["csv", "Working itinerary", "CSV"]];
  return <div className="export-menu glass" onKeyDown={(event) => event.key === "Escape" && !busy && close()}><span>Share-safe itinerary</span>{options.map(([kind, label, format]) => <button key={kind} disabled={!!busy} onClick={() => run(kind)}><Icon name="download" /><span>{busy === kind ? "Preparing…" : label}</span><em>{format}</em></button>)}{data.dataMode === "private" && <><span className="export-private-label"><Icon name="shield" /> Private operational copy</span><button disabled={!!busy} onClick={() => run("html", "private-operational")}><Icon name="download" /><span>Private itinerary · printable</span><em>HTML</em></button><button disabled={!!busy} onClick={() => run("csv", "private-operational")}><Icon name="download" /><span>Private working data</span><em>CSV</em></button><small className="export-private-note">Includes private booking details and references from this local workspace. Never share or commit these files.</small></>}{busy && <p className="export-status" role="status">Preparing your itinerary{busy === "pdf-visual" ? " and photos" : ""}…</p>}{failure && <p className="export-error" role="alert">{failure}</p>}</div>;
}
