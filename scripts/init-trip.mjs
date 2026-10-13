#!/usr/bin/env node
import { mkdir, writeFile, lstat, realpath } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { createNormalizedTrip, validateNormalizedTrip } from '../src/lib/normalized-trip.ts';
const args = {};
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  if (!['--name', '--start', '--end', '--cities', '--origins', '--adults', '--pace', '--flex-days', '--themes', '--output'].includes(key) || !process.argv[index + 1]) {
    console.error('Usage: npm run trip:init -- --name "My trip" --start YYYY-MM-DD --end YYYY-MM-DD --cities "City A,City B" --origins "AAA,BBB" [--adults 2] [--pace balanced] [--flex-days 0] [--themes "food,art"] [--output .private/trips/my-trip/trip.json]');
    process.exit(1);
  }
  args[key.slice(2)] = process.argv[index + 1];
}
if (!['name', 'start', 'end', 'cities', 'origins'].every((key) => args[key])) {
  console.error('NOT_READY: supply --name, --start, --end, --cities and --origins');
  process.exit(1);
}
const list = (value) => (value || '').split(',').map((item) => item.trim()).filter(Boolean);
const trip = createNormalizedTrip({ name: args.name, start: args.start, end: args.end, cities: list(args.cities), origins: list(args.origins), adults: Number(args.adults || 2), pace: args.pace || 'balanced', flexDays: Number(args['flex-days'] || 0), themes: list(args.themes) });
const errors = validateNormalizedTrip(trip);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const output = resolve(args.output || `.private/trips/${trip.id}/trip.json`);
const child = relative(resolve('.private/trips'), output);
if (!child || child === '..' || child.startsWith('../') || isAbsolute(child) || !output.endsWith('.json')) {
  console.error('NOT_READY: trip:init writes only JSON beneath .private/trips');
  process.exit(1);
}
// Reject symlinks in every existing component before mkdir can follow one.
async function checkParents() {
  const parts = relative(resolve('.'), dirname(output)).split('/');
  let cursor = resolve('.');
  for (const part of parts) {
    cursor = resolve(cursor, part);
    try { if ((await lstat(cursor)).isSymbolicLink()) throw new Error('symlink'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
try {
  await checkParents();
  await mkdir(dirname(output), { recursive: true });
  await checkParents();
  const actualParent = await realpath(dirname(output));
  const actualRoot = await realpath(resolve('.private/trips'));
  const actualChild = relative(actualRoot, actualParent);
  if (actualChild === '..' || actualChild.startsWith('../') || isAbsolute(actualChild)) throw new Error('outside');
} catch { console.error('NOT_READY: private output directories must not contain symlinks'); process.exit(1); }
try { await writeFile(output, JSON.stringify(trip, null, 2) + '\n', { flag: 'wx' }); }
catch { console.error('NOT_READY: destination exists or cannot be written; no file overwritten'); process.exit(1); }
console.log(`Created private-local normalized draft: ${output}`);
