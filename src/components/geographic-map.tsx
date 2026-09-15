"use client";

import GlassSelect from "./glass-select";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from "maplibre-gl";
import type { Point } from "@/lib/planner";
import RouteAtlas from "./route-atlas";
import { Icon } from "./planner-icon";
import "./geographic-map.css";

export type MapSegment = { from: string; to: string; kind: "flight" | "train" | "drive" | "other"; status?: "confirmed" | "missing" | "tbc" | "conflict" };
type OpenFreeMapStyle = "bright" | "liberty" | "fiord" | "dark";
type BuiltInMapStyle = OpenFreeMapStyle | "night";
type MapStyleChoice = BuiltInMapStyle | "configured" | "satellite";
type StyleVariant = BuiltInMapStyle | "light" | "satellite";
type LayerKey = "flights" | "rail" | "drive" | "stays" | "activities";
type Props = {
  points: Point[];
  connect?: boolean;
  segments?: MapSegment[];
  focus?: string;
  onSelect?: (id: string) => void;
  onPlace?: (lat: number, lng: number) => void;
  fitKey?: string;
  label?: string;
  basemap?: "atlas" | "city";
  styleVariant?: StyleVariant;
  showLegend?: boolean;
  cityCenter?: { lat: number; lng: number };
  initialFit?: "city" | "all";
};

const openFreeMapStyles: Record<OpenFreeMapStyle, string> = {
  bright: "https://tiles.openfreemap.org/styles/bright",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  fiord: "https://tiles.openfreemap.org/styles/fiord",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

const builtInMapStyles: Record<BuiltInMapStyle, string> = {
  night: "/styles/trippy-night.json",
  ...openFreeMapStyles,
};

const styleChoices: { id: BuiltInMapStyle; label: string }[] = [
  { id: "night", label: "Night" },
  { id: "bright", label: "Bright" },
  { id: "liberty", label: "Liberty" },
  { id: "fiord", label: "Fiord" },
  { id: "dark", label: "Dark" },
];

const mapStyleStorageKey = "trippy.map.style";

const layerMeta: Record<LayerKey, { label: string; icon: string }> = {
  flights: { label: "Flights", icon: "/icons/flights.png" },
  rail: { label: "Rail", icon: "/icons/train-rail.png" },
  drive: { label: "Car", icon: "/icons/car.png" },
  stays: { label: "Stays", icon: "/icons/hotel-bed.png" },
  activities: { label: "Activities", icon: "/icons/star-activities.png" },
};

const allLayers: Record<LayerKey, boolean> = {
  flights: true,
  rail: true,
  drive: true,
  stays: true,
  activities: true,
};

const emptySegments: MapSegment[] = [];

const localAtlasStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    { id: "night", type: "background", paint: { "background-color": "#050707" } },
  ],
};

function normalizedStyle(variant: StyleVariant | undefined): MapStyleChoice {
  if (!variant) return "night";
  if (variant === "light") return "bright";
  return variant;
}

function optionalConfiguredStyle() {
  const customStyle = (process.env.NEXT_PUBLIC_CITY_MAP_STYLE_URL || process.env.NEXT_PUBLIC_CITY_LIGHT_MAP_STYLE_URL)?.trim();
  if (customStyle && !/^your[_-]/i.test(customStyle)) return customStyle;
  const cartoKey = process.env.NEXT_PUBLIC_CARTO_BASEMAP_KEY?.trim();
  if (cartoKey && !cartoKey.startsWith("your_")) return `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${encodeURIComponent(cartoKey)}`;
  return undefined;
}

function configuredCityStyle(variant: MapStyleChoice = "bright", configuredStyle = optionalConfiguredStyle()) {
  if (variant === "satellite") return process.env.NEXT_PUBLIC_SATELLITE_MAP_STYLE_URL || openFreeMapStyles.bright;
  if (variant === "configured") return configuredStyle || openFreeMapStyles.bright;
  return builtInMapStyles[variant];
}

