/**
 * A deliberately narrow, browser-safe interchange format for agent-proposed
 * workspace decisions. Bundles never carry booking records, credentials,
 * contact details, raw provider payloads, or executable markup.
 */

export const TRIPPY_BUNDLE_FORMAT = "trippy-workspace-update" as const;
export const TRIPPY_BUNDLE_VERSION = 1 as const;
export const TRIPPY_BUNDLE_MAX_BYTES = 192 * 1024;

const ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,79}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_MIME_TYPES = new Set(["", "application/json", "text/json", "application/octet-stream"]);
const PRIORITIES = new Set<TrippyPriority>(["must", "should", "could"]);
const EVIDENCE_KINDS = new Set<TrippyEvidenceKind>(["fact", "quote", "estimate", "recommendation", "manual", "historic", "unavailable"]);
const SUBJECT_KINDS = new Set<TrippyEvidenceSubjectKind>(["trip", "activity", "transport", "hotel"]);
const LIMITS = {
  mapEntries: 160,
  assignmentsPerDate: 40,
  savedItems: 500,
  evidence: 120,
  limitations: 8,
  text: 320,
  summary: 600,
} as const;

export type TrippyPriority = "must" | "should" | "could";
export type TrippyEvidenceKind = "fact" | "quote" | "estimate" | "recommendation" | "manual" | "historic" | "unavailable";
export type TrippyEvidenceSubjectKind = "trip" | "activity" | "transport" | "hotel";

export type TrippyResearchEvidence = {
  id: string;
  subjectKind: TrippyEvidenceSubjectKind;
  subjectId: string;
  kind: TrippyEvidenceKind;
  source: string;
  checkedAt: string;
  summary: string;
  limitations: string[];
};

/** Compatible with the existing workspace state; evidence is additive. */
export type TrippyWorkspaceState = {
  assignments: Record<string, string[]>;
  activityPriority: Record<string, TrippyPriority>;
  savedActivities: string[];
  selectedTransport: Record<string, string>;
  savedHotels: string[];
  selectedHotel: Record<string, string>;
  researchEvidence?: TrippyResearchEvidence[];
};

export type TrippyWorkspaceChanges = {
  assignments?: Record<string, string[]>;
  activityPriority?: Record<string, TrippyPriority | null>;
  savedActivities?: string[];
  selectedTransport?: Record<string, string | null>;
  savedHotels?: string[];
  selectedHotel?: Record<string, string | null>;
  researchEvidence?: TrippyResearchEvidence[];
};

export type TrippyUpdateBundle = {
  format: typeof TRIPPY_BUNDLE_FORMAT;
  version: typeof TRIPPY_BUNDLE_VERSION;
  kind: "update" | "snapshot";
  bundleId: string;
  tripId: string;
  createdAt: string;
  summary?: string;
  changes: TrippyWorkspaceChanges;
};

/** The canonical identifiers an imported proposal is allowed to reference. */
export type TrippyBundleScope = {
  tripId: string;
  dates: readonly string[];
  activityIds: readonly string[];
  transportOptions: Readonly<Record<string, readonly string[]>>;
  hotelOptions: Readonly<Record<string, readonly string[]>>;
};

export type TrippyBundleIssue = {
  path: string;
  message: string;
  severity: "error" | "warning";
};

export type TrippyBundleParseResult =
  | { ok: true; bundle: TrippyUpdateBundle; issues: TrippyBundleIssue[] }
  | { ok: false; issues: TrippyBundleIssue[] };

export type TrippyBundleDiff = {
  section: "Itinerary" | "Priorities" | "Transport" | "Hotels" | "Saved items" | "Research evidence";
  path: string;
  label: string;
  before: string;
  after: string;
};

