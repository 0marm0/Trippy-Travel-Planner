#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";
import { parse } from "acorn";

const [bundleArgument, outputArgument = ".private/2026-trip.json"] = process.argv.slice(2);
if (!bundleArgument) {
  console.error("Usage: node scripts/extract-current-trip.mjs <downloaded-page-bundle.js> [output.json]");
  process.exit(1);
}

const bundlePath = resolve(bundleArgument);
const outputPath = resolve(outputArgument);
const source = readFileSync(bundlePath, "utf8");
const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
const declarations = new Map();

function walk(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "VariableDeclarator" && node.id?.type === "Identifier" && node.init) {
    declarations.set(node.id.name, source.slice(node.init.start, node.init.end));
  }
  if (node.type === "FunctionDeclaration" && node.id?.name) {
    declarations.set(node.id.name, source.slice(node.start, node.end));
  }
  for (const [key, value] of Object.entries(node)) {
    if (["start", "end", "loc"].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object" && typeof value.type === "string") walk(value);
  }
}
walk(ast);

const context = vm.createContext({ JSON });
function define(name) {
  const expression = declarations.get(name);
  if (!expression) throw new Error(`The live bundle no longer exposes ${name}; update the extractor before importing.`);
  const code = expression.startsWith("function ") ? `${expression};this.${name}=${name}` : `this.${name}=(${expression})`;
  vm.runInContext(code, context, { timeout: 5000 });
}

for (const name of ["R", "z", "q", "J", "X", "W", "hi", "gi", "G", "K", "$r", "ti", "oi", "si", "ci", "li", "Li", "fi", "U", "_i", "yi", "bi", "Si", "Ci", "Pi", "Fi", "Ii", "Hi", "ra", "Sa", "Ta", "Oa", "Aa", "$a"]) define(name);

const keys = ["$r", "ti", "oi", "si", "ci", "li", "Li", "fi", "U", "_i", "yi", "bi", "Si", "Ci", "Pi", "Fi", "Ii", "Hi", "ra", "Sa", "Ta", "Oa", "Aa", "$a"];
const output = Object.fromEntries(keys.map((key) => [key, context[key]]));
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Imported 2026 trip data to ${outputPath}`);
console.log(`${output.$r.activities.length + output.oi.length + output.si.length} activities · ${output.yi.length} hotels`);
