"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./planner-icon";
import GlassSelect from "./glass-select";
import type { Money } from "@/lib/providers";
import { buildProviderSearchRequest, initializeProviderControls, sortProviderResults, type ProviderSearchKind, type ProviderSearchProfile, type ProviderSort } from "@/lib/provider-search-controls";
export type { ProviderSearchKind, ProviderSearchProfile } from "@/lib/provider-search-controls";
import "./intelligence.css";
import "./integration-center.css";

export type ProviderSearchSeed = {
  kind?: ProviderSearchKind;
  origin?: string;
  destination?: string;
  date?: string;
  query?: string;
  endDate?: string;
  profile?: ProviderSearchProfile;
};

type ProviderState = "ready" | "manual" | "unconfigured" | "unavailable" | "degraded";
type ProviderHealth = {
  id: string;
  label: string;
  capability: ProviderSearchKind;
  capabilities: ProviderSearchKind[];
  mode: "live" | "manual";
  state: ProviderState;
  detail: string;
  checkedAt?: string;
};
type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  price?: Money;
  points?: number;
  durationMinutes?: number;
  kind: string;
  provider: string;
  checkedAt?: string;
  href?: string;
  status?: "fact" | "quote" | "estimate" | "recommendation" | "availability" | "manual";
  limitations: string[];
};
type SavedResearch = Pick<SearchResult, "id" | "title" | "subtitle" | "price" | "points" | "provider" | "checkedAt" | "kind" | "limitations">;
type GmailStatus = "checking" | "disabled" | "ready" | "connected" | "unavailable";
type GmailCandidate = {
  id: string;
  kind: string;
  title: string;
  provider: string;
  startDate?: string | null;
  endDate?: string | null;
  originCode?: string | null;
  destinationCode?: string | null;
  confidence: "high" | "medium" | "low";
  duplicate: boolean;
  conflicts: Array<{ field: string }>;
};

const providerFallbacks: ProviderHealth[] = [
  { id: "serpapi", label: "SerpApi", capability: "cash-flights", capabilities: ["cash-flights", "places"], mode: "live", state: "unconfigured", detail: "Adapter implemented · credential not configured" },
  { id: "booking-com", label: "Booking.com Demand", capability: "hotels", capabilities: ["hotels"], mode: "live", state: "unconfigured", detail: "Adapter implemented · credentials not configured" },
  { id: "seats-aero", label: "Seats.aero + Rooms.aero", capability: "award-seats", capabilities: ["award-seats", "award-hotels"], mode: "live", state: "unconfigured", detail: "Adapter implemented · credential not configured" },
  { id: "manual", label: "Manual handoffs", capability: "places", capabilities: ["cash-flights", "hotels", "places", "award-seats", "award-hotels"], mode: "manual", state: "manual", detail: "Built in · coverage must be verified by you" },
];

const capabilityCopy: Record<ProviderSearchKind, { label: string; icon: string; prompt: string }> = {
  "cash-flights": { label: "Cash flights", icon: "flight", prompt: "Compare dated cash itineraries" },
  hotels: { label: "Cash hotels", icon: "stays", prompt: "Compare cash stays for exact dates" },
  places: { label: "Places", icon: "pin", prompt: "Find attributable places" },
  "award-seats": { label: "Award seats", icon: "activities", prompt: "Check points inventory" },
  "award-hotels": { label: "Award hotels", icon: "stays", prompt: "Check cached points-hotel evidence" },
};
const researchShortlistKey = "trippy.research-shortlist.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.slice(0, 500) : fallback;
}

function parseMoney(value: unknown): Money | undefined {
  if (!isRecord(value) || typeof value.amount !== "number" || !Number.isFinite(value.amount) || value.amount < 0) return undefined;
  const unit = value.unit === "total" || value.unit === "night" || value.unit === "ticket" || value.unit === "unknown" ? value.unit : "unknown";
  const currency = cleanText(value.currency).toUpperCase().slice(0, 3);
  if (!currency) return undefined;
  return { amount: value.amount, currency, unit, ...(typeof value.display === "string" ? { display: cleanText(value.display) } : {}) };
}

