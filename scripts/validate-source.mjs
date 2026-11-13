import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function isSourcePath(path) {
  return /\.(?:[cm]?[jt]sx?|css|s[ac]ss|cs|sh|py|ya?ml|html|vue|svelte|astro)$/.test(path)
    || /(?:^|\/)(?:Dockerfile(?:\.[^/]+)?|Makefile)$/.test(path)
    || /^\.(?:husky|githooks)\/[^/]+$/.test(path);
}

export function getSourceError(path, content) {
  if (!isSourcePath(path) || path === 'next-env.d.ts') {
    return null;
  }
  const lines = content ? content.split(/\r\n|\r|\n/).length - Number(/[\r\n]$/.test(content)) : 0;
  if (lines > 400) {
    return `${lines} physical lines exceed the 400-line source limit.`;
  }
  if (/\.types\.[cm]?tsx?$/.test(path)) {
    return 'Use the singular .type.ts suffix for type sidecars.';
  }
  return null;
}

function run() {
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
  const errors = [];
  for (const path of new Set(paths)) {
    if (!isSourcePath(path)) {
      continue;
    }
    let content;
    try {
      content = readFileSync(path, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
    const error = getSourceError(path, content);
    if (error) {
      errors.push(`${JSON.stringify(path)}: ${error}`);
    }
  }
  if (errors.length) {
    console.error(`Source check failed:\n${errors.map(error => `  ${error}`).join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log('Source check passed for all tracked and unignored source files.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run();
  } catch (error) {
    console.error(`Source check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
