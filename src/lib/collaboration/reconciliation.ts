import { validateCollaborationState, type CollaborationState } from "./schema.ts";

export type Choice = "local" | "latest";
type Value = unknown;
export type ReconciliationChange = { key: string; label: string; base: Value; local: Value; latest: Value; conflict: boolean; suggested: Choice };
const equal = (a: Value, b: Value) => JSON.stringify(a) === JSON.stringify(b);

/** Entity deletions are atomic, fields of surviving entities are independent, days keep their explicit order. */
export function reconciliationChanges(baseInput: CollaborationState, localInput: CollaborationState, latestInput: CollaborationState): ReconciliationChange[] {
  const base = validateCollaborationState(baseInput), local = validateCollaborationState(localInput), latest = validateCollaborationState(latestInput);
  const changes: ReconciliationChange[] = [];
  function add(key: string, label: string, b: Value, l: Value, r: Value) {
    if (equal(b, l) && equal(b, r)) return;
    changes.push({ key, label, base: b, local: l, latest: r, conflict: !equal(l, r) && !equal(b, l) && !equal(b, r), suggested: equal(b, l) ? "latest" : "local" });
  }
  for (const field of ["title", "startDate", "endDate"] as const) add(field, field, base[field], local[field], latest[field]);
  for (const collection of ["cities", "activities", "suggestions"] as const) {
    const ids = new Set([...(base[collection] || []), ...(local[collection] || []), ...(latest[collection] || [])].map(item => item.id));
    for (const id of ids) {
      const b = (base[collection] || []).find(item => item.id === id), l = (local[collection] || []).find(item => item.id === id), r = (latest[collection] || []).find(item => item.id === id);
      const label = `${collection}: ${l && "title" in l ? l.title : l && "name" in l ? l.name : id}`;
      if (collection === "suggestions" || !b || !l || !r) add(`${collection}/${id}`, label, b, l, r);
      else for (const field of new Set([...Object.keys(b), ...Object.keys(l), ...Object.keys(r)])) {
        if (field === "id") continue;
        add(`${collection}/${id}/${field}`, `${label} · ${field}`, (b as Record<string, Value>)[field], (l as Record<string, Value>)[field], (r as Record<string, Value>)[field]);
      }
    }
  }
  for (const day of new Set([...Object.keys(base.days), ...Object.keys(local.days), ...Object.keys(latest.days)])) add(`days/${day}`, `Day ${day} · ordered activities`, base.days[day], local.days[day], latest.days[day]);
  return changes;
}

export function resolveReconciliation(base: CollaborationState, local: CollaborationState, latest: CollaborationState, choices: Record<string, Choice>): CollaborationState {
  // Server-attributed votes/comments always come from latest; they are never client merge choices.
  const result = structuredClone(validateCollaborationState(latest));
  for (const change of reconciliationChanges(base, local, latest)) {
    const choice = choices[change.key];
    if (choice !== "local" && choice !== "latest") throw new Error("Choose a value for every change before applying reconciliation.");
    const value = choice === "local" ? change.local : change.latest;
    const [collection, id, field] = change.key.split("/");
    if (collection === "cities" || collection === "activities" || collection === "suggestions") {
      if (collection === "suggestions" && !result.suggestions) result.suggestions = [];
      const items = result[collection] as unknown as Array<Record<string, Value>>;
      const index = items.findIndex(item => item.id === id);
      if (!field) {
        if (index !== -1) items.splice(index, 1);
        if (value !== undefined) items.push(structuredClone(value) as Record<string, Value>);
      } else {
        if (index === -1) throw new Error("An edited entity is missing. Review its deletion choice.");
        if (value === undefined) delete items[index][field]; else items[index][field] = structuredClone(value);
      }
    } else if (collection === "days") {
      if (value === undefined) delete result.days[id]; else result.days[id] = structuredClone(value) as string[];
    } else (result as unknown as Record<string, Value>)[collection] = value;
  }
  // Never silently drop deleted references, duplicate assignments, or out-of-range dates.
  return validateCollaborationState(result);
}

export type RecoverableBoard = { version: 1; roomId: string | null; revision: number; base: CollaborationState | null; state: CollaborationState };
export function recoveryKey(roomId?: string) { return `trippy.board-recovery.${roomId || "local"}`; }
export function validateRecovery(input: unknown, roomId?: string): RecoverableBoard {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid saved board draft.");
  const value = input as Record<string, unknown>;
  if (Object.keys(value).sort().join(",") !== "base,revision,roomId,state,version" || value.version !== 1 || value.roomId !== (roomId || null) || !Number.isSafeInteger(value.revision) || (value.revision as number) < 0 || (roomId ? value.base === null || value.revision === 0 : value.base !== null || value.revision !== 0)) throw new Error("Invalid saved board draft.");
  return { version: 1, roomId: roomId || null, revision: value.revision as number, base: value.base === null ? null : validateCollaborationState(value.base), state: validateCollaborationState(value.state) };
}
export function serializeRecovery(state: CollaborationState, base: CollaborationState | null, revision: number, roomId?: string) {
  return JSON.stringify(validateRecovery({ version: 1, roomId: roomId || null, revision, base, state }, roomId));
}
export function parseRecovery(raw: string, roomId?: string) {
  if (raw.length > 600000) throw new Error("Saved board draft is too large.");
  return validateRecovery(JSON.parse(raw), roomId);
}