export type TrippyBundleReview = {
  bundle: TrippyUpdateBundle;
  nextState: TrippyWorkspaceState;
  diff: TrippyBundleDiff[];
  issues: TrippyBundleIssue[];
  acceptedChangeCount: number;
  rejectedChangeCount: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ownEntries(value: UnknownRecord) {
  return Object.entries(value);
}

function issue(path: string, message: string, severity: TrippyBundleIssue["severity"] = "error"): TrippyBundleIssue {
  return { path, message, severity };
}

function hasOnlyKeys(value: UnknownRecord, allowed: readonly string[], path: string, issues: TrippyBundleIssue[]) {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) issues.push(issue(`${path}.[unsupported]`, "Unsupported field removed.", "warning"));
  }
}

function isSafeId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isDateTime(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 40 || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

/**
 * Keeps decision-useful prose while dropping markup, links, contact details,
 * confirmation references, and credential-like material.
 */
export function sanitizeTrippyBundleText(value: unknown, maxLength: number = LIMITS.text): string {
  if (typeof value !== "string") return "";
  let text = value
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/(?:https?:\/\/|www\.|javascript:|data:|file:|mailt[o][:])\S+/gi, "[link removed]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[private detail removed]")
    .replace(/\b(?:api[_ -]?key|(?:access|refresh|provider)?[_ -]?token|oauth|password|secret|confirmation(?:\s+(?:number|code|ref(?:erence)?))?|booking\s+(?:number|code|ref(?:erence)?)|record\s+locator|pnr|loyalty(?:\s+(?:id|number))?)\b\s*[:=#-]?\s*[^,;\n]*/gi, "[private detail removed]")
    .replace(/\b(?=[A-Z0-9-]{6,12}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9-]+\b/g, "[private detail removed]")
    .replace(/&(?:lt|gt|quot|apos|#x?[0-9a-f]+);/gi, " ")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > maxLength) text = `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
  return text;
}

function parseIdArray(value: unknown, path: string, maxItems: number, issues: TrippyBundleIssue[]): string[] | undefined {
  if (!Array.isArray(value)) {
    issues.push(issue(path, "Expected an array of canonical identifiers."));
    return undefined;
  }
  if (value.length > maxItems) {
    issues.push(issue(path, `Too many items; the limit is ${maxItems}.`));
    return undefined;
  }
  const parsed: string[] = [];
  value.forEach((item, index) => {
    if (!isSafeId(item)) issues.push(issue(`${path}[${index}]`, "Invalid identifier."));
    else parsed.push(item);
  });
  return unique(parsed);
}

function parseAssignments(value: unknown, path: string, issues: TrippyBundleIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected an object keyed by ISO date."));
    return undefined;
  }
  const entries = ownEntries(value);
  if (entries.length > LIMITS.mapEntries) {
    issues.push(issue(path, `Too many date entries; the limit is ${LIMITS.mapEntries}.`));
    return undefined;
  }
  const result: Record<string, string[]> = Object.create(null);
  for (const [date, ids] of entries) {
    if (!isDate(date)) {
      issues.push(issue(`${path}.[invalid-date]`, "Invalid ISO date key."));
      continue;
    }
    const parsed = parseIdArray(ids, `${path}.${date}`, LIMITS.assignmentsPerDate, issues);
    if (parsed) result[date] = parsed;
  }
  return result;
}

function parsePriorityMap(value: unknown, path: string, issues: TrippyBundleIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected an object keyed by activity identifier."));
    return undefined;
  }
  const entries = ownEntries(value);
  if (entries.length > LIMITS.mapEntries) {
    issues.push(issue(path, `Too many priority entries; the limit is ${LIMITS.mapEntries}.`));
    return undefined;
  }
  const result: Record<string, TrippyPriority | null> = Object.create(null);
  for (const [id, priority] of entries) {
    if (!isSafeId(id)) issues.push(issue(`${path}.[invalid-id]`, "Invalid activity identifier."));
    else if (priority !== null && !PRIORITIES.has(priority as TrippyPriority)) issues.push(issue(`${path}.${id}`, "Priority must be must, should, could, or null."));
    else result[id] = priority as TrippyPriority | null;
  }
  return result;
}

function parseSelectionMap(value: unknown, path: string, issues: TrippyBundleIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected an object keyed by canonical identifier."));
    return undefined;
  }
  const entries = ownEntries(value);
  if (entries.length > LIMITS.mapEntries) {
    issues.push(issue(path, `Too many selection entries; the limit is ${LIMITS.mapEntries}.`));
    return undefined;
  }
  const result: Record<string, string | null> = Object.create(null);
  for (const [id, selectedId] of entries) {
    if (!isSafeId(id)) issues.push(issue(`${path}.[invalid-id]`, "Invalid selection key."));
    else if (selectedId !== null && !isSafeId(selectedId)) issues.push(issue(`${path}.${id}`, "Invalid selected identifier."));
    else result[id] = selectedId as string | null;
  }
  return result;
}

function parseEvidence(value: unknown, path: string, issues: TrippyBundleIssue[]): TrippyResearchEvidence[] | undefined {
  if (!Array.isArray(value)) {
    issues.push(issue(path, "Expected an evidence array."));
    return undefined;
  }
  if (value.length > LIMITS.evidence) {
    issues.push(issue(path, `Too many evidence items; the limit is ${LIMITS.evidence}.`));
    return undefined;
  }
  const result: TrippyResearchEvidence[] = [];
  const evidenceIds = new Set<string>();
  value.forEach((candidate, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(candidate)) {
      issues.push(issue(itemPath, "Expected an evidence object."));
      return;
    }
    hasOnlyKeys(candidate, ["id", "subjectKind", "subjectId", "kind", "source", "checkedAt", "summary", "limitations"], itemPath, issues);
    if (!isSafeId(candidate.id) || !SUBJECT_KINDS.has(candidate.subjectKind as TrippyEvidenceSubjectKind) || !isSafeId(candidate.subjectId) || !EVIDENCE_KINDS.has(candidate.kind as TrippyEvidenceKind) || !isDateTime(candidate.checkedAt)) {
      issues.push(issue(itemPath, "Evidence requires valid id, subject, kind, and checkedAt fields."));
      return;
    }
    if (evidenceIds.has(candidate.id)) {
      issues.push(issue(`${itemPath}.id`, "Evidence identifiers must be unique."));
      return;
    }
    evidenceIds.add(candidate.id);
    if (!Array.isArray(candidate.limitations) || candidate.limitations.length > LIMITS.limitations || candidate.limitations.some((entry) => typeof entry !== "string")) {
      issues.push(issue(`${itemPath}.limitations`, `Expected at most ${LIMITS.limitations} text limitations.`));
      return;
    }
    const rawLimitations = candidate.limitations as string[];
    const source = sanitizeTrippyBundleText(candidate.source, 120);
    const summary = sanitizeTrippyBundleText(candidate.summary, LIMITS.summary);
    const limitations = unique(rawLimitations.map((entry) => sanitizeTrippyBundleText(entry, 200)).filter(Boolean));
    if (!source || !summary) {
      issues.push(issue(itemPath, "Evidence source and summary must contain safe text."));
      return;
    }
    if (source !== candidate.source || summary !== candidate.summary || limitations.some((entry, limitationIndex) => entry !== rawLimitations[limitationIndex])) {
      issues.push(issue(itemPath, "Private, linked, or markup content was removed from evidence text.", "warning"));
    }
    result.push({
      id: candidate.id,
      subjectKind: candidate.subjectKind as TrippyEvidenceSubjectKind,
      subjectId: candidate.subjectId,
      kind: candidate.kind as TrippyEvidenceKind,
      source,
      checkedAt: candidate.checkedAt,
      summary,
      limitations,
    });
  });
  return result;
}

