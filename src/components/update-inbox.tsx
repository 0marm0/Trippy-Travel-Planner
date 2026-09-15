"use client";

import { useId, useRef, useState } from "react";
import {
  downloadTrippyWorkspaceBundle,
  parseTrippyUpdateFile,
  reviewTrippyUpdate,
  TRIPPY_BUNDLE_MAX_BYTES,
  type TrippyBundleIssue,
  type TrippyBundleReview,
  type TrippyBundleScope,
  type TrippyWorkspaceState,
} from "@/lib/trippy-bundle";
import "./update-inbox.css";

export type UpdateInboxProps = {
  currentState: TrippyWorkspaceState;
  scope: TrippyBundleScope;
  onAccept: (nextState: TrippyWorkspaceState, review: TrippyBundleReview) => void | Promise<void>;
  onDismiss?: (review: TrippyBundleReview) => void;
  title?: string;
  className?: string;
};

function displayTimestamp(value: string) {
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return value; }
}

function IssueList({ issues }: { issues: TrippyBundleIssue[] }) {
  if (!issues.length) return null;
  return <div className="trippy-inbox-issues" aria-label="Bundle safety notices">
    <strong>{issues.some((entry) => entry.severity === "error") ? "Review blocked" : "Safety notices"}</strong>
    <ul>{issues.slice(0, 12).map((entry, index) => <li key={`${entry.path}:${index}`} data-severity={entry.severity}><code>{entry.path}</code> {entry.message}</li>)}</ul>
    {issues.length > 12 && <small>{issues.length - 12} more notice{issues.length - 12 === 1 ? "" : "s"} omitted.</small>}
  </div>;
}

