import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MIN_CHANGED_LINE_COVERAGE = 80;

export function getChangedLineCoverage({ lcov, patch, root = process.cwd() }) {
  const records = new Map();
  let file;
  for (const line of lcov.split(/\r?\n/)) {
    if (line.startsWith('SF:')) {
      const source = line.slice(3);
      file = (isAbsolute(source) ? relative(root, source) : source).replaceAll('\\', '/').replace(/^\.\//, '');
      records.set(file, new Map());
    } else if (line.startsWith('DA:') && records.has(file)) {
      const [number, hits] = line.slice(3).split(',').map(Number);
      records.get(file).set(number, hits);
    }
  }
  let number = 0;
  let covered = 0;
  let total = 0;
  const missing = new Set();
  for (const line of patch.split('\n')) {
    if (line.startsWith('+++ ')) {
      const source = line.slice(4);
      file = (source.startsWith('"') ? JSON.parse(source) : source).replace(/^b\//, '');
    } else if (line.startsWith('@@')) {
      number = Number(line.match(/\+(\d+)/)[1]);
    } else if (line.startsWith('+')) {
      const eligible = /^src\/.*\.(?:[cm]?[jt]s|[jt]sx)$/.test(file)
        && !/\.test\.(?:[cm]?[jt]s|[jt]sx)$/.test(file)
        && !file.endsWith('.type.ts') && !/\.(?:styles|d)\.ts$/.test(file)
        && !file.startsWith('src/Assets/Art/');
      if (eligible) {
        if (!records.has(file)) {
          missing.add(file);
        }
        else if (records.get(file).has(number)) {
          total++;
          if (records.get(file).get(number) > 0) {
            covered++;
          }
        }
      }
      number++;
    } else if (line.startsWith(' ')) {
      number++;
    }
  }
  return { covered, total, percent: total ? covered / total * 100 : null, missing: [...missing] };
}

function run() {
  const [option, ref, ...extra] = process.argv.slice(2);
  if (option !== '--base' || !ref || extra.length) {
    throw new Error('Usage: npm run validate:coverage -- --base REF');
  }
  const base = execFileSync('git', ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`], { encoding: 'utf8' }).trim();
  const patch = execFileSync('git', ['-c', 'core.quotePath=false', 'diff', '--no-ext-diff', '--no-renames', '--unified=0', base, 'HEAD', '--', 'src'], { encoding: 'utf8' });
  const result = getChangedLineCoverage({ lcov: readFileSync('coverage/lcov.info', 'utf8'), patch });
  const summary = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8')).total;
  const report = [
    `Global coverage: ${['lines', 'statements', 'functions', 'branches'].map(key => `${key} ${summary[key].pct}%`).join(', ')}.`,
    result.total ? `Changed-line coverage: ${result.covered}/${result.total} (${result.percent.toFixed(2)}%); required ${MIN_CHANGED_LINE_COVERAGE}%.` : 'Changed-line coverage: no added instrumented application lines to score.',
    ...result.missing.map(path => `${path}: absent from the coverage report.`),
  ].join('\n');
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Test coverage\n\n${report}\n`);
  }
  if (result.missing.length || (result.percent !== null && result.percent < MIN_CHANGED_LINE_COVERAGE)) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run();
  } catch (error) {
    console.error(`Test coverage failed: ${error.message}`);
    process.exitCode = 1;
  }
}
