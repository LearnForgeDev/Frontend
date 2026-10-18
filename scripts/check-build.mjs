import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { parse } from 'acorn';

const MAX_ENTRY_BYTES = 200_000;
const DEFERRED_MODULES = /(?:vendor-(?:lexical|katex|fullcalendar|desmos|jitsi)|TextEditor|@lexical|@fullcalendar|@jitsi|(?:^|[/_-])(?:lexical|katex|desmos)(?:[/_.-]|$))/i;
const outputDirectory = resolve(process.argv[2] ?? 'dist');
const manifest = JSON.parse(await readFile(resolve(outputDirectory, '.vite/manifest.json'), 'utf8'));
const entries = Object.values(manifest).filter((chunk) => chunk.isEntry);
if (!entries.length) throw new Error('В сборке отсутствует основной чанк');

for (const entry of entries) {
  const content = await readFile(resolve(outputDirectory, entry.file));
  console.log(`${entry.file}: ${content.length} байт, gzip: ${gzipSync(content).length} байт`);
  if (content.length > MAX_ENTRY_BYTES) {
    throw new Error(`Основной чанк превышает лимит ${MAX_ENTRY_BYTES} байт`);
  }
  const visited = new Set();
  let initialSize = 0;
  let initialGzipSize = 0;
  async function checkInitialChunk(chunk, key) {
    if (!chunk || typeof chunk.file !== 'string') {
      throw new Error(`В манифесте отсутствует статическая зависимость: ${key}`);
    }
    if (visited.has(chunk.file)) return;
    visited.add(chunk.file);
    if ([key, chunk.file, chunk.name, chunk.src].some((value) => typeof value === 'string' && DEFERRED_MODULES.test(value))) {
      throw new Error(`Тяжёлый модуль попал в начальную загрузку: ${chunk.file}`);
    }
    if (chunk.imports !== undefined && (!Array.isArray(chunk.imports) || chunk.imports.some((dependency) => typeof dependency !== 'string'))) {
      throw new Error(`Некорректные статические зависимости: ${chunk.file}`);
    }
    const source = await readFile(resolve(outputDirectory, chunk.file));
    initialSize += source.length;
    initialGzipSize += gzipSync(source).length;
    for (const dependency of chunk.imports ?? []) await checkInitialChunk(manifest[dependency], dependency);
  }
  await checkInitialChunk(entry, entry.file);
  console.log(`Начальный JavaScript со статическими зависимостями: ${initialSize} байт, gzip: ${initialGzipSize} байт`);
}

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await checkDirectory(path);
    else if (entry.name.endsWith('.js')) {
      const source = await readFile(path, 'utf8');
      const tree = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
      const replacements = [];
      function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'ImportExpression') replacements.push([node.start, node.start + 'import'.length, '__load']);
        if (node.type === 'MetaProperty' && node.meta.name === 'import') replacements.push([node.start, node.end, 'import_meta']);
        for (const value of Object.values(node)) {
          if (Array.isArray(value)) value.forEach(visit);
          else if (value && typeof value === 'object') visit(value);
        }
      }
      visit(tree);
      let normalized = source;
      for (const [start, end, replacement] of replacements.sort((a, b) => b[0] - a[0])) {
        normalized = normalized.slice(0, start) + replacement + normalized.slice(end);
      }
      try {
        parse(normalized, { ecmaVersion: 2015, sourceType: 'module' });
      } catch (error) {
        throw new Error(`Синтаксис новее ES2015 в ${path}: ${error.message}`);
      }
    }
  }
}
await checkDirectory(outputDirectory);
console.log('Проверены все JS-чанки: ES2015 с модульной загрузкой Vite');
