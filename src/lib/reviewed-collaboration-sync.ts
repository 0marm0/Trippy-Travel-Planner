import { genericCollaborationBoard } from './generic-collaboration.ts';
import { validateCollaborationState, type CollaborationState } from './collaboration/schema.ts';
import { reconciliationChanges, resolveReconciliation, type Choice, type ReconciliationChange } from './collaboration/reconciliation.ts';
import { reconcileItemEvidence, validateWorkspace, type GenericWorkspace } from './generic-trip-workspace.ts';

export type BoardSyncBase = { version: 1; tripId: string; board: CollaborationState };
export type BoardSyncReview = { workspaceSnapshot: string; base: BoardSyncBase; incoming: CollaborationState; changes: ReconciliationChange[]; warnings: string[] };
export type BoardSyncSchedule = Record<string, { date: string; time: string; durationMinutes?: number }>;
const safeBoard = (input: unknown): CollaborationState => {
  const board = validateCollaborationState(input);
  // Discussion and proposals are server history, never owner-workspace edits.
  return { title: board.title, startDate: board.startDate, endDate: board.endDate, cities: board.cities, activities: board.activities, days: board.days };
};
export function createBoardSyncBase(workspace: GenericWorkspace): BoardSyncBase {
  return { version: 1, tripId: workspace.trip.id, board: genericCollaborationBoard(workspace) };
}
function parse(text: string): unknown {
  if (text.length > 600000) throw new Error('Board JSON exceeds the 600 KB limit.');
  try { return JSON.parse(text); } catch { throw new Error('Invalid board JSON; no changes applied.'); }
}
export function previewBoardSync(workspace: GenericWorkspace, baseText: string, incomingText: string): BoardSyncReview {
  if (validateWorkspace(workspace).length) throw new Error('Validate the current workspace first.');
  const raw = parse(baseText) as BoardSyncBase;
  if (!raw || typeof raw !== 'object' || Object.keys(raw).sort().join(',') !== 'board,tripId,version' || raw.version !== 1 || raw.tripId !== workspace.trip.id) throw new Error('Use a base snapshot exported from this trip.');
  const base = { version: 1 as const, tripId: raw.tripId, board: safeBoard(raw.board) }, incoming = safeBoard(parse(incomingText)), current = safeBoard(genericCollaborationBoard(workspace));
  const cityIds = (board: CollaborationState) => board.cities.map(city => city.id).sort().join('|');
  for (const board of [base.board, incoming]) {
    if (board.startDate !== current.startDate || board.endDate !== current.endDate || cityIds(board) !== cityIds(current)) throw new Error('Trip dates or destination identities differ. Review these manually in the owner workspace before importing.');
  }
  const warnings = ['Board order does not set clock times. Existing activity times are retained; provide a time and duration for new ideas. Unscheduled ideas require an explicit day. Day destination allocations remain unchanged.'];
  if (incoming.activities.some(activity => activity.image || activity.sourceUrl || activity.lat !== undefined)) warnings.push('Activity photos, source links and activity coordinates stay on the board; those optional fields are not mapped by this reviewed import.');
  warnings.push('Pending proposals, accepted route/stay ideas, discussion and access information remain separate on the board and are excluded from this owner-workspace import. Only applied board city, activity and day edits are compared.');
  return { workspaceSnapshot: JSON.stringify(workspace), base, incoming, changes: reconciliationChanges(base.board, current, incoming), warnings };
}
export function applyBoardSync(workspace: GenericWorkspace, review: BoardSyncReview, choices: Record<string, Choice>, schedule: BoardSyncSchedule = {}): GenericWorkspace {
  if (JSON.stringify(workspace) !== review.workspaceSnapshot) throw new Error('The owner workspace changed after preview. Preview again before applying.');
  // Rebuild the comparison from validated input rather than trusting a caller-mutated change list.
  const checked = previewBoardSync(workspace, JSON.stringify(review.base), JSON.stringify(review.incoming));
  const merged = resolveReconciliation(checked.base.board, genericCollaborationBoard(workspace), checked.incoming, choices);
  const next = structuredClone(workspace);
  next.trip.name = merged.title;
  next.trip.destinations = next.trip.destinations.map(city => ({ ...city, name: merged.cities.find(item => item.id === city.id)!.name }));
  next.places = merged.cities.filter(city => city.lat !== undefined && city.lng !== undefined).map(city => ({ placeId: city.id, lat: city.lat!, lng: city.lng! }));
  next.activities = merged.activities.map(activity => {
    const previous = workspace.activities.find(item => item.id === activity.id), projected = genericCollaborationBoard(workspace).activities.find(item => item.id === activity.id);
    const explicit = schedule[activity.id];
    const date = explicit?.date || Object.entries(merged.days).find(([, ids]) => ids.includes(activity.id))?.[0];
    const time = explicit?.time || previous?.time;
    const durationMinutes = activity.durationMinutes ?? explicit?.durationMinutes;
    if (!date || !time || !durationMinutes) throw new Error(`Choose an explicit day, time and duration for “${activity.title}” before applying.`);
    // Strip only the exact synthetic time prefix from our own projection. Free-form incoming notes remain intact.
    const prefix = previous ? `${previous.time} · ` : '';
    const notes = projected?.notes === activity.notes ? previous!.notes : prefix && activity.notes.startsWith(prefix) ? activity.notes.slice(prefix.length) : activity.notes;
    return { ...(previous ? structuredClone(previous) : {}), id: activity.id, placeId: activity.cityId, title: activity.title, date, time, durationMinutes, notes };
  });
  for (const evidence of workspace.itemEvidence || []) if (evidence.target === 'activity' && !next.activities.some(activity => activity.id === evidence.targetId)) throw new Error('A deleted activity has an evidence receipt. Keep the local activity to preserve its receipt; review deletion manually.');
  const reconciled = reconcileItemEvidence(workspace, next);
  if (validateWorkspace(reconciled).length) throw new Error('The selected changes cannot form a valid owner workspace. Review missing references, unsafe text, field limits and schedule choices.');
  return reconciled;
}