function storedStyle(configuredStyle: string | undefined): MapStyleChoice {
  if (typeof window === "undefined") return "night";
  try {
    const stored = window.localStorage.getItem(mapStyleStorageKey);
    if (stored && Object.hasOwn(builtInMapStyles, stored)) return stored as BuiltInMapStyle;
    if (stored === "configured" && configuredStyle) return stored;
  } catch {
    // Storage may be unavailable in private or hardened browser contexts.
  }
  return "night";
}

function pointLayer(category = ""): LayerKey | undefined {
  if (category === "airport" || category === "flight") return "flights";
  if (category === "station" || category === "rail" || category === "train") return "rail";
  if (category === "hotel" || category === "stay") return "stays";
  if (category === "activity" || category.startsWith("activity-")) return "activities";
  return undefined;
}

function segmentLayer(kind: MapSegment["kind"]): LayerKey | undefined {
  if (kind === "flight") return "flights";
  if (kind === "train") return "rail";
  if (kind === "drive") return "drive";
  return undefined;
}

function markerIcon(category = "") {
  const layer = pointLayer(category);
  return layer ? layerMeta[layer].icon : undefined;
}

function hasPersistentLabel(category = "") {
  return category === "hotel" || category === "stay" || category === "airport" || category === "station" || category === "rail" || category === "train";
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const radius = 6371;
  const latitude = (b.lat - a.lat) * Math.PI / 180;
  const longitude = (b.lng - a.lng) * Math.PI / 180;
  const firstLatitude = a.lat * Math.PI / 180;
  const secondLatitude = b.lat * Math.PI / 180;
  const value = Math.sin(latitude / 2) ** 2 + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitude / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

export default function GeographicMap(props: Props) {
  if ((props.basemap || "atlas") === "atlas") return <RouteAtlas points={props.points} segments={props.segments} onSelect={props.onSelect} label={props.label} showLegend={props.showLegend} />;
  return <TiledGeographicMap {...props} />;
}

function TiledGeographicMap({ points, connect = false, segments = emptySegments, focus, onSelect, onPlace, fitKey = "", label = "Trip map", basemap = "city", styleVariant, showLegend = connect, cityCenter, initialFit = "city" }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const callbacks = useRef({ onSelect, onPlace });
  const pointsRef = useRef(points);
  const focusRef = useRef(focus);
  const centerRef = useRef(cityCenter);
  const lastAutoFitRef = useRef("");
  const restoredStyleRef = useRef(false);
  const configuredStyle = optionalConfiguredStyle();
  const explicitStyle = styleVariant === undefined ? undefined : normalizedStyle(styleVariant);
  const [ready, setReady] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);
  const [styleEpoch, setStyleEpoch] = useState(0);
  const [mapError, setMapError] = useState(false);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedStyle, setSelectedStyle] = useState<MapStyleChoice>(() => explicitStyle || "night");
  const [layers, setLayers] = useState(allLayers);
  const activeStyle = explicitStyle || selectedStyle;
  const availableStyleChoices = configuredStyle ? [...styleChoices, { id: "configured" as const, label: "Configured" }] : styleChoices;

  const availableLayers = useMemo(() => {
    const available = new Set<LayerKey>();
    points.forEach((point) => { const layer = pointLayer(point.category); if (layer) available.add(layer); });
    segments.forEach((segment) => { const layer = segmentLayer(segment.kind); if (layer) available.add(layer); });
    return (Object.keys(layerMeta) as LayerKey[]).filter((layer) => available.has(layer));
  }, [points, segments]);

  const visiblePoints = useMemo(() => points.filter((point) => {
    const layer = pointLayer(point.category);
    return !layer || layers[layer];
  }), [layers, points]);

  useEffect(() => { callbacks.current = { onSelect, onPlace }; }, [onSelect, onPlace]);
  useEffect(() => { pointsRef.current = points; }, [points]);
  useEffect(() => { focusRef.current = focus; }, [focus]);
  useEffect(() => { centerRef.current = cityCenter; }, [cityCenter]);
  useEffect(() => {
    if (explicitStyle || restoredStyleRef.current) return;
    restoredStyleRef.current = true;
    const stored = storedStyle(configuredStyle);
    if (stored === selectedStyle) return;
    const timer = window.setTimeout(() => setSelectedStyle(stored), 0);
    return () => window.clearTimeout(timer);
  }, [configuredStyle, explicitStyle, selectedStyle]);

  const fitPoints = useCallback((target: Point[], animate = true, maxZoom = 14) => {
    const map = mapRef.current;
    if (!map || !target.length) return;
    import("maplibre-gl").then(({ LngLatBounds }) => {
      const bounds = new LngLatBounds();
      target.forEach(point => bounds.extend([point.lng, point.lat]));
      if (target.length === 1) map.flyTo({ center: [target[0].lng, target[0].lat], zoom: 13.4, duration: animate ? 650 : 0 });
      else map.fitBounds(bounds, { padding: 62, maxZoom, duration: animate ? 650 : 0 });
    });
  }, []);

  const fitAll = useCallback((animate = true) => {
    fitPoints(pointsRef.current, animate, connect ? 6.2 : 14);
  }, [connect, fitPoints]);

  const fitCity = useCallback((animate = true) => {
    const current = pointsRef.current;
    if (!current.length) return;
    const anchor = centerRef.current
      || current.find((point) => point.id === focusRef.current)
      || current.find((point) => point.category === "hotel" || point.category === "stay")
      || current.find((point) => point.category === "city")
      || current.find((point) => point.category === "station")
      || current[0];
    const local = current.filter((point) => distanceKm(anchor, point) <= 32);
    fitPoints(local.length ? local : [current[0]], animate, 14);
  }, [fitPoints]);

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    import("maplibre-gl").then(({ Map, setWorkerUrl }) => {
      if (disposed || !container.current) return;
      setTilesReady(false);
      setWorkerUrl("/maplibre-gl-worker.mjs");
      const configuredAtlas = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
      const externalStyle = basemap === "city" ? configuredCityStyle(activeStyle, configuredStyle) : configuredAtlas;
      let usingBundledAtlas = !externalStyle;
      const map = new Map({
        container: container.current,
        style: externalStyle || localAtlasStyle,
        center: [4, 48],
        zoom: 4,
        attributionControl: { compact: true },
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
      });
      mapRef.current = map;
      map.setMissingStyleImageResolver((id) => {
        if (!map.hasImage(id)) map.addImage(id, new ImageData(1, 1));
      });
      map.on("styleimagemissing", ({ id }) => {
        if (!map.hasImage(id)) map.addImage(id, new ImageData(1, 1));
      });
      map.on("style.load", () => {
        if (container.current) {
          container.current.dataset.styleLayers = String(map.getStyle().layers?.length || 0);
          container.current.dataset.styleSources = String(Object.keys(map.getStyle().sources || {}).length);
          container.current.dataset.styleVariant = activeStyle;
        }
        if (usingBundledAtlas && !map.getSource("countries")) {
          map.addSource("countries", { type: "geojson", data: "/ne-110m-countries.geojson", attribution: "Natural Earth · public domain" });
          map.addLayer({ id: "land", type: "fill", source: "countries", paint: { "fill-color": ["match", ["get", "ISO_A2_EH"], "DE", "#102941", "PL", "#10263d", "BE", "#122b43", "NL", "#112d46", "#091a29"], "fill-opacity": 0.98 } });
          map.addLayer({ id: "borders", type: "line", source: "countries", paint: { "line-color": "#2f5576", "line-width": 0.75, "line-opacity": 0.72 } });
        }
        setReady(true);
        setStyleEpoch((current) => current + 1);
        setMapError(false);
        requestAnimationFrame(() => requestAnimationFrame(() => map.resize()));
      });
      map.on("error", event => {
        if (!event.error) return;
        if (container.current) container.current.dataset.lastError = event.error.message;
        setMapError(true);
      });
      map.on("idle", () => {
        if (container.current) container.current.dataset.renderState = "idle";
        if (fallbackTimer) clearTimeout(fallbackTimer);
        setTilesReady(true);
      });
      map.on("zoomend", () => setMapZoom(Number(map.getZoom().toFixed(1))));
      map.on("click", event => callbacks.current.onPlace?.(event.lngLat.lat, event.lngLat.lng));
      observer = new ResizeObserver(() => map.resize());
      observer.observe(container.current);
      if (externalStyle) fallbackTimer = setTimeout(() => {
        if (disposed || usingBundledAtlas) return;
        usingBundledAtlas = true;
        setReady(false);
        map.setStyle(localAtlasStyle);
      }, 15000);
    });
    return () => {
      disposed = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      observer?.disconnect();
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [activeStyle, basemap, configuredStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let disposed = false;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    import("maplibre-gl").then(({ Marker, Popup }) => {
      if (disposed) return;
      markersRef.current = visiblePoints.map(point => {
        const category = point.category || "city";
        const icon = markerIcon(category);
        const element = document.createElement("button");
        element.type = "button";
        element.className = `trippy-map-marker ${category.replace(/[^a-z0-9-]/gi, "-")} ${point.id === focus ? "selected" : ""}`;
        element.setAttribute("aria-label", point.name);
        element.title = point.name;

        const symbol = document.createElement("span");
        symbol.className = "trippy-marker-symbol";
        if (icon) {
          const image = document.createElement("img");
          image.src = icon;
          image.alt = "";
          image.draggable = false;
          symbol.append(image);
        } else {
          symbol.textContent = point.number ? String(point.number) : "•";
        }
        element.append(symbol);

        if (hasPersistentLabel(category)) {
          const markerLabel = document.createElement("span");
          markerLabel.className = "trippy-marker-label";
          markerLabel.textContent = point.name;
          element.append(markerLabel);
        }

        element.addEventListener("click", event => { event.stopPropagation(); callbacks.current.onSelect?.(point.id); });
        return new Marker({ element, anchor: "bottom" }).setLngLat([point.lng, point.lat]).setPopup(new Popup({ offset: 34, closeButton: false, className: "atlas-popup" }).setText(point.name)).addTo(map);
      });
    });

    const pointById = new Map(points.map(point => [point.id, point]));
    const visiblePointIds = new Set(visiblePoints.map((point) => point.id));
    const sourceId = "trippy-routes";
    const effectiveSegments = segments.length ? segments : points.slice(1).map((point, index) => ({ from: points[index].id, to: point.id, kind: "other" as const }));
    const features = effectiveSegments.flatMap(segment => {
      const layer = segmentLayer(segment.kind);
      if (layer && !layers[layer]) return [];
      if (!visiblePointIds.has(segment.from) || !visiblePointIds.has(segment.to)) return [];
      const from = pointById.get(segment.from), to = pointById.get(segment.to);
      return from && to ? [{ type: "Feature" as const, properties: { kind: segment.kind }, geometry: { type: "LineString" as const, coordinates: [[from.lng, from.lat], [to.lng, to.lat]] } }] : [];
    });
    if (connect && features.length) {
      map.addSource(sourceId, { type: "geojson", data: { type: "FeatureCollection", features } });
      map.addLayer({ id: `${sourceId}-glow`, type: "line", source: sourceId, paint: { "line-width": 7, "line-blur": 6, "line-opacity": .16, "line-color": ["match", ["get", "kind"], "drive", "#7da7d9", "train", "#a7d7ff", "#60b8ff"] } });
      map.addLayer({ id: sourceId, type: "line", source: sourceId, paint: { "line-width": 2, "line-opacity": .88, "line-dasharray": [2, 2.2], "line-color": ["match", ["get", "kind"], "drive", "#7da7d9", "train", "#a7d7ff", "#60b8ff"] } });
    }
    return () => {
      disposed = true;
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (map.getLayer(sourceId)) map.removeLayer(sourceId);
      if (map.getLayer(`${sourceId}-glow`)) map.removeLayer(`${sourceId}-glow`);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [points, visiblePoints, focus, ready, connect, segments, styleEpoch, layers]);

  useEffect(() => {
    if (!ready || !points.length) return;
    const autoFitIdentity = `${fitKey}\u0000${styleEpoch}\u0000${connect ? "connected" : initialFit}`;
    if (lastAutoFitRef.current === autoFitIdentity) return;
    lastAutoFitRef.current = autoFitIdentity;
    if (connect || initialFit === "all") fitAll(false);
    else fitCity(false);
  }, [fitKey, ready, connect, focus, fitAll, fitCity, points, styleEpoch, cityCenter, initialFit]);

  const chooseStyle = (choice: MapStyleChoice) => {
    if (explicitStyle) return;
    try {
      window.localStorage.setItem(mapStyleStorageKey, choice);
    } catch {
      // The in-memory choice still works when persistence is unavailable.
    }
    setReady(false);
    setTilesReady(false);
    setSelectedStyle(choice);
  };

  return <div className={`geo-map-shell vector-map trippy-vector-map map-tone-${activeStyle} ${onPlace ? "placing" : ""}`}>
    <div ref={container} className="geo-map" aria-label={label} data-zoom={mapZoom} />
    {!ready ? <span className="map-loading">Opening atlas…</span> : null}
    {ready && !tilesReady ? <div className="map-render-veil" aria-live="polite"><span /><small>Rendering city detail</small></div> : null}
    {ready && !points.length ? <div className="map-empty-state"><span><Icon name="pin" /></span><b>No mapped places yet</b><small>Add a precise location to place it on this canvas.</small></div> : null}
    <div className="trippy-map-command-deck">
      <label className="trippy-style-control"><span>Map</span><GlassSelect value={activeStyle} disabled={Boolean(explicitStyle)} onChange={(event) => chooseStyle(event.target.value as MapStyleChoice)} aria-label="Map style">{availableStyleChoices.map((choice) => <option value={choice.id} key={choice.id}>{choice.label}</option>)}{activeStyle === "satellite" ? <option value="satellite">Satellite</option> : null}</GlassSelect></label>
      {availableLayers.length > 1 ? <div className="trippy-layer-controls" role="group" aria-label="Map layers">{availableLayers.map((layer) => <button type="button" key={layer} className={layers[layer] ? "on" : ""} aria-pressed={layers[layer]} title={`${layers[layer] ? "Hide" : "Show"} ${layerMeta[layer].label}`} onClick={() => setLayers((current) => ({ ...current, [layer]: !current[layer] }))}><span className="trippy-control-icon" style={{ backgroundImage: `url(${layerMeta[layer].icon})` }} /><span>{layerMeta[layer].label}</span></button>)}</div> : null}
    </div>
    <div className="map-tools trippy-map-tools"><span className="map-zoom-readout" aria-hidden="true">{mapZoom.toFixed(1)}×</span><button type="button" onClick={() => fitCity()} title="Fit the active city" aria-label="Fit city">City</button><button type="button" onClick={() => fitAll()} title="Fit every exact pin" aria-label="Fit all pins">All</button><button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in">+</button><button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out">−</button></div>
    {showLegend ? <div className="map-legend"><span className="air">Flight</span><span className="rail">Train</span><span className="road">Drive</span></div> : null}
    {showLegend ? <span className="map-footnote">Geographic connections · not turn-by-turn directions</span> : null}
    {onPlace ? <span className="place-hint">Select the exact location on the map</span> : null}
    {mapError ? <span className="map-error" role="status">The vector map could not finish loading. Check the map provider connection.</span> : null}
  </div>;
}
