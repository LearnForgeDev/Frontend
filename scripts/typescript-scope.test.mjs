import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';

test('compiler projects include hand-written ESM and CommonJS TypeScript modules', () => {
  const root = mkdtempSync(join(tmpdir(), 'learnforge-typescript-scope-'));
  try {
    for (const name of ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'tsconfig.tests.json']) {
      writeFileSync(join(root, name), readFileSync(new URL(`../${name}`, import.meta.url)));
    }
    for (const directory of ['src', 'tests']) {
      mkdirSync(join(root, directory));
    }
    const cases = [
      ['tsconfig.json', 'src/example.mts'],
      ['tsconfig.json', 'src/example.cts'],
      ['tsconfig.node.json', 'example.config.mts'],
      ['tsconfig.node.json', 'example.config.cts'],
      ['tsconfig.tests.json', 'tests/example.mts'],
      ['tsconfig.tests.json', 'tests/example.cts'],
      ['tsconfig.tests.json', 'src/example.type.ts'],
    ];
    for (const [, path] of cases) {
      writeFileSync(join(root, path), 'export {};\n');
    }
    for (const [config, path] of cases) {
      const filename = join(root, config);
      const loaded = ts.readConfigFile(filename, ts.sys.readFile);
      assert.equal(loaded.error, undefined, config);
      const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, root, {}, filename);
      assert.ok(parsed.fileNames.includes(join(root, path)), `${config}: ${path}`);
      assert.equal(parsed.options.strict, true, config);
      assert.equal(parsed.options.noImplicitReturns, true, config);
      assert.equal(parsed.options.noImplicitOverride, true, config);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
