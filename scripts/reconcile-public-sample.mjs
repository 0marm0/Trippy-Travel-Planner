#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { applyAuthoritative2026Corrections } from "../src/lib/authoritative-trip-corrections.ts";

const samplePath = resolve("examples/trips/2026-europe-sample.json");
const source = JSON.parse(await readFile(samplePath, "utf8"));
const corrected = applyAuthoritative2026Corrections(source);
await writeFile(samplePath, `${JSON.stringify(corrected, null, 2)}\n`, "utf8");
console.log("Reconciled public 2026 sample from reviewed, non-sensitive status facts.");
