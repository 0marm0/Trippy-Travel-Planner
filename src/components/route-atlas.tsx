"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Point } from "@/lib/planner";
import type { MapSegment } from "./geographic-map";
import { Icon } from "./planner-icon";

type Ring = number[][];
type Geometry = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Country = { properties: { ISO_A2_EH?: string; NAME?: string; LABEL_X?: number; LABEL_Y?: number }; geometry: Geometry };
type AtlasData = { features: Country[] };
type View = { x: number; y: number; width: number; height: number };

const WIDTH = 1200;
const HEIGHT = 720;
const bounds = { west: -13, east: 25, south: 40, north: 57 };
const initialView: View = { x: 0, y: 0, width: WIDTH, height: HEIGHT };

function fitRoute(points: Point[]): View {
  if (!points.length) return initialView;
  const positions = points.map((point) => project([point.lng, point.lat]));
  const xs = positions.map(([x]) => x), ys = positions.map(([, y]) => y);
  const left = Math.min(...xs) - 82, right = Math.max(...xs) + 108;
  const top = Math.min(...ys) - 64, bottom = Math.max(...ys) + 64;
  // Keep every stop and its label visible while avoiding a needlessly broad
  // continental frame. Users can still zoom out from the compact route view.
  const width = Math.min(WIDTH, Math.max(WIDTH * .62, right - left, (bottom - top) * WIDTH / HEIGHT));
  const height = width * HEIGHT / WIDTH;
  return { x: Math.max(0, Math.min(WIDTH - width, (left + right - width) / 2)), y: Math.max(0, Math.min(HEIGHT - height, (top + bottom - height) / 2)), width, height };
}

function project([longitude, latitude]: number[]) {
  return [
    ((longitude - bounds.west) / (bounds.east - bounds.west)) * WIDTH,
    ((bounds.north - latitude) / (bounds.north - bounds.south)) * HEIGHT,
  ];
}

function ringPath(ring: Ring) {
  return ring.map((coordinate, index) => `${index ? "L" : "M"}${project(coordinate).map((value) => value.toFixed(1)).join(" ")}`).join(" ") + "Z";
}

function geometryPath(geometry: Geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) => polygon.map(ringPath).join(" ")).join(" ");
}

function segmentPath(from: Point, to: Point, kind: MapSegment["kind"]) {
  const [x1, y1] = project([from.lng, from.lat]);
  const [x2, y2] = project([to.lng, to.lat]);
  const bend = kind === "flight" ? 30 : kind === "train" ? 12 : -7;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - bend;
  return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
}

function pointLabelPlacement(id: string) {
  if (id === "ring") return { x: 0, y: -28, anchor: "middle" as const };
  if (id === "frankfurt") return { x: 22, y: 18, anchor: "start" as const };
  if (id === "brussels") return { x: -22, y: -7, anchor: "end" as const };
  return { x: 22, y: -6, anchor: "start" as const };
}

