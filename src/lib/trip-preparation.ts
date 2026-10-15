import { hasPrivatePlanningText } from './planning-privacy.ts';
import type { GenericWorkspace } from './generic-trip-workspace.ts';

export type PreparationTask = { id: string; title: string; category: 'task' | 'packing'; assignee: string; done: boolean; dueDate?: string; placeId?: string; activityId?: string };
export type ActivityAlternative = { id: string; activityId: string; fallbackActivityId: string; reason: 'rainy-day' | 'low-energy' | 'accessibility' | 'other'; source: string; checkedAt: string; unknowns: string };
export type TripPreparation = { version: 1; tasks: PreparationTask[]; alternatives: ActivityAlternative[] };
export type FallbackPreview = { workspaceSnapshot: string; alternativeId: string; warnings: string[]; changes: Array<{ title: string; from: string; to: string }> };
export const emptyTripPreparation = (): TripPreparation => ({ version: 1, tasks: [], alternatives: [] });
const safeText = (value: unknown, max: number): value is string => typeof value === 'string' && value.length <= max && !/[\u0000-\u001f\u007f]|@|https?:|www\.|mail[t]o:|\+?\d[\d ()-]{6,}\d/i.test(value.normalize('NFKC')) && !hasPrivatePlanningText(value);
const id = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9-]{1,64}$/.test(value) && !hasPrivatePlanningText(value);
function keys(value: unknown, required: string[], optional: string[] = []): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) && required.every(key => Object.hasOwn(value,key)) && Object.keys(value).every(key => [...required,...optional].includes(key)); }
function checkedTime(value: unknown): value is string { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value.slice(0,10)+'T00:00:00Z').toISOString().slice(0,10) === value.slice(0,10); }
/** Strict, bounded planning-only data. Aliases express responsibility, never verified identity. */
export function validateTripPreparation(input: unknown, workspace: GenericWorkspace): TripPreparation {
  const fail = (): never => { throw new Error('Preparation contains invalid, private or missing references; nothing changed.'); };
  if (!keys(input,['version','tasks','alternatives']) || input.version !== 1 || !Array.isArray(input.tasks) || input.tasks.length > 200 || !Array.isArray(input.alternatives) || input.alternatives.length > 100) return fail();
  const taskIds = new Set<string>(), alternativeIds = new Set<string>();
  for (const raw of input.tasks) {
    if (!keys(raw,['id','title','category','assignee','done'],['dueDate','placeId','activityId'])) return fail();
    const task = raw as unknown as PreparationTask;
    if (!id(task.id) || taskIds.has(task.id) || !safeText(task.title,120) || !task.title.trim() || !['task','packing'].includes(task.category) || !safeText(task.assignee,40) || typeof task.done !== 'boolean') return fail();
    if (Object.hasOwn(task,'dueDate') && !workspace.days.some(day => day.date === task.dueDate)) return fail();
    if (Object.hasOwn(task,'placeId') && !workspace.trip.destinations.some(place => place.id === task.placeId)) return fail();
    if (Object.hasOwn(task,'activityId') && !workspace.activities.some(activity => activity.id === task.activityId && (!task.placeId || activity.placeId === task.placeId))) return fail();
    taskIds.add(task.id);
  }
  for (const raw of input.alternatives) {
    if (!keys(raw,['id','activityId','fallbackActivityId','reason','source','checkedAt','unknowns'])) return fail();
    const item = raw as unknown as ActivityAlternative;
    const original = workspace.activities.find(activity => activity.id === item.activityId), fallback = workspace.activities.find(activity => activity.id === item.fallbackActivityId);
    if (!id(item.id) || alternativeIds.has(item.id) || !id(item.activityId) || !id(item.fallbackActivityId) || !original || !fallback || original.id === fallback.id || original.placeId !== fallback.placeId || !['rainy-day','low-energy','accessibility','other'].includes(item.reason) || !safeText(item.source,160) || !safeText(item.unknowns,500) || !item.unknowns.trim() || typeof item.checkedAt !== 'string' || (item.checkedAt !== '' && !checkedTime(item.checkedAt)) || Boolean(item.source.trim()) !== Boolean(item.checkedAt)) return fail();
    alternativeIds.add(item.id);
  }
  return structuredClone(input as unknown as TripPreparation);
}
const minutes = (time: string) => { const [hour,minute] = time.split(':').map(Number); return hour*60+minute; };
function swap(workspace: GenericWorkspace, alternative: ActivityAlternative): GenericWorkspace {
  const original = workspace.activities.find(item => item.id === alternative.activityId)!, fallback = workspace.activities.find(item => item.id === alternative.fallbackActivityId)!;
  const changedIds = [original.id,fallback.id];
  return { ...workspace, activities: workspace.activities.map(item => item.id === original.id ? {...item,date:fallback.date,time:fallback.time} : item.id === fallback.id ? {...item,date:original.date,time:original.time} : item),
    preparation: {...workspace.preparation!, alternatives: workspace.preparation!.alternatives.map(item => item.id === alternative.id ? {...item,activityId:fallback.id,fallbackActivityId:original.id} : item)},
    ...(workspace.itemEvidence ? {itemEvidence:workspace.itemEvidence.map(item => item.target === 'activity' && changedIds.includes(item.targetId) ? {...item,reviewRequired:true} : item)} : {}) };
}
/** Preview an explicit schedule swap; neither activity nor its source metadata is discarded. */
export function previewActivityFallback(workspace: GenericWorkspace, alternativeId: string): FallbackPreview {
  const preparation = validateTripPreparation(workspace.preparation,workspace);
  const alternative = preparation.alternatives.find(item => item.id === alternativeId);
  if (!alternative) throw new Error('Fallback no longer exists.');
  const original = workspace.activities.find(item => item.id === alternative.activityId)!, fallback = workspace.activities.find(item => item.id === alternative.fallbackActivityId)!;
  const next = swap(workspace,alternative), warnings: string[] = ['Both activities keep their own duration, notes, photos and source records. Original activity moves to the fallback’s former slot. Review hours, travel and reservations manually.'];
  if (alternative.reason === 'accessibility') warnings.push('Accessibility is unverified. A fallback label does not establish step-free access or suitability.');
  if (!alternative.checkedAt) warnings.push('Manual fallback: source and checked time are unknown.');
  for (const item of next.activities.filter(item => [original.id,fallback.id].includes(item.id))) {
    const start = minutes(item.time), end = start+item.durationMinutes;
    if (end > 1440) warnings.push(`${item.title}: crosses midnight.`);
    if (next.days.some(day => day.date === item.date && day.placeId && day.placeId !== item.placeId)) warnings.push(`${item.title}: differs from its day destination.`);
    if (next.activities.some(other => other.id !== item.id && other.date === item.date && minutes(other.time) < end && minutes(other.time)+other.durationMinutes > start)) warnings.push(`${item.title}: overlaps another activity.`);
    if (next.trip.anchors.some(anchor => anchor.locked && anchor.date === item.date)) warnings.push(`${item.title}: review the locked anchor on this date.`);
  }
  warnings.push(`Unknowns: ${alternative.unknowns}`);
  return {workspaceSnapshot:JSON.stringify(workspace),alternativeId,warnings:[...new Set(warnings)],changes:[original,fallback].map(item => {const moved=next.activities.find(activity=>activity.id===item.id)!;return {title:item.title,from:`${item.date} ${item.time}`,to:`${moved.date} ${moved.time}`};})};
}
export function applyActivityFallback(workspace: GenericWorkspace, preview: FallbackPreview): GenericWorkspace {
  if (preview.workspaceSnapshot !== JSON.stringify(workspace)) throw new Error('Workspace changed since preview. Review the fallback again.');
  const currentPreview = previewActivityFallback(workspace,preview.alternativeId);
  if (JSON.stringify(currentPreview) !== JSON.stringify(preview)) throw new Error('Fallback preview changed. Review the fallback again.');
  const preparation = validateTripPreparation(workspace.preparation,workspace);
  const alternative = preparation.alternatives.find(item => item.id === preview.alternativeId);
  if (!alternative) throw new Error('Fallback no longer exists.');
  return swap(workspace,alternative);
}