function parseChanges(value: unknown, issues: TrippyBundleIssue[]): TrippyWorkspaceChanges | undefined {
  if (!isRecord(value)) {
    issues.push(issue("$.changes", "Expected a changes object."));
    return undefined;
  }
  hasOnlyKeys(value, ["assignments", "activityPriority", "savedActivities", "selectedTransport", "savedHotels", "selectedHotel", "researchEvidence"], "$.changes", issues);
  const changes: TrippyWorkspaceChanges = {};
  if ("assignments" in value) changes.assignments = parseAssignments(value.assignments, "$.changes.assignments", issues);
  if ("activityPriority" in value) changes.activityPriority = parsePriorityMap(value.activityPriority, "$.changes.activityPriority", issues);
  if ("savedActivities" in value) changes.savedActivities = parseIdArray(value.savedActivities, "$.changes.savedActivities", LIMITS.savedItems, issues);
  if ("selectedTransport" in value) changes.selectedTransport = parseSelectionMap(value.selectedTransport, "$.changes.selectedTransport", issues);
  if ("savedHotels" in value) changes.savedHotels = parseIdArray(value.savedHotels, "$.changes.savedHotels", LIMITS.savedItems, issues);
  if ("selectedHotel" in value) changes.selectedHotel = parseSelectionMap(value.selectedHotel, "$.changes.selectedHotel", issues);
  if ("researchEvidence" in value) changes.researchEvidence = parseEvidence(value.researchEvidence, "$.changes.researchEvidence", issues);
  if (Object.keys(changes).length === 0) issues.push(issue("$.changes", "At least one supported decision field is required."));
  return changes;
}

