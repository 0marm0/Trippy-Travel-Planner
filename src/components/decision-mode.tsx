"use client";

import type { CSSProperties } from "react";
import type { Trip2026Payload } from "@/lib/trip-model";
import {
  buildTripLogistics,
  transportLegStatus,
  type LogisticsItem,
  type LogisticsKind,
  type LogisticsStatus,
} from "@/lib/trip-logistics";
import { Icon } from "./planner-icon";
import "./modes.css";

export type DecisionModeState = {
  selectedTransport: Record<string, string>;
  selectedHotels: Record<string, string>;
};

export type DecisionModeItem = {
  id: string;
  date?: string;
  kind: LogisticsKind;
  status: Exclude<LogisticsStatus, "confirmed">;
  title: string;
  detail: string;
  rank: number;
};

export type DecisionModeProps = {
  data: Trip2026Payload;
  state: DecisionModeState;
  onOpenDecision?: (decision: DecisionModeItem) => void;
  onOpenTransport?: (legId?: string) => void;
  onOpenStay?: (cityId?: string) => void;
  onRefreshData?: () => void;
};

type CoverageMetric = {
  id: "bookings" | "transport" | "stays";
  label: string;
  value: number;
  total: number;
  detail: string;
  icon: string;
};

const statusOrder: Record<Exclude<LogisticsStatus, "confirmed">, number> = { conflict: 0, missing: 1, tbc: 2 };
const statusCopy: Record<Exclude<LogisticsStatus, "confirmed">, string> = {
  conflict: "Conflict",
  missing: "Missing",
  tbc: "Verify",
};
const kindIcon: Record<LogisticsKind, string> = { flight: "flight", train: "train", car: "car", stay: "stays", activity: "activities" };

