import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { prepareMedia } from "../scripts/prepare-public-media.mjs";
import { restoreGuideMedia } from "../scripts/restore-guide-media.mjs";
import { safeSourceUrl, reviewedRecord, validateMedia, inventoryDigest, containedPath, sha256 } from "../scripts/media-tools.mjs";

const review = { credit: "Fixture artwork", sourceUrl: "https://example.com/artwork", license: "CC0 fixture", rightsStatus: "approved", privacyStatus: "approved", reviewedAt: "2026-10-13" };
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "trippy-media-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of [".private/media", "public", "examples/trips", "src/lib"]) await mkdir(join(root, directory), { recursive: true });
  await writeFile(join(root, "public/media-manifest.json"), JSON.stringify({ version: 1, localAssets: [], remoteAssets: [] }));
  await writeFile(join(root, "examples/trips/sample.json"), "{}");
  await writeFile(join(root, "src/lib/hotel-provider-media.generated.ts"), "");
  return root;
}

test("public derivatives strip metadata, retain dimensions, and bind review to exact bytes", async (t) => {
  const root = await fixture(t);
  const input = await sharp({ create: { width: 30, height: 20, channels: 3, background: "#abcdef" } }).withMetadata().png().toBuffer();
  assert.ok((await sharp(input).metadata()).exif);
  await writeFile(join(root, ".private/media/original.png"), input);
  await prepareMedia(root, { version: 1, assets: [{ ...review, source: "original.png", output: "public/media/fixture.webp" }] });
  const image = await sharp(await readFile(join(root, "public/media/fixture.webp"))).metadata();
  assert.equal(image.width, 30); assert.equal(image.height, 20); assert.equal(image.exif, undefined); assert.equal(image.icc, undefined);
  const manifest = JSON.parse(await readFile(join(root, "public/media-manifest.json"), "utf8"));
  assert.doesNotMatch(JSON.stringify(manifest), /original\.png|\.private/);
  assert.deepEqual((await validateMedia(root, manifest)).failures, []);
  await writeFile(join(root, "public/media/fixture.webp"), await sharp(input).webp({ quality: 10 }).toBuffer());
  assert.ok((await validateMedia(root, manifest)).failures.some((finding) => finding.includes("hash")));
});

test("media preparation rejects unreviewed assets, traversal, symlinks and duplicate outputs", async (t) => {
  const root = await fixture(t);
  const bytes = await sharp({ create: { width: 3, height: 3, channels: 3, background: "black" } }).png().toBuffer();
  await writeFile(join(root, ".private/media/fixture.png"), bytes);
  const asset = { ...review, source: "fixture.png", output: "public/media/safe.webp" };
  await assert.rejects(prepareMedia(root, { version: 1, assets: [{ ...asset, privacyStatus: "pending" }] }));
  await assert.rejects(prepareMedia(root, { version: 1, assets: [{ ...asset, output: "public/../secret.webp" }] }));
  await assert.rejects(prepareMedia(root, { version: 1, assets: [asset, asset] }));
  await symlink(join(root, "examples/trips/sample.json"), join(root, ".private/media/outside.json"));
  await assert.rejects(containedPath(join(root, ".private/media"), "outside.json"));
});

test("new references invalidate owner attestation and missing files fail the gate", async (t) => {
  const root = await fixture(t);
  const ref = "https://example.com/licensed-photo.webp";
  await writeFile(join(root, "examples/trips/sample.json"), JSON.stringify({ image: ref }));
  const manifest = { version: 1, localAssets: [], remoteAssets: [], ownerAttestation: { scope: "existing-trip-photo-set", rightsStatus: "owner-attested", attestedAt: "2026-10-13", inventorySha256: inventoryDigest([ref]) } };
  assert.deepEqual((await validateMedia(root, manifest)).failures, []);
  await writeFile(join(root, "examples/trips/sample.json"), JSON.stringify({ image: ref, hero: "/guide-images/missing.webp" }));
  const result = await validateMedia(root, manifest);
  assert.equal(result.counts.missingFiles, 1); assert.equal(result.counts.pendingRights, 1);
});

test("private/authenticated image references and incomplete reviews cannot pass", () => {
  for (const url of ["https://example.com/photo?token=synthetic", "https://person@example.com/photo", "https://mail.google.com/photo", "file:///tmp/photo", "https://example.com/photo#private"]) assert.equal(safeSourceUrl(url), false);
  assert.equal(safeSourceUrl("https://example.com/photo?w=1600&q=80"), true);
  assert.equal(reviewedRecord({ ...review, license: "" }), false);
  assert.equal(reviewedRecord({ ...review, reviewedAt: "invalid" }), false);
});

test("guide migration copies only hash-matched reviewed image bytes and requires matching permission", async (t) => {
  const root = await fixture(t);
  const original = await sharp({ create: { width: 4, height: 3, channels: 3, background: "#123456" } }).webp().toBuffer();
  const ref = `/guide-images/${sha256(original).slice(0, 16)}.webp`;
  await writeFile(join(root, "examples/trips/2026-europe-sample.json"), JSON.stringify({ image: ref }));
  const html = `private fixture text <img alt="Never export this text" src="data:image/webp;base64,${original.toString("base64")}">`;
  await assert.rejects(restoreGuideMedia(root, html));
  await assert.rejects(restoreGuideMedia(root, html, { pixelsReviewed: true }));
  await writeFile(join(root, "public/media-manifest.json"), JSON.stringify({ version: 1, localAssets: [], remoteAssets: [], ownerAttestation: { scope: "existing-trip-photo-set", rightsStatus: "owner-attested", inventorySha256: inventoryDigest([ref]), attestedAt: "2026-10-13" } }));
  assert.deepEqual(await restoreGuideMedia(root, html, { pixelsReviewed: true }), { restored: 1, unresolved: 0 });
  const manifest = await readFile(join(root, "public/media-manifest.json"), "utf8");
  assert.doesNotMatch(manifest, /Never export|private fixture/);
  assert.deepEqual((await validateMedia(root, JSON.parse(manifest))).failures, []);
});