function displayMoney(value?: Money) {
  if (!value) return "";
  if (value.display) return value.display;
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: value.currency, maximumFractionDigits: value.amount % 1 ? 2 : 0 }).format(value.amount); }
  catch { return `${value.currency} ${value.amount.toLocaleString()}`; }
}

function isSavedResearch(value: unknown): value is SavedResearch {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string" || typeof value.subtitle !== "string" || typeof value.provider !== "string" || typeof value.kind !== "string") return false;
  if (value.price !== undefined && !parseMoney(value.price)) return false;
  if (value.points !== undefined && (typeof value.points !== "number" || !Number.isFinite(value.points) || value.points <= 0)) return false;
  return Array.isArray(value.limitations) && value.limitations.every((item) => typeof item === "string");
}

function subscribeResearchShortlist(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("trippy-research-shortlist", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("trippy-research-shortlist", onStoreChange);
  };
}

function researchShortlistSnapshot() {
  try { return window.localStorage.getItem(researchShortlistKey) || "[]"; }
  catch { return "[]"; }
}

function normalizeState(value: unknown, configured?: unknown, mode?: unknown): ProviderState {
  if (mode === "manual") return "manual";
  if (value === "ready" || value === "manual" || value === "unconfigured" || value === "unavailable" || value === "degraded") return value;
  return configured === true ? "ready" : configured === false ? "unconfigured" : "unavailable";
}

function normalizeCapability(value: unknown, id: string): ProviderSearchKind {
  if (value === "cash-flight" || value === "cash-flights") return "cash-flights";
  if (value === "hotel" || value === "hotels") return "hotels";
  if (value === "award-hotel" || value === "award-hotels") return "award-hotels";
  if (value === "place" || value === "places" || value === "research") return "places";
  if (value === "award-flight" || value === "award-seats") return "award-seats";
  if (/hotel/i.test(id)) return "hotels";
  if (/place|map/i.test(id)) return "places";
  if (/award|seat/i.test(id)) return "award-seats";
  return "cash-flights";
}

function parseHealth(body: unknown): ProviderHealth[] {
  const source = isRecord(body) && Array.isArray(body.providers) ? body.providers : [];
  return source.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const id = cleanText(item.id || item.provider, `provider-${index}`);
    const rawCapabilities = Array.isArray(item.capabilities) ? item.capabilities : [item.capability || item.kind];
    const capabilities = [...new Set(rawCapabilities.map((capability) => normalizeCapability(capability, id)))];
    const mode = item.mode === "manual" ? "manual" : "live";
    return [{
      id,
      label: cleanText(item.label || item.name, id.split("-").map((word) => word.replace(/^./, (letter) => letter.toUpperCase())).join(" ")),
      capability: capabilities[0] || normalizeCapability(undefined, id),
      capabilities,
      mode,
      state: normalizeState(item.state || item.status, item.configured, mode),
      detail: cleanText(item.detail || item.message, mode === "manual" ? "Manual handoff · coverage not verified" : item.configured === true ? "Adapter implemented · credential configured" : "Adapter implemented · credential not configured"),
      checkedAt: cleanText(item.checkedAt || item.checked_at) || undefined,
    }];
  });
}