export function parseTrippyUpdateText(input: string): TrippyBundleParseResult {
  if (typeof input !== "string" || new TextEncoder().encode(input).byteLength > TRIPPY_BUNDLE_MAX_BYTES) {
    return { ok: false, issues: [issue("$", `Bundle exceeds the ${TRIPPY_BUNDLE_MAX_BYTES / 1024} KB limit.`)] };
  }
  let raw: unknown;
  try { raw = JSON.parse(input); }
  catch { return { ok: false, issues: [issue("$", "The file is not valid JSON.")] }; }
  if (!isRecord(raw)) return { ok: false, issues: [issue("$", "The bundle must be a JSON object.")] };

  const issues: TrippyBundleIssue[] = [];
  hasOnlyKeys(raw, ["format", "version", "kind", "bundleId", "tripId", "createdAt", "summary", "changes"], "$", issues);
  if (raw.format !== TRIPPY_BUNDLE_FORMAT) issues.push(issue("$.format", `Expected ${TRIPPY_BUNDLE_FORMAT}.`));
  if (raw.version !== TRIPPY_BUNDLE_VERSION) issues.push(issue("$.version", `Only bundle version ${TRIPPY_BUNDLE_VERSION} is supported.`));
  if (raw.kind !== "update" && raw.kind !== "snapshot") issues.push(issue("$.kind", "Kind must be update or snapshot."));
  if (!isSafeId(raw.bundleId)) issues.push(issue("$.bundleId", "Invalid bundle identifier."));
  if (!isSafeId(raw.tripId)) issues.push(issue("$.tripId", "Invalid trip identifier."));
  if (!isDateTime(raw.createdAt)) issues.push(issue("$.createdAt", "Expected an ISO date-time."));
  const summary = raw.summary === undefined ? undefined : sanitizeTrippyBundleText(raw.summary, LIMITS.summary);
  if (raw.summary !== undefined && !summary) issues.push(issue("$.summary", "Summary must contain safe text."));
  else if (summary !== raw.summary) issues.push(issue("$.summary", "Private, linked, or markup content was removed.", "warning"));
  const changes = parseChanges(raw.changes, issues);
  if (issues.some((entry) => entry.severity === "error") || !changes) return { ok: false, issues };
  return {
    ok: true,
    bundle: {
      format: TRIPPY_BUNDLE_FORMAT,
      version: TRIPPY_BUNDLE_VERSION,
      kind: raw.kind as "update" | "snapshot",
      bundleId: raw.bundleId as string,
      tripId: raw.tripId as string,
      createdAt: raw.createdAt as string,
      ...(summary ? { summary } : {}),
      changes,
    },
    issues,
  };
}

