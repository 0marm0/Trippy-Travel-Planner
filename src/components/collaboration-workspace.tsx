"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Point } from "@/lib/planner";
import { validateCollaborationState } from "@/lib/collaboration/schema";
import BrandMark from "./brand-mark";
import "./collaboration-workspace.css";

const GeographicMap = dynamic(() => import("./geographic-map"), { ssr: false, loading: () => <p>Loading map…</p> });
type City = { id: string; name: string; lat?: number; lng?: number };
type Activity = { id: string; cityId: string; title: string; notes: string; lat?: number; lng?: number; durationMinutes?: number; image?: string; sourceUrl?: string };
type Plan = { title: string; startDate: string; endDate: string; cities: City[]; activities: Activity[]; days: Record<string, string[]> };
type Snapshot = { roomId: string; role: "owner" | "editor" | "viewer"; revision: number; state: Plan; invites?: Invite[] };
type Invite = { inviteId: string; role: "editor" | "viewer"; revoked?: boolean };
type Setup = { configured: boolean; mode: string; message: string; creationCodeRequired?: boolean; creationAvailable?: boolean };
const empty: Plan = { title: "Our next adventure", startDate: "", endDate: "", cities: [], activities: [], days: {} };
const sessionKey = (id: string) => `trippy.collaboration.${id}`;
function dates(plan: Plan) {
  if (!plan.startDate || !plan.endDate || plan.endDate < plan.startDate) return [];
  const result: string[] = [];
  const current = new Date(`${plan.startDate}T12:00:00Z`);
  while (Number.isFinite(current.getTime()) && current.toISOString().slice(0, 10) <= plan.endDate && result.length < 367) {
    result.push(current.toISOString().slice(0, 10)); current.setUTCDate(current.getUTCDate() + 1);
  }
  return result;
}
async function responseBody(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "The request could not be completed.");
  return body;
}