function parseResults(body: unknown): { results: SearchResult[]; limitations: string[] } {
  const outcomes = isRecord(body) && Array.isArray(body.providers) ? body.providers : [];
  const limitations = outcomes.flatMap((outcome) => {
    if (!isRecord(outcome)) return [];
    const notes = Array.isArray(outcome.limitations) ? outcome.limitations.map((item) => cleanText(item)).filter(Boolean) : [];
    if (outcome.status !== "ok") notes.push(`${cleanText(outcome.provider, "Provider")}: ${cleanText(outcome.status, "unavailable")}. Coverage remains unverified; use the manual path if needed.`);
    return notes;
  });
  const source = outcomes.flatMap((outcome) => isRecord(outcome) && outcome.status === "ok" && Array.isArray(outcome.results) ? outcome.results.map((result) => ({ result, outcome })) : []);
  return {
    limitations: [...new Set(limitations)],
    results: source.flatMap(({ result: item, outcome }, index) => {
      if (!isRecord(item)) return [];
      const rawLimitations = Array.isArray(item.limitations) ? item.limitations.map((entry) => cleanText(entry)).filter(Boolean) : [];
      const href = cleanText(item.href || item.url);
      const resultKind = cleanText(item.kind, "research");
      const status = outcome.mode === "manual" ? "manual" : item.status === "fact" || item.status === "quote" || item.status === "estimate" || item.status === "recommendation" || item.status === "availability" ? item.status : /^award-/.test(resultKind) ? "availability" : /^(place|research)$/.test(resultKind) ? "fact" : "quote";
      const money = parseMoney(item.price);
      const freshness = isRecord(outcome.freshness) ? cleanText(outcome.freshness.checkedAt) : cleanText(outcome.checkedAt);
      return [{
        id: cleanText(item.id, `result-${index}`),
        title: cleanText(item.title || item.name, "Untitled result"),
        subtitle: cleanText(item.subtitle || item.detail || item.description, "Provider result"),
        price: money,
        durationMinutes: typeof item.durationMinutes === "number" && Number.isFinite(item.durationMinutes) && item.durationMinutes > 0 ? item.durationMinutes : undefined,
        points: typeof item.points === "number" && item.points > 0 ? item.points : undefined,
        kind: resultKind,
        provider: cleanText(outcome.provider || item.provider || item.source, "Provider"),
        checkedAt: freshness || cleanText(item.checkedAt || item.checked_at) || undefined,
        href: /^https?:\/\//i.test(href) ? href : undefined,
        status,
        limitations: rawLimitations,
      }];
    }),
  };
}

function manualLinks(kind: ProviderSearchKind, origin: string, destination: string, date: string, query: string) {
  const route = `${origin || "origin"} to ${destination || "destination"}`;
  if (kind === "cash-flights") return [
    ["Google Flights", `https://www.google.com/travel/flights?q=${encodeURIComponent(`${route} ${date}`)}`],
    ["ITA Matrix", "https://matrix.itasoftware.com/search"],
  ];
  if (kind === "hotels") return [
    ["Google Hotels", `https://www.google.com/travel/hotels/${encodeURIComponent(destination || query)}`],
    ["Booking.com", `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination || query)}`],
  ];
  if (kind === "award-hotels") return [["Rooms.aero", "https://rooms.aero"], ["Points hotel search", `https://www.google.com/search?q=${encodeURIComponent(`${destination || query} hotel points award`)}`]];
  if (kind === "award-seats") return [["Seats.aero", "https://seats.aero"], ["Point.me", "https://www.point.me"]];
  return [["Google Maps", `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || destination)}`], ["Official web search", `https://www.google.com/search?q=${encodeURIComponent(`${query || destination} official`)}`]];
}

