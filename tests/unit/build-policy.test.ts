import { afterEach, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const directories: string[] = [];
const BYTE_LIMIT = 200_000;
const DEFERRED_CHUNK_NAMES = ['vendor-lexical', 'vendor-katex', 'TextEditor', 'vendor-fullcalendar', 'vendor-desmos', 'vendor-jitsi'];
type ManifestChunk = { file: string; isEntry?: boolean; imports?: string[]; dynamicImports?: string[] };
type FixtureOptions = { manifest?: Record<string, ManifestChunk>; files?: Record<string, string> };

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function fixture(main: string, lazy = 'export const value = 1;', options: FixtureOptions = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'frontend-build-policy-'));
  directories.push(directory);
  await mkdir(join(directory, '.vite'));
  await writeFile(join(directory, '.vite/manifest.json'), JSON.stringify(options.manifest ?? {
    'src/main.tsx': { file: 'main.js', isEntry: true, dynamicImports: ['lazy.js'] },
    'lazy.js': { file: 'lazy.js' },
  }));
  await writeFile(join(directory, 'main.js'), main);
  await writeFile(join(directory, 'lazy.js'), lazy);
  await Promise.all(Object.entries(options.files ?? {}).map(([name, source]) => writeFile(join(directory, name), source)));
  return execute(process.execPath, [resolve('scripts/check-build.mjs'), directory]);
}

it('разрешает ES2015 и динамическую загрузку Vite', async () => {
  await expect(fixture('const load = () => import("./lazy.js");')).resolves.toHaveProperty('stdout');
});

it('отклоняет чанк больше 200 000 байт', async () => {
  await expect(fixture(' '.repeat(BYTE_LIMIT + 1))).rejects.toThrow();
});

it('отклоняет новый синтаксис в ленивом чанке', async () => {
  await expect(fixture('export const value = 1;', 'export const value = data?.name;')).rejects.toThrow();
});

it('отклоняет async-функции в основном чанке', async () => {
  await expect(fixture('export async function load() {}')).rejects.toThrow();
});

it.each(DEFERRED_CHUNK_NAMES)('отклоняет тяжёлый модуль %s в статическом графе', async (name) => {
  const heavyFile = `${name}-test.js`;
  await expect(fixture('import "./runtime.js";', undefined, {
    manifest: {
      'src/main.tsx': { file: 'main.js', isEntry: true, imports: ['runtime'] },
      runtime: { file: 'runtime.js', imports: ['heavy'] },
      heavy: { file: heavyFile },
    },
    files: { 'runtime.js': `import "./${heavyFile}";`, [heavyFile]: 'export const value = 1;' },
  })).rejects.toThrow('Тяжёлый модуль попал в начальную загрузку');
});

it.each(DEFERRED_CHUNK_NAMES)('разрешает ленивую загрузку тяжёлого модуля %s', async (name) => {
  const heavyFile = `${name}-test.js`;
  await expect(fixture(`const load = () => import("./${heavyFile}");`, undefined, {
    manifest: {
      'src/main.tsx': { file: 'main.js', isEntry: true, dynamicImports: ['heavy'] },
      heavy: { file: heavyFile },
    },
    files: { [heavyFile]: 'export const value = 1;' },
  })).resolves.toHaveProperty('stdout');
});

it('отклоняет неизвестную статическую зависимость', async () => {
  await expect(fixture('import "./missing.js";', undefined, {
    manifest: { 'src/main.tsx': { file: 'main.js', isEntry: true, imports: ['missing'] } },
  })).rejects.toThrow('В манифесте отсутствует статическая зависимость');
});

it('считает размер общих статических зависимостей один раз и сообщает gzip', async () => {
  const main = 'import "./runtime.js";';
  const runtime = 'export const value = 1;';
  const result = await fixture(main, undefined, {
    manifest: {
      'src/main.tsx': { file: 'main.js', isEntry: true, imports: ['runtime', 'runtime'] },
      runtime: { file: 'runtime.js', imports: ['src/main.tsx'] },
    },
    files: { 'runtime.js': runtime },
  });
  expect(result.stdout).toContain(`Начальный JavaScript со статическими зависимостями: ${Buffer.byteLength(main + runtime)} байт, gzip:`);
});

it('изолирует React runtime от обёрток редактора и стилей', async () => {
  const modulePaths = [
    '/app/node_modules/react/index.js',
    '/app/node_modules/.pnpm/react-dom@19/node_modules/react-dom/client.js',
    '/app/node_modules/scheduler/index.js',
    '/app/node_modules/@lexical/react/LexicalComposer.js',
    '/app/node_modules/.pnpm/@lexical+react@0.39/node_modules/@lexical/react/LexicalComposer.js',
    '/app/node_modules/@emotion/react/index.js',
    '/app/node_modules/prismjs/prism.js',
    '/app/node_modules/prismjs/components/prism-javascript.js',
    '/app/node_modules/.pnpm/prismjs@1.30.0/node_modules/prismjs/prism.js',
  ];
  const result = await execute(process.execPath, ['--input-type=module', '-e', `
    const { loadConfigFromFile } = await import('vite');
    const { config } = await loadConfigFromFile({ command: 'build', mode: 'production' });
    const classify = config.build.rollupOptions.output.manualChunks;
    console.log(JSON.stringify(${JSON.stringify(modulePaths)}.map((id) => classify(id))));
  `]);
  expect(JSON.parse(result.stdout.trim())).toEqual([
    'vendor-react', 'vendor-react', 'vendor-react', 'vendor-lexical', 'vendor-lexical', 'vendor-styles',
    'vendor-lexical', 'vendor-lexical', 'vendor-lexical',
  ]);
});
