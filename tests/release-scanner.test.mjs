import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, copyFile, writeFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "trippy-history-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "scripts"));
  await copyFile(resolve("scripts/scan-git-history.sh"), join(root, "scripts/scan-git-history.sh"));
  const git = (args) => {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0); return result;
  };
  git(["init", "--quiet"]); git(["config", "user.name", "Fixture"]); git(["config", "user.email", "fixture@example.test"]);
  return { root, git, scan: () => spawnSync("sh", ["scripts/scan-git-history.sh"], { cwd: root, encoding: "utf8" }) };
}

test("history scanner inspects staged bytes instead of a subsequently cleaned worktree", async (t) => {
  const { root, git, scan } = await fixture(t);
  const syntheticCredential = "sk-" + "x".repeat(25);
  await writeFile(join(root, "candidate.txt"), syntheticCredential); git(["add", "candidate.txt"]);
  await writeFile(join(root, "candidate.txt"), "sanitized working copy");
  const result = scan();
  assert.equal(result.status, 1); assert.match(result.stdout, /staged files/);
  assert.equal(result.stdout.includes(syntheticCredential), false);
});

test("history scanner catches sensitive-shaped commit messages without printing values", async (t) => {
  const { root, git, scan } = await fixture(t);
  await writeFile(join(root, "candidate.txt"), "safe fixture"); git(["add", "candidate.txt"]);
  const syntheticCredential = "sk-" + "z".repeat(25);
  git(["commit", "--quiet", "-m", `fixture ${syntheticCredential}`]);
  const result = scan();
  assert.equal(result.status, 1); assert.match(result.stdout, /commit message content/);
  assert.equal(result.stdout.includes(syntheticCredential), false);
});
