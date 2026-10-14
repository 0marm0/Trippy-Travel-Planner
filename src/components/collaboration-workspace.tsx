"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Point } from "@/lib/planner";
import { validateCollaborationState } from "@/lib/collaboration/schema";
import { reconciliationChanges, resolveReconciliation, recoveryKey, parseRecovery, serializeRecovery, type Choice, type RecoverableBoard, type ReconciliationChange } from "@/lib/collaboration/reconciliation";
import RoomLifecycle from "./room-lifecycle";
import DetailDrawer from "./detail-drawer";
import { parseRoomAccessFragment } from "@/lib/collaboration/access-fragment";
import { reviewCollaborationSuggestion } from "@/lib/collaboration/suggestions";
import type { CollaborationState, CollaborationSuggestion } from "@/lib/collaboration/schema";
import BrandMark from "./brand-mark";
import "./collaboration-workspace.css";

const GeographicMap = dynamic(() => import("./geographic-map"), { ssr: false, loading: () => <p>Loading map…</p> });
type Activity = { id: string; cityId: string; title: string; notes: string; lat?: number; lng?: number; durationMinutes?: number; image?: string; sourceUrl?: string };
type Plan = CollaborationState;
type Snapshot = { roomId: string; role: "owner" | "editor" | "viewer"; revision: number; state: Plan; invites?: Invite[] };
type Invite = { inviteId: string; role: "editor" | "viewer"; revoked?: boolean; expiresAt?: string | null; expired?: boolean };
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
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [catalogueCity, setCatalogueCity] = useState("");
  const [boardDay, setBoardDay] = useState("");
  const [allDays, setAllDays] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [creationCode, setCreationCode] = useState("");
  const [draftActivity, setDraftActivity] = useState({ title: "", notes: "", cityId: "", lat: "", lng: "", duration: "" });
  const [retainDraft, setRetainDraft] = useState(false);
  const [recovered, setRecovered] = useState<RecoverableBoard | null>(null);
  const [recoveryStatus, setRecoveryStatus] = useState("");
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<Plan | null>(null);
  const [reconciliation, setReconciliation] = useState<{ base: Plan; local: Plan; latest: Snapshot; changes: ReconciliationChange[]; choices: Record<string, Choice> } | null>(null);
  const [inviteReview, setInviteReview] = useState<"editor" | "viewer" | null>(null);
  const [inviteDays, setInviteDays] = useState(7);
  const [activityOpen, setActivityOpen] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [proposalDay, setProposalDay] = useState("");
  const [daySuggestion, setDaySuggestion] = useState<{ activityId: string; day: string } | null>(null);
  const [discussionId, setDiscussionId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const commentDraftRef = useRef("");
  const commentTargetRef = useRef("");
  const [reviewSuggestionId, setReviewSuggestionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const token = useRef("");
  const [accessToken, setAccessToken] = useState("");
  const activityDraftRef = useRef(false);
  const activityForm = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  const closedRef = useRef(false);
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
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(recoveryKey(roomId));
        if (raw) { setRecovered(parseRecovery(raw, roomId)); setRecoveryStatus("A validated board draft is available. Review it before restoring."); }
      } catch { try { window.localStorage.removeItem(recoveryKey(roomId)); } catch { /* Storage unavailable. */ } setRecoveryStatus("Invalid saved board draft or unavailable storage. No draft was restored."); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [roomId]);

  useEffect(() => {
    if (!retainDraft) return;
    let status = "Validated board retained on this device. Unfinished forms and access links are excluded.";
    try {
      window.localStorage.setItem(recoveryKey(roomId), serializeRecovery(plan, snapshot?.state || null, snapshot?.revision || 0, roomId));
    } catch {
      try { window.localStorage.removeItem(recoveryKey(roomId)); } catch { /* Storage unavailable. */ }
      status = "This draft is invalid or storage is unavailable; it is not retained. Fix the board or download a validated copy.";
    }
    const timer = window.setTimeout(() => setRecoveryStatus(status), 0);
    return () => window.clearTimeout(timer);
  }, [retainDraft, plan, snapshot, roomId]);

  function toggleRetention(enabled: boolean) {
    setRetainDraft(enabled);
    if (!enabled) { try { window.localStorage.removeItem(recoveryKey(roomId)); } catch { /* Storage unavailable. */ } setRecovered(null); setRecoveryStatus("Device recovery cleared."); }
  }
  function restoreRecovered() {
    if (!recovered || busy || (roomId && (!snapshot || !connected || snapshot.role === "viewer"))) return;
    if ((dirtyRef.current || activityDraftRef.current || Boolean(commentDraftRef.current.trim())) && !window.confirm("Replace this tab’s unsaved changes with the reviewed recovery draft?")) return;
    update(recovered.state); resetActivity();
    if (snapshot && recovered.base) {
      const current = latest || snapshot;
      setSnapshot({ ...current, revision: recovered.revision, state: recovered.base }); revisionRef.current = recovered.revision;
      setLatest(current.revision !== recovered.revision ? current : null);
    }
    setRecovered(null); setRetainDraft(true); setNotice("Board draft restored locally. Review conflicts and save explicitly when ready.");
  }
  function previewImport() {
    try {
      if (importText.length > 600000) throw new Error("Board JSON is too large.");
      setImportPreview(validateCollaborationState(JSON.parse(importText))); setError("");
    } catch { setImportPreview(null); setError("Invalid share-safe board JSON. Remove unsupported fields, private identifiers and invalid assignments."); }
  }
  function applyImport() {
    if (!importPreview || !canManageTrip) return;
    if ((dirtyRef.current || activityDraftRef.current || Boolean(commentDraftRef.current.trim())) && !window.confirm("Replace this tab’s board and unfinished form with this reviewed import?")) return;
    update(validateCollaborationState(importPreview)); resetActivity(); setImportPreview(null); setImportText(""); setNotice("Reviewed board imported into your local draft. Nothing has been published or saved to the room.");
  }
  function prepareReconciliation() {
    if (!snapshot || !latest || !canEdit) return;
    if (activityDraftRef.current) { setError("Finish or cancel the unfinished activity before reconciling."); return; }
    try {
      const changes = reconciliationChanges(snapshot.state, plan, latest.state);
      setReconciliation({ base: snapshot.state, local: plan, latest, changes, choices: Object.fromEntries(changes.filter(change => !change.conflict).map(change => [change.key, change.suggested])) }); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Validate your draft before reconciling."); }
  }
  function applyReconciliation() {
    if (!reconciliation || !latest || !canEdit) return;
    if (latest.revision !== reconciliation.latest.revision || JSON.stringify(plan) !== JSON.stringify(reconciliation.local)) { setReconciliation(null); setError("The board changed during review. Review reconciliation again."); return; }
    try {
      const merged = resolveReconciliation(reconciliation.base, reconciliation.local, reconciliation.latest.state, reconciliation.choices);
      update(merged); setSnapshot(latest); revisionRef.current = latest.revision; setLatest(null); setReconciliation(null); setNotice("Chosen changes applied locally. Save explicitly against this reviewed revision; another concurrent change will pause saving again."); setError("");
    } catch { setError("The chosen combination is invalid. Check deleted city/activity references, date ranges and activities assigned to multiple days; choose compatible values before applying."); }
  }

  useEffect(() => {
    if (!roomId) return;
    let stopped = false;
    let refreshing = false;
    let accessGeneration = 0;
    let controller: AbortController | null = null;
    let pendingAccess: string | null = null;
    let accessChanged = false;
    const hasDraft = () => dirtyRef.current || activityDraftRef.current || Boolean(commentDraftRef.current.trim());
    function applyAccess(incoming: string) {
      accessGeneration++; controller?.abort(); refreshing = false;
      token.current = incoming; accessChanged = true;
      try { window.sessionStorage.setItem(sessionKey(roomId!), incoming); } catch { /* The active tab can still use the invitation. */ }
      setConnected(false); setAccessToken(""); setInvites([]); setInviteReview(null); setReconciliation(null);
      setNotice(hasDraft() ? "Room access changed. Your board and unfinished forms are preserved; review the current role and latest board before saving." : "Checking the new room access…");
    }
    async function refresh() {
      if (stopped || busyRef.current || closedRef.current) return;
      if (pendingAccess !== null) { const incoming = pendingAccess; pendingAccess = null; applyAccess(incoming); }
      if (refreshing || !token.current) return;
      refreshing = true;
      const generation = accessGeneration;
      const requestedAccess = token.current;
      const requestController = new AbortController(); controller = requestController;
      try {
        const value: Snapshot = await responseBody(await fetch(`/api/collaboration/rooms/${roomId}`, { headers: { Authorization: `Bearer ${requestedAccess}` }, cache: "no-store", signal: AbortSignal.any([requestController.signal, AbortSignal.timeout(10000)]) }));
        if (stopped || generation !== accessGeneration || requestedAccess !== token.current || busyRef.current || closedRef.current) return;
        setConnected(true); setAccessToken(requestedAccess);
        if (accessChanged || value.revision > revisionRef.current) {
          if (hasDraft()) { setLatest(value); setSnapshot(previous => previous ? { ...previous, role: value.role } : value); }
          else { setPlan(value.state); setSnapshot(value); revisionRef.current = value.revision; setLatest(null); }
        } else setSnapshot(previous => previous ? { ...previous, role: value.role } : value);
        if (accessChanged) setNotice(hasDraft() ? "New room role loaded. Your unsaved board and forms are preserved. Review the latest board before saving; viewer access cannot write." : "New room role and current board loaded.");
        accessChanged = false;
        setInvites(value.invites?.filter(invite => !invite.revoked) || []);
        setConnectionError("");
      } catch (cause) {
        if (!stopped && generation === accessGeneration && requestedAccess === token.current && !busyRef.current && !closedRef.current && !requestController.signal.aborted) { setConnected(false); setConnectionError(cause instanceof Error ? cause.message : "Could not connect. Your draft is preserved."); }
      } finally { if (generation === accessGeneration) refreshing = false; }
    }
    function consumeFragment(initial = false) {
      const fragment = parseRoomAccessFragment(window.location.hash);
      // Remove capabilities even when malformed; do not leave them in visible browser history.
      if (fragment.present) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      if (fragment.present && !fragment.capability) { setConnectionError("The invitation fragment is invalid. Existing access and drafts were preserved."); return; }
      if (fragment.capability) pendingAccess = null; // The latest invitation supersedes any queued switch.
      if (fragment.capability && fragment.capability !== token.current) {
        if (busyRef.current) { pendingAccess = fragment.capability; setConnected(false); setNotice("New room access will be checked after the current operation finishes. Your draft is preserved."); return; }
        applyAccess(fragment.capability);
      } else if (initial && !token.current) {
        try { const saved = window.sessionStorage.getItem(sessionKey(roomId!)); if (saved && /^[a-zA-Z0-9_-]{43}$/.test(saved)) token.current = saved; } catch { /* Invitation links remain usable without storage. */ }
      }
      if (!token.current) { setConnectionError("Open the invitation link to access this shared plan. This tab has no access link saved."); return; }
      void refresh();
    }
    const onHashChange = () => consumeFragment();
    consumeFragment(true);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    const interval = window.setInterval(() => { void refresh(); }, 4000);
    return () => { stopped = true; controller?.abort(); window.clearInterval(interval); window.removeEventListener("hashchange", onHashChange); window.removeEventListener("popstate", onHashChange); };
  }, [roomId]);

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirtyRef.current || activityDraftRef.current || Boolean(commentDraftRef.current.trim())) event.preventDefault(); }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function confirmNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if ((dirtyRef.current || activityDraftRef.current || Boolean(commentDraftRef.current.trim())) && !window.confirm("Leave this shared board? Unfinished activity edits are not retained. Board changes can be recovered only if device recovery is enabled and the board is valid.")) event.preventDefault();
  }
  function changeActivity(value: typeof draftActivity) {
    setDraftActivity(value); setActivityDraft(true); activityDraftRef.current = true;
    setReview(false); setApproved(false);
  }
  function resetActivity() {
    setActivityOpen(false); setProposing(false); setProposalDay("");
    setEditingId(null); setDraftActivity({ title: "", notes: "", cityId: "", lat: "", lng: "", duration: "" });
    setActivityDraft(false); activityDraftRef.current = false;
  }
  function beginEdit(activity: Activity) {
    if (activityDraftRef.current && !window.confirm("Discard your unfinished activity draft and edit this idea?")) return;
    setActivityOpen(true); setProposing(false);
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
      setNotice("Your share-safe board draft was downloaded. Unfinished activity form edits are excluded; you can preview and import the board JSON here later.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Remove unsupported or private fields before downloading this board."); }
  }
  function discardAndLoadLatest() {
    if (!latest || !window.confirm("Discard all your unsaved board changes and unfinished activity edits, and load your friend’s latest plan?")) return;
    setPlan(latest.state); setSnapshot(latest); revisionRef.current = latest.revision; setLatest(null); setReconciliation(null);
    dirtyRef.current = false; setDirty(false); resetActivity(); setReview(false); setApproved(false); setError("");
    setNotice("Latest plan loaded. Previous unsaved edits were discarded.");
  }
  async function loadSample() {
    if ((dirtyRef.current || activityDraftRef.current || Boolean(commentDraftRef.current.trim())) && !window.confirm("Replace your local board and unfinished activity with the public sample?")) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      const value = await responseBody(await fetch("/api/collaboration/sample", { cache: "no-store", signal: AbortSignal.timeout(10000) }));
      update(value.state); resetActivity(); setNotice("Public sample loaded locally. Review its dates, ideas and locations before sharing.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the public sample. Your draft is preserved."); }
    finally { busyRef.current = false; setBusy(false); }
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
    busyRef.current = true; setBusy(true); setError("");
    try {
      const value = await responseBody(await fetch("/api/collaboration/rooms", { method: "POST", headers: { "Content-Type": "application/json", ...(setup.creationCodeRequired ? { "X-Trippy-Create-Code": creationCode } : {}) }, body: JSON.stringify({ state: plan }), signal: AbortSignal.timeout(30000) }));
      setCreationCode("");
      token.current = value.ownerToken;
      try { window.sessionStorage.setItem(sessionKey(value.roomId), value.ownerToken); } catch { /* Keep capability in memory until navigation. */ }
      // A fragment is never sent to the server; the room screen consumes and removes it.
      dirtyRef.current = false; setDirty(false);
      router.push(`/collaborate/${value.roomId}#token=${encodeURIComponent(value.ownerToken)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create a room. Your local draft is preserved."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  async function save() {
    if (!snapshot || !canEdit || !dirty || busy || latest || activityDraftRef.current || closedRef.current) return;
    try { validateCollaborationState(plan); } catch (cause) { setError(cause instanceof Error ? cause.message : "Check your shared fields before saving."); return; }
    busyRef.current = true; setBusy(true); setError("");
    try {
      const response = await fetch(`/api/collaboration/rooms/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}`, "If-Match": String(snapshot.revision) }, body: JSON.stringify({ state: plan }), signal: AbortSignal.timeout(30000) });
      if (response.status === 412) { const body = await response.json(); setLatest(body.latest || (body.state ? body : null)); setError("A friend saved a newer version. Your edits are still here; review the latest plan before saving."); return; }
      if (response.status === 403 || response.status === 404) { setConnected(false); setConnectionError("Room access is unavailable. Your local draft remains here."); }
      const value: Snapshot = await responseBody(response);
      setSnapshot(value); setPlan(value.state); setLatest(previous => previous && previous.revision > value.revision ? previous : null); revisionRef.current = value.revision; dirtyRef.current = false; setDirty(false); setNotice("Saved. Everyone in this room will receive the update.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Save failed. Your draft is preserved."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  async function invite(role: "editor" | "viewer") {
    if (!snapshot || snapshot.role !== "owner" || !connected || inviteReview !== role) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      const value = await responseBody(await fetch(`/api/collaboration/rooms/${id}/invites`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}` }, body: JSON.stringify({ role, expiresAt: new Date(Date.now() + inviteDays * 86400000).toISOString() }), signal: AbortSignal.timeout(30000) }));
      setInviteReview(null); setInvites(previous => [...previous, { inviteId: value.inviteId, role, expiresAt: value.expiresAt }]);
      const link = `${window.location.origin}/collaborate/${id}#token=${encodeURIComponent(value.token)}`;
      try { await navigator.clipboard.writeText(link); setNotice(`${role === "editor" ? "Editor" : "Viewer"} invitation copied. Anyone with it can access this plan until revoked.`); }
      catch { setError("Clipboard access is unavailable. The invitation was created; revoke it below and retry in a browser with clipboard access."); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create an invitation."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  async function copyOwnerAccess() {
    if (!snapshot || snapshot.role !== "owner" || !connected || busy) return;
    try { await navigator.clipboard.writeText(`${window.location.origin}/collaborate/${snapshot.roomId}#token=${encodeURIComponent(token.current)}`); setNotice("Current owner link copied. Keep it privately; anyone holding it has owner access."); }
    catch { setError("Owner link could not be copied. Keep this tab open and allow clipboard access before replacing owner access."); }
  }
  async function revoke(inviteId: string) {
    busyRef.current = true; setBusy(true); setError("");
    try {
      await responseBody(await fetch(`/api/collaboration/rooms/${id}/invites/${inviteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token.current}` }, signal: AbortSignal.timeout(30000) }));
      setInvites(previous => previous.filter(value => value.inviteId !== inviteId)); setNotice("Invitation revoked. That link can no longer access this plan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not revoke the invitation."); }
    finally { busyRef.current = false; setBusy(false); }
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
    if (proposing) {
      appendSuggestion({ id: crypto.randomUUID(), kind: "activity", status: "pending", activity, ...(proposalDay ? { day: proposalDay } : {}) });
      return;
    }
    const next = { ...plan, activities: editingId ? plan.activities.map(value => value.id === editingId ? activity : value) : [...plan.activities, activity] };
    try { validateCollaborationState(next); } catch (cause) { setError(cause instanceof Error ? cause.message : "Check share-safe activity fields."); return; }
    update(next);
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
  function appendSuggestion(suggestion: CollaborationSuggestion) {
    if (!canEdit) return;
    const next = { ...plan, suggestions: [...(plan.suggestions || []), suggestion] };
    try { validateCollaborationState(next); } catch (cause) { setError(cause instanceof Error ? cause.message : "Check the proposed activity or day."); return; }
    update(next); resetActivity(); setDaySuggestion(null); setError("");
    setNotice(id ? "Suggestion added to your draft. Save changes to submit it for owner review; the board has not changed." : "Suggestion added locally for review; the board has not changed.");
  }
  async function decideSuggestion(decision: "apply" | "reject") {
    if (!reviewSuggestionId || !canManageTrip || busy || latest || activityDraft || (id && dirty)) return;
    if (!id) {
      try { update(reviewCollaborationSuggestion(plan, reviewSuggestionId, decision)); setReviewSuggestionId(null); } catch (cause) { setError(cause instanceof Error ? cause.message : "Review failed."); }
      return;
    }
    if (!snapshot) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      const response = await fetch(`/api/collaboration/rooms/${id}/suggestions/review`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}`, "If-Match": String(snapshot.revision) }, body: JSON.stringify({ suggestionId: reviewSuggestionId, decision }), signal: AbortSignal.timeout(30000) });
      if (response.status === 412) { const value = await response.json(); setLatest(value.latest || null); setError("The shared plan changed during review. Your draft and suggestion remain here; review the latest version first."); return; }
      if (response.status === 403 || response.status === 404) setConnected(false);
      const value: Snapshot = await responseBody(response);
      setSnapshot(value); setPlan(value.state); revisionRef.current = value.revision; setReviewSuggestionId(null); setNotice(decision === "apply" ? "Reviewed suggestion applied to the shared board." : "Suggestion rejected; the board is unchanged.");
    } catch (cause) { setError(cause instanceof Error ? `${cause.message} Reload the current room before another review; the outcome may be uncertain.` : "Review outcome uncertain. Reload before another review."); setConnected(false); }
    finally { busyRef.current = false; setBusy(false); }
  }
  async function interactSuggestion(action: "vote" | "comment", value: string) {
    if (!discussionId || !id || !snapshot || !canEdit || dirty || latest || activityDraft || busy) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      const response = await fetch(`/api/collaboration/rooms/${id}/suggestions/interact`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}`, "If-Match": String(snapshot.revision) }, body: JSON.stringify({ suggestionId: discussionId, action, value }), signal: AbortSignal.timeout(30000) });
      if (response.status === 412) { const next = await response.json(); setLatest(next.latest || null); setError("The shared room changed. Your comment draft is preserved; review the latest board before posting."); return; }
      if (response.status === 403 || response.status === 404) setConnected(false);
      const next: Snapshot = await responseBody(response);
      setSnapshot(next); setPlan(next.state); revisionRef.current = next.revision;
      if (action === "comment") { setCommentDraft(""); commentDraftRef.current = ""; }
      setNotice(action === "vote" ? "Choice recorded for this access capability. It does not identify a verified person." : "Comment saved to this shared room. No notification was sent.");
    } catch (cause) { setError(cause instanceof Error ? `${cause.message} Your comment draft is preserved. Reload the room before posting again; the outcome may be uncertain.` : "Posting outcome uncertain. Draft preserved; reload before retrying."); setConnected(false); }
    finally { busyRef.current = false; setBusy(false); }
  }
  const discussion = plan.suggestions?.find(item => item.id === discussionId);
  const discussionVotes = plan.interactions?.votes.filter(item => item.suggestionId === discussionId) || [];
  const discussionComments = plan.interactions?.comments.filter(item => item.suggestionId === discussionId) || [];
  const canInteract = Boolean(id && snapshot && canEdit && !dirty && !latest && !activityDraft && discussion?.status === "pending");
  const reviewingSuggestion = plan.suggestions?.find(item => item.id === reviewSuggestionId);
  const boardReady = Boolean(plan.cities.length && plan.startDate && plan.endDate);
  const tripDates = dates(plan);
  const focusedDay = tripDates.includes(boardDay) ? boardDay : tripDates.find(date => plan.days[date]?.length) || tripDates[0];
  const effectiveCatalogueCity = plan.cities.some(city => city.id === catalogueCity) ? catalogueCity : "";
  const visibleActivities = plan.activities.filter(activity => (!effectiveCatalogueCity || activity.cityId === effectiveCatalogueCity) && `${activity.title} ${activity.notes} ${plan.cities.find(city => city.id === activity.cityId)?.name || ""}`.toLocaleLowerCase().includes(catalogueSearch.toLocaleLowerCase())).sort((a, b) => Number((plan.days[focusedDay] || []).includes(b.id)) - Number((plan.days[focusedDay] || []).includes(a.id)));
  const sharedPhotos = plan.activities.filter(activity => activity.image).slice(0, 3);
  const points: Point[] = [...plan.cities.map(city => ({ ...city, category: "city" })), ...plan.activities.map(activity => ({ ...activity, name: activity.title, category: "activity" }))].filter((point): point is typeof point & { lat: number; lng: number } => typeof point.lat === "number" && typeof point.lng === "number").map(point => ({ id: point.id, name: point.name, lat: point.lat, lng: point.lng, category: point.category }));

  return <main className={`collab-shell ${boardReady ? "collab-board-ready" : ""}`}>
    <header className="collab-header"><Link href="/" onClick={confirmNavigation} className="collab-brand"><span className="collab-brand-mark"><BrandMark /></span><span className="collab-brand-copy">Trippy<span>Plan together</span></span></Link><nav aria-label="Planner navigation"><Link href="/plan" onClick={confirmNavigation}>New trip</Link><Link href="/" onClick={confirmNavigation}>Travel atlas</Link></nav></header>
    {!boardReady && <section className="collab-hero"><div className="collab-hero-copy"><p className="collab-eyebrow">A plan you can make together</p><h1>{id || plan.cities.length ? plan.title : "Good trips start with a shared idea."}</h1><p>Add places, shape each day, and invite a friend to edit with you. Shared planning contains dates, cities and activities only.</p><div className="collab-status"><span className={snapshot && connected ? "collab-dot live" : "collab-dot"} />{snapshot ? `${snapshot.role} · Version ${snapshot.revision} · ${connected ? "Updates every 4 seconds" : "Updates paused; draft preserved"}` : id ? "Connecting to shared plan…" : "Private local draft until you approve sharing"}</div><div className="collab-hero-metrics"><span><b>{plan.cities.length}</b> cities</span><span><b>{tripDates.length}</b> days</span><span><b>{plan.activities.length}</b> ideas</span></div></div><div className={`collab-hero-art ${sharedPhotos.length ? "has-photos" : ""}`} aria-hidden="true">{sharedPhotos.length ? sharedPhotos.map(activity => <Image key={activity.id} src={activity.image!} alt="" width={440} height={360} />) : <><span className="collab-orbit" /><span className="collab-orbit second" /><BrandMark /></>}<span className="collab-art-caption">A little room for possibility.</span></div></section>}
    {boardReady && <section className="collab-trip-bar"><div><h1>{plan.title}</h1><p>{plan.startDate} → {plan.endDate} · {plan.cities.length} cities · {plan.activities.length} ideas</p><small>{snapshot ? `${snapshot.role} · Version ${snapshot.revision} · ${connected ? "Connected" : "Updates paused; draft preserved"}` : "Local draft · review before sharing"}</small></div><div className="collab-actions">{snapshot && <button className="collab-primary" onClick={() => void save()} disabled={!canEdit || !dirty || Boolean(latest) || activityDraft}>{busy ? "Working…" : activityDraft ? "Finish activity draft first" : dirty ? "Save changes" : "All changes saved"}</button>}<a href="#collab-settings">Trip & sharing settings ↓</a></div></section>}

    {setup && !setup.configured && <aside className="collab-banner" role="status"><strong>Live sharing needs setup</strong><p>{setup.message} You can prepare a local draft below; creating a shared room is disabled.</p></aside>}
    {connectionError && <aside className="collab-banner error" role="alert">{connectionError}</aside>}
    {error && <aside className="collab-banner error" role="alert">{error}</aside>}
    {notice && <p className="collab-banner" role="status">{notice}</p>}
    {commentDraft.trim() && !discussionId && <p className="collab-banner" role="status">An unsent suggestion comment is preserved in this tab. <button onClick={() => setDiscussionId(commentTargetRef.current)}>Resume comment</button></p>}

    {latest && <aside className="collab-banner conflict" role="alert"><strong>A newer plan is available — version {latest.revision}</strong><p>Your unsaved edits have been preserved. Saving is paused to prevent overwriting your friend’s work.</p><details><summary>Review the latest plan</summary><pre>{JSON.stringify(latest.state, null, 2)}</pre><p>{latest.state.title} · {latest.state.activities.length} activities</p>{latest.state.activities.map(activity => <p key={activity.id}>{activity.title} — {activity.notes}</p>)}</details><p>Finish or cancel unfinished activity edits before reconciliation. Review every proposed change; incompatible assignments remain blocked by validation.</p><div className="collab-actions"><button onClick={prepareReconciliation} disabled={!canEdit || activityDraft}>Review changes together</button><button onClick={downloadDraft}>Download my board draft</button><button onClick={discardAndLoadLatest}>Discard my edits and load latest</button></div></aside>}
    {reconciliation && <section className="collab-panel"><h2>Choose changes · latest version {reconciliation.latest.revision}</h2><p>Review both versions against the original. Conflicting edits require a choice. Other suggested choices can also be changed. This applies only to your draft.</p>{reconciliation.changes.map(change => <fieldset className="collab-merge" key={change.key}><legend>{change.label}{change.conflict ? " · conflict" : ""}</legend><details><summary>Original value</summary><pre>{JSON.stringify(change.base, null, 2) ?? "Removed / absent"}</pre></details><div className="collab-merge-values">{(["local", "latest"] as const).map(choice => <label key={choice}><span><input type="radio" name={change.key} checked={reconciliation.choices[change.key] === choice} onChange={() => setReconciliation({ ...reconciliation, choices: { ...reconciliation.choices, [change.key]: choice } })} />{choice === "local" ? "My draft" : "Latest shared"}</span><pre>{JSON.stringify(change[choice], null, 2) ?? "Removed / absent"}</pre></label>)}</div><p>Chosen: {reconciliation.choices[change.key] || "Choose one"}</p></fieldset>)}{!reconciliation.changes.length && <p>No board changes to reconcile.</p>}<div className="collab-actions"><button disabled={!canEdit || reconciliation.changes.some(change => !reconciliation.choices[change.key]) || latest?.revision !== reconciliation.latest.revision} onClick={applyReconciliation}>Apply chosen changes to draft</button><button onClick={() => setReconciliation(null)}>Cancel review</button></div></section>}

    {(!id || snapshot) && <>
      {Boolean(plan.suggestions?.length) && <details className="collab-panel collab-suggestions"><summary>Suggestions for owner review · {plan.suggestions?.filter(item => item.status === "pending").length} pending</summary><p className="collab-muted">Proposals are separate from the board. Capability roles do not establish a person’s identity.</p>{plan.suggestions?.map(item => <article key={item.id}><div><b>{item.kind === "activity" ? item.activity.title : plan.activities.find(activity => activity.id === item.activityId)?.title || "Recorded activity"}</b><small>{item.kind === "activity" ? "New activity" : "Move activity"} · {item.day || "Catalogue only"} · {item.status}</small></div><div className="collab-actions"><button onClick={() => { if (commentDraft.trim() && commentTargetRef.current !== item.id && !window.confirm("Discard the unsent comment before opening another discussion?")) return; if (commentTargetRef.current !== item.id) { setCommentDraft(""); commentDraftRef.current = ""; } commentTargetRef.current = item.id; setDiscussionId(item.id); }}>Discussion · {plan.interactions?.comments.filter(comment => comment.suggestionId === item.id).length || 0} comments · {plan.interactions?.votes.filter(vote => vote.suggestionId === item.id).length || 0} choices</button>{item.status === "pending" && canManageTrip && <button onClick={() => setReviewSuggestionId(item.id)}>Review suggestion</button>}</div></article>)}</details>}
      {discussion && <DetailDrawer title="Suggestion discussion" close={() => setDiscussionId(null)}><p><strong>{discussion.kind === "activity" ? discussion.activity.title : plan.activities.find(activity => activity.id === discussion.activityId)?.title || "Recorded activity"}</strong> · {discussion.day || "Catalogue only"} · {discussion.status}</p><p>Attribution identifies an owner/editor access capability, never a verified person. People sharing the same invitation share one choice. A new invitation or owner access has a separate identity.</p><p>Support: {discussionVotes.filter(vote => vote.choice === "support").length} · Concern: {discussionVotes.filter(vote => vote.choice === "concern").length} · Neutral: {discussionVotes.filter(vote => vote.choice === "neutral").length}. Choices do not apply a proposal; the owner reviews it separately.</p>{!id && <p>Votes and comments require an authenticated shared room; local drafts have no access identity.</p>}{id && <><div className="collab-actions" role="group" aria-label="Record a choice for this access"><button disabled={!canInteract} onClick={() => void interactSuggestion("vote", "support")}>Support</button><button disabled={!canInteract} onClick={() => void interactSuggestion("vote", "concern")}>Concern</button><button disabled={!canInteract} onClick={() => void interactSuggestion("vote", "neutral")}>Neutral / replace choice</button></div><details><summary>Choices by access capability</summary>{discussionVotes.map(vote => <p key={vote.actor.id}>{vote.actor.role} access {vote.actor.id.slice(-8)} · {vote.choice} · {vote.updatedAt}</p>)}</details></>}<h3>Comments</h3>{discussionComments.length === 0 && <p>No comments recorded.</p>}{discussionComments.map(comment => <article key={comment.id} style={{borderTop:"1px solid #9fc4ee30",padding:"10px 0"}}><small>{comment.actor.role} access {comment.actor.id.slice(-8)} · {comment.createdAt}</small><p style={{whiteSpace:"pre-wrap"}}>{comment.text}</p></article>)}{hasEditRole && id && <form className="collab-activity-form" onSubmit={event => { event.preventDefault(); void interactSuggestion("comment", commentDraft); }}><label>Comment (planning ideas only)<textarea maxLength={500} value={commentDraft} onChange={event => { setCommentDraft(event.target.value); commentDraftRef.current = event.target.value; }} placeholder="No private identifiers or booking details" /></label><p>{commentDraft.length}/500 characters. Comments are saved to the room only when you post them; closing this drawer preserves this tab’s unfinished comment.</p><button disabled={!canInteract || !commentDraft.trim()} type="submit">Post share-safe comment</button>{commentDraft && <button type="button" onClick={() => { setCommentDraft(""); commentDraftRef.current = ""; }}>Discard comment draft</button>}</form>}{!canInteract && id && <p>Only connected owners/editors may interact with pending proposals. Save or reconcile board changes first. Existing discussion remains readable.</p>}</DetailDrawer>}
      {daySuggestion && <DetailDrawer title="Suggest a planning day" close={() => setDaySuggestion(null)}><form className="collab-activity-form" onSubmit={event => { event.preventDefault(); appendSuggestion({ id: crypto.randomUUID(), kind: "day", status: "pending", ...daySuggestion }); }}><p>This proposes moving the activity; it does not change the day board until the owner applies it.</p><label>Proposed day<select required value={daySuggestion.day} onChange={event => setDaySuggestion({ ...daySuggestion, day: event.target.value })}>{tripDates.map(day => <option key={day}>{day}</option>)}</select></label><button type="submit" disabled={!canEdit || !daySuggestion.day}>Add suggestion to draft</button></form></DetailDrawer>}
      {reviewingSuggestion && <DetailDrawer title="Review suggestion" close={() => setReviewSuggestionId(null)}><p>Review the exact proposed change. Only applying it changes the board.</p><pre>{JSON.stringify(reviewingSuggestion, null, 2)}</pre><p>{id ? `Current observed version ${snapshot?.revision}. Save or reconcile unfinished changes before reviewing.` : "Local review changes only this draft."}</p><div className="collab-actions"><button disabled={!canManageTrip || busy || Boolean(latest) || activityDraft || Boolean(id && dirty) || reviewingSuggestion.status !== "pending"} onClick={() => void decideSuggestion("apply")}>Apply reviewed suggestion</button><button disabled={!canManageTrip || busy || Boolean(latest) || activityDraft || Boolean(id && dirty) || reviewingSuggestion.status !== "pending"} onClick={() => void decideSuggestion("reject")}>Reject suggestion</button></div></DetailDrawer>}
      <div className="collab-grid"><section className="collab-panel"><div className="collab-section-title"><h2>Places & activities</h2><span>{plan.activities.length} ideas</span></div>{hasEditRole && <div className="collab-actions collab-catalogue-actions"><button disabled={!canEdit} onClick={() => { setActivityOpen(true); if (!activityDraft) setProposing(false); }}>{activityDraft ? "Resume activity draft" : "Add activity"}</button><button disabled={!canEdit || activityDraft} onClick={() => { setEditingId(null); setProposing(true); setActivityOpen(true); }}>Suggest an activity</button></div>}<div className="collab-catalogue-tools"><label>Find an idea<input type="search" value={catalogueSearch} onChange={event => setCatalogueSearch(event.target.value)} placeholder="Museum, walk, neighborhood…" /></label><label>Filter ideas by city<select value={effectiveCatalogueCity} onChange={event => setCatalogueCity(event.target.value)}><option value="">All cities</option>{plan.cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label></div>{hasEditRole && activityOpen && <DetailDrawer title={proposing ? "Suggest an activity" : editingId ? "Edit activity" : "Add activity"} close={() => setActivityOpen(false)}><form ref={activityForm} onSubmit={submitActivity} className="collab-activity-form"><fieldset disabled={!canEdit}><div className="collab-form-heading"><h3>{proposing ? "Propose a new activity for owner review" : editingId ? "Edit your idea" : "Add a new idea"}</h3>{activityDraft && <span>Unfinished draft</span>}</div><label>Activity title<input required value={draftActivity.title} maxLength={160} onChange={event => changeActivity({ ...draftActivity, title: event.target.value })} placeholder="A morning at the art museum" /></label><label>City<select value={draftActivity.cityId || plan.cities[0]?.id || ""} onChange={event => changeActivity({ ...draftActivity, cityId: event.target.value })}>{!plan.cities.length && <option value="">Add a city first</option>}{plan.cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label><label>Planning notes<textarea aria-label="Planning notes" maxLength={1000} value={draftActivity.notes} onChange={event => changeActivity({ ...draftActivity, notes: event.target.value })} placeholder="Ideas and preferences only — no booking details" /></label><details><summary>Optional map location & duration</summary><div className="collab-fields"><label>Latitude<input type="number" step="any" min="-90" max="90" value={draftActivity.lat} onChange={event => changeActivity({ ...draftActivity, lat: event.target.value })} /></label><label>Longitude<input type="number" step="any" min="-180" max="180" value={draftActivity.lng} onChange={event => changeActivity({ ...draftActivity, lng: event.target.value })} /></label><label>Minutes<input type="number" min="1" max="1440" value={draftActivity.duration} onChange={event => changeActivity({ ...draftActivity, duration: event.target.value })} /></label></div></details>{proposing && <label>Proposed day (optional)<select value={proposalDay} onChange={event => setProposalDay(event.target.value)}><option value="">Catalogue only</option>{tripDates.map(day => <option key={day}>{day}</option>)}</select></label>}<div className="collab-actions"><button className="collab-primary" type="submit" disabled={!plan.cities.length}>{proposing ? "Add suggestion to draft" : editingId ? "Update activity" : "Add activity"}</button>{activityDraft && <button type="button" onClick={resetActivity}>{editingId ? "Cancel edit" : "Clear draft"}</button>}</div></fieldset></form></DetailDrawer>}{!plan.activities.length && <p className="collab-empty">Your ideas live here. Add the first place you want to explore.</p>}{visibleActivities.map(activity => <article className="collab-activity" key={activity.id}>{activity.image && <Image src={activity.image} alt="" width={480} height={260} className="collab-activity-photo" />}<h3>{activity.title}</h3><p className="collab-muted">{plan.cities.find(city => city.id === activity.cityId)?.name}{activity.durationMinutes ? ` · ${activity.durationMinutes} min` : ""}</p>{activity.notes && <p>{activity.notes}</p>}{activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="collab-source">View activity source ↗</a>}<label>Plan for<span className="collab-sr-only"> {activity.title}</span><select disabled={!canEdit} value={Object.entries(plan.days).find(([, ids]) => ids.includes(activity.id))?.[0] || ""} onChange={event => assign(activity.id, event.target.value)}><option value="">Unscheduled idea</option>{tripDates.map(date => <option key={date} value={date}>{date}</option>)}</select></label>{canEdit && <div className="collab-actions"><button onClick={() => beginEdit(activity)}>Edit</button><button onClick={() => setDaySuggestion({ activityId: activity.id, day: focusedDay || "" })}>Suggest day</button><button aria-label={`Delete ${activity.title}`} onClick={() => { if (!window.confirm(`Remove “${activity.title}” from this board and all days?`)) return; if (editingId === activity.id) resetActivity(); const days = Object.fromEntries(Object.entries(plan.days).map(([date, ids]) => [date, ids.filter(value => value !== activity.id)])); update({ ...plan, activities: plan.activities.filter(value => value.id !== activity.id), days }); }}>Delete</button></div>}</article>)}</section>
      <section className="collab-panel collab-days-panel"><div className="collab-section-title"><h2>Your days</h2><button aria-expanded={showMap} aria-controls="collab-map" onClick={() => setShowMap(!showMap)}>{showMap ? "Hide map" : "Show map"}</button></div><div className="collab-day-navigation"><label>Focus a planning day<select value={focusedDay || ""} onChange={event => { setBoardDay(event.target.value); setAllDays(false); }}>{tripDates.map(date => <option key={date} value={date}>{new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {weekday:"short",month:"short",day:"numeric",timeZone:"UTC"})} · {(plan.days[date] || []).length} ideas</option>)}</select></label><button aria-pressed={allDays} onClick={() => setAllDays(!allDays)}>{allDays ? "Focus one day" : "Show all days"}</button></div>{showMap && <div id="collab-map" className="collab-map">{points.length ? <GeographicMap points={points} basemap="city" label="Shared activity locations" /> : <p className="collab-empty">Add optional coordinates to an activity to place it on the map. Your day plan works without map access.</p>}</div>}{!tripDates.length && <p className="collab-empty">Choose your dates to start arranging days.</p>}{tripDates.map(date => <article className="collab-day" key={date} hidden={!allDays && date !== focusedDay}><h3>{new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}</h3>{!(plan.days[date]?.length) && <p className="collab-muted">Room to explore. Assign an idea from the catalogue.</p>}<ol>{(plan.days[date] || []).map((activityId, position, ids) => <li key={activityId}>{plan.activities.find(activity => activity.id === activityId)?.image && <Image className="collab-day-photo" src={plan.activities.find(activity => activity.id === activityId)!.image!} alt="" width={100} height={100} />}<span>{plan.activities.find(activity => activity.id === activityId)?.title}<small>{plan.cities.find(city => city.id === plan.activities.find(activity => activity.id === activityId)?.cityId)?.name}</small></span>{canEdit && <div><button aria-label={`Move ${plan.activities.find(activity => activity.id === activityId)?.title || "activity"} earlier on ${date}`} disabled={position === 0} onClick={() => move(date, position, -1)}>↑</button><button aria-label={`Move ${plan.activities.find(activity => activity.id === activityId)?.title || "activity"} later on ${date}`} disabled={position === ids.length - 1} onClick={() => move(date, position, 1)}>↓</button><button aria-label={`Unassign ${plan.activities.find(activity => activity.id === activityId)?.title || "activity"} from ${date}`} onClick={() => assign(activityId, "")}>×</button></div>}</li>)}</ol></article>)}</section></div>
    </>}
    <details id="collab-settings" className="collab-settings" open={!boardReady}><summary>Trip settings, sharing & invitations</summary>      <section className="collab-panel"><div className="collab-section-title"><h2>The trip</h2>{!id && <button onClick={() => void loadSample()} disabled={busy}>Load public Europe sample</button>}{snapshot && <button className="collab-primary" onClick={() => void save()} disabled={!canEdit || !dirty || busy || Boolean(latest) || activityDraft}>{busy ? "Working…" : activityDraft ? "Finish activity edit first" : dirty ? "Save changes" : "All changes saved"}</button>}</div><div className="collab-fields"><label>Trip name<input value={plan.title} disabled={!canManageTrip} maxLength={160} onChange={event => update({ ...plan, title: event.target.value })} /></label><label>Start date<input type="date" value={plan.startDate} disabled={!canManageTrip} onChange={event => changeDate("startDate", event.target.value)} /></label><label>End date<input type="date" value={plan.endDate} disabled={!canManageTrip} onChange={event => changeDate("endDate", event.target.value)} /></label></div><p className="collab-muted">Day assignments within your dates are preserved. Ideas outside a changed date range return to the catalogue.</p><div className="collab-cities">{plan.cities.map(city => <span key={city.id}>{city.name}</span>)}</div>{canManageTrip && <div className="collab-inline"><label>Add cities, separated by commas<input value={cityNames} onChange={event => setCityNames(event.target.value)} placeholder="Tokyo, Kyoto, Osaka" /></label><button onClick={addCities} disabled={!cityNames.trim()}>Add cities</button></div>}</section>
      {!id && <section className="collab-panel"><h2>Ready to invite a friend?</h2><p className="collab-muted">Review exactly what you will share. Anyone holding an invitation link can access the room with its assigned role.</p><button className="collab-primary" onClick={prepareReview}>Preview shared content</button>{review && <div className="collab-review"><h3>{plan.title}</h3><p>{plan.startDate} → {plan.endDate}</p><p>{plan.cities.map(city => city.name).join(" · ")}</p>{plan.activities.map(activity => <p key={activity.id}>{activity.title}{activity.notes ? ` — ${activity.notes}` : ""}</p>)}<p>{plan.activities.length} activities · {Object.values(plan.days).flat().length} day assignments · {points.length} map locations</p><details><summary>Inspect all shared fields</summary><pre>{JSON.stringify(plan, null, 2)}</pre></details><label className="collab-check"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} />I approve sharing this planning content. It contains no booking references, seats, personal identifiers, email links or secrets.</label>{setup?.creationCodeRequired && <label>Room creation code<input type="password" autoComplete="off" value={creationCode} onChange={event => setCreationCode(event.target.value)} disabled={busy} /><span className="collab-muted">Ask the site owner for this code. It authorizes room creation and is never included in your shared plan.</span></label>}{setup?.creationAvailable === false && <p className="collab-muted">Room creation is unavailable on this host. The site owner must complete collaboration setup.</p>}<button className="collab-primary" disabled={!approved || !setup?.configured || setup.creationAvailable === false || Boolean(setup?.creationCodeRequired && !creationCode) || busy} onClick={() => void create()}>{busy ? "Creating…" : "Create shared plan"}</button></div>}</section>}
      {snapshot?.role === "owner" && connected && <section className="collab-panel"><h2>Invite your people</h2><p className="collab-muted">Editors can change the plan; viewers can follow along. Keep your owner link private. Copied invitations grant access until revoked.</p><div className="collab-actions"><button onClick={() => void copyOwnerAccess()} disabled={busy}>Copy my current owner link</button><button onClick={() => setInviteReview("editor")} disabled={busy}>Review editor invitation</button><button onClick={() => setInviteReview("viewer")} disabled={busy}>Review viewer invitation</button></div>{inviteReview && <div className="collab-review"><h3>Review {inviteReview} access</h3><p>{inviteReview === "editor" ? "Anyone with this invitation may change activities and day assignments." : "Anyone with this invitation may read and copy the board."} No message is sent. The link will be copied to your clipboard.</p><label>Invitation lifetime<select value={inviteDays} onChange={event => setInviteDays(Number(event.target.value))}><option value={1}>1 day</option><option value={7}>7 days</option><option value={30}>30 days</option></select></label><div className="collab-actions"><button onClick={() => void invite(inviteReview)} disabled={busy}>Create and copy reviewed invitation</button><button onClick={() => setInviteReview(null)}>Cancel</button></div></div>}{invites.map((value, index) => <div className="collab-invite" key={value.inviteId}><span>{value.role} invitation {index + 1}{value.expiresAt ? ` · expires ${new Date(value.expiresAt).toLocaleDateString()}` : ""}{value.expired ? " · expired" : ""}</span><button onClick={() => void revoke(value.inviteId)} disabled={busy}>Revoke</button></div>)}</section>}
    {snapshot && <RoomLifecycle roomId={snapshot.roomId} token={accessToken} role={snapshot.role} revision={snapshot.revision} connected={connected} busy={busy} hasUnsavedChanges={dirty || activityDraft || Boolean(commentDraft.trim()) || Boolean(latest)} onBusyChange={value => { busyRef.current = value; setBusy(value); }} onClosed={() => { closedRef.current = true; token.current = ""; setAccessToken(""); setConnected(false); setInvites([]); try { window.sessionStorage.removeItem(sessionKey(snapshot.roomId)); } catch { /* Storage unavailable. */ } setConnectionError("This room was deleted. The board displayed here is a local copy; it cannot be saved to that room."); }} onOwnerRotated={(newToken, revision) => { token.current = newToken; setAccessToken(newToken); revisionRef.current = revision; setSnapshot({ ...snapshot, revision }); setLatest(null); setInviteReview(null); try { window.sessionStorage.setItem(sessionKey(snapshot.roomId), newToken); window.history.replaceState(null, "", window.location.pathname); } catch { window.history.replaceState(null, "", `${window.location.pathname}#token=${encodeURIComponent(newToken)}`); } }} onConflict={value => setLatest(value)} onError={setError} onNotice={setNotice} />}</details>
    <section className="collab-panel collab-utility-panel"><details open={utilitiesOpen || Boolean(recovered)} onToggle={event => setUtilitiesOpen(event.currentTarget.open)}><summary>Draft recovery & board JSON</summary><p className="collab-muted">With your consent, only the validated board and its base revision are retained in this browser’s local storage. Other users of this device may see it. Access links stay separate in this tab’s session. Unfinished forms, import text and creation codes are never retained.</p><label className="collab-check"><input type="checkbox" checked={retainDraft} onChange={event => toggleRetention(event.target.checked)} />Retain my validated board draft on this device</label>{recoveryStatus && <p role="status">{recoveryStatus}</p>}{recovered && <div className="collab-review"><h3>Review recovered board · version {recovered.revision}</h3><pre>{JSON.stringify(recovered.state, null, 2)}</pre><div className="collab-actions"><button disabled={busy || Boolean(roomId && (!connected || !snapshot || snapshot.role === "viewer"))} onClick={restoreRecovered}>Restore reviewed draft</button><button onClick={() => toggleRetention(false)}>Delete retained draft</button></div></div>}<div className="collab-actions"><button onClick={downloadDraft}>Download validated board JSON</button></div>{canManageTrip && <details><summary>Import share-safe board JSON</summary><label>Board JSON<textarea value={importText} onChange={event => { setImportText(event.target.value); setImportPreview(null); }} /></label><button onClick={previewImport} disabled={!importText.trim()}>Preview board import</button>{importPreview && <div className="collab-review"><h3>Review replacement board</h3><pre>{JSON.stringify(importPreview, null, 2)}</pre><button onClick={applyImport}>Apply reviewed import to local draft</button></div>}</details>}</details></section>
    <footer className="collab-footer">Planning ideas are recommendations. Shared rooms do not create bookings or change confirmation states.</footer>
  </main>;
}
