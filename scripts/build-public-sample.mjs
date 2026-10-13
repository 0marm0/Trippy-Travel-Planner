#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { redactSampleString, sanitizePublicSample } from "./public-sample-redaction.mjs";

const input = resolve(process.argv[2] || ".private/2026-trip.json");
const output = resolve(process.argv[3] || "examples/trips/2026-europe-sample.json");
const source = JSON.parse(await readFile(input, "utf8"));

const redactString = redactSampleString;

const sample = sanitizePublicSample(source);
sample.$a = (source.$a || []).map((booking) => ({
  kind: booking.kind,
  date: booking.date,
  title: redactString(booking.title),
  detail: redactString(booking.detail),
  status: ["confirmed", "tbc", "missing", "conflict"].includes(booking.status) ? booking.status : "tbc",
  ref: booking.status === "confirmed" || booking.status === "conflict"
    ? "Reviewed status · private reference removed"
    : "Planning item · no private reference",
  // A booking link can encode a private reference even without a query string.
  href: "",
}));

await writeFile(output, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
console.log(`Wrote redacted public sample: ${output}`);