export default function UpdateInbox({ currentState, scope, onAccept, onDismiss, title = "Agent update inbox", className = "" }: UpdateInboxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [review, setReview] = useState<TrippyBundleReview | null>(null);
  const [parseIssues, setParseIssues] = useState<TrippyBundleIssue[]>([]);
  const [status, setStatus] = useState("No update loaded.");
  const [reading, setReading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const clear = () => {
    setReview(null);
    setParseIssues([]);
    setStatus("No update loaded.");
    if (inputRef.current) inputRef.current.value = "";
  };

  const readFile = async (file?: File) => {
    if (!file) return;
    setReading(true);
    setReview(null);
    setParseIssues([]);
    setStatus("Inspecting update in this browser…");
    try {
      const parsed = await parseTrippyUpdateFile(file);
      if (!parsed.ok) {
        setParseIssues(parsed.issues);
        setStatus("This file cannot be reviewed.");
        return;
      }
      const nextReview = reviewTrippyUpdate(parsed.bundle, currentState, scope);
      setReview({ ...nextReview, issues: [...parsed.issues, ...nextReview.issues] });
      setStatus(nextReview.diff.length ? `${nextReview.diff.length} proposed change${nextReview.diff.length === 1 ? "" : "s"} ready for review.` : "No applicable changes were found.");
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const accept = async () => {
    if (!review || !review.diff.length || review.issues.some((entry) => entry.severity === "error")) return;
    setAccepting(true);
    setStatus("Applying reviewed decisions…");
    try {
      await onAccept(review.nextState, review);
      setStatus(`${review.diff.length} reviewed change${review.diff.length === 1 ? "" : "s"} accepted.`);
      setReview(null);
      setParseIssues([]);
    } catch {
      setStatus("The host workspace did not accept these changes. Nothing was applied by the inbox.");
    } finally {
      setAccepting(false);
    }
  };

  const dismiss = () => {
    if (review) onDismiss?.(review);
    clear();
  };

  const exportCurrent = () => {
    try {
      downloadTrippyWorkspaceBundle(currentState, { scope, summary: "Sanitized current TRIPPY workspace decisions" });
      setStatus("A sanitized workspace bundle was prepared for download.");
    } catch {
      setStatus("The browser could not prepare this workspace bundle.");
    }
  };

  const blocking = [...parseIssues, ...(review?.issues || [])].some((entry) => entry.severity === "error");
  const evidence = review?.bundle.changes.researchEvidence || [];

  return <section className={`trippy-update-inbox ${className}`.trim()} aria-labelledby={`${inputId}-title`}>
    <header className="trippy-inbox-heading">
      <span className="trippy-inbox-mark" aria-hidden="true">⇄</span>
      <div>
        <small>Local review lane</small>
        <h2 id={`${inputId}-title`}>{title}</h2>
        <p>Inspect agent proposals before they can change itinerary decisions.</p>
      </div>
      <button type="button" className="trippy-inbox-quiet" onClick={exportCurrent}>Export safe snapshot</button>
    </header>

    {!review && <div
      className={`trippy-inbox-dropzone${dragging ? " is-dragging" : ""}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); void readFile(event.dataTransfer.files[0]); }}
    >
      <input ref={inputRef} id={inputId} type="file" accept=".json,.trippy,application/json" onChange={(event) => void readFile(event.target.files?.[0])} disabled={reading} />
      <span className="trippy-inbox-file-icon" aria-hidden="true">{reading ? "···" : "＋"}</span>
      <strong>{reading ? "Checking structure and privacy" : "Drop an update here"}</strong>
      <p>Choose a <code>.trippy</code> or JSON bundle. It stays in this browser and is not retained.</p>
      <label htmlFor={inputId} aria-disabled={reading}>{reading ? "Reading…" : "Choose update"}</label>
      <small>Maximum {TRIPPY_BUNDLE_MAX_BYTES / 1024} KB · decisions and redacted evidence only</small>
    </div>}

    <div className="trippy-inbox-status" role="status" aria-live="polite">{status}</div>
    <IssueList issues={parseIssues} />

    {review && <div className="trippy-inbox-review">
      <div className="trippy-inbox-bundle-meta">
        <div><small>{review.bundle.kind === "snapshot" ? "Workspace snapshot" : "Proposed update"}</small><strong>{review.bundle.summary || review.bundle.bundleId}</strong></div>
        <dl>
          <div><dt>Created</dt><dd>{displayTimestamp(review.bundle.createdAt)}</dd></div>
          <div><dt>Safe changes</dt><dd>{review.diff.length}</dd></div>
          <div><dt>Filtered</dt><dd>{review.rejectedChangeCount}</dd></div>
        </dl>
      </div>

      <IssueList issues={review.issues} />

      <div className="trippy-inbox-diff" aria-label="Proposed workspace changes">
        <header><div><small>Before → after</small><h3>Decision diff</h3></div><span>{review.diff.length} change{review.diff.length === 1 ? "" : "s"}</span></header>
        {review.diff.length === 0 ? <p className="trippy-inbox-empty">Every proposed reference was unchanged or outside this trip.</p> : <ol>
          {review.diff.map((entry) => <li key={entry.path}>
            <span>{entry.section}</span>
            <div><strong>{entry.label}</strong><code>{entry.path}</code></div>
            <p><del>{entry.before}</del><ins>{entry.after}</ins></p>
          </li>)}
        </ol>}
      </div>

      {evidence.length > 0 && <details className="trippy-inbox-evidence">
        <summary>Review {evidence.length} sanitized evidence note{evidence.length === 1 ? "" : "s"}</summary>
        <div>{evidence.map((item) => <article key={item.id}>
          <span>{item.kind}</span><strong>{item.source}</strong><p>{item.summary}</p>
          <small>{item.subjectKind} · {item.subjectId} · checked {displayTimestamp(item.checkedAt)}</small>
          {item.limitations.length > 0 && <ul>{item.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>}
        </article>)}</div>
      </details>}

      <aside className="trippy-inbox-safety">
        <strong>No booking authority</strong>
        <p>Accepting can update planning selections and evidence notes only. It cannot confirm, hold, purchase, contact a provider, or import private booking data.</p>
      </aside>

      <footer>
        <button type="button" className="trippy-inbox-secondary" onClick={dismiss} disabled={accepting}>Dismiss</button>
        <button type="button" className="trippy-inbox-primary" onClick={() => void accept()} disabled={accepting || blocking || review.diff.length === 0}>
          {accepting ? "Applying…" : `Accept ${review.diff.length} reviewed change${review.diff.length === 1 ? "" : "s"}`}
        </button>
      </footer>
    </div>}
  </section>;
}
