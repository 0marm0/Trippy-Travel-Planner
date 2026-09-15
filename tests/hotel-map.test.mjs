import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { reviewedActivityCoordinates } from "../src/lib/activity-map-coordinates.ts";
import { canonicalCityKey } from "../src/lib/city-key.ts";

const centers = {
  amsterdam: [52.3676, 4.9041],
  berlin: [52.52, 13.405],
  munich: [48.1351, 11.582],
};

test("hotel-map activity anchors are public, finite, and city-local", () => {
  for (const [id, coordinate] of Object.entries(reviewedActivityCoordinates)) {
    assert.match(id, /^guide-/);
    assert.ok(Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng));
    assert.match(coordinate.source, /^https:\/\/www\.openstreetmap\.org\/(?:node|way|relation)\/\d+$/);
    const center = centers[coordinate.city];
    assert.ok(center, `recognized route city for ${id}`);
    assert.ok(Math.abs(coordinate.lat - center[0]) < 0.35, `${id} latitude remains near ${coordinate.city}`);
    assert.ok(Math.abs(coordinate.lng - center[1]) < 0.45, `${id} longitude remains near ${coordinate.city}`);
  }
});

test("Amsterdam, Berlin, and Munich each have deterministic Must, Should, and Could pins", async () => {
  const sample = JSON.parse(await readFile(new URL("../examples/trips/2026-europe-sample.json", import.meta.url), "utf8"));
  for (const city of Object.keys(centers)) {
    const tiers = new Set(sample.$r.activities
      .filter((activity) => canonicalCityKey(activity.city) === city && reviewedActivityCoordinates[activity.id])
      .map((activity) => /must/i.test(activity.priority) ? "must" : /worth|should/i.test(activity.priority) ? "should" : "could"));
    assert.deepEqual([...tiers].sort(), ["could", "must", "should"], `${city} has every toggle tier`);
  }
});

test("canonical city keys repair known aliases without changing route keys", () => {
  assert.equal(canonicalCityKey("München"), "munich");
  assert.equal(canonicalCityKey("Nürburgring"), "ring");
  assert.equal(canonicalCityKey("Amsterdam"), "amsterdam");
});

test("custom markers preserve MapLibre's absolute transformed root", async () => {
  const css = await readFile(new URL("../src/components/geographic-map.css", import.meta.url), "utf8");
  const markerRule = css.match(/\.vector-map \.trippy-map-marker\s*\{([^}]+)\}/)?.[1] || "";
  assert.match(markerRule, /position:\s*absolute/);
  assert.match(markerRule, /top:\s*0/);
  assert.match(markerRule, /left:\s*0/);
  assert.doesNotMatch(markerRule, /transform\s*:/, "MapLibre exclusively owns the marker-root transform");
});
