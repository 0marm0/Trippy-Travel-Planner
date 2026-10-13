#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { validateNormalizedTrip } from '../src/lib/normalized-trip.ts';
const files = process.argv.slice(2);
if (!files.length) files.push('examples/trips/sample-city-break.json');
let failed = false;
for (const file of files) {
  try {
    const errors = validateNormalizedTrip(JSON.parse(await readFile(file, 'utf8')));
    if (errors.length) {
      failed = true;
      console.error(`NOT_READY: ${file}`);
      errors.forEach((error) => console.error(`- ${error}`));
    } else console.log(`PASS: ${file}`);
  } catch {
    failed = true;
    console.error(`NOT_READY: ${file}: unreadable or invalid JSON`);
  }
}
process.exitCode = failed ? 1 : 0;
