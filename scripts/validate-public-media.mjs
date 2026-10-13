#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateMedia } from "./media-tools.mjs";

try {
  const root = resolve(process.argv[2] || ".");
  const manifest = JSON.parse(await readFile(resolve(root, "public/media-manifest.json"), "utf8"));
  const { failures, counts, ownerAttestedPhotos } = await validateMedia(root, manifest);
  console.log(JSON.stringify({ status: failures.length ? "NOT_READY" : "PASS", ...counts, ownerAttestedPhotos, findings: failures.length }));
  if (ownerAttestedPhotos) console.log("NOTE: owner attests licenses acquired for this exact photo set; license receipts and per-photo attribution mapping are deferred.");
  // No image URLs, original paths, metadata values, or pixel contents in logs.
  [...new Set(failures)].slice(0, 12).forEach((failure) => console.log(`- ${failure}`));
  process.exitCode = failures.length ? 1 : 0;
} catch {
  console.error("NOT_READY: media inventory/manifest could not be safely validated.");
  process.exitCode = 1;
}
