"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Trip2026Payload } from "@/lib/trip-model";
import { buildTripLogistics, calendarDates, logisticsItemsForDate, type LogisticsItem, type LogisticsKind } from "@/lib/trip-logistics";
import { Icon } from "./planner-icon";
import "./logistics.css";

const colors = ["#6caeff", "#a394ff", "#67cdd0", "#7a9bff", "#b095dc", "#629dc8", "#86b7db"];
const format = (date: string, options: Intl.DateTimeFormatOptions) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
const iconName: Record<LogisticsKind, string> = { flight: "flight", train: "train", car: "car", stay: "stays", activity: "activities" };
const statusLabel = (status: LogisticsItem["status"]) => status === "confirmed" ? "Confirmed record" : status === "missing" ? "Needs booking" : status === "conflict" ? "Schedule conflict" : "Date/details TBC";

export function LogisticsIcon({ kind, width = 18 }: { kind: LogisticsKind; width?: number }) {
  return <Icon className="logistics-icon" name={iconName[kind]} width={width} height={width} />;
}

function itemDate(item: LogisticsItem) {
  if (!item.date) return "Date TBC";
  const start = format(item.date, { day: "numeric", month: "short" });
  return item.endDate ? `${start}–${format(item.endDate, { day: "numeric", month: "short" })}` : start;
}