export async function parseTrippyUpdateFile(file: Blob & { name?: string }): Promise<TrippyBundleParseResult> {
  const name = typeof file.name === "string" ? file.name.toLowerCase() : "";
  if (name && !name.endsWith(".json") && !name.endsWith(".trippy")) {
    return { ok: false, issues: [issue("$file", "Choose a .json or .trippy file.")] };
  }
  if (file.size > TRIPPY_BUNDLE_MAX_BYTES) {
    return { ok: false, issues: [issue("$file", `Bundle exceeds the ${TRIPPY_BUNDLE_MAX_BYTES / 1024} KB limit.`)] };
  }
  if (!SAFE_MIME_TYPES.has(file.type.toLowerCase())) {
    return { ok: false, issues: [issue("$file", "The file type is not JSON.")] };
  }
  try { return parseTrippyUpdateText(await file.text()); }
  catch { return { ok: false, issues: [issue("$file", "The browser could not read this file.")] }; }
}

function copyMap<T>(value: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(value));
}

function normalizeCurrentState(state: TrippyWorkspaceState): TrippyWorkspaceState {
  return {
    assignments: Object.fromEntries(Object.entries(state.assignments).map(([date, ids]) => [date, [...ids]])),
    activityPriority: copyMap(state.activityPriority),
    savedActivities: [...state.savedActivities],
    selectedTransport: copyMap(state.selectedTransport),
    savedHotels: [...state.savedHotels],
    selectedHotel: copyMap(state.selectedHotel),
    researchEvidence: [...(state.researchEvidence || [])],
  };
}

function displayValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "Not set";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  return String(value);
}

function mapsEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Applies a parsed proposal against a canonical allowlist. Out-of-scope
 * references are individually rejected and can never reach the callback.
 */
