export type CollaborationRole = "owner" | "editor" | "viewer";
export type CollaborationCity = { id: string; name: string; lat?: number; lng?: number };
export type CollaborationActivity = { id: string; cityId: string; title: string; notes: string; lat?: number; lng?: number; durationMinutes?: number; image?: string; sourceUrl?: string };
export type CollaborationState = { title: string; startDate: string; endDate: string; cities: CollaborationCity[]; activities: CollaborationActivity[]; days: Record<string, string[]> };

export class CollaborationError extends Error {
  status: number;
  latest?: { roomId: string; role: CollaborationRole; revision: number; state: CollaborationState };
  constructor(status: number, message: string) { super(message); this.status = status; }
}
const bad = () => { throw new CollaborationError(400, "Invalid share-safe collaboration state. Remove private identifiers, links, and unsupported fields."); };
const privateText = /@|https?:|www\.|mailto\x3a|gmail|\b(?:api[ _-]?key|oauth|bearer|password|secret|token|confirmation|pnr|booking[ _-]?(?:reference|number|code)|record[ _-]?locator|loyalty|seat[ _-]?(?:(?:assignment|number)|\d{1,3}[a-z]))\b|\b(?:sk-[a-z0-9_-]+|ghp_[a-z0-9]+|github_pat_[a-z0-9_]+|AIza[a-z0-9_-]+|ya29\.[a-z0-9_-]+)|\b\d{9,}\b/i;
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return bad();
  if (Object.keys(value).some(key => !keys.includes(key))) return bad();
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, allowEmpty = false, multiline = false): string {
  if (typeof value !== "string") return bad();
  const normalized = value.normalize("NFKC");
  if (normalized.length > max || (!allowEmpty && !normalized.trim()) || (multiline ? /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(normalized) || privateText.test(normalized.replace(/[\r\n]+/g, " ")) || /\b(?=[A-Z0-9]{6}\b)(?=[A-Z0-9]*\d)[A-Z0-9]+\b/.test(normalized)) return bad();
  return normalized.trim();
}
function id(value: unknown): string {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value) || privateText.test(value) || /\b(?=[A-Z0-9]{6}\b)(?=[A-Z0-9]*\d)[A-Z0-9]+\b/.test(value)) return bad();
  return value;
}
function date(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) return bad();
  return value;
}
function coordinates(value: Record<string, unknown>): { lat?: number; lng?: number } {
  if (value.lat === undefined && value.lng === undefined) return {};
  if (typeof value.lat !== "number" || !Number.isFinite(value.lat) || Math.abs(value.lat) > 90 || typeof value.lng !== "number" || !Number.isFinite(value.lng) || Math.abs(value.lng) > 180) return bad();
  return { lat: value.lat, lng: value.lng };
}
export function safeCollaborationImage(value: unknown): string | undefined {
  return typeof value === "string" && /^\/(?:guide-images|media)\/[a-zA-Z0-9_-]{1,160}\.webp$/.test(value) && !privateText.test(value) ? value : undefined;
}
export function safeCollaborationSourceUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 500) return undefined;
  try {
    const url = new URL(value.normalize("NFKC"));
    let pathname = url.pathname;
    for (let depth = 0; depth < 8; depth++) { const decoded = decodeURIComponent(pathname).normalize("NFKC"); if (decoded === pathname) break; pathname = decoded; }
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || /%[a-f0-9]{2}/i.test(pathname) || privateText.test(pathname) || /(?:gmail|mail\.google|accounts\.google|localhost)/i.test(url.hostname) || /^\d|:/.test(url.hostname)) return undefined;
    return url.href;
  } catch { return undefined; }
}
export function validateCollaborationState(input: unknown): CollaborationState {
  const s = object(input, ["title", "startDate", "endDate", "cities", "activities", "days"]);
  const startDate = date(s.startDate), endDate = date(s.endDate);
  if (endDate < startDate || Date.parse(endDate) - Date.parse(startDate) > 366 * 86400000) return bad();
  if (!Array.isArray(s.cities) || s.cities.length > 50 || !Array.isArray(s.activities) || s.activities.length > 500) return bad();
  const cities = s.cities.map(value => { const c = object(value, ["id", "name", "lat", "lng"]); return { id: id(c.id), name: text(c.name, 100), ...coordinates(c) }; });
  const cityIds = new Set(cities.map(c => c.id));
  if (cityIds.size !== cities.length) return bad();
  const activities = s.activities.map(value => {
    const a = object(value, ["id", "cityId", "title", "notes", "lat", "lng", "durationMinutes", "image", "sourceUrl"]);
    const cityId = id(a.cityId);
    if (!cityIds.has(cityId) || (a.durationMinutes !== undefined && (typeof a.durationMinutes !== "number" || !Number.isInteger(a.durationMinutes) || a.durationMinutes < 1 || a.durationMinutes > 1440))) return bad();
    const image = safeCollaborationImage(a.image), sourceUrl = safeCollaborationSourceUrl(a.sourceUrl);
    if ((a.image !== undefined && !image) || (a.sourceUrl !== undefined && !sourceUrl)) return bad();
    return { id: id(a.id), cityId, title: text(a.title, 160), notes: text(a.notes ?? "", 1000, true, true), ...coordinates(a), ...(a.durationMinutes !== undefined ? { durationMinutes: a.durationMinutes as number } : {}), ...(image ? { image } : {}), ...(sourceUrl ? { sourceUrl } : {}) };
  });
  const activityIds = new Set(activities.map(a => a.id));
  if (activityIds.size !== activities.length || !s.days || typeof s.days !== "object" || Array.isArray(s.days) || Object.keys(s.days).length > 367) return bad();
  const days: Record<string, string[]> = {};
  const scheduled = new Set<string>();
  for (const [key, values] of Object.entries(s.days)) {
    const day = date(key);
    if (day < startDate || day > endDate || !Array.isArray(values) || values.length > 50) return bad();
    days[day] = values.map(value => { const activityId = id(value); if (!activityIds.has(activityId) || scheduled.has(activityId)) return bad(); scheduled.add(activityId); return activityId; });
  }
  return { title: text(s.title, 160), startDate, endDate, cities, activities, days };
}