export default function RouteAtlas({ points, segments = [], onSelect, label = "Trip route atlas", showLegend = true }: { points: Point[]; segments?: MapSegment[]; onSelect?: (id: string) => void; label?: string; showLegend?: boolean }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [view, setView] = useState(() => fitRoute(points));
  const [interacting, setInteracting] = useState(false);
  const drag = useRef<{ x: number; y: number; view: View } | null>(null);
  const atlasId = useId().replace(/:/g, "");
  const seaId = `${atlasId}-sea`;
  const gridId = `${atlasId}-grid`;
  const glowId = `${atlasId}-glow`;
  const clipId = `${atlasId}-clip`;
  const pointById = useMemo(() => new Map(points.map((point) => [point.id, point])), [points]);
  const openSegments = segments.filter((segment) => segment.status === "missing" || segment.status === "conflict" || segment.status === "tbc").length;

  useEffect(() => {
    let cancelled = false;
    fetch("/ne-110m-countries.geojson").then((response) => response.json()).then((data: AtlasData) => {
      if (!cancelled) setCountries(data.features);
    }).catch(() => setCountries([]));
    return () => { cancelled = true; };
  }, []);

  const zoom = (factor: number) => setView((current) => {
    const width = Math.max(430, Math.min(WIDTH, current.width * factor));
    const height = width * HEIGHT / WIDTH;
    return { x: Math.max(0, Math.min(WIDTH - width, current.x + (current.width - width) / 2)), y: Math.max(0, Math.min(HEIGHT - height, current.y + (current.height - height) / 2)), width, height };
  });

  return <div className={`route-atlas-shell ${interacting ? "is-interacting" : ""}`}>
    <svg role="img" aria-label={label} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} onWheel={(event) => { event.preventDefault(); zoom(event.deltaY > 0 ? 1.12 : .88); }} onPointerDown={(event) => { setInteracting(true); drag.current = { x: event.clientX, y: event.clientY, view }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (!drag.current) return; const scale = drag.current.view.width / event.currentTarget.clientWidth; setView({ ...drag.current.view, x: Math.max(0, Math.min(WIDTH - drag.current.view.width, drag.current.view.x - (event.clientX - drag.current.x) * scale)), y: Math.max(0, Math.min(HEIGHT - drag.current.view.height, drag.current.view.y - (event.clientY - drag.current.y) * scale)) }); }} onPointerUp={(event) => { setInteracting(false); drag.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { setInteracting(false); drag.current = null; }}>
      <defs>
        <linearGradient id={seaId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#030a14" /><stop offset=".48" stopColor="#07192b" /><stop offset="1" stopColor="#0b2138" /></linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <pattern id={gridId} width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="#6eaccf" strokeOpacity=".055" strokeWidth="1" /></pattern>
        <clipPath id={clipId}><rect width={WIDTH} height={HEIGHT} rx="22" /></clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={WIDTH} height={HEIGHT} fill={`url(#${seaId})`} />
        <rect width={WIDTH} height={HEIGHT} fill={`url(#${gridId})`} />
        <g className="atlas-countries">{countries.map((country, index) => <path key={`${country.properties.ISO_A2_EH || country.properties.NAME}-${index}`} className={["DE", "PL", "BE", "NL"].includes(country.properties.ISO_A2_EH || "") ? "route-country" : ""} d={geometryPath(country.geometry)} fillRule="evenodd" />)}</g>
        <g className="atlas-country-labels">{countries.filter((country) => country.properties.LABEL_X != null && country.properties.LABEL_Y != null && country.properties.LABEL_X! >= bounds.west && country.properties.LABEL_X! <= bounds.east && country.properties.LABEL_Y! >= bounds.south && country.properties.LABEL_Y! <= bounds.north).map((country) => { const [x, y] = project([country.properties.LABEL_X!, country.properties.LABEL_Y!]); return <text key={country.properties.NAME} x={x} y={y}>{country.properties.NAME}</text>; })}</g>
        <g className="atlas-route-lines" style={{ filter: `url(#${glowId})` }}>{segments.map((segment, index) => { const from = pointById.get(segment.from); const to = pointById.get(segment.to); return from && to ? <path key={`${segment.from}-${segment.to}-${index}`} className={`${segment.kind} ${segment.status ? `booking-${segment.status}` : ""}`} d={segmentPath(from, to, segment.kind)} pathLength="100"><title>{from.name} → {to.name}{segment.status ? ` · ${segment.status === "missing" ? "Needs booking" : segment.status === "tbc" ? "Details pending" : segment.status === "conflict" ? "Check dates" : "Confirmed"}` : ""}</title></path> : null; })}</g>
        <g className="atlas-route-points">{points.map((point) => { const [x, y] = project([point.lng, point.lat]); const labelPosition = pointLabelPlacement(point.id); return <g key={point.id} role="button" tabIndex={0} aria-label={point.name} transform={`translate(${x} ${y})`} onClick={() => onSelect?.(point.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(point.id); }}><circle className="point-halo" r="23" /><circle className={`point-core ${point.category || "city"}`} r="16" /><text className="point-number" textAnchor="middle" y="4">{point.number || (point.category === "airport" ? "✈" : "•")}</text><text className="point-label" x={labelPosition.x} y={labelPosition.y} textAnchor={labelPosition.anchor}>{point.name}</text></g>; })}</g>
      </g>
    </svg>
    <div className="atlas-context"><span><i />Live route canvas</span><b>{points.length} stops · {segments.length} legs</b>{openSegments > 0 && <em>{openSegments} open decision{openSegments === 1 ? "" : "s"}</em>}</div>
    <div className="atlas-controls"><button onClick={() => setView(fitRoute(points))} aria-label="Fit route" title="Fit the complete route"><Icon name="globe" /><span>Fit</span></button><button onClick={() => zoom(.78)} aria-label="Zoom in" title="Zoom in">+</button><button onClick={() => zoom(1.28)} aria-label="Zoom out" title="Zoom out">−</button></div>
    <span className="atlas-gesture-hint">Drag to explore · scroll to zoom</span>
    {showLegend ? <div className="map-legend"><span className="air">Flight</span><span className="rail">Train</span><span className="road">Drive</span>{segments.some((segment) => segment.status === "missing") && <span className="needs-booking">Needs booking</span>}</div> : null}
    {!countries.length ? <span className="map-loading">Drawing Europe…</span> : null}
  </div>;
}
