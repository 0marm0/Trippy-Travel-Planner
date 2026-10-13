import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { checkBuildBoundary, sensitivePathCategory } from "../scripts/check-build-boundary.mjs";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "trippy-build-boundary-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, ".next/server/app"), { recursive: true });
  await writeFile(join(root, "safe.js"), "safe fixture");
  const trace = join(root, ".next/server/app/page.js.nft.json");
  const setFiles = (paths) => writeFile(trace, JSON.stringify({ version: 1, files: paths.map((path) => relative(join(root, ".next/server/app"), path)) }));
  await setFiles([join(root, "safe.js")]);
  return { root, trace, setFiles };
}

test("clean traces and sample configuration pass without reading target contents", async (t) => {
  const { root, setFiles } = await fixture(t);
  await writeFile(join(root, ".env.example"), "TOKEN=placeholder");
  await setFiles([join(root, "safe.js"), join(root, ".env.example")]);
  const result = await checkBuildBoundary(root);
  assert.equal(result.status, "PASS"); assert.equal(result.manifests, 1); assert.equal(result.tracedFiles, 2);
});

test("traces of private data, environment and raw imports fail without revealing target paths", async (t) => {
  const { root, setFiles } = await fixture(t);
  const paths = [".private/do-not-log-this-trip.json", ".env.local", "raw-mail.eml"];
  for (const path of paths) { await mkdir(join(root, path, ".."), { recursive: true }); await writeFile(join(root, path), "NEVER_READ_THIS_VALUE"); }
  await setFiles(paths.map((path) => join(root, path)));
  const result = await checkBuildBoundary(root);
  assert.equal(result.status, "NOT_READY");
  assert.deepEqual(new Set(result.findings.map((finding) => finding.category)), new Set(["private-data-root", "environment-file", "raw-personal-file"]));
  assert.doesNotMatch(JSON.stringify(result), /do-not-log-this-trip|NEVER_READ_THIS_VALUE|raw-mail\.eml/);
});

test("traced files through a safe-looking symlink into private data fail", async (t) => {
  const { root, setFiles } = await fixture(t);
  await mkdir(join(root, ".private"));
  await writeFile(join(root, ".private/source.json"), "NEVER_READ_THIS_VALUE");
  await symlink(join(root, ".private/source.json"), join(root, "public-looking.json"));
  await setFiles([join(root, "public-looking.json")]);
  const result = await checkBuildBoundary(root);
  assert.equal(result.status, "NOT_READY");
  assert.ok(result.findings.some((finding) => finding.category === "symlink-into-private-root"));
  assert.doesNotMatch(JSON.stringify(result), /source\.json|NEVER_READ_THIS_VALUE/);
});

test("copied deployment artifacts reject raw personal files even without a trace", async (t) => {
  const { root } = await fixture(t);
  await mkdir(join(root, ".vercel/output/functions"), { recursive: true });
  await writeFile(join(root, ".vercel/output/functions/private-mail.mbox"), "NEVER_READ_THIS_VALUE");
  const result = await checkBuildBoundary(root);
  assert.equal(result.status, "NOT_READY");
  assert.ok(result.findings.some((finding) => finding.category === "raw-personal-file"));
  assert.doesNotMatch(JSON.stringify(result), /private-mail\.mbox|NEVER_READ_THIS_VALUE/);
});

test("packaged private folders are rejected before inspecting or reporting their children", async (t) => {
  const { root } = await fixture(t);
  await mkdir(join(root, ".next/standalone/.private/personal-name"), { recursive: true });
  await writeFile(join(root, ".next/standalone/.private/personal-name/token.json"), "NEVER_READ_THIS_VALUE");
  const result = await checkBuildBoundary(root);
  assert.equal(result.status, "NOT_READY");
  assert.ok(result.findings.some((finding) => finding.trace === ".next/standalone" && finding.category === "private-data-root"));
  assert.doesNotMatch(JSON.stringify(result), /personal-name|token\.json|NEVER_READ_THIS_VALUE/);
});

test("missing build fails closed and sensitive filenames are categorized", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "trippy-missing-build-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  assert.equal((await checkBuildBoundary(root)).status, "NOT_READY");
  for (const path of ["data/private/trip.json", "data/imports/raw.json", "bookings/record.json", "emails/message.json", "calendar-private/event.json"]) assert.equal(sensitivePathCategory(path), "private-data-root");
  assert.equal(sensitivePathCategory(".mcp.json"), "local-connector-configuration");
  assert.equal(sensitivePathCategory("node_modules/dotenv/lib/main.js"), null);
});
