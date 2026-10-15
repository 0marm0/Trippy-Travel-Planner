import { validateWorkspace, type GenericWorkspace } from './generic-trip-workspace.ts';
import { researchTripIdentity } from './research-ledger.ts';
import { quoteTripIdentity } from './trip-quote-comparison.ts';

export type ScenarioBookingPolicy = 'exclude' | 'retain-existing';
export type ScenarioReceipt = { version: 1; kind: 'local-scenario-copy'; sourceTripId: string; scenarioTripId: string; copiedAt: string; bookingPolicy: ScenarioBookingPolicy; retainedBookingStates: Array<{ id: string; state: string }>; omittedBookingCount: number; omittedBookingDetailCount: number; omittedBookingEvidenceCount: number; evidenceIdentityRebinding: 'same-facts-new-trip-identity'; notice: string };
export type ScenarioPreview = { sourceSnapshot: string; name: string; bookingPolicy: ScenarioBookingPolicy; workspace: GenericWorkspace; receipt: ScenarioReceipt };

/** A new planning identity is an explicit local copy, never a new booking or a renewed quote. */
export function previewWorkspaceScenario(source: GenericWorkspace, name: string, bookingPolicy: ScenarioBookingPolicy = 'exclude', scenarioId = `scenario-${crypto.randomUUID()}`, copiedAt = new Date().toISOString()): ScenarioPreview {
  if (validateWorkspace(source).length) throw new Error('Validate the source workspace before creating a scenario.');
  if (!['exclude', 'retain-existing'].includes(bookingPolicy) || typeof name !== 'string' || !name.trim() || name.trim() === source.trip.name || scenarioId === source.trip.id || !/^scenario-[a-z0-9-]{1,54}$/.test(scenarioId) || !Number.isFinite(Date.parse(copiedAt)) || new Date(copiedAt).toISOString() !== copiedAt) throw new Error('Use a different scenario name and a new scenario identity.');
  const next = structuredClone(source);
  next.trip.id = scenarioId; next.trip.name = name.trim();
  // Rebinding is valid only because the dates, destinations, traveler basis, preferences and all source facts remain identical.
  if (next.researchEvidence) next.researchEvidence.tripIdentity = researchTripIdentity(next.trip);
  if (next.quoteEvidence) next.quoteEvidence.tripIdentity = quoteTripIdentity(next.trip);
  if (next.routeScenarios) next.routeScenarios.tripIdentity = quoteTripIdentity(next.trip);
  const omit = bookingPolicy === 'exclude';
  const receipt: ScenarioReceipt = { version: 1, kind: 'local-scenario-copy', sourceTripId: source.trip.id, scenarioTripId: scenarioId, copiedAt, bookingPolicy, retainedBookingStates: omit ? [] : source.trip.bookings.map(item => ({ id: item.id, state: item.status })), omittedBookingCount: omit ? source.trip.bookings.length : 0, omittedBookingDetailCount: omit ? source.bookingDetails.length : 0, omittedBookingEvidenceCount: omit ? source.itemEvidence?.filter(item => item.target === 'booking').length || 0 : 0, evidenceIdentityRebinding: 'same-facts-new-trip-identity', notice: 'Local scenario copy. Existing source dates, prices and evidence timestamps are retained, not refreshed. Copied booking states describe the same recorded bookings; this copy creates no new reservation or confirmation. No account ownership or shared-room access is copied.' };
  if (omit) {
    next.trip.bookings = []; next.bookingDetails = [];
    if (next.bookingPlans) next.bookingPlans = {version:1,items:[]};
    if (next.itemEvidence) next.itemEvidence = next.itemEvidence.filter(item => item.target !== 'booking');
  }
  if (validateWorkspace(next).length) throw new Error('Scenario identity cannot be rebound safely. No records were copied or saved.');
  return { sourceSnapshot: JSON.stringify(source), name: next.trip.name, bookingPolicy, workspace: next, receipt };
}
export function acceptWorkspaceScenario(current: GenericWorkspace, preview: ScenarioPreview): { workspace: GenericWorkspace; receipt: ScenarioReceipt } {
  if (JSON.stringify(current) !== preview.sourceSnapshot) throw new Error('The source workspace changed after preview. Preview the scenario again.');
  const checked = previewWorkspaceScenario(current, preview.name, preview.bookingPolicy, preview.receipt.scenarioTripId, preview.receipt.copiedAt);
  if (JSON.stringify(checked.workspace) !== JSON.stringify(preview.workspace) || JSON.stringify(checked.receipt) !== JSON.stringify(preview.receipt)) throw new Error('The scenario preview changed. Preview again.');
  return { workspace: checked.workspace, receipt: checked.receipt };
}
