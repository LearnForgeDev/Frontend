import type { Chunk } from './build-policy.test.type';
import { afterEach, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const directories: string[] = [];

async function fixture({ entry = 'const value = data?.name;', chunks, omit }: { entry?: string; chunks?: Chunk[]; omit?: string } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'next-build-policy-'));
  directories.push(directory);
  const files: Record<string, string> = {
    'BUILD_ID': 'build-id',
    'build-manifest.json': JSON.stringify({ pages: { '/_app': ['static/chunks/pages/_app.js'], '/[[...path]]': ['static/chunks/pages/route.js'] } }),
    'server/pages-manifest.json': JSON.stringify({ '/_app': 'pages/_app.js', '/[[...path]]': 'pages/route.js' }),
    'client-stats.json': JSON.stringify({ chunks: chunks ?? [{ initial: true, files: ['static/chunks/pages/_app.js'], modules: [{ name: './src/pages/_app.tsx' }] }] }),
    'static/chunks/pages/_app.js': entry,
    'static/chunks/pages/route.js': 'export const route = 1;',
    'server/pages/_app.js': 'module.exports = {};',
    'server/pages/route.js': 'module.exports = {};',
    'standalone/server.js': 'require("next");',
  };
  for (const [file, content] of Object.entries(files)) {
    if (file === omit) {
      continue;
    }
    await mkdir(dirname(join(directory, file)), { recursive: true });
    await writeFile(join(directory, file), content);
  }
  return execute(process.execPath, [resolve('scripts/check-build.mjs'), directory]);
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});
it('accepts valid Next server output and its modern client syntax', async () => {
  await expect(fixture()).resolves.toHaveProperty('stdout');
});
it('keeps the 200000-byte application entry budget', async () => {
  await expect(fixture({ entry: ' '.repeat(200_001) })).rejects.toThrow('Application entry exceeds');
});
it.each(['BUILD_ID', 'client-stats.json', 'standalone/server.js', 'server/pages/route.js', 'static/chunks/pages/route.js'])('rejects missing build output %s', async omit => {
  await expect(fixture({ omit })).rejects.toThrow();
});
it('rejects client syntax outside the configured browser baseline', async () => {
  await expect(fixture({ entry: 'using value = acquire();' })).rejects.toThrow('Unsupported client JavaScript');
});
it.each(['@lexical/react', 'lexical', '@fullcalendar/core', '@jitsi/sdk', 'desmos', 'katex'])('keeps %s out of initial JavaScript', async name => {
  await expect(fixture({ chunks: [{ initial: true, files: ['static/chunks/pages/_app.js'], modules: [{ name: 'concatenated', modules: [{ name: `./node_modules/${name}/index.js` }] }] }] })).rejects.toThrow('Heavy module entered initial JavaScript');
  await expect(fixture({ chunks: [{ initial: true, files: ['static/chunks/pages/_app.js'], modules: [{ name: './src/pages/_app.tsx' }] }, { initial: false, files: ['static/chunks/editor.js'], modules: [{ name: `./node_modules/${name}/index.js` }] }] })).resolves.toHaveProperty('stdout');
});
it('does not confuse global math CSS with eager math JavaScript', async () => {
  await expect(fixture({ chunks: [{ initial: true, files: ['static/chunks/pages/_app.js'], modules: [{ name: './node_modules/katex/dist/katex.css' }] }] })).resolves.toHaveProperty('stdout');
});