function dateLabel(value?: string) {
  if (!value) return "Date not recorded";
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function occursOn(item: LogisticsItem, date: string) {
  if (!item.date) return false;
  if (!item.endDate) return item.date === date;
  return date >= item.date && (item.endExclusive ? date < item.endDate : date <= item.endDate);
}

function nightDates(start: string, count: number) {
  return Array.from({ length: count }, (_, index) => new Date(Date.parse(`${start}T12:00:00Z`) + index * 86_400_000).toISOString().slice(0, 10));
}

function recordedSourceDates(data: Trip2026Payload) {
  const values = [
    ...data.transport.flatMap((leg) => leg.options.flatMap((option) => option.published ? [option.published] : [])),
    ...data.hotels.flatMap((hotel) => hotel.offers.flatMap((offer) => offer.checked ? [offer.checked] : [])),
  ];
  return values.flatMap((value) => {
    const iso = value.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    return iso && !Number.isNaN(Date.parse(`${iso}T12:00:00Z`)) ? [iso] : [];
  }).sort();
}

function selectedStayDetail(item: LogisticsItem, data: Trip2026Payload, state: DecisionModeState) {
  if (item.kind !== "stay" || !item.date) return item.detail;
  const stop = data.stops.find((candidate) => item.date! >= candidate.checkIn && item.date! < candidate.checkOut);
  const hotel = stop && data.hotels.find((candidate) => candidate.id === state.selectedHotels[stop.id]);
  return hotel ? `Planning option: ${hotel.name}. No confirmed accommodation record covers this period.` : item.detail;
}

function toDecision(item: LogisticsItem, data: Trip2026Payload, state: DecisionModeState): DecisionModeItem | null {
  if (item.status === "confirmed" || item.kind === "activity") return null;
  const status = item.status;
  const dateRank = item.date ? Math.max(0, Math.floor((Date.parse(`${item.date}T12:00:00Z`) - Date.parse(`${data.start}T12:00:00Z`)) / 86_400_000)) : 999;
  return {
    id: item.id,
    date: item.date,
    kind: item.kind,
    status,
    title: item.title,
    detail: selectedStayDetail(item, data, state),
    rank: statusOrder[status] * 10_000 + dateRank,
  };
}

function coverageStyle(metric: CoverageMetric) {
  const percent = metric.total ? Math.round((metric.value / metric.total) * 100) : 0;
  return { "--coverage": `${percent}%` } as CSSProperties;
}

export default function DecisionMode({ data, state, onOpenDecision, onOpenTransport, onOpenStay, onRefreshData }: DecisionModeProps) {
  const logistics = buildTripLogistics(data, state.selectedTransport);
  const bookingItems = logistics.items.filter((item) => item.source === "booking");
  const transportStatuses = data.transport.map((leg) => transportLegStatus(logistics, leg, data.stops));
  const nights = data.stops.flatMap((stop) => nightDates(stop.checkIn, stop.nights));
  const confirmedStayNights = nights.filter((date) => logistics.items.some((item) => item.kind === "stay" && item.status === "confirmed" && occursOn(item, date))).length;
  const transportSelections = data.transport.filter((leg) => {
    const selected = state.selectedTransport[leg.id];
    return Boolean(selected && leg.options.some((option) => option.id === selected));
  }).length;
  const staySelections = data.stops.filter((stop) => data.hotels.some((hotel) => hotel.id === state.selectedHotels[stop.id] && hotel.city === stop.id)).length;
  const metrics: CoverageMetric[] = [
    {
      id: "bookings",
      label: "Booking records",
      value: bookingItems.filter((item) => item.status === "confirmed").length,
      total: bookingItems.length,
      detail: bookingItems.length ? "Explicitly confirmed records only" : "No booking records loaded",
      icon: "check",
    },
    {
      id: "transport",
      label: "Transport legs",
      value: transportStatuses.filter((status) => status === "confirmed").length,
      total: data.transport.length,
      detail: `${transportSelections}/${data.transport.length} manual planning selections`,
      icon: "train",
    },
    {
      id: "stays",
      label: "Lodging nights",
      value: confirmedStayNights,
      total: nights.length,
      detail: `${staySelections}/${data.stops.length} hotel options selected; selections are not bookings`,
      icon: "stays",
    },
  ];
  const decisions = logistics.items
    .flatMap((item) => {
      const decision = toDecision(item, data, state);
      return decision ? [decision] : [];
    })
    .sort((left, right) => left.rank - right.rank || left.title.localeCompare(right.title));
  const conflicts = decisions.filter((item) => item.status === "conflict").length;
  const missing = decisions.filter((item) => item.status === "missing").length;
  const tbc = decisions.filter((item) => item.status === "tbc").length;
  const readiness = conflicts ? { tone: "danger", label: "Blocked by conflicts", copy: "Resolve contradictory route or booking evidence before relying on this plan." }
    : missing ? { tone: "warning", label: "Booking decisions open", copy: "The route is usable for planning, but required logistics are not fully confirmed." }
      : tbc ? { tone: "checking", label: "Verification needed", copy: "Coverage exists, but some dates or details are still provisional." }
        : { tone: "ready", label: "Core logistics ready", copy: "All tracked transport and lodging requirements have confirmed coverage." };
  const sourceDates = recordedSourceDates(data);
  const newestSourceDate = sourceDates.at(-1);

  return <section className="mode-shell decision-mode" aria-labelledby="decision-mode-title">
    <header className="mode-hero mode-glass">
      <div>
        <span className="mode-eyebrow">Decision mode</span>
        <h1 id="decision-mode-title">What still needs a call</h1>
        <p>Coverage comes from normalized records. Quotes, recommendations, holds, and selected options never count as confirmed.</p>
      </div>
      <div className={`mode-readiness ${readiness.tone}`} role="status">
        <span className="mode-status-dot" />
        <div><strong>{readiness.label}</strong><small>{readiness.copy}</small></div>
      </div>
    </header>

    <div className="mode-coverage" aria-label="Trip coverage">
      {metrics.map((metric) => <article className="mode-coverage-card mode-glass" key={metric.id} style={coverageStyle(metric)}>
        <header><span className="mode-icon"><Icon name={metric.icon} /></span><small>{metric.label}</small></header>
        <div className="mode-coverage-value"><strong>{metric.value}</strong><span>/ {metric.total}</span></div>
        <div className="mode-coverage-track" aria-hidden="true"><i /></div>
        <p>{metric.detail}</p>
        {metric.id === "transport" && onOpenTransport ? <button className="mode-link" onClick={() => onOpenTransport()}>Review transport <Icon name="arrow" width="14" /></button> : null}
        {metric.id === "stays" && onOpenStay ? <button className="mode-link" onClick={() => onOpenStay()}>Review stays <Icon name="arrow" width="14" /></button> : null}
      </article>)}
    </div>

    <div className="decision-layout">
      <section className="decision-queue mode-glass" aria-labelledby="decision-queue-title">
        <header className="mode-section-header">
          <div><span className="mode-eyebrow">Ranked queue</span><h2 id="decision-queue-title">Unresolved decisions</h2></div>
          <div className="decision-totals" aria-label={`${conflicts} conflicts, ${missing} missing, ${tbc} to verify`}>
            {conflicts ? <span className="danger">{conflicts} conflict{conflicts === 1 ? "" : "s"}</span> : null}
            {missing ? <span className="warning">{missing} missing</span> : null}
            {tbc ? <span>{tbc} verify</span> : null}
          </div>
        </header>
        {decisions.length ? <ol className="decision-list">
          {decisions.map((decision, index) => <li key={decision.id} className={`decision-row ${decision.status}`}>
            <span className="decision-rank" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="mode-icon"><Icon name={kindIcon[decision.kind]} /></span>
            <div className="decision-copy">
              <div><span className={`mode-status ${decision.status}`}>{statusCopy[decision.status]}</span><small>{dateLabel(decision.date)}</small></div>
              <h3>{decision.title}</h3>
              <p>{decision.detail}</p>
            </div>
            {onOpenDecision ? <button className="mode-button secondary" onClick={() => onOpenDecision(decision)}>
              {decision.status === "conflict" ? "Resolve" : decision.status === "missing" ? "Choose" : "Verify"}<Icon name="arrow" width="14" />
            </button> : null}
          </li>)}
        </ol> : <div className="mode-empty"><span className="mode-icon ready"><Icon name="check" /></span><div><h3>No unresolved core logistics</h3><p>The current normalized records cover every tracked transport leg and lodging night.</p></div></div>}
      </section>

      <aside className="decision-evidence mode-glass" aria-labelledby="decision-evidence-title">
        <span className="mode-eyebrow">Evidence health</span>
        <h2 id="decision-evidence-title">Freshness &amp; scope</h2>
        <dl>
          <div><dt>Workspace</dt><dd>{data.dataMode === "private" ? "Private local data" : "Redacted sample data"}</dd></div>
          <div><dt>Dated sources</dt><dd>{sourceDates.length || "None"}</dd></div>
          <div><dt>Newest recorded check</dt><dd>{newestSourceDate ? dateLabel(newestSourceDate) : "Not recorded"}</dd></div>
          <div><dt>Readiness basis</dt><dd>Confirmed records and route coverage</dd></div>
        </dl>
        <p className="mode-note"><Icon name="clock" width="15" />A recorded source date is not a live availability check.</p>
        {onRefreshData ? <button className="mode-button primary" onClick={onRefreshData}><Icon name="globe" />Refresh source data</button> : null}
      </aside>
    </div>
  </section>;
}
