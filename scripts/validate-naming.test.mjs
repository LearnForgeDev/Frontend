import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { getNamingError } from './validate-naming.mjs';

test('naming rules reject misplaced roles and the staged CLI protects new paths', () => {
  const valid = [
    'src/Services/Auth/AuthPage.tsx',
    'src/Services/Auth/components/LoginForm/LoginForm.tsx',
    'src/Services/Auth/components/LoginForm/LoginForm.types.ts',
    'src/Services/Auth/components/LoginForm/LoginForm.test.tsx',
    'src/Services/Auth/components/LoginForm/index.ts',
    'src/Services/Auth/hooks/useAuth.ts',
    'src/Services/Auth/hooks/useAuth.const.ts',
    'src/Services/Auth/hooks/useAuth.test.tsx',
    'src/Services/Auth/hooks/index.ts',
    'src/Services/Auth/validation/auth.validation.ts',
    'src/Endpoints/Auth/auth.ts',
    'src/Endpoints/Auth/auth.types.ts',
    'src/Endpoints/Auth/auth.test.ts',
    'src/Storage/Auth/auth.slice.ts',
    'src/Storage/Auth/auth.selectors.ts',
    'src/Storage/Auth/auth.slice.test.ts',
    'src/Storage/URL/url.slice.ts',
    'src/Storage/APIAuth/apiAuth.selectors.ts',
    'src/Assets/Components/Button/Button.tsx',
    'src/Assets/Hooks/useModal.ts',
    'src/Services/Auth/index.ts',
    'src/vite-env.d.ts',
    'src/Services/Auth/AuthPage.styles.ts',
    'src/Services/Auth/AuthPage.css',
    'tests/e2e/auth-session.spec.ts',
    'tests/e2e/auth-session.utils.ts',
    'tests/unit/auth-session.test.ts',
    'docs/features/auth-session.md',
    'docs/features/README.md',
    'scripts/validate-naming.mjs',
    'scripts/validate-naming.test.mjs',
  ];
  const invalid = [
    'src/services/Auth/AuthPage.tsx',
    'src/Services/auth/AuthPage.tsx',
    'src/Services/Auth/Components/LoginForm/LoginForm.tsx',
    'src/Services/Auth/components/LoginForm/OtherForm.tsx',
    'src/Services/Auth/components/loginForm/loginForm.tsx',
    'src/Services/Auth/components/LoginForm/types.ts',
    'src/Services/Auth/components/LoginForm/LoginForm.types.tsx',
    'src/Services/Auth/components/bad_name/index.ts',
    'src/Services/Auth/components/LoginForm/hooks/useFields.ts',
    'src/Services/Auth/components/LoginForm/hooks/useFields/useFields.ts',
    'src/Assets/Components/Button/hooks/useFields.ts',
    'src/Services/Auth/components/bad_name/hooks/useFields/useFields.ts',
    'src/Services/Auth/Components/LoginForm/hooks/useFields/useFields.ts',
    'src/Services/Auth/LoginForm.tsx',
    'src/Services/Auth/hooks/useAuth/useAuth.ts',
    'src/Services/Auth/hooks/useAuth/index.ts',
    'src/Services/Auth/hooks/useAuth/other.ts',
    'src/Services/Auth/hooks/bad_name/index.ts',
    'src/Services/Auth/hooks/useAuth/useAuth.tsx',
    'src/Services/Auth/hooks/useAuth.tsx',
    'src/Assets/Hooks/useModal/useModal.ts',
    'src/Assets/hooks/useModal.ts',
    'src/Assets/components/Button/Button.tsx',
    'src/Services/Auth/Hooks/useAuth/useAuth.ts',
    'src/Endpoints/Auth/Auth.endpoints.ts',
    'src/Endpoints/auth/auth.ts',
    'src/Endpoints/auth/auth.types.ts',
    'src/Endpoints/Auth/Auth.ts',
    'src/Endpoints/auth/auth.endpoints.ts',
    'src/Endpoints/auth/auth.endpoints.test.ts',
    'src/Services/Auth/auth.endpoints.ts',
    'src/Endpoints/auth/login.endpoints.ts',
    'src/Storage/Auth/user.slice.ts',
    'src/Storage/auth/auth.slice.ts',
    'src/Services/Auth/bad name.validation.ts',
    'src/Services/Auth/auth.Validation.ts',
    'src/Services/Auth/AuthPage.TSX',
    'tests/e2e/authSession.spec.ts',
    'tests/e2e/nested/auth.spec.ts',
    'tests/unit/authSession.test.ts',
    'docs/features/authSession.md',
    'docs/features/nested/auth.md',
    'scripts/validateNaming.mjs',
  ];
  for (const path of valid) assert.equal(getNamingError(path), null, path);
  for (const path of invalid) assert.equal(typeof getNamingError(path), 'string', path);

  const directory = mkdtempSync(join(tmpdir(), 'learnforge-naming-'));
  const script = fileURLToPath(new URL('./validate-naming.mjs', import.meta.url));
  const git = (...args) => execFileSync('git', args, { cwd: directory, stdio: 'pipe' });
  const write = path => {
    mkdirSync(dirname(join(directory, path)), { recursive: true });
    writeFileSync(join(directory, path), 'export {};\n');
  };
  const check = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: directory, encoding: 'utf8' });
  try {
    git('init');
    git('config', 'user.name', 'Naming check');
    git('config', 'user.email', 'naming@example.invalid');
    git('config', 'core.hooksPath', '/dev/null');
    write('src/Services/Auth/old_name.ts');
    git('add', '.');
    git('commit', '-m', 'Legacy path');
    const base = git('rev-parse', 'HEAD').toString().trim();
    assert.equal(check('--all').status, 1, 'audit mode includes legacy paths');
    writeFileSync(join(directory, 'src/Services/Auth/old_name.ts'), 'export const existing = 1;\n');
    git('add', '.');
    write('src/Services/Auth/unstaged_bad.ts');
    assert.equal(check().status, 0, 'existing modified and unstaged paths are not migrations');
    write('src/Services/Auth/AuthPage.tsx');
    git('add', 'src/Services/Auth/AuthPage.tsx');
    assert.equal(check('--staged').status, 0, 'a new canonical page passes');
    write('src/Services/Auth/hooks/useAuth/useAuth.ts');
    git('add', 'src/Services/Auth/hooks/useAuth/useAuth.ts');
    const rejected = check();
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /src\/Services\/Auth\/hooks\/useAuth\/useAuth\.ts/);
    assert.match(rejected.stderr, /hooks\/use<Purpose>\.ts/);
    git('rm', '--cached', 'src/Services/Auth/hooks/useAuth/useAuth.ts');
    git('mv', 'src/Services/Auth/old_name.ts', 'src/Services/Auth/new_bad_name.ts');
    assert.equal(check().status, 1, 'rename detection cannot grandfather a bad new name');
    git('mv', 'src/Services/Auth/new_bad_name.ts', 'src/Services/Auth/auth.validation.ts');
    assert.equal(check().status, 0, 'a valid migration passes');
    git('commit', '-m', 'Canonical paths');
    assert.equal(check('--base', base).status, 0, 'CI checks committed migrations');
    write('src/Services/Auth/hooks/useAuth/useAuth.ts');
    git('add', 'src/Services/Auth/hooks/useAuth/useAuth.ts');
    assert.equal(check('--base', base).status, 0, 'CI ignores the index');
    git('commit', '-m', 'Invalid committed hook');
    assert.equal(check('--base', base).status, 1, 'a clean index cannot hide a committed violation');
    assert.equal(check('--base', 'missing-ref').status, 1);
    write('docs/features/bad name\tfile.md');
    git('add', 'docs/features/bad name\tfile.md');
    assert.equal(check().status, 1, 'NUL-separated git paths preserve whitespace');
    assert.equal(check('--unknown').status, 1, 'invalid options fail closed');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
