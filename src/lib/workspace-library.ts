import { validateWorkspace, workspaceKey, type BrowserStore, type GenericWorkspace } from "./generic-trip-workspace.ts";

export const WORKSPACE_LIBRARY_KEY = "trippy.workspace-library.v1";
export const WORKSPACE_LIBRARY_LIMIT = 40;
const ACTIVE_KEY = "trippy.workspace.active.v1";
const MAX_KEY_LENGTH = 20_000;
const MAX_INDEX_LENGTH = WORKSPACE_LIBRARY_LIMIT * (MAX_KEY_LENGTH + 8) + 100;
const safeKey = (key: unknown): key is string => typeof key === "string" && key.startsWith("trippy.workspace.v1:") && key.length <= MAX_KEY_LENGTH;
export type WorkspaceLibraryEntry = { key: string; name: string; start: string; end: string; destinations: string[] };
export type WorkspaceLibraryListing = { entries: WorkspaceLibraryEntry[]; unavailable: boolean; skipped: number };

function readEntry(store: BrowserStore, key: string): GenericWorkspace | null {
  if (!safeKey(key)) return null;
  const raw = store.getItem(key);
  if (!raw || raw.length > 2_000_000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (validateWorkspace(value).length) return null;
    const workspace = value as GenericWorkspace;
    return workspaceKey(workspace.trip) === key ? workspace : null;
  } catch { return null; }
}

/** Read-only: even legacy discovery never creates or changes an index or active pointer. */
export function listWorkspaceLibrary(store: BrowserStore): WorkspaceLibraryListing {
  const result: WorkspaceLibraryListing = { entries: [], unavailable: false, skipped: 0 };
  let keys: unknown[] = [];
  try {
    const raw = store.getItem(WORKSPACE_LIBRARY_KEY);
    if (raw) {
      if (raw.length > MAX_INDEX_LENGTH) result.skipped++;
      else {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length === 2 && "version" in parsed && parsed.version === 1 && "keys" in parsed && Array.isArray(parsed.keys) && parsed.keys.length <= WORKSPACE_LIBRARY_LIMIT) keys = parsed.keys;
          else result.skipped++;
        } catch { result.skipped++; }
      }
    }
    const active = store.getItem(ACTIVE_KEY);
    if (active) keys = [active, ...keys];
  } catch { result.unavailable = true; }
  const seen = new Set<string>();
  for (const key of keys) {
    if (!safeKey(key)) { result.skipped++; continue; }
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const workspace = readEntry(store, key);
      if (!workspace) { result.skipped++; continue; }
      if (result.entries.length >= WORKSPACE_LIBRARY_LIMIT) break;
      result.entries.push({ key, name: workspace.trip.name, start: workspace.trip.dateWindow.earliestDeparture, end: workspace.trip.dateWindow.latestReturn, destinations: workspace.trip.destinations.map(place => place.name) });
    } catch { result.unavailable = true; }
  }
  return result;
}

/** Revalidate on preview and on explicit Open, rather than trusting a cached listing. */
export function readWorkspaceLibraryEntry(store: BrowserStore, key: string): GenericWorkspace | null {
  try { return readEntry(store, key); } catch { return null; }
}

/** Call only after saveWorkspace succeeds. The index contains keys, never duplicate plan content. */
export function indexWorkspaceLibrary(store: BrowserStore, workspace: GenericWorkspace): void {
  if (validateWorkspace(workspace).length) throw new Error("Invalid workspace; library index was not changed.");
  const key = workspaceKey(workspace.trip);
  if (!safeKey(key)) throw new Error("Workspace identity exceeds library limits.");
  let saved: GenericWorkspace | null;
  try { saved = readEntry(store, key); } catch { throw new Error("Browser storage is unavailable; the library index was not changed."); }
  if (!saved || JSON.stringify(saved) !== JSON.stringify(workspace)) throw new Error("Save the current workspace before adding it to the library.");
  const listing = listWorkspaceLibrary(store);
  if (listing.unavailable) throw new Error("Browser storage is unavailable; the library index was not changed.");
  const keys = [key, ...listing.entries.map(item => item.key).filter(item => item !== key)].slice(0, WORKSPACE_LIBRARY_LIMIT);
  try { store.setItem(WORKSPACE_LIBRARY_KEY, JSON.stringify({ version: 1, keys })); }
  catch { throw new Error("The workspace remains saved, but its library index could not be updated."); }
}