export function reviewTrippyUpdate(bundle: TrippyUpdateBundle, currentState: TrippyWorkspaceState, scope: TrippyBundleScope): TrippyBundleReview {
  const nextState = normalizeCurrentState(currentState);
  const issues: TrippyBundleIssue[] = [];
  const diff: TrippyBundleDiff[] = [];
  let rejectedChangeCount = 0;
  const dates = new Set(scope.dates);
  const activities = new Set(scope.activityIds);
  const transportOptions = new Map(Object.entries(scope.transportOptions).map(([leg, options]) => [leg, new Set(options)]));
  const hotelOptions = new Map(Object.entries(scope.hotelOptions).map(([city, options]) => [city, new Set(options)]));
  const allHotels = new Set(Object.values(scope.hotelOptions).flat());

  const reject = (path: string, message: string) => {
    rejectedChangeCount += 1;
    issues.push(issue(path, message, "warning"));
  };
  const addDiff = (entry: TrippyBundleDiff) => {
    if (entry.before !== entry.after) diff.push(entry);
  };

  if (bundle.tripId !== scope.tripId) {
    issues.push(issue("$.tripId", "This update targets a different trip."));
    return { bundle, nextState, diff, issues, acceptedChangeCount: 0, rejectedChangeCount: 1 };
  }

  for (const [date, ids] of Object.entries(bundle.changes.assignments || {})) {
    if (!dates.has(date)) { reject(`$.changes.assignments.${date}`, "Date is outside this trip and was ignored."); continue; }
    const safeIds = ids.filter((id) => activities.has(id));
    rejectedChangeCount += ids.length - safeIds.length;
    if (safeIds.length !== ids.length) issues.push(issue(`$.changes.assignments.${date}`, "Unknown activity identifiers were ignored.", "warning"));
    const before = nextState.assignments[date] || [];
    nextState.assignments[date] = safeIds;
    addDiff({ section: "Itinerary", path: `assignments.${date}`, label: date, before: displayValue(before), after: displayValue(safeIds) });
  }

  for (const [activityId, priority] of Object.entries(bundle.changes.activityPriority || {})) {
    if (!activities.has(activityId)) { reject("$.changes.activityPriority.[unknown]", "Unknown activity was ignored."); continue; }
    const before = nextState.activityPriority[activityId];
    if (priority === null) delete nextState.activityPriority[activityId];
    else nextState.activityPriority[activityId] = priority;
    addDiff({ section: "Priorities", path: `activityPriority.${activityId}`, label: activityId, before: displayValue(before), after: displayValue(priority) });
  }

  if (bundle.changes.savedActivities) {
    const safeIds = bundle.changes.savedActivities.filter((id) => activities.has(id));
    rejectedChangeCount += bundle.changes.savedActivities.length - safeIds.length;
    if (safeIds.length !== bundle.changes.savedActivities.length) issues.push(issue("$.changes.savedActivities", "Unknown saved activity identifiers were ignored.", "warning"));
    const before = nextState.savedActivities;
    nextState.savedActivities = safeIds;
    addDiff({ section: "Saved items", path: "savedActivities", label: "Saved activities", before: displayValue(before), after: displayValue(safeIds) });
  }

  for (const [legId, optionId] of Object.entries(bundle.changes.selectedTransport || {})) {
    const allowed = transportOptions.get(legId);
    if (!allowed || (optionId !== null && !allowed.has(optionId))) { reject("$.changes.selectedTransport.[unknown]", "Unknown transport selection was ignored."); continue; }
    const before = nextState.selectedTransport[legId];
    if (optionId === null) delete nextState.selectedTransport[legId];
    else nextState.selectedTransport[legId] = optionId;
    addDiff({ section: "Transport", path: `selectedTransport.${legId}`, label: legId, before: displayValue(before), after: displayValue(optionId) });
  }

  if (bundle.changes.savedHotels) {
    const safeIds = bundle.changes.savedHotels.filter((id) => allHotels.has(id));
    rejectedChangeCount += bundle.changes.savedHotels.length - safeIds.length;
    if (safeIds.length !== bundle.changes.savedHotels.length) issues.push(issue("$.changes.savedHotels", "Unknown saved hotel identifiers were ignored.", "warning"));
    const before = nextState.savedHotels;
    nextState.savedHotels = safeIds;
    addDiff({ section: "Saved items", path: "savedHotels", label: "Saved hotels", before: displayValue(before), after: displayValue(safeIds) });
  }

  for (const [cityId, hotelId] of Object.entries(bundle.changes.selectedHotel || {})) {
    const allowed = hotelOptions.get(cityId);
    if (!allowed || (hotelId !== null && !allowed.has(hotelId))) { reject("$.changes.selectedHotel.[unknown]", "Unknown hotel selection was ignored."); continue; }
    const before = nextState.selectedHotel[cityId];
    if (hotelId === null) delete nextState.selectedHotel[cityId];
    else nextState.selectedHotel[cityId] = hotelId;
    addDiff({ section: "Hotels", path: `selectedHotel.${cityId}`, label: cityId, before: displayValue(before), after: displayValue(hotelId) });
  }

  if (bundle.changes.researchEvidence) {
    const safeEvidence = bundle.changes.researchEvidence.filter((evidence) => {
      if (evidence.subjectKind === "trip") return evidence.subjectId === scope.tripId;
      if (evidence.subjectKind === "activity") return activities.has(evidence.subjectId);
      if (evidence.subjectKind === "transport") return transportOptions.has(evidence.subjectId);
      return allHotels.has(evidence.subjectId);
    });
    rejectedChangeCount += bundle.changes.researchEvidence.length - safeEvidence.length;
    if (safeEvidence.length !== bundle.changes.researchEvidence.length) issues.push(issue("$.changes.researchEvidence", "Evidence for unknown subjects was ignored.", "warning"));
    const before = nextState.researchEvidence || [];
    nextState.researchEvidence = safeEvidence;
    if (!mapsEqual(before, safeEvidence)) diff.push({ section: "Research evidence", path: "researchEvidence", label: "Research evidence", before: `${before.length} item${before.length === 1 ? "" : "s"}`, after: `${safeEvidence.length} item${safeEvidence.length === 1 ? "" : "s"}` });
  }

  return { bundle, nextState, diff, issues, acceptedChangeCount: diff.length, rejectedChangeCount };
}