export default function IntegrationCenter({ open, onClose, seed }: { open: boolean; onClose: () => void; seed?: ProviderSearchSeed }) {
  const [providers, setProviders] = useState<ProviderHealth[]>(providerFallbacks);
  const [healthState, setHealthState] = useState<"loading" | "live" | "fallback">("loading");
  const [kind, setKind] = useState<ProviderSearchKind>(seed?.kind || "cash-flights");
  const [controls, setControls] = useState(() => initializeProviderControls(seed));
  const { origin, destination, date, query } = controls;
  const [sort, setSort] = useState<ProviderSort>("balanced");
  const [resultCurrency, setResultCurrency] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [limitations, setLimitations] = useState<string[]>([]);
  const [searchState, setSearchState] = useState<"idle" | "searching" | "complete" | "manual">("idle");
  const [message, setMessage] = useState("");
  const searchController = useRef<AbortController | null>(null);
  const clearSearch = useCallback(() => {
    searchController.current?.abort();
    searchController.current = null;
    setSearchState("idle");
    setResults([]);
    setLimitations([]);
    setMessage("");
    setResultCurrency("");
  }, []);
  function setControl(field: keyof typeof controls, value: string) {
    // A response is evidence for the submitted controls only, never a newly edited party/date/route.
    clearSearch();
    setControls(previous => ({ ...previous, [field]: value }));
  }

  const [gmailStatus, setGmailStatus] = useState<GmailStatus>("checking");
  const [gmailSearch, setGmailSearch] = useState("reservation");
  const [gmailAfter, setGmailAfter] = useState("2026-09-01");
  const [gmailBefore, setGmailBefore] = useState("2026-10-31");
  const [gmailState, setGmailState] = useState<"idle" | "starting" | "previewing" | "complete" | "error">("idle");
  const [gmailCandidates, setGmailCandidates] = useState<GmailCandidate[]>([]);
  const [gmailMessage, setGmailMessage] = useState("");
  const [liveAccess, setLiveAccess] = useState<{ state: "available" | "locked"; reason: string }>({ state: "available", reason: "Manual and unconfigured-provider mode" });
  const [accessCode, setAccessCode] = useState("");
  const [accessState, setAccessState] = useState<"idle" | "unlocking" | "error">("idle");
  const [accessMessage, setAccessMessage] = useState("");
  const savedResearchSnapshot = useSyncExternalStore(subscribeResearchShortlist, researchShortlistSnapshot, () => "[]");
  const savedResearch = useMemo(() => {
    try {
      const stored = JSON.parse(savedResearchSnapshot) as unknown;
      return Array.isArray(stored) ? stored.filter(isSavedResearch).slice(0, 50).map((item) => ({ ...item, ...(item.price ? { price: parseMoney(item.price) } : {}) })) : [];
    } catch { return []; }
  }, [savedResearchSnapshot]);

  const loadHealth = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/providers/health", { cache: "no-store", signal });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const body = await response.json() as unknown;
      const normalized = parseHealth(body);
      if (isRecord(body) && isRecord(body.liveAccess) && (body.liveAccess.state === "available" || body.liveAccess.state === "locked")) setLiveAccess({ state: body.liveAccess.state, reason: cleanText(body.liveAccess.reason, "Live provider access is restricted") });
      setProviders(normalized.length ? normalized : providerFallbacks);
      setHealthState("live");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setProviders(providerFallbacks);
      setHealthState("fallback");
    }
  }, []);

  const loadGmailStatus = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/integrations/gmail/status", { cache: "no-store", signal });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const body = await response.json() as { enabled?: boolean; connected?: boolean };
      setGmailStatus(body.enabled ? body.connected ? "connected" : "ready" : "disabled");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setGmailStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const healthTimer = window.setTimeout(() => { clearSearch(); void loadHealth(controller.signal); void loadGmailStatus(controller.signal); }, 0);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.clearTimeout(healthTimer); controller.abort(); searchController.current?.abort(); searchController.current = null; window.removeEventListener("keydown", onKeyDown); };
  }, [clearSearch, loadGmailStatus, loadHealth, onClose, open]);

  const readiness = useMemo(() => providers.filter((provider) => provider.state === "ready").length, [providers]);
  const links = manualLinks(kind, origin, destination, date, query);

  const sortedResults = useMemo(() => sortProviderResults(results, sort, resultCurrency), [results, sort, resultCurrency]);

  async function search() {
    let requestBody;
    try { requestBody = buildProviderSearchRequest(kind, controls); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Review the search fields."); return; }
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    const isCurrent = () => searchController.current === controller && !controller.signal.aborted;
    setResultCurrency(controls.currency);
    setSearchState("searching");
    setMessage("");
    setResults([]);
    setLimitations([]);
    try {
      const response = await fetch("/api/providers/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const body = await response.json() as unknown;
      if (!isCurrent()) return;
      const normalized = parseResults(body);
      if (isRecord(body) && isRecord(body.liveAccess) && (body.liveAccess.state === "available" || body.liveAccess.state === "locked")) setLiveAccess({ state: body.liveAccess.state, reason: cleanText(body.liveAccess.reason, "Live provider access is restricted") });
      setResults(normalized.results);
      setLimitations(normalized.limitations);
      setSearchState("complete");
      setMessage(normalized.results.length ? "Results received. Verify terms before changing the plan." : "The provider returned no comparable results.");
    } catch {
      if (!isCurrent()) return;
      setSearchState("manual");
      setMessage("Live provider search is not available in this environment. The manual path is ready below.");
    }
  }

  function storeSavedResearch(next: SavedResearch[]) {
    const bounded = next.slice(0, 50);
    try {
      window.localStorage.setItem(researchShortlistKey, JSON.stringify(bounded));
      window.dispatchEvent(new Event("trippy-research-shortlist"));
    } catch { /* Browser storage is optional. */ }
  }

  function toggleResearchResult(result: SearchResult) {
    const exists = savedResearch.some((item) => item.provider === result.provider && item.id === result.id);
    if (exists) storeSavedResearch(savedResearch.filter((item) => item.provider !== result.provider || item.id !== result.id));
    else storeSavedResearch([{ id: result.id, title: result.title, subtitle: result.subtitle, price: result.price, points: result.points, provider: result.provider, checkedAt: result.checkedAt, kind: result.kind, limitations: result.limitations }, ...savedResearch]);
  }

  async function unlockLiveAccess() {
    if (!accessCode) return;
    setAccessState("unlocking"); setAccessMessage("");
    try {
      const response = await fetch("/api/providers/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessCode }) });
      if (!response.ok) throw new Error(`status ${response.status}`);
      setAccessCode("");
      setLiveAccess({ state: "available", reason: "Private provider session active in this browser" });
      setAccessState("idle");
      setAccessMessage("Live provider access unlocked for this private browser session.");
      void loadHealth();
    } catch {
      setAccessCode("");
      setAccessState("error");
      setAccessMessage("Access was not unlocked. Check the private deployment code or continue manually.");
    }
  }

  async function startGmail() {
    setGmailState("starting"); setGmailMessage("");
    try {
      const response = await fetch("/api/integrations/gmail/start", { method: "POST" });
      const body = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !body.authorizationUrl || !/^https:\/\//i.test(body.authorizationUrl)) throw new Error(body.error || "Authorization could not start");
      window.open(body.authorizationUrl, "_blank", "noopener,noreferrer");
      setGmailState("idle");
      setGmailMessage("Authorization opened in a new tab. Return here and refresh status when finished.");
    } catch {
      setGmailState("error");
      setGmailMessage("Gmail authorization is not available in this environment.");
    }
  }

  async function previewGmail() {
    setGmailState("previewing"); setGmailCandidates([]); setGmailMessage("");
    try {
      const response = await fetch("/api/integrations/gmail/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ searchTerm: gmailSearch, after: gmailAfter || null, before: gmailBefore || null, maxMessages: 10, existing: [] }),
      });
      const body = await response.json() as { candidates?: GmailCandidate[]; review?: { instruction?: string }; error?: string };
      if (!response.ok) throw new Error(body.error || "Preview unavailable");
      setGmailCandidates(Array.isArray(body.candidates) ? body.candidates : []);
      setGmailMessage(body.review?.instruction || "Review each candidate manually. No itinerary changes were made.");
      setGmailState("complete");
    } catch {
      setGmailState("error");
      setGmailMessage("The narrow Gmail preview could not be completed. No data was imported or saved.");
    }
  }

  if (!open) return null;
  return <div className="connection-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <aside className="connection-center glass" role="dialog" aria-modal="true" aria-labelledby="connection-title">
      <header className="connection-header">
        <div><span className="intelligence-orb"><Icon name="globe" /></span><span><small>TRIPPY Intelligence</small><h2 id="connection-title">Connections</h2></span></div>
        <div className="connection-health"><i className={`${healthState} ${readiness ? "available" : "none"}`} /><span><b>{healthState === "loading" ? "Checking" : healthState === "live" ? `${readiness} live credential${readiness === 1 ? "" : "s"}` : "Manual mode"}</b><small>No credentials enter this browser</small></span></div>
        <button className="drawer-close" onClick={onClose} aria-label="Close Connections" autoFocus><Icon name="close" /></button>
      </header>

      <section className="connection-status" aria-label="Provider status">
        <div className="connection-section-label"><span>Capability map</span><button onClick={() => { setHealthState("loading"); void loadHealth(); }}>Refresh</button></div>
        <div className="provider-grid">{providers.map((provider) => <article key={provider.id} className={`provider-state state-${provider.state}`}>
          <span className="provider-icon"><Icon name={capabilityCopy[provider.capability].icon} /></span><div><b>{provider.label}</b><small>{provider.detail}</small><span className="provider-coverage">{provider.capabilities.map((capability) => capabilityCopy[capability].label).join(" · ")}</span></div><em>{provider.state === "ready" ? "Credential set" : provider.state === "degraded" ? "Limited" : provider.state === "manual" ? "Manual" : "Optional"}</em>
        </article>)}</div>
        {healthState === "fallback" && <p className="connection-inline-note">Provider status could not be refreshed. TRIPPY has stayed in credential-free manual mode.</p>}
        <details className="connection-setup-guide"><summary>Configure an optional adapter</summary><div><p><b>Local</b> Add only the named variable to untracked <code>.env.local</code>: <code>SERPAPI_API_KEY</code>, <code>SEATS_AERO_API_KEY</code>, or the Booking.com Demand pair in <code>.env.example</code>.</p><p><b>Vercel</b> Add the server-side variable in Project Settings → Environment Variables, redeploy, then refresh this status. Never use a <code>NEXT_PUBLIC_*</code> variable for a provider secret.</p><p><b>Seats + Rooms</b> Eligible Seats.aero Pro keys can use cached flight search. Commercial access is required for live flight mode. Rooms.aero shares the key, but uses a separate quota and cached hotel evidence.</p><a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Open Vercel dashboard ↗</a><small>An implemented adapter, a configured credential, and verified live coverage are three different states. Gmail status is reported separately below.</small></div></details>
        {liveAccess.state === "locked" && readiness > 0 && <div className="provider-unlock"><span><Icon name="lock" /><span><b>Private live access</b><small>{liveAccess.reason}</small></span></span><form onSubmit={(event) => { event.preventDefault(); void unlockLiveAccess(); }}><input type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} maxLength={200} autoComplete="off" aria-label="Private deployment access code" placeholder="Access code" /><button disabled={!accessCode || accessState === "unlocking"}>{accessState === "unlocking" ? "Unlocking…" : "Unlock"}</button></form>{accessMessage && <p className={`state-${accessState}`}>{accessMessage}</p>}</div>}
      </section>

      <section className={`gmail-connection-card state-${gmailStatus}`}>
        <header><span className="provider-icon"><Icon name="mail" /></span><div><small>Optional private import</small><b>Gmail booking review</b><p>{gmailStatus === "checking" ? "Checking local connection state…" : gmailStatus === "disabled" ? "Disabled · OAuth is not configured" : gmailStatus === "ready" ? "Adapter ready · not connected" : gmailStatus === "connected" ? "Read-only connection active" : "Status unavailable · no connection assumed"}</p></div><em>{gmailStatus === "connected" ? "Connected" : gmailStatus === "ready" ? "Ready" : gmailStatus === "disabled" ? "Disabled" : "Optional"}</em></header>
        {gmailStatus === "disabled" && <div className="gmail-disabled"><p>Configure the server-side Google OAuth variables and callback in your local or deployment environment. No OAuth client value belongs in this browser.</p><code>GOOGLE_OAUTH_CLIENT_ID · GOOGLE_OAUTH_CLIENT_SECRET</code></div>}
        {gmailStatus === "ready" && <div className="gmail-ready"><p>Connection requests Gmail read-only access and creates review candidates only.</p><button onClick={() => void startGmail()} disabled={gmailState === "starting"}><Icon name="mail" />{gmailState === "starting" ? "Opening…" : "Connect read-only Gmail"}</button></div>}
        {gmailStatus === "connected" && <div className="gmail-preview-form"><label>Travel search<input value={gmailSearch} onChange={(event) => setGmailSearch(event.target.value)} maxLength={80} placeholder="e.g. Brussels hotel" /></label><label>After<input type="date" value={gmailAfter} onChange={(event) => setGmailAfter(event.target.value)} /></label><label>Before<input type="date" value={gmailBefore} onChange={(event) => setGmailBefore(event.target.value)} /></label><button onClick={() => void previewGmail()} disabled={gmailState === "previewing"}><Icon name="search" />{gmailState === "previewing" ? "Previewing…" : "Preview 10 messages"}</button></div>}
        {gmailMessage && <p className={`gmail-message state-${gmailState}`}>{gmailMessage}</p>}
        {gmailCandidates.length > 0 && <div className="gmail-candidates">{gmailCandidates.map((candidate) => <article key={candidate.id}><span className={`confidence-${candidate.confidence}`}>{candidate.confidence}</span><div><b>{candidate.title}</b><small>{candidate.provider} · {[candidate.originCode && candidate.destinationCode ? `${candidate.originCode} → ${candidate.destinationCode}` : null, candidate.startDate, candidate.endDate].filter(Boolean).join(" · ") || "Details require review"}</small></div><em>{candidate.duplicate ? "Possible duplicate" : candidate.conflicts.length ? "Conflict" : "Review only"}</em></article>)}</div>}
        <footer><Icon name="check" /><span>Preview only · nothing is imported, persisted, confirmed, emailed, or added to the itinerary.</span></footer>
      </section>

      <section className="connection-search">
        <div className="connection-section-label"><span>Research request</span><small>Quotes remain distinct from bookings</small></div>
        <div className="capability-switch" role="tablist" aria-label="Search capability">{(Object.keys(capabilityCopy) as ProviderSearchKind[]).map((item) => <button key={item} role="tab" aria-selected={kind === item} className={kind === item ? "active" : ""} onClick={() => { clearSearch(); setKind(item); }}><Icon name={capabilityCopy[item].icon} /><span>{capabilityCopy[item].label}</span></button>)}</div>
        <div className="connection-form">
          {(kind === "cash-flights" || kind === "award-seats") && <><label>From<input value={origin} onChange={(event) => setControl("origin", event.target.value.toUpperCase())} placeholder="Airport or city" /></label><label>To<input value={destination} onChange={(event) => setControl("destination", event.target.value.toUpperCase())} placeholder="Airport or city" /></label></>}
          {(kind === "hotels" || kind === "award-hotels" || kind === "places") && <label className="wide">Destination or query<input value={query} onChange={(event) => setControl("query", event.target.value)} placeholder={kind === "hotels" ? "e.g. Brussels city centre" : kind === "award-hotels" ? "e.g. Brussels or hotel name" : "e.g. modern art near hotel"} /></label>}
          {kind !== "places" && <label>{kind === "hotels" ? "Check-in" : kind === "award-hotels" ? "First arrival date" : "Departure date"}<input type="date" value={date} onChange={(event) => setControl("date", event.target.value)} /></label>}
          {(kind === "hotels" || kind === "award-hotels") && <label>{kind === "hotels" ? "Check-out" : "Last arrival date"}<input type="date" value={controls.endDate} onChange={(event) => setControl("endDate", event.target.value)} /></label>}
          {(kind === "cash-flights" || kind === "hotels") && <>
            <label>Adults<input type="number" min="1" max={kind === "hotels" ? 30 : 9} value={controls.adults} onChange={(event) => setControl("adults", event.target.value)} placeholder="Choose adults" /></label>
            <label>Currency<input value={controls.currency} maxLength={3} onChange={(event) => setControl("currency", event.target.value.toUpperCase())} placeholder="e.g. USD" /></label>
          </>}
          {kind === "cash-flights" && <label>Cabin<GlassSelect aria-label="Cash flight cabin" value={controls.cabin} onChange={(event) => setControl("cabin", event.target.value)}><option value="">Choose cabin</option><option value="economy">Economy</option><option value="premium-economy">Premium economy</option><option value="business">Business</option><option value="first">First</option></GlassSelect></label>}
          {kind === "hotels" && <label>Rooms<input type="number" min="1" max="9" value={controls.rooms} onChange={(event) => setControl("rooms", event.target.value)} placeholder="Choose rooms" /></label>}
          {kind === "award-seats" && <><label>Seats requested<input type="number" min="1" max="9" value={controls.seats} onChange={(event) => setControl("seats", event.target.value)} placeholder="Choose seat count" /></label><label>Program source<input value={controls.program} onChange={(event) => setControl("program", event.target.value)} placeholder="Provider program code" /></label><label>Cabin filter<input value="Not supported · all returned cabins" disabled /></label></>}
          {kind === "award-hotels" && <><label>Nights (optional, 1–5)<input type="number" min="1" max="5" value={controls.nights} onChange={(event) => setControl("nights", event.target.value)} placeholder="Provider range if blank" /></label><label>Program source (optional)<input value={controls.program} onChange={(event) => setControl("program", event.target.value)} placeholder="Provider program code" /></label><label>Guests / rooms<input value="Not supported by cached search" disabled /></label></>}
          <label>Sort<GlassSelect aria-label="Research result sort" value={sort} onChange={(event) => setSort(event.target.value as ProviderSort)}><option value="balanced">Balanced cash / time</option><option value="price">Lowest comparable cash</option><option value="time">Shortest reported time</option></GlassSelect></label>
          <button className="connection-search-button" onClick={() => void search()} disabled={searchState === "searching"}><Icon name="search" />{searchState === "searching" ? "Searching…" : "Search configured sources"}</button>
        </div>
        <p className="connection-prompt">Search fields start from available planning-profile values; blank values are unknown and require your choice. Editing them changes this request only. {seed?.profile?.childrenAges?.length ? "Child pricing is unsupported by these request contracts: adult-only results are not a full-party quote. " : ""}{kind === "award-seats" ? "Enter an explicit provider program code and seat count; no all-program search or seat availability is assumed. " : ""}{kind === "award-hotels" ? "The date range is an arrival search window, not check-in/check-out. Cached results do not verify guest/room occupancy. " : ""}</p>
        <p className="connection-prompt">{capabilityCopy[kind].prompt}. The server decides provider access; this form never asks for a key or token.</p>
      </section>

      <section className="connection-results" aria-live="polite">
        {message && <div className={`connection-message ${searchState}`}>{message}</div>}
        {results.length > 0 && <p className="connection-prompt">Sorting uses returned cash prices in {resultCurrency || "the selected currency (none selected)"} and reported duration only. Mixed price units cannot be ranked by cash; unknown and other-currency prices stay incomparable. Balanced gives equal weight to normalized cash and time when available, with unknown values last on each measure. Points, taxes, baggage and terms are not valued; ties preserve source order. Results do not establish live inventory or eligibility.</p>}
        {sortedResults.map((result) => { const saved = savedResearch.some((item) => item.provider === result.provider && item.id === result.id); return <article key={result.id} className={`provider-result${saved ? " saved" : ""}`}><div><span>{result.status || "result"} · {result.provider}</span><h3>{result.title}</h3><p>{result.subtitle}</p>{result.limitations.length > 0 && <small>{result.limitations.join(" · ")}</small>}</div><div>{result.price && <b>{displayMoney(result.price)} / {result.price.unit}</b>}{result.durationMinutes && <small>{result.durationMinutes} min reported</small>}{result.points && <b>{result.points.toLocaleString()} pts</b>}{result.checkedAt && <small>Checked {result.checkedAt}</small>}{result.href && <a href={result.href} target="_blank" rel="noreferrer">Open source ↗</a>}<button className="save-research" aria-pressed={saved} onClick={() => toggleResearchResult(result)}>{saved ? "Saved to research" : "Save to research shortlist"}</button></div></article>; })}
        {(searchState === "idle" || searchState === "manual" || searchState === "complete" && results.length === 0) && <div className="manual-search-card"><span><small>Always available</small><b>Continue manually</b><p>Open an external search, then record comparable totals in the Research workspace.</p></span><div>{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label} <Icon name="external" width="13" /></a>)}</div></div>}
        {limitations.length > 0 && <div className="provider-limitations"><b>Provider limitations</b><ul>{limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></div>}
        <section className="saved-research" aria-label="Saved research shortlist"><header><span><small>Local research shortlist</small><b>{savedResearch.length} saved · not trip items</b></span>{savedResearch.length > 0 && <button onClick={() => storeSavedResearch([])}>Clear all</button>}</header>{savedResearch.length === 0 ? <p>Save comparable evidence here without changing confirmed itinerary or booking state.</p> : <div>{savedResearch.map((item) => <article key={`${item.provider}-${item.id}`}><span><b>{item.title}</b><small>{item.provider} · {item.kind}{item.checkedAt ? ` · ${item.checkedAt}` : ""}</small></span><em>{item.price ? displayMoney(item.price) : item.points ? `${item.points.toLocaleString()} pts` : "Evidence"}</em><button aria-label={`Remove ${item.title} from research shortlist`} onClick={() => storeSavedResearch(savedResearch.filter((saved) => saved.provider !== item.provider || saved.id !== item.id))}><Icon name="close" /></button></article>)}</div>}</section>
      </section>

      <footer className="connection-privacy"><Icon name="check" /><span><b>Privacy boundary active</b><small>Configuration status only. Secret values, booking references and personal identifiers are never rendered here.</small></span></footer>
    </aside>
  </div>;
}