export default function CollaborationWorkspace({ roomId }: { roomId?: string }) {
  const router = useRouter();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [plan, setPlan] = useState<Plan>(empty);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [latest, setLatest] = useState<Snapshot | null>(null);
  const [dirty, setDirty] = useState(false);
  const [review, setReview] = useState(false);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [activityDraft, setActivityDraft] = useState(false);
  const [notice, setNotice] = useState("");
  const [cityNames, setCityNames] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [connected, setConnected] = useState(false);
  const [creationCode, setCreationCode] = useState("");
  const [draftActivity, setDraftActivity] = useState({ title: "", notes: "", cityId: "", lat: "", lng: "", duration: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const token = useRef("");
  const activityDraftRef = useRef(false);
  const activityForm = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const id = snapshot?.roomId || roomId;
  const hasEditRole = !id || snapshot?.role === "owner" || snapshot?.role === "editor";
  const canEdit = !busy && hasEditRole && (!id || connected);
  const canManageTrip = canEdit && (!id || snapshot?.role === "owner");

  useEffect(() => {
    let stopped = false;
    fetch("/api/collaboration/status", { cache: "no-store", signal: AbortSignal.timeout(10000) }).then(responseBody).then(value => { if (!stopped) setSetup(value); }).catch(() => { if (!stopped) setSetup({ configured: false, mode: "disabled", message: "Shared planning is unavailable. Your local draft remains editable." }); });
    return () => { stopped = true; };
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const incoming = fragment.get("token");
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    try {
      if (incoming) window.sessionStorage.setItem(sessionKey(roomId), incoming);
      token.current = incoming || window.sessionStorage.getItem(sessionKey(roomId)) || "";
    } catch { token.current = incoming || ""; }
    if (!token.current) { setConnectionError("Open the invitation link to access this shared plan. This tab has no access link saved."); return; }
    let stopped = false;
    let refreshing = false;
    async function refresh() {
      if (refreshing || stopped) return;
      refreshing = true;
      try {
        const value: Snapshot = await responseBody(await fetch(`/api/collaboration/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token.current}` }, cache: "no-store", signal: AbortSignal.timeout(10000) }));
        if (stopped) return;
        setConnected(true);
        if (value.revision > revisionRef.current) {
          if (dirtyRef.current || activityDraftRef.current) { setLatest(value); setSnapshot(previous => previous ? { ...previous, role: value.role } : value); }
          else { setPlan(value.state); setSnapshot(value); revisionRef.current = value.revision; }
        } else setSnapshot(previous => previous ? { ...previous, role: value.role } : value);
        if (value.invites) setInvites(value.invites.filter(invite => !invite.revoked));
        setConnectionError("");
      } catch (cause) { if (!stopped) { setConnected(false); setConnectionError(cause instanceof Error ? cause.message : "Could not connect. Your draft is preserved."); } }
      finally { refreshing = false; }
    }
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 4000);
    return () => { stopped = true; window.clearInterval(interval); };
  }, [roomId]);

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirtyRef.current || activityDraftRef.current) event.preventDefault(); }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function confirmNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if ((dirtyRef.current || activityDraftRef.current) && !window.confirm("Leave this shared board? Unsaved board changes and unfinished activity edits will be lost.")) event.preventDefault();
  }
  function changeActivity(value: typeof draftActivity) {
    setDraftActivity(value); setActivityDraft(true); activityDraftRef.current = true;
    setReview(false); setApproved(false);
  }
  function resetActivity() {
    setEditingId(null); setDraftActivity({ title: "", notes: "", cityId: "", lat: "", lng: "", duration: "" });
    setActivityDraft(false); activityDraftRef.current = false;
  }
  function beginEdit(activity: Activity) {
    if (activityDraftRef.current && !window.confirm("Discard your unfinished activity draft and edit this idea?")) return;
    setEditingId(activity.id);
    changeActivity({ title: activity.title, notes: activity.notes, cityId: activity.cityId, lat: activity.lat?.toString() || "", lng: activity.lng?.toString() || "", duration: activity.durationMinutes?.toString() || "" });
    requestAnimationFrame(() => { activityForm.current?.scrollIntoView({ behavior: "instant", block: "start" }); activityForm.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }); });
  }
  function changeDate(field: "startDate" | "endDate", value: string) {
    const next = { ...plan, [field]: value };
    if (next.startDate && next.endDate && next.endDate >= next.startDate) {
      next.days = Object.fromEntries(Object.entries(plan.days).filter(([date]) => date >= next.startDate && date <= next.endDate));
    }
    update(next);
  }
  function downloadDraft() {
    try {
      const safe = validateCollaborationState(plan);
      const url = URL.createObjectURL(new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "shared-plan-draft.json"; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Your share-safe board draft was downloaded. Unfinished activity form edits stay in this tab.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Remove unsupported or private fields before downloading this board."); }
  }
  function discardAndLoadLatest() {
    if (!latest || !window.confirm("Discard all your unsaved board changes and unfinished activity edits, and load your friend’s latest plan?")) return;
    setPlan(latest.state); setSnapshot(latest); revisionRef.current = latest.revision; setLatest(null);
    dirtyRef.current = false; setDirty(false); resetActivity(); setReview(false); setApproved(false); setError("");
    setNotice("Latest plan loaded. Previous unsaved edits were discarded.");
  }
  async function loadSample() {
    if ((dirtyRef.current || activityDraftRef.current) && !window.confirm("Replace your local board and unfinished activity with the public sample?")) return;
    setBusy(true); setError("");
    try {
      const value = await responseBody(await fetch("/api/collaboration/sample", { cache: "no-store", signal: AbortSignal.timeout(10000) }));
      update(value.state); resetActivity(); setNotice("Public sample loaded locally. Review its dates, ideas and locations before sharing.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the public sample. Your draft is preserved."); }
    finally { setBusy(false); }
  }
  function update(value: Plan) {
    setPlan(value); setDirty(true); dirtyRef.current = true; setReview(false); setApproved(false); setNotice("");
  }
  function prepareReview() {
    if (activityDraftRef.current) { setError("Add or update your unfinished activity, or cancel it, before reviewing the shared board."); return; }
    if (!plan.title.trim() || !plan.startDate || !plan.endDate || plan.endDate < plan.startDate || dates(plan).length === 0) { setError("Enter a title and valid trip dates before review."); return; }
    if (!plan.cities.length) { setError("Add at least one city before review."); return; }
    try { validateCollaborationState(plan); } catch (cause) { setError(cause instanceof Error ? cause.message : "Check your shared fields before review."); return; }
    setError(""); setReview(true); setApproved(false);
  }
  async function create() {
    if (!approved || !setup?.configured || setup.creationAvailable === false) return;
    if (setup.creationCodeRequired && !creationCode) { setError("Enter the room creation code supplied by this site’s owner."); return; }
    setBusy(true); setError("");
    try {
      const value = await responseBody(await fetch("/api/collaboration/rooms", { method: "POST", headers: { "Content-Type": "application/json", ...(setup.creationCodeRequired ? { "X-Trippy-Create-Code": creationCode } : {}) }, body: JSON.stringify({ state: plan }), signal: AbortSignal.timeout(30000) }));
      setCreationCode("");
      token.current = value.ownerToken;
      try { window.sessionStorage.setItem(sessionKey(value.roomId), value.ownerToken); } catch { /* Keep capability in memory until navigation. */ }
      // A fragment is never sent to the server; the room screen consumes and removes it.
      dirtyRef.current = false; setDirty(false);
      router.push(`/collaborate/${value.roomId}#token=${encodeURIComponent(value.ownerToken)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create a room. Your local draft is preserved."); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!snapshot || !canEdit || !dirty || busy || latest || activityDraftRef.current) return;
    try { validateCollaborationState(plan); } catch (cause) { setError(cause instanceof Error ? cause.message : "Check your shared fields before saving."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/collaboration/rooms/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}`, "If-Match": String(snapshot.revision) }, body: JSON.stringify({ state: plan }), signal: AbortSignal.timeout(30000) });
      if (response.status === 412) { const body = await response.json(); setLatest(body.latest || (body.state ? body : null)); setError("A friend saved a newer version. Your edits are still here; review the latest plan before saving."); return; }
      const value: Snapshot = await responseBody(response);
      setSnapshot(value); setPlan(value.state); revisionRef.current = value.revision; dirtyRef.current = false; setDirty(false); setNotice("Saved. Everyone in this room will receive the update.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Save failed. Your draft is preserved."); }
    finally { setBusy(false); }
  }
  async function invite(role: "editor" | "viewer") {
    if (!snapshot || snapshot.role !== "owner") return;
    setBusy(true); setError("");
    try {
      const value = await responseBody(await fetch(`/api/collaboration/rooms/${id}/invites`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}` }, body: JSON.stringify({ role }), signal: AbortSignal.timeout(30000) }));
      setInvites(previous => [...previous, { inviteId: value.inviteId, role }]);
      const link = `${window.location.origin}/collaborate/${id}#token=${encodeURIComponent(value.token)}`;
      try { await navigator.clipboard.writeText(link); setNotice(`${role === "editor" ? "Editor" : "Viewer"} invitation copied. Anyone with it can access this plan until revoked.`); }
      catch { setError("Clipboard access is unavailable. The invitation was created; revoke it below and retry in a browser with clipboard access."); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create an invitation."); }
    finally { setBusy(false); }
  }
  async function revoke(inviteId: string) {
    setBusy(true); setError("");
    try {
      await responseBody(await fetch(`/api/collaboration/rooms/${id}/invites/${inviteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token.current}` }, signal: AbortSignal.timeout(30000) }));
      setInvites(previous => previous.filter(value => value.inviteId !== inviteId)); setNotice("Invitation revoked. That link can no longer access this plan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not revoke the invitation."); }
    finally { setBusy(false); }
  }
  function addCities() {
    const existing = new Set(plan.cities.map(city => city.name.toLocaleLowerCase()));
    const names = cityNames.split(",").map(value => value.trim()).filter(name => { if (!name || existing.has(name.toLocaleLowerCase())) return false; existing.add(name.toLocaleLowerCase()); return true; });
    if (!names.length) { setCityNames(""); return; }
    if (plan.cities.length + names.length > 50 || names.some(name => name.length > 100)) { setError("Use at most 50 cities, with names of up to 100 characters."); return; }
    update({ ...plan, cities: [...plan.cities, ...names.map(name => ({ id: crypto.randomUUID(), name }))] }); setCityNames("");
  }
  function submitActivity(event: React.FormEvent) {
    event.preventDefault();
    if (!canEdit) return;
    const cityId = draftActivity.cityId || plan.cities[0]?.id;
    if (!cityId || !plan.cities.some(city => city.id === cityId) || !draftActivity.title.trim()) { setError("Choose a city and name your activity."); return; }
    if (editingId && !plan.activities.some(activity => activity.id === editingId)) { setError("This activity is no longer on the board. Cancel your edit and add it as a new idea."); return; }
    if (!editingId && plan.activities.length >= 500) { setError("This board already has 500 activities. Remove an idea before adding another."); return; }
    const activity: Activity = { ...(plan.activities.find(value => value.id === editingId) || {}), id: editingId || crypto.randomUUID(), cityId, title: draftActivity.title.trim(), notes: draftActivity.notes.trim() };
    delete activity.lat; delete activity.lng; delete activity.durationMinutes;
    if (draftActivity.lat || draftActivity.lng) {
      const lat = Number(draftActivity.lat), lng = Number(draftActivity.lng);
      if (!draftActivity.lat || !draftActivity.lng || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { setError("Enter both latitude (−90 to 90) and longitude (−180 to 180)."); return; }
      activity.lat = lat; activity.lng = lng;
    }
    if (draftActivity.duration) {
      const duration = Number(draftActivity.duration);
      if (!Number.isInteger(duration) || duration < 1 || duration > 1440) { setError("Duration must be 1–1440 whole minutes."); return; }
      activity.durationMinutes = duration;
    }
    update({ ...plan, activities: editingId ? plan.activities.map(value => value.id === editingId ? activity : value) : [...plan.activities, activity] });
    resetActivity(); setError("");
  }
  function assign(activityId: string, date: string) {
    if (date && (plan.days[date]?.length || 0) >= 50) { setError("A day can contain up to 50 ideas. Choose another day or unschedule an idea first."); return; }
    const days = Object.fromEntries(Object.entries(plan.days).map(([day, ids]) => [day, ids.filter(value => value !== activityId)]));
    if (date) days[date] = [...(days[date] || []), activityId];
    update({ ...plan, days });
  }
  function move(date: string, position: number, direction: number) {
    const ids = [...plan.days[date]]; const target = position + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[position], ids[target]] = [ids[target], ids[position]]; update({ ...plan, days: { ...plan.days, [date]: ids } });
  }
  const tripDates = dates(plan);
  const points: Point[] = [...plan.cities.map(city => ({ ...city, category: "city" })), ...plan.activities.map(activity => ({ ...activity, name: activity.title, category: "activity" }))].filter((point): point is typeof point & { lat: number; lng: number } => typeof point.lat === "number" && typeof point.lng === "number").map(point => ({ id: point.id, name: point.name, lat: point.lat, lng: point.lng, category: point.category }));

  return <main className="collab-shell">
    <header className="collab-header"><Link href="/" onClick={confirmNavigation} className="collab-brand"><span className="collab-brand-mark"><BrandMark /></span><span className="collab-brand-copy">Trippy<span>Plan together</span></span></Link><nav aria-label="Planner navigation"><Link href="/plan" onClick={confirmNavigation}>New trip</Link><Link href="/" onClick={confirmNavigation}>Travel atlas</Link></nav></header>
    <section className="collab-hero"><p className="collab-eyebrow">A plan you can make together</p><h1>{id ? plan.title : "Good trips start with a shared idea."}</h1><p>Add places, shape each day, and invite a friend to edit with you. Shared planning contains dates, cities and activities only.</p><div className="collab-status"><span className={snapshot && connected ? "collab-dot live" : "collab-dot"} />{snapshot ? `${snapshot.role} · Version ${snapshot.revision} · ${connected ? "Updates every 4 seconds" : "Updates paused; draft preserved"}` : id ? "Connecting to shared plan…" : "Private local draft until you approve sharing"}</div></section>
    {setup && !setup.configured && <aside className="collab-banner" role="status"><strong>Live sharing needs setup</strong><p>{setup.message} You can prepare a local draft below; creating a shared room is disabled.</p></aside>}
    {connectionError && <aside className="collab-banner error" role="alert">{connectionError}</aside>}
    {error && <aside className="collab-banner error" role="alert">{error}</aside>}
    {notice && <p className="collab-banner" role="status">{notice}</p>}
    {latest && <aside className="collab-banner conflict" role="alert"><strong>A newer plan is available — version {latest.revision}</strong><p>Your unsaved edits have been preserved. Saving is paused to prevent overwriting your friend’s work.</p><details><summary>Review the latest plan</summary><pre>{JSON.stringify(latest.state, null, 2)}</pre><p>{latest.state.title} · {latest.state.activities.length} activities</p>{latest.state.activities.map(activity => <p key={activity.id}>{activity.title} — {activity.notes}</p>)}</details><p>Keep this tab open to retain your unfinished activity. You can download your validated board draft before discarding changes; unfinished form fields are excluded.</p><div className="collab-actions"><button onClick={downloadDraft}>Download my board draft</button><button onClick={discardAndLoadLatest}>Discard my edits and load latest</button></div></aside>}
    {(!id || snapshot) && <>
      <section className="collab-panel"><div className="collab-section-title"><h2>The trip</h2>{!id && <button onClick={() => void loadSample()} disabled={busy}>Load public Europe sample</button>}{snapshot && <button className="collab-primary" onClick={() => void save()} disabled={!canEdit || !dirty || busy || Boolean(latest) || activityDraft}>{busy ? "Working…" : activityDraft ? "Finish activity edit first" : dirty ? "Save changes" : "All changes saved"}</button>}</div><div className="collab-fields"><label>Trip name<input value={plan.title} disabled={!canManageTrip} maxLength={160} onChange={event => update({ ...plan, title: event.target.value })} /></label><label>Start date<input type="date" value={plan.startDate} disabled={!canManageTrip} onChange={event => changeDate("startDate", event.target.value)} /></label><label>End date<input type="date" value={plan.endDate} disabled={!canManageTrip} onChange={event => changeDate("endDate", event.target.value)} /></label></div><p className="collab-muted">Day assignments within your dates are preserved. Ideas outside a changed date range return to the catalogue.</p><div className="collab-cities">{plan.cities.map(city => <span key={city.id}>{city.name}</span>)}</div>{canManageTrip && <div className="collab-inline"><label>Add cities, separated by commas<input value={cityNames} onChange={event => setCityNames(event.target.value)} placeholder="Tokyo, Kyoto, Osaka" /></label><button onClick={addCities} disabled={!cityNames.trim()}>Add cities</button></div>}</section>
      {!id && <section className="collab-panel"><h2>Ready to invite a friend?</h2><p className="collab-muted">Review exactly what you will share. Anyone holding an invitation link can access the room with its assigned role.</p><button className="collab-primary" onClick={prepareReview}>Preview shared content</button>{review && <div className="collab-review"><h3>{plan.title}</h3><p>{plan.startDate} → {plan.endDate}</p><p>{plan.cities.map(city => city.name).join(" · ")}</p>{plan.activities.map(activity => <p key={activity.id}>{activity.title}{activity.notes ? ` — ${activity.notes}` : ""}</p>)}<p>{plan.activities.length} activities · {Object.values(plan.days).flat().length} day assignments · {points.length} map locations</p><details><summary>Inspect all shared fields</summary><pre>{JSON.stringify(plan, null, 2)}</pre></details><label className="collab-check"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} />I approve sharing this planning content. It contains no booking references, seats, personal identifiers, email links or secrets.</label>{setup?.creationCodeRequired && <label>Room creation code<input type="password" autoComplete="off" value={creationCode} onChange={event => setCreationCode(event.target.value)} disabled={busy} /><span className="collab-muted">Ask the site owner for this code. It authorizes room creation and is never included in your shared plan.</span></label>}{setup?.creationAvailable === false && <p className="collab-muted">Room creation is unavailable on this host. The site owner must complete collaboration setup.</p>}<button className="collab-primary" disabled={!approved || !setup?.configured || setup.creationAvailable === false || Boolean(setup?.creationCodeRequired && !creationCode) || busy} onClick={() => void create()}>{busy ? "Creating…" : "Create shared plan"}</button></div>}</section>}
      {snapshot?.role === "owner" && connected && <section className="collab-panel"><h2>Invite your people</h2><p className="collab-muted">Editors can change the plan; viewers can follow along. Keep your owner link private. Copied invitations grant access until revoked.</p><div className="collab-actions"><button onClick={() => void invite("editor")} disabled={busy}>Copy editor invitation</button><button onClick={() => void invite("viewer")} disabled={busy}>Copy viewer invitation</button></div>{invites.map((value, index) => <div className="collab-invite" key={value.inviteId}><span>{value.role} invitation {index + 1}</span><button onClick={() => void revoke(value.inviteId)} disabled={busy}>Revoke</button></div>)}</section>}
      <div className="collab-grid"><section className="collab-panel"><div className="collab-section-title"><h2>Places & activities</h2><span>{plan.activities.length} ideas</span></div>{hasEditRole && <form ref={activityForm} onSubmit={submitActivity} className="collab-activity-form"><fieldset disabled={!canEdit}><div className="collab-form-heading"><h3>{editingId ? "Edit your idea" : "Add a new idea"}</h3>{activityDraft && <span>Unfinished draft</span>}</div><label>Activity title<input required value={draftActivity.title} maxLength={160} onChange={event => changeActivity({ ...draftActivity, title: event.target.value })} placeholder="A morning at the art museum" /></label><label>City<select value={draftActivity.cityId || plan.cities[0]?.id || ""} onChange={event => changeActivity({ ...draftActivity, cityId: event.target.value })}>{!plan.cities.length && <option value="">Add a city first</option>}{plan.cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label><label>Planning notes<textarea aria-label="Planning notes" maxLength={1000} value={draftActivity.notes} onChange={event => changeActivity({ ...draftActivity, notes: event.target.value })} placeholder="Ideas and preferences only — no booking details" /></label><details><summary>Optional map location & duration</summary><div className="collab-fields"><label>Latitude<input type="number" step="any" min="-90" max="90" value={draftActivity.lat} onChange={event => changeActivity({ ...draftActivity, lat: event.target.value })} /></label><label>Longitude<input type="number" step="any" min="-180" max="180" value={draftActivity.lng} onChange={event => changeActivity({ ...draftActivity, lng: event.target.value })} /></label><label>Minutes<input type="number" min="1" max="1440" value={draftActivity.duration} onChange={event => changeActivity({ ...draftActivity, duration: event.target.value })} /></label></div></details><div className="collab-actions"><button className="collab-primary" type="submit" disabled={!plan.cities.length}>{editingId ? "Update activity" : "Add activity"}</button>{activityDraft && <button type="button" onClick={resetActivity}>{editingId ? "Cancel edit" : "Clear draft"}</button>}</div></fieldset></form>}{!plan.activities.length && <p className="collab-empty">Your ideas live here. Add the first place you want to explore.</p>}{plan.activities.map(activity => <article className="collab-activity" key={activity.id}>{activity.image && <Image src={activity.image} alt="" width={480} height={260} className="collab-activity-photo" />}<h3>{activity.title}</h3><p className="collab-muted">{plan.cities.find(city => city.id === activity.cityId)?.name}{activity.durationMinutes ? ` · ${activity.durationMinutes} min` : ""}</p>{activity.notes && <p>{activity.notes}</p>}{activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="collab-source">View activity source ↗</a>}<label>Plan for<span className="collab-sr-only"> {activity.title}</span><select disabled={!canEdit} value={Object.entries(plan.days).find(([, ids]) => ids.includes(activity.id))?.[0] || ""} onChange={event => assign(activity.id, event.target.value)}><option value="">Unscheduled idea</option>{tripDates.map(date => <option key={date} value={date}>{date}</option>)}</select></label>{canEdit && <div className="collab-actions"><button onClick={() => beginEdit(activity)}>Edit</button><button aria-label={`Delete ${activity.title}`} onClick={() => { if (!window.confirm(`Remove “${activity.title}” from this board and all days?`)) return; if (editingId === activity.id) resetActivity(); const days = Object.fromEntries(Object.entries(plan.days).map(([date, ids]) => [date, ids.filter(value => value !== activity.id)])); update({ ...plan, activities: plan.activities.filter(value => value.id !== activity.id), days }); }}>Delete</button></div>}</article>)}</section>
      <section className="collab-panel"><div className="collab-section-title"><h2>Your days</h2><button aria-expanded={showMap} aria-controls="collab-map" onClick={() => setShowMap(!showMap)}>{showMap ? "Hide map" : "Show map"}</button></div>{showMap && <div id="collab-map" className="collab-map">{points.length ? <GeographicMap points={points} basemap="city" label="Shared activity locations" /> : <p className="collab-empty">Add optional coordinates to an activity to place it on the map. Your day plan works without map access.</p>}</div>}{!tripDates.length && <p className="collab-empty">Choose your dates to start arranging days.</p>}{tripDates.map(date => <article className="collab-day" key={date}><h3>{new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}</h3>{!(plan.days[date]?.length) && <p className="collab-muted">Room to explore. Assign an idea from the catalogue.</p>}<ol>{(plan.days[date] || []).map((activityId, position, ids) => <li key={activityId}><span>{plan.activities.find(activity => activity.id === activityId)?.title}</span>{canEdit && <div><button aria-label={`Move ${plan.activities.find(activity => activity.id === activityId)?.title || "activity"} earlier on ${date}`} disabled={position === 0} onClick={() => move(date, position, -1)}>↑</button><button aria-label={`Move ${plan.activities.find(activity => activity.id === activityId)?.title || "activity"} later on ${date}`} disabled={position === ids.length - 1} onClick={() => move(date, position, 1)}>↓</button><button aria-label={`Unassign ${plan.activities.find(activity => activity.id === activityId)?.title || "activity"} from ${date}`} onClick={() => assign(activityId, "")}>×</button></div>}</li>)}</ol></article>)}</section></div>
    </>}
    <footer className="collab-footer">Planning ideas are recommendations. Shared rooms do not create bookings or change confirmation states.</footer>
  </main>;
}
