#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const input = resolve(process.argv[2] || ".private/2026-trip.json");
const output = resolve(process.argv[3] || "examples/trips/2026-europe-sample.json");
const source = JSON.parse(await readFile(input, "utf8"));

const privatePatterns = [
  /https?:\/\/mail\.google\.com\/[^\s"']*/gi,
  /mailto:[^\s"']+/gi,
  /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,
  /\b(?:Booking\.com\s*)?\d{9,}\b/gi,
  /\b(?:(?:confirmation|reservation)\s+(?:number|code)|booking reference|record locator)\s*[:#-]?\s*[A-Z0-9-]{5,}\b/gi,
  /\bseat\s+\d{1,2}[A-Z]\b/gi,
];

function redactString(value) {
  return privatePatterns.reduce((text, pattern) => text.replace(pattern, "[redacted]"), value).replace(/\s+([,;.])/g, "$1");
}

function sanitize(value) {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/(confirmation|booking.?ref|record.?locator|loyalty|frequent.?flyer|personal.?email|seat.?assignment)/i.test(key))
    .map(([key, item]) => [key, sanitize(item)]));
}

const sample = sanitize(source);
sample.$a = (source.$a || []).map((booking) => ({
  kind: booking.kind,
  date: booking.date,
  title: redactString(booking.title),
  detail: redactString(booking.detail),
  status: ["confirmed", "tbc", "missing", "conflict"].includes(booking.status) ? booking.status : "tbc",
  ref: booking.status === "confirmed" || booking.status === "conflict"
    ? "Reviewed status · private reference removed"
    : "Planning item · no private reference",
  href: /^https?:\/\/(?!mail\.google\.com)/i.test(booking.href || "") ? booking.href : "",
}));

await writeFile(output, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
console.log(`Wrote redacted public sample: ${output}`);