export default function TripOverview({ data, assignments, priorities, selectedTransport, selectedHotels, onDay }: { data: Trip2026Payload; assignments: Record<string, string[]>; priorities: Record<string, "must" | "should" | "could">; selectedTransport: Record<string, string>; selectedHotels: Record<string, string>; onDay: (date: string) => void }) {
  const [view, setView] = useState<"calendar" | "timeline" | "list">("calendar");
  const [density, setDensity] = useState<"compact" | "detailed">("compact");
  const logistics = useMemo(() => buildTripLogistics(data, selectedTransport), [data, selectedTransport]);
  const dates = calendarDates(logistics);
  const [selected, setSelected] = useState(logistics.start);
  const months = [...new Set(dates.map((date) => date.slice(0, 7)))];
  const stopFor = (date: string) => data.stops.find((stop) => date >= stop.checkIn && date < stop.checkOut) || (date === data.end ? data.stops.at(-1) : undefined);
  const destinationFor = (date: string) => stopFor(date) || data.stops.find((stop) => stop.checkIn >= date) || data.stops.at(-1);
  const stop = destinationFor(selected);
  const selectedItems = logisticsItemsForDate(logistics, selected);
  const selectedActivities = (assignments[selected] || []).flatMap((id) => { const activity = data.activities.find((item) => item.id === id); return activity ? [activity] : []; });
  const hotel = data.hotels.find((item) => item.id === selectedHotels[stop?.id || ""]);
  const departure = logistics.items.find((item) => item.kind === "flight" && item.date === logistics.start && item.status === "confirmed");

  return <>
    <section className="trip-overview glass" aria-label="Trip overview">
      <header className="overview-toolbar"><div><h2>Your trip</h2><span>{dates.length} days · {data.stops.length} cities</span></div><label className="detail-toggle"><span>Details</span><input type="checkbox" checked={density === "detailed"} onChange={(event) => setDensity(event.target.checked ? "detailed" : "compact")} aria-label="Show detailed calendar logistics" /></label><div className="segmented" aria-label="Overview view">{(["calendar", "timeline", "list"] as const).map((item) => <button key={item} aria-pressed={view === item} className={view === item ? "active" : ""} onClick={() => setView(item)}><Icon name={item === "calendar" ? "calendar" : item === "timeline" ? "route" : "itinerary"} width="15" />{item[0].toUpperCase() + item.slice(1)}</button>)}</div></header>
      {view === "calendar" && <div className="calendar-layout"><div className="calendar-months">{months.map((month) => {
        const first = `${month}-01`;
        const firstTrip = month === logistics.start.slice(0, 7) ? Number(logistics.start.slice(-2)) : 1;
        const lastTrip = month === logistics.end.slice(0, 7) ? Number(logistics.end.slice(-2)) : 31;
        const startWeekday = (new Date(`${month}-${String(firstTrip).padStart(2, "0")}T12:00:00Z`).getUTCDay() + 6) % 7;
        const displayStart = Math.max(1, firstTrip - startWeekday);
        const offset = (new Date(`${month}-${String(displayStart).padStart(2, "0")}T12:00:00Z`).getUTCDay() + 6) % 7;
        const monthDate = new Date(`${first}T12:00:00Z`);
        const count = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
        const lastDate = Math.min(count, lastTrip);
        const endWeekday = (new Date(`${month}-${String(lastDate).padStart(2, "0")}T12:00:00Z`).getUTCDay() + 6) % 7;
        const displayEnd = Math.min(count, lastDate + 6 - endWeekday);
        return <section className="calendar-month" key={month}><h3>{format(first, { month: "long", year: "numeric" })}</h3><div className="calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: offset }, (_, index) => <span className="calendar-blank" key={`blank-${index}`} />)}{Array.from({ length: displayEnd - displayStart + 1 }, (_, index) => {
          const date = `${month}-${String(index + displayStart).padStart(2, "0")}`;
          const currentStop = destinationFor(date);
          const inTrip = date >= logistics.start && date <= logistics.end;
          const statusRank: Record<LogisticsItem["status"], number> = { missing: 0, conflict: 1, tbc: 2, confirmed: 3 };
          const items = [...logisticsItemsForDate(logistics, date)].sort((left, right) => statusRank[left.status] - statusRank[right.status]);
          const color = colors[Math.max(0, data.stops.findIndex((item) => item.id === currentStop?.id))];
          const detailedItems = items.filter((item) => item.kind === "flight");
          if (!detailedItems.length) detailedItems.push(...items.filter((item) => item.status !== "confirmed").slice(0, 2));
          return <button key={date} disabled={!inTrip} onClick={() => setSelected(date)} aria-label={`${format(date, { day: "numeric", month: "long" })}${inTrip ? `, ${currentStop?.name || "Travel"}, ${items.length} logistics items` : ""}`} aria-pressed={selected === date} className={`calendar-day ${inTrip ? "in-trip" : "outside-trip"} ${selected === date ? "selected" : ""} ${density === "detailed" ? "logistics-detailed" : ""}`} style={{ "--city-color": color } as CSSProperties}><span>{index + displayStart}</span>{inTrip && <><b>{date < data.stops[0].checkIn ? "🇺🇸 Departure" : `${currentStop?.flag} ${currentStop?.name}`}</b>{date < data.stops[0].checkIn && <small className="calendar-next">→ 🇩🇪 Frankfurt</small>}<div className="calendar-symbols">{items.slice(0, density === "detailed" ? 5 : 3).map((item) => <i key={item.id} className={`calendar-symbol status-${item.status}`} title={`${statusLabel(item.status)}: ${item.title}`}><LogisticsIcon kind={item.kind} width={13} /></i>)}{(assignments[date]?.length || 0) > 0 && <small>{assignments[date].length} sights</small>}</div>{density === "detailed" && detailedItems.length > 0 && <span className="calendar-detail-list">{detailedItems.map((item) => <small key={item.id} className={`calendar-detail status-${item.status}`}><b>{item.title}</b>{item.kind === "flight" ? item.detail : statusLabel(item.status)}</small>)}</span>}</>}</button>;
        })}</div></section>;
      })}</div><aside className="calendar-agenda"><span>{format(selected, { weekday: "long", day: "numeric", month: "long" })}</span><h3>{stop?.flag} {selected < data.stops[0].checkIn ? `Next: ${stop?.name}` : stop?.name || "Travel"}</h3>{selectedItems.map((item) => <div className={`agenda-item status-${item.status}`} key={item.id}><LogisticsIcon kind={item.kind} width={18} /><div><b>{item.title}</b><small className="agenda-status">{statusLabel(item.status)}</small>{density === "detailed" && <p className="agenda-detail">{item.detail}</p>}</div></div>)}{hotel && <div className="agenda-item status-tbc"><LogisticsIcon kind="stay" width={18} /><div><b>{hotel.name}</b><small>Selected option · booking not implied</small></div></div>}{selectedActivities.slice(0, 4).map((activity) => <div className="agenda-item activity" key={activity.id}><LogisticsIcon kind="activity" width={18} /><div><b>{activity.title}</b><small>{(priorities[activity.id] || activity.priority) === "must" ? "Must do" : (priorities[activity.id] || activity.priority) === "should" ? "Should do" : "Could do"}</small></div></div>)}{!selectedItems.length && !selectedActivities.length && <p>No logistics or activities placed yet.</p>}<button className="text-button" onClick={() => onDay(selected)}>Open this day <Icon name="arrow" width="15" /></button></aside></div>}
      {view === "timeline" && <div className="trip-timeline">{departure && <button style={{ "--city-color": colors[0] } as CSSProperties} onClick={() => onDay(logistics.start)}><span className="timeline-date">{format(logistics.start, { day: "numeric", month: "short" })}</span><i /><div><h3>🇺🇸 Departure → 🇩🇪 Frankfurt</h3><small>{departure.title}</small><p>{departure.detail}</p></div><Icon name="arrow" width="16" /></button>}{data.stops.map((item, index) => <button key={item.id} style={{ "--city-color": colors[index % colors.length] } as CSSProperties} onClick={() => onDay(item.checkIn)}><span className="timeline-date">{format(item.checkIn, { day: "numeric", month: "short" })}</span><i /><div><h3>{item.flag} {item.name}</h3><small>{item.nights} nights · until {format(item.checkOut, { day: "numeric", month: "short" })}</small><p>{data.transport.filter((leg) => leg.from === item.id).map((leg) => { const option = leg.options.find((entry) => entry.id === selectedTransport[leg.id]) || leg.options.find((entry) => entry.id === leg.recommend); return option ? `${option.name} · planning only` : ""; }).join(" · ")}</p></div><Icon name="arrow" width="16" /></button>)}</div>}
      {view === "list" && <div className="overview-table-wrap"><table className="overview-table"><thead><tr><th>Date</th><th>Next city</th><th>Logistics</th><th>Activities</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{dates.map((date) => <tr key={date}><td>{format(date, { weekday: "short", day: "numeric", month: "short" })}</td><td>{destinationFor(date)?.flag} {destinationFor(date)?.name}</td><td>{logisticsItemsForDate(logistics, date).map((item) => <span key={item.id} className={`table-anchor status-${item.status}`}><LogisticsIcon kind={item.kind} width={13} />{item.title} · {statusLabel(item.status)}</span>)}</td><td>{assignments[date]?.length || "—"}</td><td><button aria-label={`Open ${date}`} onClick={() => onDay(date)}><Icon name="arrow" width="16" /></button></td></tr>)}</tbody></table></div>}
    </section>
    <section className="logistics-alerts" aria-labelledby="missing-logistics-title"><header><h2 id="missing-logistics-title">Needs booking</h2><span className="logistics-count">{logistics.missing.length} open</span></header><div className="missing-grid">{logistics.missing.map((item) => <article className="missing-card" key={item.id}><LogisticsIcon kind={item.kind} width={20} /><div><b>{item.title}</b><small>{itemDate(item)} · {statusLabel(item.status)}</small><p>{item.detail}</p></div></article>)}</div>{logistics.exceptions.length > 0 && <div className="logistics-exceptions"><h3>Conflicts and TBC records</h3>{logistics.exceptions.map((item) => <div className="exception-row" key={item.id}><LogisticsIcon kind={item.kind} width={16} /><div><b>{item.title}</b><small>{itemDate(item)} · {statusLabel(item.status)} · {item.detail}</small></div></div>)}</div>}</section>
  </>;
}
