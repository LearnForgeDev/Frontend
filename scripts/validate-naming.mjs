import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const pascalCase = /^[A-Z][A-Za-z0-9]*$/;
const camelCase = /^[a-z][A-Za-z0-9]*$/;
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hookName = /^use[A-Z][A-Za-z0-9]*$/;
const subjectName = /^[A-Za-z][A-Za-z0-9]*$/;

export function getNamingError(path) {
  const parts = path.split('/');
  const file = parts.at(-1);
  if (path.startsWith('docs/features/') && file.endsWith('.md')) {
    return parts.length === 3 && (file === 'README.md' || kebabCase.test(file.slice(0, -3)))
      ? null : 'Use docs/features/<kebab-case>.md (or README.md).';
  }
  if (!/\.(?:tsx?|mjs)$/i.test(file)) return null;
  if (/^tests\/(?:e2e|unit)\//.test(path)) {
    const suffix = path.startsWith('tests/e2e/') ? '.spec.ts' : '.test.ts';
    if (file.endsWith(suffix)) {
      return parts.length === 3 && kebabCase.test(file.slice(0, -suffix.length))
        ? null : `Use tests/${parts[1]}/<kebab-case>${suffix}.`;
    }
    return parts[1] === 'e2e' && /^[a-z][a-z0-9-]*\.(?:const|utils|types)\.ts$/.test(file)
      ? null : `Use ${suffix} for tests, or <kebab-case>.const/utils/types.ts for E2E support.`;
  }
  if (path.startsWith('scripts/')) {
    return parts.length === 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.test)?\.mjs$/.test(file)
      ? null : 'Use scripts/<kebab-case>.mjs or scripts/<kebab-case>.test.mjs.';
  }
  if (!path.startsWith('src/')) return null;
  if (/^src\/pages\/(?:_app|_document|_error|\[\[\.\.\.path\]\])\.tsx$/.test(path)) return null;
  const root = { services: 'Services', endpoints: 'Endpoints', storage: 'Storage', assets: 'Assets', router: 'Router' }[parts[1].toLowerCase()];
  if (root && parts[1] !== root) return `Use src/${root}/ with this capitalization.`;
  if (['Services', 'Storage', 'Endpoints'].includes(root) && parts.length > 3 && !pascalCase.test(parts[2])) {
    return `Use a PascalCase domain directory in src/${root}/<Feature>/.`;
  }
  if (!/\.tsx?$/.test(file)) return 'Use a lowercase .ts or .tsx extension for source files.';
  if (root === 'Services' && parts.includes('Hooks')) return 'Use lowercase hooks/ inside a feature.';
  if (root === 'Services' && parts.includes('Components')) return 'Use lowercase components/ inside a feature.';
  if (root === 'Assets' && ['hooks', 'components'].includes(parts[2])) return 'Use src/Assets/Hooks/ or src/Assets/Components/ with this capitalization.';
  for (const [index, directory] of parts.slice(0, -1).entries()) {
    if ((directory === 'components' || (root === 'Assets' && directory === 'Components')) && !pascalCase.test(parts[index + 1])) {
      return 'Use components/<Component>/ with a PascalCase component directory.';
    }
  }
  const isTest = /\.test\.tsx?$/.test(file);
  const name = file.replace(/\.test(?=\.tsx?$)/, '').replace(/\.tsx?$/, '');
  const [subject, ...roles] = name.split('.');
  if (roles.some(role => !camelCase.test(role))) return 'Use camelCase role suffixes such as .types, .const or .validation.';
  if (roles.includes('endpoints')) return 'Omit .endpoints: use src/Endpoints/<Feature>/<feature>.ts.';
  const hookIndex = parts.lastIndexOf('hooks');
  const sharedHookIndex = root === 'Assets' ? parts.lastIndexOf('Hooks') : -1;
  const ownerIndex = Math.max(hookIndex, sharedHookIndex);
  const componentIndex = Math.max(parts.lastIndexOf('components'), root === 'Assets' ? parts.lastIndexOf('Components') : -1);
  if (ownerIndex >= 0) {
    if (componentIndex >= 0) return 'Hooks must not be placed inside component folders.';
    const featureHooks = root === 'Services' && ownerIndex === 3 && parts.length === 5;
    const sharedHooks = root === 'Assets' && sharedHookIndex === 2 && parts.length === 4;
    return (featureHooks || sharedHooks) && (hookName.test(subject) || file === 'index.ts') && (isTest || file.endsWith('.ts'))
      ? null : 'Use flat hooks/use<Purpose>.ts or src/Assets/Hooks/use<Purpose>.ts with matching sidecar/test names.';
  }
  if (/\.styles\.ts$/.test(file)) return null;
  if (componentIndex >= 0) {
    const owner = parts[componentIndex + 1];
    return parts.length === componentIndex + 3 && (file === 'index.ts' || (subject === owner && (isTest || (roles.length ? file.endsWith('.ts') : file.endsWith('.tsx')))))
      ? null : 'Use components/<Component>/<Component>.tsx with matching sidecar/test names.';
  }
  if (root === 'Endpoints' && file !== 'index.ts' && (roles.length === 0 || roles[0] === 'types')) {
    const feature = parts[2].replace(/^[A-Z]+(?=[A-Z][a-z]|$)/, prefix => prefix.toLowerCase());
    return parts.length === 4 && subject === feature[0].toLowerCase() + feature.slice(1) && roles.length <= 1 && file.endsWith('.ts')
      ? null : 'Use src/Endpoints/<Feature>/<feature>.ts or <feature>.types.ts.';
  }
  if (root === 'Storage' && ['slice', 'selectors'].includes(roles[0])) {
    const feature = parts[2].replace(/^[A-Z]+(?=[A-Z][a-z]|$)/, prefix => prefix.toLowerCase());
    return parts.length === 4 && subject === feature[0].toLowerCase() + feature.slice(1) && roles.length === 1 && file.endsWith('.ts')
      ? null : 'Use src/Storage/<Feature>/<feature>.slice.ts or <feature>.selectors.ts.';
  }
  if (file === 'index.ts' || path === 'src/vite-env.d.ts') return null;
  if (hookName.test(subject)) return 'Place hooks in hooks/use<Purpose>.ts, outside component folders.';
  if (file.endsWith('.tsx')) {
    return pascalCase.test(subject) && (isTest || root !== 'Services' || subject.endsWith('Page'))
      ? null : 'Use PascalCase component names in their component package, or <Purpose>Page.tsx for pages.';
  }
  return subjectName.test(subject) && (roles.length > 0 || isTest)
    ? null : 'Use <subject>.<purpose>.ts for domain logic, or index.ts for a barrel.';
}

