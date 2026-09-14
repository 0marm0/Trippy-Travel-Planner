export type Stop = { id: string; name: string; nights: number; cin: string; cout: string; range: string };
export type Leg = { d: string; route: string; mode: string; note: string; drive: boolean };
export type Day = { n: number; iso: string; date: string; city: string; title: string; blocks: string[][]; flag?: string[] | null };
export type Route = { key: string; label: string; tag: string; start: string; end: string; startiso: string; days: number; nights: number; cities: Stop[]; legs: Leg[]; cal: Day[]; anchortext: string; note: string; who: string };
export type Point = { id: string; name: string; lat: number; lng: number; category?: string; number?: number };
export type Quote = { id: string; leg: string; routeKey: string; provider: string; cash: number | null; points: number | null; taxes: number | null; currency: string; duration: string; stops: string; url: string; checked: string };
export type Stay = { id: string; city: string; name: string; cost: string; url: string; notes: string };
export type Preferences = { name: string; origin: string; pace: string; cabin: string; budget: string; interests: string[]; pointsValue: number };
export const defaults: Preferences = { name: "Europe trip", origin: "", pace: "Balanced", cabin: "Economy", budget: "", interests: ["Architecture", "Food", "Museums"], pointsValue: 1.5 };
export const geo: Record<string, { lat: number; lng: number; flag: string; country: string; code: string }> = {
  london: { lat: 51.5074, lng: -.1278, flag: "🇬🇧", country: "United Kingdom", code: "GB" },
  lisbon: { lat: 38.7223, lng: -9.1393, flag: "🇵🇹", country: "Portugal", code: "PT" },
  porto: { lat: 41.1579, lng: -8.6291, flag: "🇵🇹", country: "Portugal", code: "PT" },
  sintra: { lat: 38.8029, lng: -9.3817, flag: "🇵🇹", country: "Portugal", code: "PT" },
  brussels: { lat: 50.8503, lng: 4.3517, flag: "🇧🇪", country: "Belgium", code: "BE" },
  bruges: { lat: 51.2093, lng: 3.2247, flag: "🇧🇪", country: "Belgium", code: "BE" },
  amsterdam: { lat: 52.3676, lng: 4.9041, flag: "🇳🇱", country: "Netherlands", code: "NL" },
  berlin: { lat: 52.52, lng: 13.405, flag: "🇩🇪", country: "Germany", code: "DE" },
  munich: { lat: 48.1351, lng: 11.582, flag: "🇩🇪", country: "Germany", code: "DE" },
  ring: { lat: 50.3356, lng: 6.9475, flag: "🇩🇪", country: "Germany", code: "DE" },
  cologne: { lat: 50.9375, lng: 6.9603, flag: "🇩🇪", country: "Germany", code: "DE" },
};
export function modeKind(mode: string) { return /flight|fly/i.test(mode) ? "flight" : /drive|car/i.test(mode) ? "car" : "train"; }
export function mapPoints(route: Route): Point[] { return route.cities.flatMap((c, i) => geo[c.id] ? [{ id: c.id, name: c.name, ...geo[c.id], number: i + 1 }] : []); }
export function safeLink(url: string) { try { const p = new URL(url); return ["https:", "http:"].includes(p.protocol) ? p.href : undefined; } catch { return undefined; } }
export function money(n: number, currency = "USD") { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(n); }
export function pointValue(q: Quote) { return q.cash !== null && q.points && q.taxes !== null ? ((q.cash - q.taxes) / q.points * 100).toFixed(2) : null; }
export function dateLabel(iso: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) { return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { ...options, timeZone: "UTC" }); }
export function shiftDate(iso: string, days: number) { return new Date(new Date(iso + "T12:00:00Z").getTime() + days * 86400000).toISOString().slice(0, 10); }
export function shiftRoute(route: Route, start?: string): Route {
  if (!start || start === route.startiso) return route;
  const delta = Math.round((new Date(start).getTime() - new Date(route.startiso).getTime()) / 86400000);
  if (!Number.isFinite(delta)) return route;
  let cursor = start;
  const cities = route.cities.map(c => { const end = shiftDate(cursor, c.nights); const changed = { ...c, cin: dateLabel(cursor), cout: dateLabel(end), range: `${dateLabel(cursor)} – ${dateLabel(end)}` }; cursor = end; return changed; });
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const legs = route.legs.map(l => {
    const match = l.d.match(/(\d{1,2})\s+([A-Za-z]{3})/);
    if (!match) return l;
    const month = months.indexOf(match[2]);
    if (month < 0) return l;
    const year = Number(route.startiso.slice(0,4)) + (month + 1 < Number(route.startiso.slice(5,7)) ? 1 : 0);
    const iso = `${year}-${String(month + 1).padStart(2,"0")}-${match[1].padStart(2,"0")}`;
    return { ...l, d: dateLabel(shiftDate(iso, delta)) };
  });
  return { ...route, startiso: start, start: dateLabel(start), end: dateLabel(cursor), cities, legs, cal: route.cal.map(d => ({ ...d, iso: shiftDate(d.iso, delta), date: dateLabel(shiftDate(d.iso, delta), { weekday: "short", day: "numeric", month: "short" }) })) };
}
