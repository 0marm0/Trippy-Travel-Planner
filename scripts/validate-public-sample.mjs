#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(process.argv[2] || "examples/trips/2026-europe-sample.json");
const sample = JSON.parse(await readFile(path, "utf8"));
const failures = [];
const activityCount = [sample?.$r?.activities, sample?.oi, sample?.si].reduce((total, items) => total + (Array.isArray(items) ? items.length : 0), 0);

if (!Array.isArray(sample?.$r?.activities) || sample.$r.activities.length === 0) failures.push("activity catalogue is missing");
if (!Array.isArray(sample?.yi) || sample.yi.length === 0) failures.push("hotel catalogue is missing");
if (!Array.isArray(sample?.$a)) failures.push("booking summary is missing");
if (!sample?._i || typeof sample._i !== "object") failures.push("transport alternatives are missing");

const forbiddenKey = /(confirmation|booking.?ref|record.?locator|loyalty|frequent.?flyer|personal.?email|seat.?assignment)/i;
const forbiddenValue = /mail\.google\.com|mailto:|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b(?:(?:confirmation|reservation)\s+(?:number|code)|booking reference|record locator)\s*[:#-]?\s*[A-Z0-9-]{5,}\b|\bseat\s+\d{1,2}[A-Z]\b/i;

function inspect(value, trail = "root") {
  if (typeof value === "string") {
    if (forbiddenValue.test(value)) failures.push(`${trail} contains private-looking text`);
    return;
  }
  if (Array.isArray(value)) return value.forEach((item, index) => inspect(item, `${trail}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (forbiddenKey.test(key)) failures.push(`${trail}.${key} is a forbidden private field`);
    inspect(item, `${trail}.${key}`);
  }
}

inspect(sample);
if (failures.length) {
  console.error("NOT_READY: public sample validation failed");
  failures.slice(0, 25).forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`PASS: public sample validated (${activityCount} activities, ${sample.yi.length} hotels, ${sample.$a.length} redacted booking summaries).`);
