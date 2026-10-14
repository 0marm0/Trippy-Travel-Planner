import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { usableTripPhoto, preferredActivityPhoto } from "../src/lib/trip-photo.ts";

test("photo references reject redaction placeholders and unsafe references", () => {
  for (const value of ["", undefined, "https://host.test/[redacted].jpg", "https://host.test/%5Bredacted%5D.jpg", "data:image/png;base64,test", "http://host.test/photo.jpg", "https://user:password@example.test/photo.jpg", "/guide-images/../private.webp"]) assert.equal(usableTripPhoto(value), false);
  assert.equal(usableTripPhoto("/guide-images/a147060c263ada7a.webp"), true);
  assert.equal(usableTripPhoto("https://hotel.test/photo.jpg"), true);
});

test("exact activity-associated bundled images take priority over provider overrides", () => {
  assert.equal(preferredActivityPhoto("/guide-images/a147060c263ada7a.webp", "https://hotel.test/photo.jpg"), "/guide-images/a147060c263ada7a.webp");
  assert.equal(preferredActivityPhoto("", "https://hotel.test/[redacted].jpg"), "");
});

test("every bundled image chosen from the public activity catalogue exists", async () => {
  const raw = JSON.parse(await readFile(new URL("../examples/trips/2026-europe-sample.json", import.meta.url), "utf8"));
  const overrides = { ...raw.ci, ...raw.li };
  const activities = [...raw.oi, ...raw.si, ...raw.$r.activities];
  let bundled = 0;
  for (const activity of activities) {
    const image = preferredActivityPhoto(activity.image, overrides[activity.id]?.image);
    if (image.startsWith("/")) { await access(new URL(`../public${image}`, import.meta.url)); bundled++; }
  }
  assert.ok(bundled >= 146);
});

test("approved hotel derivatives resolve only exact recorded sources and exist", async () => {
  const { cachedHotelPhoto, hotelPhotoCacheCoverage } = await import("../src/lib/hotel-photo-cache.generated.ts");
  const { hotelProviderMediaFor } = await import("../src/lib/hotel-provider-media.generated.ts");
  const raw = JSON.parse(await readFile(new URL("../examples/trips/2026-europe-sample.json", import.meta.url), "utf8"));
  const cached = new Set();
  for (const hotel of raw.yi) {
    for (const photo of hotelProviderMediaFor(hotel.name)?.photos || []) {
      const resolved = cachedHotelPhoto(photo.src);
      if (resolved !== photo.src) {
        assert.equal(usableTripPhoto(resolved), true);
        await access(new URL(`../public${resolved}`, import.meta.url));
        cached.add(resolved);
      }
    }
  }
  assert.equal(cached.size, hotelPhotoCacheCoverage.cached);
  assert.equal(cachedHotelPhoto("https://unrecorded.test/photo.jpg"), "https://unrecorded.test/photo.jpg");
});
