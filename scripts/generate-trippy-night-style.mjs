import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sourceUrl = "https://tiles.openfreemap.org/styles/bright";
const outputPath = path.resolve("public/styles/trippy-night.json");
const expectedLayerCount = 119;
const expectedSymbolCount = 25;

const palette = {
  land: "#102334",
  water: "#07121e",
  waterLine: "#28516c",
  residential: "#132a3c",
  commercial: "#253146",
  industrial: "#293342",
  civic: "#233349",
  hospital: "#29364a",
  park: "#19364a",
  ice: "#8fa8ba",
  sand: "#2b3b4d",
  building: "#193345",
  buildingOutline: "#2d485b",
  roadCasing: "#263b4e",
  roadMinor: "#53687b",
  roadSecondary: "#788b9a",
  roadMajor: "#baa675",
  path: "#465c6e",
  rail: "#718599",
  aeroway: "#637588",
  boundary: "#526b80",
  label: "#edf4fa",
  labelSecondary: "#d7e4ed",
  labelWater: "#87b8da",
  halo: "#06111c",
};

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function loadBright() {
  const inputPath = argument("--input");
  if (inputPath) return JSON.parse(await readFile(path.resolve(inputPath), "utf8"));
  const response = await fetch(sourceUrl, { headers: { "user-agent": "TRIPPY-style-generator/1.0" } });
  if (!response.ok) throw new Error(`Bright style fetch failed: ${response.status} ${response.statusText}`);
  return response.json();
}

function colorAlpha(value) {
  const functional = value.match(/^hsla?\([^,]+,[^,]+,[^,]+(?:,\s*([\d.]+))?\)$/i)
    || value.match(/^rgba?\([^,]+,[^,]+,[^,]+(?:,\s*([\d.]+))?\)$/i);
  if (functional) return functional[1] === undefined ? 1 : Number(functional[1]);
  if (/^#[\da-f]{4}$/i.test(value)) return parseInt(value[4] + value[4], 16) / 255;
  if (/^#[\da-f]{8}$/i.test(value)) return parseInt(value.slice(7, 9), 16) / 255;
  return 1;
}

function hexRgb(hex) {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}

function recolor(value, target, preserveAlpha = true) {
  if (Array.isArray(value)) return value.map((item) => recolor(item, target, preserveAlpha));
  if (typeof value !== "string" || !/^(?:#|rgba?\(|hsla?\()/i.test(value)) return value;
  const alpha = preserveAlpha ? colorAlpha(value) : 1;
  if (alpha >= 0.999) return target;
  const [red, green, blue] = hexRgb(target);
  return `rgba(${red},${green},${blue},${Number(alpha.toFixed(3))})`;
}

function fillColor(layer, property) {
  const id = layer.id;
  if (property === "fill-outline-color") return id.includes("building") ? palette.buildingOutline : palette.roadCasing;
  if (id.includes("water")) return palette.water;
  if (/glacier|ice-shelf/.test(id)) return palette.ice;
  if (/park|grass|wood|cemetery/.test(id)) return palette.park;
  if (id.includes("sand")) return palette.sand;
  if (id.includes("hospital")) return palette.hospital;
  if (/school|commercial/.test(id)) return id.includes("commercial") ? palette.commercial : palette.civic;
  if (id.includes("industrial")) return palette.industrial;
  if (/residential|suburb|landuse-railway/.test(id)) return palette.residential;
  if (id.includes("building")) return property === "fill-outline-color" ? palette.buildingOutline : palette.building;
  if (id.includes("aeroway")) return palette.aeroway;
  if (/highway-area/.test(id)) return palette.roadCasing;
  return palette.land;
}

function lineColor(layer) {
  const id = layer.id;
  if (/waterway|ferry/.test(id)) return palette.waterLine;
  if (/railway|cablecar/.test(id)) return palette.rail;
  if (/aeroway/.test(id)) return palette.aeroway;
  if (/boundary/.test(id)) return palette.boundary;
  if (/casing/.test(id)) return palette.roadCasing;
  if (/pier/.test(id)) return palette.land;
  if (/path/.test(id)) return palette.path;
  if (/(motorway|trunk|primary)/.test(id)) return palette.roadMajor;
  if (/(secondary|tertiary|link)/.test(id)) return palette.roadSecondary;
  if (/(minor|service|track|highway)/.test(id)) return palette.roadMinor;
  return palette.roadSecondary;
}

function symbolColor(layer, property) {
  if (property === "text-halo-color") return palette.halo;
  if (property === "icon-color") return palette.labelSecondary;
  if (/water/.test(layer.id)) return palette.labelWater;
  if (/highway-name-path/.test(layer.id)) return palette.labelSecondary;
  if (/poi|airport|highway-name/.test(layer.id)) return palette.labelSecondary;
  return palette.label;
}

function paletteColor(layer, property) {
  if (property === "background-color") return palette.land;
  if (property.startsWith("fill-")) return fillColor(layer, property);
  if (property.startsWith("line-")) return lineColor(layer);
  if (property.startsWith("text-") || property.startsWith("icon-")) return symbolColor(layer, property);
  return palette.labelSecondary;
}

function withoutColorPaint(layer) {
  const clone = structuredClone(layer);
  for (const key of Object.keys(clone.paint || {})) {
    if (key.endsWith("-color")) delete clone.paint[key];
  }
  return clone;
}

function makeNight(bright) {
  assert.equal(bright.version, 8, "Expected a MapLibre v8 style");
  assert.equal(bright.layers.length, expectedLayerCount, "Bright layer count drifted; review upstream before regenerating");
  assert.equal(bright.layers.filter((layer) => layer.type === "symbol").length, expectedSymbolCount, "Bright symbol coverage drifted");

  const night = structuredClone(bright);
  let changedColors = 0;
  for (const layer of night.layers) {
    for (const [property, value] of Object.entries(layer.paint || {})) {
      if (!property.endsWith("-color")) continue;
      const preserveAlpha = property !== "text-halo-color";
      layer.paint[property] = recolor(value, paletteColor(layer, property), preserveAlpha);
      changedColors += 1;
    }
  }

  assert.equal(changedColors, 135, "Bright color-property coverage drifted; review the palette transform");
  assert.deepEqual(night.sources, bright.sources, "Sources must remain byte-equivalent as JSON values");
  assert.equal(night.sprite, bright.sprite, "Sprite URL must remain unchanged");
  assert.equal(night.glyphs, bright.glyphs, "Glyph URL must remain unchanged");
  assert.deepEqual(night.layers.map(withoutColorPaint), bright.layers.map(withoutColorPaint), "Only paint color properties may change");
  assert.deepEqual(night.layers.map((layer) => layer.id), bright.layers.map((layer) => layer.id), "Layer IDs and order must remain unchanged");
  return { night, changedColors };
}

const bright = await loadBright();
const { night, changedColors } = makeNight(bright);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(night, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
console.log(`Preserved ${night.layers.length} layers, ${expectedSymbolCount} symbols, sources, sprite, glyphs, layouts, filters, and zoom bounds; recolored ${changedColors} paint properties.`);
