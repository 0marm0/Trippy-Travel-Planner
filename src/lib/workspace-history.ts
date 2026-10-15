import { validateWorkspace, type BrowserStore, type GenericWorkspace } from './generic-trip-workspace.ts';
import { validateNormalizedTrip } from './normalized-trip.ts';

export const WORKSPACE_HISTORY_LIMIT = 8;
export const WORKSPACE_HISTORY_BYTES = 4_000_000;
export type WorkspaceSnapshot = { id: string; name: string; createdAt: string; workspace: GenericWorkspace };
export type WorkspaceHistory = { version: 1; tripId: string; snapshots: WorkspaceSnapshot[] };
export type WorkspaceHistoryRead = { raw: string | null; history: WorkspaceHistory };
export type WorkspaceDifference = { scope: string; label: string; before: unknown; after: unknown; kind: 'added' | 'removed' | 'changed' };
export type WorkspaceRestorePreview = { currentSnapshot: string; historyRaw: string; snapshot: WorkspaceSnapshot; differences: WorkspaceDifference[] };
export const workspaceHistoryKey = (tripId: string) => `trippy.workspace-history.v1:${encodeURIComponent(tripId)}`;
const bytes = (value: string) => new TextEncoder().encode(value).length;
const validName = (name: unknown, workspace: GenericWorkspace) => typeof name === 'string' && name.length <= 80 && name.trim() === name && Boolean(name) && !validateNormalizedTrip({ ...workspace.trip, name }).length;
function validateHistory(input: unknown, tripId: string): WorkspaceHistory {
  const fail = () => { throw new Error('Saved snapshots are invalid or belong to another trip. No current workspace changes were made.'); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail();
  const history = input as WorkspaceHistory;
  if (Object.keys(history).sort().join(',') !== 'snapshots,tripId,version' || history.version !== 1 || history.tripId !== tripId || !Array.isArray(history.snapshots) || history.snapshots.length > WORKSPACE_HISTORY_LIMIT) return fail();
  const seen = new Set<string>();
  for (const snapshot of history.snapshots) {
    if (!snapshot || typeof snapshot !== 'object' || Object.keys(snapshot).sort().join(',') !== 'createdAt,id,name,workspace' || typeof snapshot.id !== 'string' || !/^snapshot-[a-z0-9-]{1,54}$/.test(snapshot.id) || seen.has(snapshot.id) || validateWorkspace(snapshot.workspace).length || snapshot.workspace.trip.id !== tripId || !validName(snapshot.name, snapshot.workspace) || typeof snapshot.createdAt !== 'string' || !Number.isFinite(Date.parse(snapshot.createdAt)) || new Date(snapshot.createdAt).toISOString() !== snapshot.createdAt) return fail();
    seen.add(snapshot.id);
  }
  if (bytes(JSON.stringify(history)) > WORKSPACE_HISTORY_BYTES) return fail();
  return structuredClone(history);
}
/** Reading never indexes or saves plans and never changes the active workspace pointer. */
export function readWorkspaceHistory(store: BrowserStore, workspace: GenericWorkspace): WorkspaceHistoryRead {
  if (validateWorkspace(workspace).length) throw new Error('Validate the open workspace first.');
  let raw: string | null;
  try { raw = store.getItem(workspaceHistoryKey(workspace.trip.id)); } catch { throw new Error('Browser snapshot storage is unavailable. Your open workspace is intact.'); }
  if (raw === null) return { raw, history: { version: 1, tripId: workspace.trip.id, snapshots: [] } };
  if (bytes(raw) > WORKSPACE_HISTORY_BYTES) throw new Error('Saved snapshots exceed the storage limit. Your open workspace is intact.');
  let input: unknown;
  try { input = JSON.parse(raw); } catch { throw new Error('Saved snapshots could not be read. Your open workspace is intact.'); }
  return { raw, history: validateHistory(input, workspace.trip.id) };
}
function writeHistory(store: BrowserStore, workspace: GenericWorkspace, expectedRaw: string | null, history: WorkspaceHistory) {
  const checked = validateHistory(history, workspace.trip.id);
  const current = readWorkspaceHistory(store, workspace);
  if (current.raw !== expectedRaw) throw new Error('Saved snapshots changed in another view. Refresh and review again.');
  try { store.setItem(workspaceHistoryKey(workspace.trip.id), JSON.stringify(checked)); }
  catch { throw new Error('Snapshot storage is full or unavailable. Your current workspace is intact; nothing was restored.'); }
}
export function saveWorkspaceSnapshot(store: BrowserStore, workspace: GenericWorkspace, name: string, expectedRaw: string | null, id = `snapshot-${crypto.randomUUID()}`, createdAt = new Date().toISOString()): WorkspaceSnapshot {
  const current = readWorkspaceHistory(store, workspace);
  if (current.raw !== expectedRaw) throw new Error('Saved snapshots changed. Refresh before saving.');
  if (current.history.snapshots.length >= WORKSPACE_HISTORY_LIMIT) throw new Error('Eight snapshots are already saved. Delete a reviewed snapshot before saving another.');
  const snapshot = { id, name: name.trim(), createdAt, workspace: structuredClone(workspace) };
  writeHistory(store, workspace, expectedRaw, { ...current.history, snapshots: [snapshot, ...current.history.snapshots] });
  return structuredClone(snapshot);
}
export function deleteWorkspaceSnapshot(store: BrowserStore, workspace: GenericWorkspace, id: string, expectedRaw: string | null): void {
  const current = readWorkspaceHistory(store, workspace);
  if (!current.history.snapshots.some(snapshot => snapshot.id === id)) throw new Error('This snapshot is no longer available.');
  writeHistory(store, workspace, expectedRaw, { ...current.history, snapshots: current.history.snapshots.filter(snapshot => snapshot.id !== id) });
}
/** Stable record IDs make additions/deletions and full optional evidence or metadata changes visible. */
export function workspaceDifferences(before: GenericWorkspace, after: GenericWorkspace): WorkspaceDifference[] {
  if (validateWorkspace(before).length || validateWorkspace(after).length || before.trip.id !== after.trip.id) throw new Error('Only validated snapshots of the same trip can be compared.');
  const result: WorkspaceDifference[] = [];
  function add(scope: string, label: string, a: unknown, b: unknown) { if (JSON.stringify(a) !== JSON.stringify(b)) result.push({ scope, label, before: a, after: b, kind: a === undefined ? 'added' : b === undefined ? 'removed' : 'changed' }); }
  function records(scope: string, a: unknown[], b: unknown[], key: (item: Record<string, unknown>) => string) {
    const first = new Map(a.map(item => [key(item as Record<string, unknown>), item])), second = new Map(b.map(item => [key(item as Record<string, unknown>), item]));
    for (const id of new Set([...first.keys(), ...second.keys()])) add(scope, `${scope}: ${id}`, first.get(id), second.get(id));
  }
  for (const key of Object.keys(before.trip) as Array<keyof GenericWorkspace['trip']>) {
    if (key === 'bookings') records('Booking', before.trip.bookings, after.trip.bookings, item => String(item.id));
    else add('Trip', key, before.trip[key], after.trip[key]);
  }
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (key === 'trip') continue;
    const a = (before as unknown as Record<string, unknown>)[key], b = (after as unknown as Record<string, unknown>)[key];
    if (['activities', 'days', 'bookingDetails', 'itemEvidence', 'places', 'routeAllocations'].includes(key)) records(key, (a as unknown[]) || [], (b as unknown[]) || [], item => key === 'itemEvidence' ? `${item.target}:${item.targetId}` : String(item.id ?? item.date ?? item.bookingId ?? item.placeId ?? item.routeId));
    else add(key, key, a, b);
  }
  return result;
}
export function previewWorkspaceRestore(store: BrowserStore, current: GenericWorkspace, snapshotId: string): WorkspaceRestorePreview {
  const saved = readWorkspaceHistory(store, current), snapshot = saved.history.snapshots.find(item => item.id === snapshotId);
  if (!snapshot || saved.raw === null) throw new Error('This snapshot is no longer available.');
  return { currentSnapshot: JSON.stringify(current), historyRaw: saved.raw, snapshot, differences: workspaceDifferences(current, snapshot.workspace) };
}
/** A failed safety save or a stale preview prevents restoration. Discarding the current open copy is a separate explicit choice. */
export function acceptWorkspaceRestore(store: BrowserStore, current: GenericWorkspace, preview: WorkspaceRestorePreview, policy: 'preserve-current' | 'discard-current', safetyName = 'Before restore'): GenericWorkspace {
  if (JSON.stringify(current) !== preview.currentSnapshot) throw new Error('The open workspace changed. Preview restoration again.');
  const latest = previewWorkspaceRestore(store, current, preview.snapshot.id);
  if (latest.historyRaw !== preview.historyRaw || JSON.stringify(latest.snapshot) !== JSON.stringify(preview.snapshot)) throw new Error('The saved snapshot changed. Preview restoration again.');
  if (policy === 'preserve-current') saveWorkspaceSnapshot(store, current, safetyName, latest.historyRaw);
  else if (policy !== 'discard-current') throw new Error('Choose whether to preserve the current open copy before restoring.');
  return structuredClone(latest.snapshot.workspace);
}
