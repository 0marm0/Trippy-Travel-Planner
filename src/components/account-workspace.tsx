'use client';
import { useEffect, useState } from 'react';
import { createAuthClient } from 'better-auth/react';
import { saveWorkspace, validateWorkspace, type GenericWorkspace } from '@/lib/generic-trip-workspace';
import './account-workspace.css';
const auth = createAuthClient();
type Plan = { id: string; revision: number; name: string };
type Snapshot = { id: string; revision: number; workspace: GenericWorkspace };
async function request(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers }, cache: 'no-store' });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'Account request failed.');
  return value;
}
export function AccountWorkspaceControls({ workspace, onLoad }: { workspace?: GenericWorkspace; onLoad?: (workspace: GenericWorkspace) => void }) {
  const [ready, setReady] = useState(false), [signedIn, setSignedIn] = useState(false), [message, setMessage] = useState('Checking private account availability…');
  const [plans, setPlans] = useState<Plan[]>([]), [selected, setSelected] = useState<Snapshot | null>(null), [preview, setPreview] = useState<Snapshot | null>(null);
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState(''), [busy, setBusy] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(false);
  async function refresh() {
    const response = await fetch('/api/account', { cache: 'no-store' });
    if (response.status === 401) { setReady(true); setSignedIn(false); setPlans([]); setSelected(null); return; }
    const value = await response.json(); setReady(Boolean(value.ready)); setSignedIn(Boolean(value.signedIn)); setMessage(value.message || 'Private plans are encrypted on this server.');
    if (value.signedIn) setPlans((await request('/api/account/plans')).plans);
  }
  useEffect(() => { const timer = window.setTimeout(() => { void refresh().catch(() => setMessage('Private accounts are unavailable. Browser-only planning remains available.')); }, 0); return () => window.clearTimeout(timer); }, []);
  async function run(operation: () => Promise<void>) { setBusy(true); try { await operation(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Account request failed.'); } finally { setBusy(false); } }
  async function authenticate(signUp: boolean) {
    const result = signUp ? await auth.signUp.email({ email, password, name }) : await auth.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message || 'Unable to sign in.');
    setPassword(''); await refresh();
  }
  function acceptPreview() {
    if (!preview) return;
    if (validateWorkspace(preview.workspace).length) { setMessage('Stored plan failed validation.'); return; }
    if (onLoad) onLoad(preview.workspace); else saveWorkspace(localStorage, preview.workspace);
    setSelected(preview); setPreview(null); setMessage(onLoad ? 'Loaded the reviewed private plan.' : 'Reviewed plan loaded into this browser. Open the planner to continue.');
  }
  async function exportPlan(plan: Plan) {
    const snapshot = await request(`/api/account/plans/${plan.id}`) as Snapshot;
    if (validateWorkspace(snapshot.workspace).length) throw new Error('Export failed validation.');
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot.workspace, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'planning-workspace.json'; link.click(); URL.revokeObjectURL(url); setMessage('Downloaded sanitized planning workspace. Keep real plans private.');
  }
  return <section className="account-workspace" aria-label="Private account and plans">
    <h2>Private account</h2><p>Optional account storage for sanitized planning records. Signing in does not upload your browser draft.</p>
    <p role="status">{message}</p>
    {ready && !signedIn && <form onSubmit={event => { event.preventDefault(); void run(() => authenticate(false)); }}>
      <label>Email<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" minLength={12} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} /></label>
      <label>Display name (for a new account)<input autoComplete="name" maxLength={80} value={name} onChange={event => setName(event.target.value)} /></label>
      <button disabled={busy}>Sign in</button><button type="button" disabled={busy || !name || !email || password.length < 12} onClick={() => void run(() => authenticate(true))}>Create account</button>
      <p>Password recovery requires a server administrator’s configured email transport; this installation does not send recovery emails by default.</p>
    </form>}
    {signedIn && <>
      <button disabled={busy} onClick={() => void run(async () => { await auth.signOut(); setPreview(null); await refresh(); })}>Sign out</button>
      {workspace && <><button disabled={busy} onClick={() => void run(async () => { const value = await request('/api/account/plans', { method: 'POST', body: JSON.stringify({ workspace }) }); await refresh(); setSelected(value); setMessage('Created an encrypted private copy.'); })}>Save current draft as new private plan</button>
      {selected && <button disabled={busy} onClick={() => void run(async () => { const value = await request(`/api/account/plans/${selected.id}`, { method: 'PUT', headers: { 'If-Match': String(selected.revision) }, body: JSON.stringify({ workspace }) }); await refresh(); setSelected(value); setMessage('Saved private plan.'); })}>Update loaded private plan</button>}</>}
      <ul>{plans.map(plan => <li key={plan.id}><strong>{plan.name}</strong> <span>Revision {plan.revision}</span>
        <button disabled={busy} onClick={() => void run(async () => { setPreview(await request(`/api/account/plans/${plan.id}`)); })}>Preview for loading</button>
        <button disabled={busy} onClick={() => void run(() => exportPlan(plan))}>Export sanitized JSON</button>
        <button disabled={busy} onClick={() => { if (window.confirm('Delete this stored plan? Your browser draft remains available.')) void run(async () => { await request(`/api/account/plans/${plan.id}`, { method: 'DELETE', headers: { 'If-Match': String(plan.revision) } }); if (selected?.id === plan.id) setSelected(null); await refresh(); }); }}>Delete plan</button>
      </li>)}</ul>
      {preview && <div className="account-preview"><h3>Review before loading</h3><p>{preview.workspace.trip.name}: {preview.workspace.trip.dateWindow.earliestDeparture} through {preview.workspace.trip.dateWindow.latestReturn}; {preview.workspace.trip.destinations.map(place => place.name).join(', ')}. {preview.workspace.activities.length} activities. Loading replaces the active browser draft.</p><button onClick={acceptPreview}>Accept and load</button><button onClick={() => setPreview(null)}>Cancel</button></div>}
      <button onClick={() => setDeleteAccount(!deleteAccount)}>Delete account…</button>
      {deleteAccount && <form onSubmit={event => { event.preventDefault(); void run(async () => { const result = await auth.deleteUser({ password }); if (result.error) throw new Error(result.error.message || 'Account deletion failed.'); setPassword(''); setPreview(null); setSelected(null); setDeleteAccount(false); await refresh(); setMessage('Account and stored plans deleted. Local browser drafts and previous exports remain your responsibility.'); }); }}><p>Deletes your account, sessions and every stored private plan. Enter your current password to confirm.</p><label>Current password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label><button disabled={busy}>Permanently delete account and plans</button></form>}
    </>}
  </section>;
}
