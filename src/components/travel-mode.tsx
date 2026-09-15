"use client";

import type { Trip2026Payload, TripStop } from "@/lib/trip-model";
import { buildTripLogistics, calendarDates, logisticsItemsForDate, type LogisticsItem, type LogisticsKind } from "@/lib/trip-logistics";
import { Icon } from "./planner-icon";
import "./modes.css";

export type TravelModeState = {
  today: string;
  selectedDate?: string;
  selectedCity?: string;
  selectedTransport?: Record<string, string>;
  offlineReady?: boolean;
};

export type TravelMapTarget = { date: string; cityId?: string };

export type TravelModeProps = {
  data: Trip2026Payload;
  state: TravelModeState;
  onSelectDate?: (date: string) => void;
  onSelectCity?: (cityId: string) => void;
  onOpenMap?: (target: TravelMapTarget) => void;
  onExport?: () => void;
  onPrepareOffline?: () => void;
  onOpenDecisionMode?: () => void;
  onOpenEmergencyCard?: (target: TravelMapTarget) => void;
};

const privateLabelPattern = /\b(confirmation|booking(?:\s+reference)?|record\s+locator|pnr|loyalty(?:\s+(?:id|number))?|seat)\s*(?:number|code|id|ref(?:erence)?)?\s*[:#-]?\s*[a-z0-9][a-z0-9-]{2,}\b/gi;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const urlPattern = /https?:\/\/\S+/gi;
const kindIcon: Record<LogisticsKind, string> = { flight: "flight", train: "train", car: "car", stay: "stays", activity: "activities" };
const statusLabel: Record<LogisticsItem["status"], string> = { confirmed: "Confirmed", tbc: "TBC", missing: "Missing", conflict: "Conflict" };
const statusRank: Record<LogisticsItem["status"], number> = { conflict: 0, missing: 1, tbc: 2, confirmed: 3 };

function safeText(value: string) {
  return value.replace(emailPattern, "private detail withheld").replace(urlPattern, "link withheld").replace(privateLabelPattern, "$1 withheld").replace(/\s+/g, " ").trim();
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
}

function stopForDate(stops: TripStop[], date: string) {
  return stops.find((stop) => date >= stop.checkIn && date < stop.checkOut)
    || (date >= (stops.at(-1)?.checkOut || "9999-12-31") ? stops.at(-1) : undefined);
}

function dateOffset(start: string, date: string) {
  return Math.max(0, Math.floor((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86_400_000));
}

function phaseFor(today: string, start: string, end: string) {
  if (today < start) return { id: "pretrip", eyebrow: "Before your trip", title: `Departs ${formatDate(start, { day: "numeric", month: "long" })}` } as const;
  if (today > end) return { id: "complete", eyebrow: "Trip complete", title: "Your itinerary remains available" } as const;
  return { id: "current", eyebrow: "Travel mode", title: "Your trip is underway" } as const;
}

function focusDateFor(state: TravelModeState, dates: string[], start: string, end: string) {
  if (state.selectedDate && dates.includes(state.selectedDate)) return state.selectedDate;
  if (state.today >= start && state.today <= end && dates.includes(state.today)) return state.today;
  return state.today < start ? start : end;
}

export default function TravelMode({ data, state, onSelectDate, onSelectCity, onOpenMap, onExport, onPrepareOffline, onOpenDecisionMode, onOpenEmergencyCard }: TravelModeProps) {
  const logistics = buildTripLogistics(data, state.selectedTransport || {});
  const dates = calendarDates(logistics);
  const focusDate = focusDateFor(state, dates, logistics.start, logistics.end);
  const focusStop = stopForDate(data.stops, focusDate);
  const selectedCity = data.stops.find((stop) => stop.id === state.selectedCity) || focusStop || data.stops[0];
  const cityDates = dates.filter((date) => stopForDate(data.stops, date)?.id === selectedCity.id);
  const phase = phaseFor(state.today, logistics.start, logistics.end);
  const openCount = logistics.items.filter((item) => item.status !== "confirmed" && item.kind !== "activity").length;
  const focusIndex = Math.max(0, dates.indexOf(focusDate));
  const timelineDates = dates.slice(focusIndex, focusIndex + 5);
  const target = { date: focusDate, cityId: focusStop?.id };

  const selectCity = (stop: TripStop) => {
    onSelectCity?.(stop.id);
    onSelectDate?.(stop.checkIn);
  };

  return <section className={`mode-shell travel-mode phase-${phase.id}`} aria-labelledby="travel-mode-title">
    <header className="travel-hero mode-glass">
      <div className="travel-hero-top">
        <div><span className="mode-eyebrow">{phase.eyebrow}</span><h1 id="travel-mode-title">{phase.title}</h1></div>
        <span className={`travel-offline ${state.offlineReady ? "ready" : ""}`}><i />{state.offlineReady ? "Offline ready" : "Online view"}</span>
      </div>
      <div className="travel-now">
        <span className="travel-date-block"><strong>{formatDate(focusDate, { day: "2-digit" })}</strong><small>{formatDate(focusDate, { month: "short", weekday: "short" })}</small></span>
        <div><small>{focusDate === state.today && phase.id === "current" ? "Today in" : "Viewing"}</small><h2>{focusStop ? `${focusStop.flag} ${focusStop.name}` : "Departure day"}</h2><p>{focusDate === state.today ? "Current trip day" : formatDate(focusDate, { day: "numeric", month: "long", year: "numeric" })}</p></div>
      </div>
      <div className="travel-actions" aria-label="Travel tools">
        {onOpenMap ? <button className="mode-button primary" onClick={() => onOpenMap(target)}><Icon name="pin" />Map</button> : null}
        {onPrepareOffline ? <button className="mode-button secondary" onClick={onPrepareOffline}><Icon name="download" />{state.offlineReady ? "Update offline" : "Save offline"}</button> : null}
        {onExport ? <button className="mode-button secondary" onClick={onExport}><Icon name="download" />Export</button> : null}
      </div>
    </header>

    <nav className="travel-city-tabs" aria-label="Active city">
      {data.stops.map((stop) => <button key={stop.id} aria-pressed={selectedCity.id === stop.id} className={selectedCity.id === stop.id ? "active" : ""} onClick={() => selectCity(stop)}>
        <span>{stop.flag}</span><strong>{stop.name}</strong><small>{stop.nights}n</small>
      </button>)}
    </nav>

    <section className="travel-date-picker mode-glass" aria-labelledby="travel-date-title">
      <header><div><span className="mode-eyebrow">{selectedCity.name}</span><h2 id="travel-date-title">Choose a day</h2></div><small>{cityDates.length} day{cityDates.length === 1 ? "" : "s"}</small></header>
      <div>
        {cityDates.map((date) => <button key={date} aria-pressed={date === focusDate} className={date === focusDate ? "active" : ""} onClick={() => onSelectDate?.(date)}>
          <small>{formatDate(date, { weekday: "short" })}</small><strong>{formatDate(date, { day: "numeric" })}</strong><span>{formatDate(date, { month: "short" })}</span>
          {logisticsItemsForDate(logistics, date).some((item) => item.status !== "confirmed") ? <i aria-hidden="true" /> : null}
        </button>)}
      </div>
    </section>

    <div className="travel-content">
      <section className="travel-timeline mode-glass" aria-labelledby="travel-timeline-title">
        <header className="mode-section-header">
          <div><span className="mode-eyebrow">From {focusDate === state.today ? "today" : "selected day"}</span><h2 id="travel-timeline-title">Coming up</h2></div>
          {openCount && onOpenDecisionMode ? <button className="mode-link" onClick={onOpenDecisionMode}>{openCount} open <Icon name="arrow" width="14" /></button> : null}
        </header>
        <div className="travel-timeline-list">
          {timelineDates.map((date) => {
            const stop = stopForDate(data.stops, date);
            const items = [...logisticsItemsForDate(logistics, date)].sort((left, right) => statusRank[left.status] - statusRank[right.status]);
            const planIndex = stop ? dateOffset(stop.checkIn, date) : 0;
            const plan = stop ? data.cityPlans[stop.id]?.[planIndex] : undefined;
            const planBlocks = plan?.blocks.slice(0, 2) || [];
            return <article className={date === focusDate ? "active" : ""} key={date}>
              <div className="travel-timeline-date"><strong>{formatDate(date, { day: "numeric" })}</strong><span>{formatDate(date, { weekday: "short", month: "short" })}</span></div>
              <div className="travel-timeline-body">
                <header><h3>{stop?.flag} {stop?.name || "Travel"}</h3>{date === state.today ? <span>Today</span> : null}</header>
                {items.map((item) => <div className={`travel-logistics ${item.status}`} key={item.id}>
                  <span className="mode-icon"><Icon name={kindIcon[item.kind]} /></span>
                  <div><strong>{safeText(item.title)}</strong><small><span>{statusLabel[item.status]}</span>{safeText(item.detail)}</small></div>
                </div>)}
                {plan ? <div className="travel-plan">
                  <strong>{safeText(plan.theme)}</strong>
                  {planBlocks.map((block, index) => <span key={`${block.time}:${block.id || index}`}><time>{safeText(block.time)}</time>{safeText(block.title || block.note)}</span>)}
                </div> : null}
                {!items.length && !plan ? <p className="travel-empty-day">No logistics or day plan recorded.</p> : null}
              </div>
            </article>;
          })}
        </div>
      </section>

      <aside className="travel-safety mode-glass" aria-labelledby="travel-safety-title">
        <span className="mode-icon safety"><Icon name="pin" /></span>
        <div><span className="mode-eyebrow">Keep accessible offline</span><h2 id="travel-safety-title">Safety card</h2><p>If someone is in immediate danger, contact local emergency services first. Use your saved card for trip-specific help.</p></div>
        {onOpenEmergencyCard ? <button className="mode-button secondary" onClick={() => onOpenEmergencyCard(target)}>Open safety card</button> : null}
        <small>Confirmation codes, booking references, email addresses, seats, and loyalty IDs are hidden in Travel mode.</small>
      </aside>
    </div>
  </section>;
}
