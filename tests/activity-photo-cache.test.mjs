import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { cachedActivityPhoto, activityPhotoCacheCoverage } from "../src/lib/activity-photo-cache.generated.ts";
import { mediaReferences, inventoryDigest, sha256, imagePrivacyFacts, safeSourceUrl } from "../scripts/media-tools.mjs";

test("activity derivatives retain exact approved source inventory and metadata-free provenance", async () => {
  const root = new URL("..", import.meta.url).pathname;
  const manifest = JSON.parse(await readFile(new URL("../public/media-manifest.json", import.meta.url), "utf8"));
  const refs = await mediaReferences(root);
  const digest = inventoryDigest(refs);
  assert.equal(digest, manifest.ownerAttestation.inventorySha256);
  const assets = manifest.localAssets.filter((asset) => asset.path.startsWith("public/media/activity-"));
  assert.equal(assets.length, activityPhotoCacheCoverage.cached);
  for (const asset of assets) {
    assert.ok(refs.includes(asset.sourceUrl));
    assert.ok(safeSourceUrl(asset.sourceUrl));
    assert.equal(asset.rightsStatus, "approved");
    assert.equal(asset.privacyStatus, "approved");
    assert.equal(asset.originalInventorySha256, digest);
    assert.equal(cachedActivityPhoto(asset.sourceUrl), asset.path.replace(/^public/, ""));
    const bytes = await readFile(new URL(`../${asset.path}`, import.meta.url));
    assert.equal(sha256(bytes), asset.sha256);
    assert.deepEqual(await imagePrivacyFacts(bytes, ".webp"), { metadata: false, sensitive: false });
  }
  assert.equal(cachedActivityPhoto("https://unrecorded.test/photo.jpg"), "https://unrecorded.test/photo.jpg");
  assert.equal(cachedActivityPhoto("/media/nurburgring-aerial.webp"), "/media/nurburgring-aerial.webp");
});
