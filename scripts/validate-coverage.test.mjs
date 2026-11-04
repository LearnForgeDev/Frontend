import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { getChangedLineCoverage, MIN_CHANGED_LINE_COVERAGE } from './validate-coverage.mjs';

test('changed coverage scores executable additions and fails missing reports', () => {
  const lcov = 'SF:src/rules.ts\nDA:1,1\nDA:2,0\nDA:4,1\nend_of_record\n';
  const patch = '+++ b/src/rules.ts\n@@ -0,0 +1,4 @@\n+covered\n+missed\n+type only\n+covered\n';
  assert.deepEqual(getChangedLineCoverage({ lcov, patch }), { covered: 2, total: 3, percent: 2 / 3 * 100, missing: [] });
  assert.deepEqual(getChangedLineCoverage({ lcov, patch: patch.replace('rules.ts', 'missing.ts') }).missing, ['src/missing.ts']);
  for (const path of ['src/rules.test.ts', 'src/rules.types.ts', 'src/rules.styles.ts', 'src/env.d.ts', 'src/Assets/Art/image.ts']) {
    assert.deepEqual(getChangedLineCoverage({ lcov, patch: patch.replace('src/rules.ts', path) }), { covered: 0, total: 0, percent: null, missing: [] });
  }
  assert.equal(getChangedLineCoverage({ lcov, patch: '+++ /dev/null\n@@ -1 +0,0 @@\n-deleted\n' }).total, 0);
  assert.equal(getChangedLineCoverage({ lcov: lcov.replace('src/rules.ts', '/repo/src/rules.ts'), patch, root: '/repo' }).covered, 2);

  const directory = mkdtempSync(join(tmpdir(), 'learnforge-coverage-'));
  const script = fileURLToPath(new URL('./validate-coverage.mjs', import.meta.url));
  const git = (...args) => execFileSync('git', args, { cwd: directory, stdio: 'pipe' });
  const check = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: directory, encoding: 'utf8', env: { ...process.env, GITHUB_STEP_SUMMARY: join(directory, 'summary.md') } });
  try {
    git('init');
    git('config', 'user.name', 'Coverage check');
    git('config', 'user.email', 'coverage@example.invalid');
    git('config', 'core.hooksPath', '/dev/null');
    git('commit', '--allow-empty', '-m', 'Base');
    const base = git('rev-parse', 'HEAD').toString().trim();
    mkdirSync(join(directory, 'src'));
    writeFileSync(join(directory, 'src/rules.ts'), 'one\ntwo\nthree\nfour\nfive\n');
    git('add', 'src');
    git('commit', '-m', 'Rules');
    assert.equal(check('--base', base).status, 1, 'missing coverage files fail');
    mkdirSync(join(directory, 'coverage'));
    writeFileSync(join(directory, 'coverage/coverage-summary.json'), JSON.stringify({ total: Object.fromEntries(['lines', 'statements', 'functions', 'branches'].map(key => [key, { pct: 80 }])) }));
    const report = hits => writeFileSync(join(directory, 'coverage/lcov.info'), `SF:src/rules.ts\n${hits.map((hit, index) => `DA:${index + 1},${hit}`).join('\n')}\nend_of_record\n`);
    report([1, 1, 1, 1, 0]);
    assert.equal(MIN_CHANGED_LINE_COVERAGE, 80);
    const passed = check('--base', base);
    assert.equal(passed.status, 0, passed.stderr);
    assert.match(passed.stdout, /4\/5 \(80.00%\)/);
    report([1, 1, 1, 0, 0]);
    assert.equal(check('--base', base).status, 1, 'coverage below the limit fails');
    writeFileSync(join(directory, 'coverage/lcov.info'), '');
    assert.equal(check('--base', base).status, 1, 'unreported changed source fails');
    assert.equal(check('--base', 'HEAD').status, 0, 'no changed application lines is explicit');
    assert.equal(check('--unknown').status, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
