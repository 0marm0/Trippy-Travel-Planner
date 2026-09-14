import { copyFile, readFile, writeFile } from "node:fs/promises";

const path = new URL("../public/ne-110m-countries.geojson", import.meta.url);
const data = JSON.parse(await readFile(path, "utf8"));

function signedArea(ring) {
  let area = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    area += ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
  }
  return area / 2;
}

function rewindPolygon(polygon) {
  return polygon.map((ring, index) => {
    const shouldBeCounterClockwise = index === 0;
    const isCounterClockwise = signedArea(ring) > 0;
    return shouldBeCounterClockwise === isCounterClockwise ? ring : [...ring].reverse();
  });
}

for (const feature of data.features) {
  const geometry = feature.geometry;
  if (!geometry) continue;
  if (geometry.type === "Polygon") geometry.coordinates = rewindPolygon(geometry.coordinates);
  if (geometry.type === "MultiPolygon") geometry.coordinates = geometry.coordinates.map(rewindPolygon);
}

delete data.crs;
await writeFile(path, `${JSON.stringify(data)}\n`);
await copyFile(new URL("../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url), new URL("../public/maplibre-gl-worker.mjs", import.meta.url));
await copyFile(new URL("../node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs", import.meta.url), new URL("../public/maplibre-gl-shared.mjs", import.meta.url));
console.log(`Prepared ${data.features.length} Natural Earth country features for MapLibre.`);