export type BuildTrippyBundleOptions = {
  scope: TrippyBundleScope;
  bundleId?: string;
  createdAt?: string;
  summary?: string;
};

/** Creates a complete, sanitized snapshot suitable for download and handoff. */
export function buildTrippyWorkspaceBundle(state: TrippyWorkspaceState, options: BuildTrippyBundleOptions): TrippyUpdateBundle {
  const createdAt = options.createdAt && isDateTime(options.createdAt) ? options.createdAt : new Date().toISOString();
  const fallbackId = `snapshot-${createdAt.slice(0, 10)}-${createdAt.slice(11, 19).replace(/:/g, "")}`;
  const bundleId = isSafeId(options.bundleId) ? options.bundleId : fallbackId;
  const summary = sanitizeTrippyBundleText(options.summary, LIMITS.summary);
  const seed: TrippyUpdateBundle = {
    format: TRIPPY_BUNDLE_FORMAT,
    version: TRIPPY_BUNDLE_VERSION,
    kind: "snapshot",
    bundleId,
    tripId: options.scope.tripId,
    createdAt,
    ...(summary ? { summary } : {}),
    changes: {
      assignments: state.assignments,
      activityPriority: state.activityPriority,
      savedActivities: state.savedActivities,
      selectedTransport: state.selectedTransport,
      savedHotels: state.savedHotels,
      selectedHotel: state.selectedHotel,
      researchEvidence: state.researchEvidence || [],
    },
  };
  const parsed = parseTrippyUpdateText(JSON.stringify(seed));
  if (!parsed.ok) throw new Error("Workspace state could not be converted to a safe TRIPPY bundle.");
  const reviewed = reviewTrippyUpdate(parsed.bundle, {
    assignments: {}, activityPriority: {}, savedActivities: [], selectedTransport: {}, savedHotels: [], selectedHotel: {}, researchEvidence: [],
  }, options.scope);
  return { ...parsed.bundle, changes: {
    assignments: reviewed.nextState.assignments,
    activityPriority: reviewed.nextState.activityPriority,
    savedActivities: reviewed.nextState.savedActivities,
    selectedTransport: reviewed.nextState.selectedTransport,
    savedHotels: reviewed.nextState.savedHotels,
    selectedHotel: reviewed.nextState.selectedHotel,
    researchEvidence: reviewed.nextState.researchEvidence || [],
  } };
}

export function serializeTrippyWorkspaceBundle(state: TrippyWorkspaceState, options: BuildTrippyBundleOptions) {
  return `${JSON.stringify(buildTrippyWorkspaceBundle(state, options), null, 2)}\n`;
}

/** Browser-only convenience helper. It does not persist the snapshot. */
export function downloadTrippyWorkspaceBundle(state: TrippyWorkspaceState, options: BuildTrippyBundleOptions) {
  if (typeof document === "undefined" || typeof URL === "undefined") throw new Error("Bundle downloads are available only in a browser.");
  const text = serializeTrippyWorkspaceBundle(state, options);
  const blobUrl = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = `trippy-${options.scope.tripId}-workspace.trippy`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
}
