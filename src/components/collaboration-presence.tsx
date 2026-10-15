'use client';
import { useEffect, useRef, useState } from 'react';
import { consumePresenceStream, validatePresenceSummary, type PresenceSummary } from '../lib/collaboration/presence';

export default function CollaborationPresence({ roomId, access, connected, onRevision }: { roomId: string; access: string; connected: boolean; onRevision: (revision: number) => void }) {
  const [announce, setAnnounce] = useState(false), [live, setLive] = useState(false), [summary, setSummary] = useState<PresenceSummary | null>(null), [status, setStatus] = useState('Presence is read-only until you opt in.');
  const revisionCallback = useRef(onRevision);
  useEffect(() => { revisionCallback.current = onRevision; }, [onRevision]);
  useEffect(() => {
    if (!announce || !connected || !access) return;
    return () => {
      // Best-effort withdrawal; another tab sharing this capability may renew it. No retry is attempted.
      void fetch(`/api/collaboration/rooms/${roomId}/presence`, { method: 'POST', headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ present: false }), cache: 'no-store', signal: AbortSignal.timeout(3000) }).catch(() => undefined);
    };
  }, [roomId, access, connected, announce]);
  useEffect(() => {
    if (!connected || !access) return;
    const controller = new AbortController(); let stopped = false, streaming = false, pending = false, lastAnnounced = 0;
    const headers = { Authorization: `Bearer ${access}` };
    const accept = (value: PresenceSummary) => { if (stopped || controller.signal.aborted) return; setSummary(value); revisionCallback.current(value.revision); };
    async function refresh() {
      if (stopped || pending) return;
      const renew = announce && Date.now() - lastAnnounced >= 10000;
      if (streaming && !renew) return;
      pending = true;
      try {
        const response = await fetch(`/api/collaboration/rooms/${roomId}/presence`, { method: renew ? 'POST' : 'GET', headers: { ...headers, ...(renew ? { 'Content-Type': 'application/json' } : {}) }, ...(renew ? { body: JSON.stringify({ present: true }) } : {}), cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
        if (!response.ok) throw new Error('Presence unavailable; checking room access with normal refresh.');
        const value = validatePresenceSummary(await response.json());
        if (renew) lastAnnounced = Date.now(); accept(value);
        if (!stopped && !streaming) setStatus(live ? 'Live connection retrying; four-second refresh remains active.' : 'Four-second refresh. Presence leases expire after 30 seconds.');
      } catch { if (!stopped) { setSummary(null); setStatus('Presence unavailable. Your board and drafts are unchanged; normal room refresh remains active.'); } }
      finally { pending = false; }
    }
    async function stream() {
      if (stopped || !live) return;
      try {
        const streamSignal = AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]);
        const response = await fetch(`/api/collaboration/rooms/${roomId}/events`, { headers, cache: 'no-store', signal: streamSignal });
        await consumePresenceStream(response, value => { if (!stopped) { streaming = true; setStatus('Live revision notices connected; normal four-second refresh remains active.'); accept(value); } }, streamSignal);
      } catch { /* Room polling remains independent and preserves drafts. */ }
      finally {
        streaming = false;
        if (!stopped) { setSummary(null); setStatus('Live connection ended. Four-second refresh remains active; reconnecting shortly.'); reconnect = window.setTimeout(() => { void stream(); }, 4000); }
      }
    }
    let reconnect: number | undefined;
    void refresh(); if (live) void stream();
    const interval = window.setInterval(() => { void refresh(); }, 4000);
    return () => {
      stopped = true; controller.abort(); window.clearInterval(interval); window.clearTimeout(reconnect);
    };
  }, [roomId, access, connected, announce, live]);
  const visible = connected ? summary?.presence || [] : [];
  return <section className="collab-presence-strip" aria-label="Shared access presence"><div className="collab-presence-summary"><span className={`collab-presence-dot ${connected?'connected':''}`} aria-hidden="true"/><div><strong>{visible.length ? `${visible.length} opted-in access ${visible.length === 1 ? 'link' : 'links'} active` : 'Plan together, at your pace'}</strong><p role="status">{connected ? status : 'Room updates paused. Your drafts are preserved.'}</p>{visible.length > 0 && <ul>{visible.map((item,index)=><li key={item.id}>{item.role} access {index+1}</li>)}</ul>}</div></div><div className="collab-presence-controls"><div><label><input type="checkbox" aria-label="Show this access as active for 30 seconds, renewed while this tab is open" checked={announce} disabled={!connected} onChange={event=>{setSummary(null);setAnnounce(event.target.checked);}}/>Show active access</label><label><input type="checkbox" aria-label="Use faster live revision notices" checked={live} disabled={!connected} onChange={event=>setLive(event.target.checked)}/>Faster updates</label></div><details><summary>Privacy & presence</summary><small>Presence is optional and expires after 30 seconds, renewed while the tab stays open. Access links represent capabilities, not verified people. Tabs sharing one link share its lease. Drafts and personal identities stay private. Faster notices reconnect in bounded sessions; four-second refresh remains available.</small></details></div></section>;
}
