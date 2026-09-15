"use client";

import { useEffect, useState } from "react";
import { Icon } from "./planner-icon";
import "./deployment-center.css";

export type WorkspaceMode = "agent" | "local" | "cloud" | "sample";

const modes: Array<{ id: WorkspaceMode; icon: string; title: string; note: string; badge?: string }> = [
  { id: "agent", icon: "activities", title: "Agent connected", note: "Codex or Claude researches; every update waits in a review inbox.", badge: "Recommended" },
  { id: "local", icon: "download", title: "Local private", note: "Run TRIPPY on this computer with private files and host-local connectors." },
  { id: "cloud", icon: "globe", title: "Personal cloud", note: "Your own deployment, optional server APIs, and future encrypted sync." },
  { id: "sample", icon: "route", title: "Public sample", note: "Explore the complete redacted workspace with no credentials." },
];

const instructions: Record<WorkspaceMode, { title: string; steps: string[]; status: string }> = {
  agent: {
    title: "Research outside the website. Review inside it.",
    status: "No website credentials required",
    steps: ["Connect only the tools you approve inside Codex or Claude.", "Ask the agent for a sanitized .trippy update bundle.", "Review every proposed change before applying it to this browser."],
  },
  local: {
    title: "A private workspace on your computer.",
    status: "Private data stays local",
    steps: ["Install dependencies and start the local Next.js app.", "Keep provider keys in untracked .env.local only.", "Enable the private-file gate only on localhost."],
  },
  cloud: {
    title: "An independent deployment for each traveler.",
    status: "Cloud sync requires auth + storage",
    steps: ["Deploy into your own Vercel account.", "Add server API keys only if the website should search directly.", "Keep private trips in authenticated encrypted storage—not the public repository."],
  },
  sample: {
    title: "A zero-setup product tour.",
    status: "Safe public data",
    steps: ["Use the redacted 2026 sample.", "Edit and rank locally in this browser.", "Export sanitized HTML, CSV, or PDF without connecting an account."],
  },
};

function deployUrl() {
  const repository = process.env.NEXT_PUBLIC_TRIPPY_REPOSITORY_URL?.trim();
  return repository ? `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repository)}` : "";
}

export default function DeploymentCenter({ current, onChoose, onOpenInbox, onClose }: { current: WorkspaceMode; onChoose: (mode: WorkspaceMode) => void; onOpenInbox: () => void; onClose: () => void }) {
  const [selected, setSelected] = useState<WorkspaceMode>(current);
  const [copied, setCopied] = useState(false);
  const detail = instructions[selected];
  const oneClick = deployUrl();

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const copyLocal = async () => {
    await navigator.clipboard?.writeText("npm install\nnpm run dev");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="launch-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="launch-center glass" role="dialog" aria-modal="true" aria-labelledby="launch-title">
      <header>
        <div><span className="launch-kicker">Workspace launch</span><h2 id="launch-title">Choose where TRIPPY lives.</h2></div>
        <button className="drawer-close" onClick={onClose} aria-label="Close workspace launch"><Icon name="close" /></button>
      </header>
      <div className="launch-grid">
        <nav aria-label="Workspace modes">
          {modes.map((mode) => <button key={mode.id} className={selected === mode.id ? "active" : ""} aria-pressed={selected === mode.id} onClick={() => setSelected(mode.id)}>
            <span><Icon name={mode.icon} /></span><div><b>{mode.title}</b><small>{mode.note}</small></div>{mode.badge && <em>{mode.badge}</em>}
          </button>)}
        </nav>
        <article className={`launch-detail mode-${selected}`}>
          <div className="launch-status"><i /><span>{detail.status}</span></div>
          <h3>{detail.title}</h3>
          <ol>{detail.steps.map((step) => <li key={step}><span>{detail.steps.indexOf(step) + 1}</span><p>{step}</p></li>)}</ol>
          <div className="launch-boundary">
            <Icon name="shield" /><div><b>One repository, separate custody</b><small>Agent tokens stay with the agent. Deployment secrets stay server-side. Trip files never contain either.</small></div>
          </div>
          <div className="launch-actions">
            {selected === "agent" && <button className="primary" onClick={onOpenInbox}>Open update inbox <Icon name="arrow" /></button>}
            {selected === "local" && <button className="primary" onClick={copyLocal}>{copied ? "Copied" : "Copy local commands"} <Icon name="download" /></button>}
            {selected === "cloud" && (oneClick ? <a className="primary" href={oneClick} target="_blank" rel="noreferrer">Deploy your own <Icon name="external" /></a> : <button className="primary" disabled>Deploy link available after repo publication</button>)}
            {selected === "sample" && <button className="primary" onClick={onClose}>Continue with sample <Icon name="arrow" /></button>}
            <button onClick={() => onChoose(selected)}>Use this mode</button>
          </div>
        </article>
      </div>
      <footer><span>Every mode works without live providers.</span><button onClick={onClose}>Done</button></footer>
    </section>
  </div>;
}
