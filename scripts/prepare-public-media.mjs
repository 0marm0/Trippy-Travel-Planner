#!/usr/bin/env node
import { readFile, writeFile, mkdir, realpath, lstat } from "node:fs/promises";
import { resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { containedPath, imagePrivacyFacts, reviewedRecord, sha256 } from "./media-tools.mjs";

export async function prepareMedia(root, plan) {
  if (plan?.version !== 1 || !Array.isArray(plan.assets) || !plan.assets.length) throw new Error("A nonempty reviewed plan is required");
  const privateRoot = resolve(root, ".private/media");
  const outputs = new Set();
  const prepared = [];
  for (const asset of plan.assets) {
    if (!reviewedRecord(asset) || !/^public\/media\/[a-z0-9][a-z0-9-]*\.webp$/.test(asset.output || "") || outputs.has(asset.output)) throw new Error("Asset lacks public approval or a safe unique output name");
    outputs.add(asset.output);
    try { await lstat(resolve(root, asset.output)); throw new Error("Public output already exists"); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    const source = await containedPath(privateRoot, asset.source);
    const bytes = await sharp(source, { limitInputPixels: 40_000_000, animated: false })
      .rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer();
    if ((await imagePrivacyFacts(bytes, ".webp")).metadata) throw new Error("Prepared image retained metadata");
    prepared.push({ output: asset.output, bytes, record: {
      path: asset.output, sha256: sha256(bytes), credit: asset.credit, sourceUrl: asset.sourceUrl,
      license: asset.license, rightsStatus: asset.rightsStatus, privacyStatus: asset.privacyStatus,
      reviewedAt: asset.reviewedAt,
    } });
  }
  // Validate and transform the entire batch before publishing any derivative.
  const manifestPath = resolve(root, "public/media-manifest.json");
  await containedPath(root, "public");
  if ((await lstat(resolve(root, "public"))).isSymbolicLink()) throw new Error("Public directory cannot be a symlink");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.version !== 1 || !Array.isArray(manifest.localAssets) || !Array.isArray(manifest.remoteAssets)) throw new Error("Unsupported media manifest");
  const targetRoot = resolve(root, "public/media");
  await mkdir(targetRoot, { recursive: true });
  if (relative(await realpath(resolve(root, "public")), await realpath(targetRoot)).split(sep).includes("..")) throw new Error("Output symlink leaves public directory");
  for (const { output, bytes } of prepared) {
    const full = resolve(root, output);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, bytes, { flag: "wx" });
  }
  manifest.localAssets = [...manifest.localAssets.filter((asset) => !outputs.has(asset.path)), ...prepared.map(({ record }) => record)];
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return prepared.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(".");
    const planPath = await containedPath(resolve(root, ".private"), process.argv[2] || "media-plan.json");
    const count = await prepareMedia(root, JSON.parse(await readFile(planPath, "utf8")));
    console.log(`Prepared ${count} reviewed, metadata-free public image(s).`);
  } catch {
    console.error("NOT_READY: media preparation requires a reviewed private plan, safe original paths, and new public outputs. No private values are logged.");
    process.exitCode = 1;
  }
}
