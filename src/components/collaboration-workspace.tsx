"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Point } from "@/lib/planner";
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
  while (Number.isFinite(current.getTime()) && current.toISOString().slice(0, 10) <= plan.endDate && result.length < 366) {
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
  const [notice, setNotice] = useState("");
  const [cityNames, setCityNames] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [connected, setConnected] = useState(false);
  const [creationCode, setCreationCode] = useState("");
  const [draftActivity, setDraftActivity] = useState({ title: "", notes: "", cityId: "", lat: "", lng: "", duration: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const token = useRef("");
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const id = snapshot?.roomId || roomId;
  const canEdit = !busy && (!id || (connected && (snapshot?.role === "owner" || snapshot?.role === "editor")));
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
    if (!token.current) { setError("Open the invitation link to access this shared plan. This tab has no access link saved."); return; }
    let stopped = false;
    async function refresh() {
      try {
        const value: Snapshot = await responseBody(await fetch(`/api/collaboration/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token.current}` }, cache: "no-store", signal: AbortSignal.timeout(10000) }));
        if (stopped) return;
        setConnected(true);
        if (value.revision > revisionRef.current) {
          if (dirtyRef.current) setLatest(value);
          else { setPlan(value.state); setSnapshot(value); revisionRef.current = value.revision; }
        } else setSnapshot(previous => previous ? { ...previous, role: value.role } : value);
        if (value.invites) setInvites(value.invites.filter(invite => !invite.revoked));
        setError("");
      } catch (cause) { if (!stopped) { setConnected(false); setError(cause instanceof Error ? cause.message : "Could not connect. Your draft is preserved."); } }
    }
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 4000);
    return () => { stopped = true; window.clearInterval(interval); };
  }, [roomId]);

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirtyRef.current) event.preventDefault(); }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  async function loadSample() {
    setBusy(true); setError("");
    try {
      const value = await responseBody(await fetch("/api/collaboration/sample", { cache: "no-store", signal: AbortSignal.timeout(10000) }));
      update(value.state); setNotice("Public sample loaded locally. Review its dates, ideas and locations before sharing.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the public sample. Your draft is preserved."); }
    finally { setBusy(false); }
  }
  function update(value: Plan) {
    setPlan(value); setDirty(true); dirtyRef.current = true; setReview(false); setApproved(false); setNotice("");
  }
  function prepareReview() {
    if (!plan.title.trim() || !plan.startDate || !plan.endDate || plan.endDate < plan.startDate || dates(plan).length === 0) { setError("Enter a title and valid trip dates before review."); return; }
    if (!plan.cities.length) { setError("Add at least one city before review."); return; }
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
    if (!snapshot || !canEdit || !dirty || busy || latest) return;
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
    const names = cityNames.split(",").map(value => value.trim()).filter(Boolean);
    if (!names.length) return;
    update({ ...plan, cities: [...plan.cities, ...names.map(name => ({ id: crypto.randomUUID(), name }))] }); setCityNames("");
  }
  function submitActivity(event: React.FormEvent) {
    event.preventDefault();
    const cityId = draftActivity.cityId || plan.cities[0]?.id;
    if (!cityId || !draftActivity.title.trim()) { setError("Choose a city and name your activity."); return; }
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
    setEditingId(null); setDraftActivity({ title: "", notes: "", cityId, lat: "", lng: "", duration: "" }); setError("");
  }
  function assign(activityId: string, date: string) {
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
    <header className="collab-header"><Link href="/" className="collab-brand">Trippy <span>together</span></Link><nav><Link href="/plan">New trip</Link><Link href="/">Travel atlas</Link></nav></header>
    <section className="collab-hero"><p className="collab-eyebrow">A plan you can make together</p><h1>{id ? plan.title : "Good trips start with a shared idea."}</h1><p>Add places, shape each day, and invite a friend to edit with you. Shared planning contains dates, cities and activities only.</p><div className="collab-status"><span className={snapshot && connected ? "collab-dot live" : "collab-dot"} />{snapshot ? `${snapshot.role} · Version ${snapshot.revision} · ${connected ? "Updates every 4 seconds" : "Updates paused; draft preserved"}` : id ? "Connecting to shared plan…" : "Private local draft until you approve sharing"}</div></section>
    {setup && !setup.configured && <aside className="collab-banner" role="status"><strong>Live sharing needs setup</strong><p>{setup.message} You can prepare a local draft below; creating a shared room is disabled.</p></aside>}
    {error && <aside className="collab-banner error" role="alert">{error}</aside>}
    {notice && <p className="collab-banner" role="status">{notice}</p>}
    {latest && <aside className="collab-banner conflict" role="alert"><strong>A newer plan is available — version {latest.revision}</strong><p>Your unsaved edits have been preserved. Saving is paused to prevent overwriting your friend’s work.</p><details><summary>Review the latest plan</summary><pre>{JSON.stringify(latest.state, null, 2)}</pre><p>{latest.state.title} · {latest.state.activities.length} activities</p>{latest.state.activities.map(activity => <p key={activity.id}>{activity.title} — {activity.notes}</p>)}</details><button onClick={() => { setPlan(latest.state); setSnapshot(latest); revisionRef.current = latest.revision; setLatest(null); dirtyRef.current = false; setDirty(false); setError(""); setNotice("Latest plan loaded. Previous unsaved edits were discarded."); }}>Discard my edits and load latest</button></aside>}
    {(!id || snapshot) && <>
      <section className="collab-panel"><div className="collab-section-title"><h2>The trip</h2>{!id && <button onClick={() => void loadSample()} disabled={busy}>Load public Europe sample</button>}{snapshot && <button className="collab-primary" onClick={() => void save()} disabled={!canEdit || !dirty || busy || Boolean(latest)}>{busy ? "Saving…" : dirty ? "Save changes" : "All changes saved"}</button>}</div><div className="collab-fields"><label>Trip name<input value={plan.title} disabled={!canManageTrip} maxLength={160} onChange={event => update({ ...plan, title: event.target.value })} /></label><label>Start date<input type="date" value={plan.startDate} disabled={!canManageTrip} onChange={event => update({ ...plan, startDate: event.target.value, days: {} })} /></label><label>End date<input type="date" value={plan.endDate} disabled={!canManageTrip} onChange={event => update({ ...plan, endDate: event.target.value, days: {} })} /></label></div><p className="collab-muted">Changing trip dates clears day assignments; activities stay in your catalogue.</p><div className="collab-cities">{plan.cities.map(city => <span key={city.id}>{city.name}</span>)}</div>{canManageTrip && <div className="collab-inline"><label>Add cities, separated by commas<input value={cityNames} onChange={event => setCityNames(event.target.value)} placeholder="Tokyo, Kyoto, Osaka" /></label><button onClick={addCities} disabled={!cityNames.trim()}>Add cities</button></div>}</section>
      {!id && <section className="collab-panel"><h2>Ready to invite a friend?</h2><p className="collab-muted">Review exactly what you will share. Anyone holding an invitation link can access the room with its assigned role.</p><button className="collab-primary" onClick={prepareReview}>Preview shared content</button>{review && <div className="collab-review"><h3>{plan.title}</h3><p>{plan.startDate} → {plan.endDate}</p><p>{plan.cities.map(city => city.name).join(" · ")}</p>{plan.activities.map(activity => <p key={activity.id}>{activity.title}{activity.notes ? ` — ${activity.notes}` : ""}</p>)}<p>{plan.activities.length} activities · {Object.values(plan.days).flat().length} day assignments · {points.length} map locations</p><details><summary>Inspect all shared fields</summary><pre>{JSON.stringify(plan, null, 2)}</pre></details><label className="collab-check"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} />I approve sharing this planning content. It contains no booking references, seats, personal identifiers, email links or secrets.</label>{setup?.creationCodeRequired && <label>Room creation code<input type="password" autoComplete="off" value={creationCode} onChange={event => setCreationCode(event.target.value)} disabled={busy} /><span className="collab-muted">Ask the site owner for this code. It authorizes room creation and is never included in your shared plan.</span></label>}{setup?.creationAvailable === false && <p className="collab-muted">Room creation is unavailable on this host. The site owner must complete collaboration setup.</p>}<button className="collab-primary" disabled={!approved || !setup?.configured || setup.creationAvailable === false || Boolean(setup?.creationCodeRequired && !creationCode) || busy} onClick={() => void create()}>{busy ? "Creating…" : "Create shared plan"}</button></div>}</section>}
      {snapshot?.role === "owner" && connected && <section className="collab-panel"><h2>Invite your people</h2><p className="collab-muted">Editors can change the plan; viewers can follow along. Keep your owner link private. Copied invitations grant access until revoked.</p><div className="collab-actions"><button onClick={() => void invite("editor")} disabled={busy}>Copy editor invitation</button><button onClick={() => void invite("viewer")} disabled={busy}>Copy viewer invitation</button></div>{invites.map((value, index) => <div className="collab-invite" key={value.inviteId}><span>{value.role} invitation {index + 1}</span><button onClick={() => void revoke(value.inviteId)} disabled={busy}>Revoke</button></div>)}</section>}
      <div className="collab-grid"><section className="collab-panel"><div className="collab-section-title"><h2>Places & activities</h2><span>{plan.activities.length} ideas</span></div>{canEdit && <form onSubmit={submitActivity} className="collab-activity-form"><label>Activity title<input required value={draftActivity.title} maxLength={160} onChange={event => setDraftActivity({ ...draftActivity, title: event.target.value })} placeholder="A morning at the art museum" /></label><label>City<select value={draftActivity.cityId || plan.cities[0]?.id || ""} onChange={event => setDraftActivity({ ...draftActivity, cityId: event.target.value })}>{!plan.cities.length && <option value="">Add a city first</option>}{plan.cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label><label>Planning notes<textarea maxLength={1000} value={draftActivity.notes} onChange={event => setDraftActivity({ ...draftActivity, notes: event.target.value })} placeholder="Ideas and preferences only — no booking details" /></label><details><summary>Optional map location & duration</summary><div className="collab-fields"><label>Latitude<input type="number" step="any" min="-90" max="90" value={draftActivity.lat} onChange={event => setDraftActivity({ ...draftActivity, lat: event.target.value })} /></label><label>Longitude<input type="number" step="any" min="-180" max="180" value={draftActivity.lng} onChange={event => setDraftActivity({ ...draftActivity, lng: event.target.value })} /></label><label>Minutes<input type="number" min="1" max="1440" value={draftActivity.duration} onChange={event => setDraftActivity({ ...draftActivity, duration: event.target.value })} /></label></div></details><div className="collab-actions"><button className="collab-primary" type="submit" disabled={!plan.cities.length}>{editingId ? "Update activity" : "Add activity"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setDraftActivity({ title: "", notes: "", cityId: "", lat: "", lng: "", duration: "" }); }}>Cancel edit</button>}</div></form>}{!plan.activities.length && <p className="collab-empty">Your ideas live here. Add the first place you want to explore.</p>}{plan.activities.map(activity => <article className="collab-activity" key={activity.id}>{activity.image && <Image src={activity.image} alt="" width={480} height={260} className="collab-activity-photo" />}<h3>{activity.title}</h3><p className="collab-muted">{plan.cities.find(city => city.id === activity.cityId)?.name}{activity.durationMinutes ? ` · ${activity.durationMinutes} min` : ""}</p>{activity.notes && <p>{activity.notes}</p>}{activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="collab-source">View activity source ↗</a>}<label>Plan for<select disabled={!canEdit} value={Object.entries(plan.days).find(([, ids]) => ids.includes(activity.id))?.[0] || ""} onChange={event => assign(activity.id, event.target.value)}><option value="">Unscheduled idea</option>{tripDates.map(date => <option key={date} value={date}>{date}</option>)}</select></label>{canEdit && <div className="collab-actions"><button onClick={() => { setEditingId(activity.id); setDraftActivity({ title: activity.title, notes: activity.notes, cityId: activity.cityId, lat: activity.lat?.toString() || "", lng: activity.lng?.toString() || "", duration: activity.durationMinutes?.toString() || "" }); }}>Edit</button><button onClick={() => { const days = Object.fromEntries(Object.entries(plan.days).map(([date, ids]) => [date, ids.filter(value => value !== activity.id)])); update({ ...plan, activities: plan.activities.filter(value => value.id !== activity.id), days }); }}>Delete</button></div>}</article>)}</section>
      <section className="collab-panel"><div className="collab-section-title"><h2>Your days</h2><button onClick={() => setShowMap(!showMap)}>{showMap ? "Hide map" : "Show map"}</button></div>{showMap && <div className="collab-map">{points.length ? <GeographicMap points={points} basemap="city" label="Shared activity locations" /> : <p className="collab-empty">Add optional coordinates to an activity to place it on the map. Your day plan works without map access.</p>}</div>}{!tripDates.length && <p className="collab-empty">Choose your dates to start arranging days.</p>}{tripDates.map(date => <article className="collab-day" key={date}><h3>{new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}</h3>{!(plan.days[date]?.length) && <p className="collab-muted">Room to explore. Assign an idea from the catalogue.</p>}<ol>{(plan.days[date] || []).map((activityId, position, ids) => <li key={activityId}><span>{plan.activities.find(activity => activity.id === activityId)?.title}</span>{canEdit && <div><button aria-label={`Move activity ${position + 1} earlier on ${date}`} disabled={position === 0} onClick={() => move(date, position, -1)}>↑</button><button aria-label={`Move activity ${position + 1} later on ${date}`} disabled={position === ids.length - 1} onClick={() => move(date, position, 1)}>↓</button><button aria-label={`Unassign activity ${position + 1} from ${date}`} onClick={() => assign(activityId, "")}>×</button></div>}</li>)}</ol></article>)}</section></div>
    </>}
    <footer className="collab-footer">Planning ideas are recommendations. Shared rooms do not create bookings or change confirmation states.</footer>
  </main>;
}
