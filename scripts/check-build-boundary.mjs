#!/usr/bin/env node
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { resolve, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Classify filenames only. Do not open any traced/private target or reveal its
// path, contents, symlink destination, or filename in diagnostics.
export function sensitivePathCategory(path) {
  const normalized = path.replaceAll("\\", "/");
  const segments = normalized.split("/");
  const name = segments.at(-1);
  if (segments.includes(".private") || /(?:^|\/)(?:data\/(?:private|imports)|bookings|emails|calendar-private)(?:\/|$)/i.test(normalized)) return "private-data-root";
  if (segments.some((segment) => /^\.env(?:\..*)?$/.test(segment) && segment !== ".env.example")) return "environment-file";
  if (/^(?:credentials|token)\.json$|^client_secret.*\.json$|\.(?:pem|key)$/i.test(name || "")) return "credential-file";
  if (/\.(?:eml|mbox|ics)$/i.test(name || "")) return "raw-personal-file";
  if (/(?:^|\/)(?:\.mcp\.json|mcp\.local\.json|\.claude\/settings\.local\.json|\.codex\/config\.local\.toml)$/i.test(normalized)) return "local-connector-configuration";
  if (segments.includes(".playwright-cli")) return "local-private-output";
  return null;
}

export async function checkBuildBoundary(root) {
  root = resolve(root);
  const findings = [];
  let manifests = 0;
  let tracedFiles = 0;
  let artifactEntries = 0;
  const label = (path) => relative(root, path).split(sep).join("/");
  const report = (trace, category) => findings.push({ trace, category });

  async function targetCategory(path) {
    if (/^output(?:\/|$)/.test(relative(root, path).split(sep).join("/"))) return "local-private-output";
    const lexical = sensitivePathCategory(path);
    if (lexical) return lexical;
    try {
      const destination = await realpath(path);
      return sensitivePathCategory(destination) || /^output(?:\/|$)/.test(relative(root, destination).split(sep).join("/")) ? "symlink-into-private-root" : null;
    } catch { return "unresolvable-traced-path"; }
  }

  async function inspectTrace(path) {
    const category = await targetCategory(path);
    const trace = sensitivePathCategory(path) ? ".next" : label(path);
    if (category) { report(trace, category); return; }
    let manifest;
    try { manifest = JSON.parse(await readFile(path, "utf8")); }
    catch { report(trace, "invalid-trace-manifest"); return; }
    manifests++;
    if (!Array.isArray(manifest.files) || !manifest.files.every((file) => typeof file === "string" && file.length > 0 && !file.includes("\0"))) {
      report(trace, "invalid-trace-file-list"); return;
    }
    for (const file of manifest.files) {
      tracedFiles++;
      const category = await targetCategory(resolve(dirname(path), file));
      if (category) report(trace, category);
    }
  }

  async function walk(directory, { artifact = false, artifactLabel = ".next" } = {}) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); }
    catch { report(label(directory), "unreadable-build-directory"); return; }
    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      if (artifact) artifactEntries++;
      const lexicalCategory = sensitivePathCategory(path);
      if (lexicalCategory) { report(artifactLabel, lexicalCategory); continue; }
      if (entry.isSymbolicLink()) {
        const category = await targetCategory(path);
        if (category) report(artifact ? artifactLabel : label(directory), category);
        // An already-packaged directory symlink can hide private descendants.
        // Do not follow it or read its contents; require explicit packaging.
        else if (artifact) {
          try { if ((await lstat(await realpath(path))).isDirectory()) report(artifactLabel, "packaged-directory-symlink"); }
          catch { report(artifactLabel, "unresolvable-packaged-symlink"); }
        }
      } else if (entry.isDirectory()) await walk(path, { artifact, artifactLabel });
      else if (entry.name.endsWith(".nft.json")) await inspectTrace(path);
      else if (artifact) {
        const category = await targetCategory(path);
        if (category) report(artifactLabel, category);
      }
    }
  }

  const next = resolve(root, ".next");
  try {
    if (!(await lstat(next)).isDirectory()) report(".next", "missing-or-symlinked-production-build");
    else await walk(next);
  } catch { report(".next", "missing-production-build"); }
  if (!manifests) report(".next", "no-production-trace-manifests");
  // Scan filenames and symlinks in deploy-ready copies, if those artifacts exist.
  for (const directory of [".next/standalone", ".vercel/output"]) {
    try {
      const path = resolve(root, directory);
      const category = await targetCategory(path);
      if (category && category !== "unresolvable-traced-path") report(directory, category);
      else if ((await lstat(path)).isDirectory()) await walk(path, { artifact: true, artifactLabel: directory });
      else report(directory, "symlinked-deployment-artifact-root");
    } catch (error) {
      if (error.code !== "ENOENT") report(directory, "unreadable-deployment-artifact-root");
      // ENOENT means the optional copied artifact has not been generated.
    }
  }
  return { status: findings.length ? "NOT_READY" : "PASS", manifests, tracedFiles, artifactEntries, findings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await checkBuildBoundary(resolve(process.argv[2] || "."));
    console.log(JSON.stringify({ status: result.status, manifests: result.manifests, tracedFiles: result.tracedFiles, artifactEntries: result.artifactEntries, findings: result.findings.length }));
    // Report the build trace/category only, never the private target value.
    const bounded = [...new Map(result.findings.map((finding) => [`${finding.trace}:${finding.category}`, finding])).values()];
    bounded.slice(0, 20).forEach(({ trace, category }) => console.log(`- ${trace}: ${category}`));
    process.exitCode = result.findings.length ? 1 : 0;
  } catch {
    console.error("NOT_READY: build packaging boundary could not be safely checked.");
    process.exitCode = 1;
  }
}
