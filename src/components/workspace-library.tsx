"use client";

import { useState } from "react";
import type { GenericWorkspace } from "@/lib/generic-trip-workspace";
import { listWorkspaceLibrary, readWorkspaceLibraryEntry, WORKSPACE_LIBRARY_LIMIT, type WorkspaceLibraryListing } from "@/lib/workspace-library";
import DetailDrawer from "./detail-drawer";
import "./workspace-library.css";

type Preview = { key: string; workspace: GenericWorkspace };
export default function WorkspaceLibrary({ onOpen }: { onOpen: (workspace: GenericWorkspace) => void }) {
  const [listing, setListing] = useState<WorkspaceLibraryListing | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState("");
  function refresh() {
    try { setListing(listWorkspaceLibrary(localStorage)); setMessage(""); }
    catch { setMessage("Browser storage is unavailable. Current planning work has not changed."); }
  }
  function inspect(key: string) {
    try {
      const workspace = readWorkspaceLibraryEntry(localStorage, key);
      if (!workspace) { setMessage("This saved trip is unavailable or no longer validates. Refresh the list; the current workspace has not changed."); return; }
      setPreview({ key, workspace }); setMessage("");
    } catch { setMessage("Browser storage is unavailable. Current planning work has not changed."); }
  }
  function open() {
    if (!preview) return;
    try {
      const current = readWorkspaceLibraryEntry(localStorage, preview.key);
      if (!current || JSON.stringify(current) !== JSON.stringify(preview.workspace)) {
        setPreview(null); setMessage("The saved trip changed after preview. Refresh and review it again before opening."); return;
      }
      onOpen(structuredClone(current)); setPreview(null);
    } catch { setMessage("The saved trip could not be opened. Current planning work has not changed."); }
  }
  return <section className="workspace-library" aria-label="Saved trips on this device"><header><div><h2>Saved trips on this device</h2><p>Review a trip before opening it. Nothing uploads to an account or server.</p></div><button type="button" onClick={refresh}>{listing ? "Refresh saved trips" : "Show saved trips"}</button></header>
    {listing && <><p className="workspace-library-note">Up to {WORKSPACE_LIBRARY_LIMIT} indexed trips. The last saved legacy trip is discoverable too; opening this list does not change storage. Saving/indexing newer trips may remove older entries from this list, without deleting their stored plans.</p>{listing.unavailable && <p role="alert">Some browser storage could not be read. This list may be incomplete.</p>}{listing.skipped > 0 && <p role="status">Some unavailable or invalid records were skipped. No records were deleted.</p>}{listing.entries.length ? <ul>{listing.entries.map(entry => <li key={entry.key}><div><h3>{entry.name}</h3><p>{entry.start} → {entry.end}</p><p>{entry.destinations.join(" → ")}</p></div><button type="button" onClick={() => inspect(entry.key)}>Preview saved trip</button></li>)}</ul> : <p>No valid indexed or last-saved trips were found in this browser. Save a workspace explicitly to retain it.</p>}</>}
    {message && <p role="status">{message}</p>}
    {preview && <DetailDrawer title="Review saved trip" close={() => setPreview(null)}><div className="workspace-library-preview"><h3>{preview.workspace.trip.name}</h3><p>{preview.workspace.trip.dateWindow.earliestDeparture} → {preview.workspace.trip.dateWindow.latestReturn}</p><p>{preview.workspace.trip.destinations.map(place => place.name).join(" → ")}</p><p>{preview.workspace.trip.travelers.adults} adults · {preview.workspace.activities.length} activities · {preview.workspace.trip.bookings.length} recorded booking items</p><p>This opens the reviewed saved workspace in memory. The parent planner controls any unsaved-work warning. It does not save, upload, research or change booking states.</p><details><summary>Inspect saved workspace fields</summary><pre>{JSON.stringify(preview.workspace, null, 2)}</pre></details><div><button type="button" onClick={open}>Open this saved trip</button><button type="button" onClick={() => setPreview(null)}>Keep current workspace</button></div></div></DetailDrawer>}
  </section>;
}
