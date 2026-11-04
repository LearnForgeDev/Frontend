import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { getDocumentationErrors, getFeatureDocument } from './validate-docs.mjs';

test('documentation coverage checks the staged snapshot, local links and line limit', () => {
  assert.equal(getFeatureDocument('src/Services/Auth/hooks/useAuth.ts'), 'docs/features/auth-session.md');
  assert.equal(getFeatureDocument('src/Endpoints/Auth/auth.ts'), 'docs/features/auth-session.md');
  assert.equal(getFeatureDocument('src/Services/Schools/FilesPage/FilesPage.tsx'), 'docs/features/files.md');
  assert.equal(getFeatureDocument('src/Services/Homework/hooks/useHomework.ts'), 'docs/features/homework.md');
  assert.equal(getFeatureDocument('src/Services/APIKeys/hooks/useAPIKeys.ts'), 'docs/features/api-keys.md');
  assert.equal(getFeatureDocument('src/Endpoints/factory/factory.ts'), 'ARCHITECTURE.md');
  assert.equal(getFeatureDocument('src/Services/Auth/hooks/useAuth.test.tsx'), null);
  assert.equal(getFeatureDocument('src/Services/Auth/AuthPage.styles.ts'), null);
  const doc = 'docs/features/auth-session.md';
  const code = 'src/Services/Auth/hooks/useAuth.ts';
  const text = '# Auth\n\nCurrent user behavior.\n\n## User `identity`\n\n[Same](#user-identity)\n[Guide][guide]\n\n[guide]: ../guide.md#overview\n\n```text\n[Ignored](missing.md)\n# Hidden\n```\n';
  const documents = new Map([[doc, text], ['docs/guide.md', '# Overview\n\nGuide.\n']]);
  const paths = [...documents.keys(), code];
  const validate = overrides => getDocumentationErrors({ documents, paths, changed: [doc, code], ...overrides });
  assert.deepEqual(validate(), []);
  assert.match(validate({ changed: [code] }).join('\n'), /stage a knowledge update/);
  assert.match(validate({ documents: new Map([['docs/guide.md', '# Guide\n']]) }).join('\n'), /missing feature documentation/);
  assert.match(validate({ documents: new Map([[doc, '# Auth\n\n[Gone](missing.md)\n']]) }).join('\n'), /broken local link/);
  assert.match(validate({ documents: new Map([[doc, '# Auth\n\n[Gone](#hidden)\n```\n# Hidden\n```\n']]) }).join('\n'), /missing heading/);
  assert.match(validate({ documents: new Map([[doc, '# Auth\n\n[Gone][missing]\n']]) }).join('\n'), /undefined link reference/);
  assert.deepEqual(validate({ documents: new Map([[doc, '# Auth\n' + 'Text\n'.repeat(298)]]) }), []);
  assert.match(validate({ documents: new Map([[doc, '# Auth\n' + 'Text\n'.repeat(299)]]) }).join('\n'), /300 lines/);

  const directory = mkdtempSync(join(tmpdir(), 'learnforge-docs-'));
  const script = fileURLToPath(new URL('./validate-docs.mjs', import.meta.url));
  const git = (...args) => execFileSync('git', args, { cwd: directory, stdio: 'pipe' });
  const write = (path, value) => {
    mkdirSync(dirname(join(directory, path)), { recursive: true });
    writeFileSync(join(directory, path), value);
  };
  const check = () => spawnSync(process.execPath, [script], { cwd: directory, encoding: 'utf8' });
  try {
    git('init');
    git('config', 'user.name', 'Documentation check');
    git('config', 'user.email', 'docs@example.invalid');
    git('config', 'core.hooksPath', '/dev/null');
    write(code, 'export {};\n');
    git('add', code);
    write(doc, '# Auth\n\nCurrent user.\n');
    assert.equal(check().status, 1, 'an unstaged feature document cannot provide coverage');
    git('add', doc);
    assert.equal(check().status, 0);
    git('commit', '-m', 'Documented feature');
    write(code, 'export const changed = true;\n');
    git('add', code);
    write(doc, '# Auth\n\nUpdated current user.\n');
    const rejected = check();
    assert.equal(rejected.status, 1, 'a knowledge update must be staged with the implementation');
    assert.match(rejected.stderr, /docs\/features\/auth-session\.md: stage a knowledge update/);
    git('add', doc);
    assert.equal(check().status, 0);
    write('docs/guide.md', '# Guide\n\n[Auth](features/auth-session.md)\n');
    git('add', 'docs/guide.md');
    git('rm', doc, '-f');
    assert.equal(check().status, 1, 'deleting a still-required document fails coverage and links');
    git('rm', code, '-f');
    git('rm', 'docs/guide.md', '-f');
    assert.equal(check().status, 0, 'removing a complete feature and its docs is valid');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
