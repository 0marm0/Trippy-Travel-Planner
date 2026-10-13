import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scanner = resolve('scripts/scan-git-history.sh');
test('history gate accepts exact automation contacts and rejects personal or lookalike contacts', async () => {
  const cases = [
    ['support', 'github.com', true],
    ['noreply', 'github.com', true],
    ['123+automation', 'users.noreply.github.com', true],
    ['invented-traveler', 'github.com', false],
    ['support', 'github.com.example.test.invalid', false],
  ];
  for (const [local, domain, accepted] of cases) {
    const directory = await mkdtemp(join(tmpdir(), 'trippy-history-gate-'));
    const run = (program, args) => spawnSync(program, args, { cwd: directory, encoding: 'utf8' });
    try {
      await mkdir(join(directory, 'scripts'));
      await copyFile(scanner, join(directory, 'scripts/scan-git-history.sh'));
      assert.equal(run('git', ['init', '-q']).status, 0);
      assert.equal(run('git', ['config', 'user.name', 'Synthetic automation']).status, 0);
      const contact = [local, domain].join('@');
      assert.equal(run('git', ['config', 'user.email', contact]).status, 0);
      await writeFile(join(directory, 'fixture.txt'), `Synthetic automation contact: ${contact}\n`);
      assert.equal(run('git', ['add', 'fixture.txt']).status, 0);
      const staged = run('sh', ['scripts/scan-git-history.sh']);
      assert.equal(staged.status === 0, accepted, `staged case ${local} on ${domain}`);
      assert.equal(run('git', ['commit', '-q', '-m', `Synthetic automation contact: ${contact}`]).status, 0);
      const committed = run('sh', ['scripts/scan-git-history.sh']);
      assert.equal(committed.status === 0, accepted, `history case ${local} on ${domain}`);
      if (!accepted) assert.equal(committed.stdout.includes(contact), false, 'failure must not reveal matching contact');
    } finally { await rm(directory, { recursive: true, force: true }); }
  }
});
