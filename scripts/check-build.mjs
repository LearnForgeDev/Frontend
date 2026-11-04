import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { parse } from 'acorn';

const MAX_ENTRY_BYTES = 200_000;
const CLIENT_ECMA_VERSION = 2022;
const DEFERRED_MODULES = /(?:node_modules\/(?:@lexical|lexical|@fullcalendar|@jitsi|desmos|katex)\/|Services\/Lessons\/components\/TextEditor)/i;
const outputDirectory = resolve(process.argv[2] ?? '.next');
const json = async path => JSON.parse(await readFile(resolve(outputDirectory, path), 'utf8'));
const buildId = (await readFile(resolve(outputDirectory, 'BUILD_ID'), 'utf8')).trim();
if (!buildId) throw new Error('The Next.js build ID is missing.');
const manifest = await json('build-manifest.json');
const pages = await json('server/pages-manifest.json');
const stats = await json('client-stats.json');
for (const route of ['/_app', '/[[...path]]']) {
  if (!pages[route] || !Array.isArray(manifest.pages?.[route]) || !manifest.pages[route].length) {
    throw new Error(`Missing server/client route output: ${route}`);
  }
  await stat(resolve(outputDirectory, 'server', pages[route]));
}
await stat(resolve(outputDirectory, 'standalone/server.js'));
if (!Array.isArray(stats.chunks) || !stats.chunks.length) throw new Error('Client compiler chunk data is missing.');

function checkModules(modules) {
  for (const module of modules ?? []) {
    const name = module.nameForCondition ?? module.name ?? module.identifier ?? '';
    if (!/\.css(?:[?!]|$)/.test(name) && DEFERRED_MODULES.test(name.replaceAll('\\', '/'))) {
      throw new Error(`Heavy module entered initial JavaScript: ${name}`);
    }
    if (module.filteredModules > 0) throw new Error(`Incomplete module data: ${name}`);
    checkModules(module.modules ?? module.children);
  }
}
if (!stats.chunks.some(chunk => chunk.initial && chunk.files?.some(file => file.endsWith('.js')))) throw new Error('Initial client chunk data is missing.');
for (const chunk of stats.chunks) {
  if (!chunk.initial || !chunk.files?.some(file => file.endsWith('.js'))) continue;
  if (chunk.filteredModules > 0 || !Array.isArray(chunk.modules)) throw new Error('Initial chunk module data is incomplete.');
  checkModules(chunk.modules);
}
const initial = [...new Set(['/_app', '/[[...path]]'].flatMap(route => manifest.pages[route]))].filter(file => file.endsWith('.js'));
let initialSize = 0;
let initialGzipSize = 0;
for (const file of initial) {
  const content = await readFile(resolve(outputDirectory, file));
  initialSize += content.length;
  initialGzipSize += gzipSync(content).length;
  if (file.includes('/pages/') && content.length > MAX_ENTRY_BYTES) throw new Error(`Application entry exceeds ${MAX_ENTRY_BYTES} bytes: ${file}`);
}
console.log(`Initial JavaScript: ${initialSize} bytes; gzip: ${initialGzipSize} bytes.`);
async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await checkDirectory(path);
    else if (entry.name.endsWith('.js')) {
      try { parse(await readFile(path, 'utf8'), { ecmaVersion: CLIENT_ECMA_VERSION, sourceType: 'module' }); }
      catch (error) { throw new Error(`Unsupported client JavaScript in ${path}: ${error.message}`); }
    }
  }
}
await checkDirectory(resolve(outputDirectory, 'static'));
console.log('Next.js server output, application entry budgets, lazy modules and modern client syntax passed.');