function run() {
  const args = process.argv.slice(2);
  const committed = args.length === 2 && args[0] === '--base';
  if (!committed && (args.length > 1 || (args.length && !['--staged', '--all'].includes(args[0])))) {
    throw new Error('Usage: npm run validate:naming -- [--staged|--all|--base REF]');
  }
  const base = committed ? execFileSync('git', ['rev-parse', '--verify', '--end-of-options', `${args[1]}^{commit}`], { encoding: 'utf8' }).trim() : null;
  const all = args[0] === '--all';
  const gitArgs = all
    ? ['ls-files', '--cached', '--full-name', '-z']
    : ['diff', ...(base ? [base, 'HEAD'] : ['--cached']), '--name-only', '--diff-filter=A', '--no-renames', '--no-relative', '-z'];
  const paths = execFileSync('git', [...gitArgs, '--'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const errors = paths.flatMap(path => {
    const error = getNamingError(path);
    return error ? [`${JSON.stringify(path)}: ${error}`] : [];
  });
  if (errors.length) {
    console.error(`Naming check failed (${errors.length}):\n${errors.map(error => `  ${error}`).join('\n')}\nSee docs/guides/naming.md.`);
    process.exitCode = 1;
    return;
  }
  console.log(`Naming check passed: ${paths.length} ${all ? 'tracked' : base ? 'added/renamed committed' : 'added/renamed staged'} paths checked.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run();
  } catch (error) {
    console.error(`Naming check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
