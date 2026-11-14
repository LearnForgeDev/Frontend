import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { getSourceError } from './validate-source.mjs';

test('the physical source limit counts blank and comment lines at the exact boundary', () => {
  for (const path of ['src/value.ts', 'src/View.tsx', 'src/value.mts', 'src/value.cts', 'scripts/check.mjs', 'style.css', 'tests/Seed.cs', 'Dockerfile', '.husky/pre-commit', '.github/workflows/test.yml']) {
    assert.equal(getSourceError(path, '\n'.repeat(400)), null, path);
    assert.match(getSourceError(path, '\n'.repeat(401)), /401 physical lines/, path);
    assert.equal(getSourceError(path, '// value\r\n'.repeat(400)), null, path);
    assert.match(getSourceError(path, '// value\r\n'.repeat(401)), /401 physical lines/, path);
  }
  assert.equal(getSourceError('src/value.ts', 'value\n'.repeat(399) + 'value'), null);
  assert.equal(getSourceError('package-lock.json', '\n'.repeat(500)), null);
  assert.equal(getSourceError('next-env.d.ts', '\n'.repeat(500)), null);
  assert.match(getSourceError('src/feature.types.ts', 'export type Value = string;'), /singular .type.ts/);
  assert.equal(getSourceError('src/feature.type.ts', 'export type Value = string;'), null);
});

test('the global source gate checks existing and untracked source without a baseline', () => {
  const root = mkdtempSync(join(tmpdir(), 'learnforge-source-'));
  const script = fileURLToPath(new URL('./validate-source.mjs', import.meta.url));
  const check = () => spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  try {
    execFileSync('git', ['init'], { cwd: root, stdio: 'pipe' });
    mkdirSync(join(root, 'src'));
    writeFileSync(join(root, 'src', 'existing.ts'), '\n'.repeat(401));
    execFileSync('git', ['add', '.'], { cwd: root });
    assert.equal(check().status, 1);
    writeFileSync(join(root, 'src', 'existing.ts'), '\n'.repeat(400));
    assert.equal(check().status, 0);
    writeFileSync(join(root, 'src', 'untracked.ts'), '\n'.repeat(401));
    assert.equal(check().status, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
