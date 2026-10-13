#!/usr/bin/env node
// Extract only referenced image bytes from an authorized, inert local HTML file.
// No titles, alt text, booking records, source filename, or HTML are exported.
import { readFile, mkdir, writeFile, lstat } from "node:fs/promises";
import { resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { sha256, imagePrivacyFacts, mediaReferences, inventoryDigest, containedPath } from "./media-tools.mjs";

export async function restoreGuideMedia(root, html, { pixelsReviewed = false } = {}) {
  if (!pixelsReviewed) throw new Error("Review source photos before creating public derivatives");
  const sample = await readFile(resolve(root, "examples/trips/2026-europe-sample.json"), "utf8");
  const wanted = new Set([...sample.matchAll(/\/guide-images\/([a-f0-9]{16})\.webp/g)].map((match) => match[1]));
  const candidates = new Map();
  for (const match of html.matchAll(/data:image\/webp;base64,([a-z0-9+/=\s]+)/gi)) {
    const original = Buffer.from(match[1].replace(/\s/g, ""), "base64");
    const id = sha256(original).slice(0, 16);
    if (!wanted.has(id) || candidates.has(id)) continue;
    const bytes = await sharp(original, { limitInputPixels: 40_000_000 }).rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    if ((await imagePrivacyFacts(bytes, ".webp")).metadata) throw new Error("Metadata remains after conversion");
    candidates.set(id, bytes);
  }
  const manifestPath = resolve(root, "public/media-manifest.json");
  await containedPath(root, "public");
  if ((await lstat(resolve(root, "public"))).isSymbolicLink()) throw new Error("Public directory cannot be a symlink");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!Array.isArray(manifest.localAssets)) throw new Error("Missing media manifest");
  const permission = manifest.ownerAttestation;
  if (permission?.rightsStatus !== "owner-attested" || permission?.scope !== "existing-trip-photo-set"
    || permission?.inventorySha256 !== inventoryDigest(await mediaReferences(root))) throw new Error("Matching photo-set owner permission is required");
  const directory = resolve(root, "public/guide-images");
  await mkdir(directory, { recursive: true });
  if ((await lstat(directory)).isSymbolicLink() || relative(resolve(root, "public"), directory).split(sep).includes("..")) throw new Error("Unsafe destination");
  const records = [];
  for (const [id, bytes] of candidates) {
    const path = `public/guide-images/${id}.webp`;
    const target = resolve(root, path);
    try { await lstat(target); throw new Error("Existing derivative requires separate review"); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    records.push({ path, sha256: sha256(bytes), credit: "Existing trip photo collection; owner holds photo licenses", sourceUrl: "repository:docs/MEDIA.md", license: "Owner-attested licensed image; license receipts and per-photo attribution mapping deferred", rightsStatus: "approved", rightsEvidence: `owner-attested-${permission.attestedAt}`, privacyStatus: "approved", privacyReview: "Contact-sheet pixel review and metadata stripping", reviewedAt: permission.attestedAt });
  }
  for (const [id, bytes] of candidates) await writeFile(resolve(directory, `${id}.webp`), bytes, { flag: "wx" });
  const replaced = new Set(records.map((record) => record.path));
  manifest.localAssets = [...manifest.localAssets.filter((record) => !replaced.has(record.path)), ...records];
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { restored: candidates.size, unresolved: wanted.size - candidates.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[3] !== "--pixels-reviewed") throw new Error("Pixel review acknowledgement required");
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const result = await restoreGuideMedia(root, await readFile(resolve(process.argv[2]), "utf8"), { pixelsReviewed: true });
    console.log(JSON.stringify(result));
  } catch {
    console.error("NOT_READY: guide restoration needs an explicitly authorized local source, completed pixel review, and new derivative paths. Private content is never logged.");
    process.exitCode = 1;
  }
}
