import { execFileSync } from 'node:child_process';
import { posix } from 'node:path';
import { pathToFileURL } from 'node:url';

const pascalCase = /^[A-Z][A-Za-z0-9]*$/;
const camelCase = /^[a-z][A-Za-z0-9]*$/;
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hookName = /^use[A-Z][A-Za-z0-9]*$/;
const subjectName = /^[A-Za-z][A-Za-z0-9]*$/;
const sourceExtension = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const plainExtension = /\.[cm]?[jt]s$/;

function hasTypeOwner(path, paths) {
  const directory = posix.dirname(path);
  const subject = posix.basename(path, '.type.ts');
  const runtime = [...paths].filter(candidate => sourceExtension.test(candidate)
    && !candidate.endsWith('.type.ts') && posix.dirname(candidate) === directory);
  if (runtime.some(candidate => posix.basename(candidate).replace(sourceExtension, '') === subject)) {
    return true;
  }
  const parts = path.split('/');
  if (parts[0] === 'tests') {
    return runtime.some(candidate => posix.basename(candidate).startsWith(`${subject}.`));
  }
  if (parts.length === 4 && directory === 'src/Assets/Types') {
    return camelCase.test(subject);
  }
  const domain = ['Services', 'Storage', 'Endpoints'].includes(parts[1]);
  const feature = parts[2];
  const sharedFeature = domain && (parts.length === 4 || (parts.length === 5 && parts[3] === 'types'))
    && subject.split('.')[0].toLowerCase() === feature.toLowerCase();
  const sharedComponent = parts.at(-3) === 'components' && pascalCase.test(parts.at(-2)) && subject === parts.at(-2);
  const ownerDirectory = sharedFeature ? parts.slice(0, 3).join('/') : directory;
  return (sharedFeature || sharedComponent) && [...paths].some(candidate => candidate.startsWith(`${ownerDirectory}/`)
    && sourceExtension.test(candidate) && !candidate.endsWith('.type.ts'));
}

export function getNamingError(path, paths = new Set()) {
  const parts = path.split('/');
  const file = parts.at(-1);
  if (path.startsWith('docs/features/') && file.endsWith('.md')) {
    return parts.length === 3 && (file === 'README.md' || kebabCase.test(file.slice(0, -3)))
      ? null : 'Use docs/features/<kebab-case>.md (or README.md).';
  }
  if (!/\.(?:[cm]?[jt]s|[jt]sx)$/i.test(file)) {
    return null;
  }
  if (!sourceExtension.test(file)) {
    return 'Use a lowercase JavaScript or TypeScript source extension.';
  }
  if (/\.types?\.(?:[cm]?[jt]s|[jt]sx)$/.test(file) && !file.endsWith('.type.ts')) {
    return 'Use the singular .type.ts suffix for type sidecars.';
  }
  const root = { services: 'Services', endpoints: 'Endpoints', storage: 'Storage', assets: 'Assets', router: 'Router' }[parts[1]?.toLowerCase()];
  if (parts[0] === 'src' && root && parts[1] !== root) {
    return `Use src/${root}/ with this capitalization.`;
  }
  if (file.endsWith('.type.ts')) {
    const subject = file.slice(0, -'.type.ts'.length);
    const sourceSubject = /^[A-Za-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/;
    const supportSubject = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][A-Za-z0-9]*)*$/;
    const valid = (path.startsWith('src/') ? sourceSubject : supportSubject).test(subject);
    const flatSupport = !['scripts', 'tests'].includes(parts[0])
      || (parts[0] === 'scripts' ? parts.length === 2 : parts.length === 3 && ['unit', 'e2e'].includes(parts[1]));
    return valid && flatSupport && hasTypeOwner(path, paths)
      ? null : 'Use an adjacent owner or shared feature basename followed by .type.ts in its owning directory.';
  }
  if (/^tests\/(?:e2e|unit)\//.test(path)) {
    const role = parts[1] === 'e2e' ? 'spec' : 'test';
    const name = file.replace(sourceExtension, '');
    if (name.endsWith(`.${role}`)) {
      return parts.length === 3 && kebabCase.test(name.slice(0, -role.length - 1))
        ? null : `Use tests/${parts[1]}/<kebab-case>.${role} with a supported source extension.`;
    }
    return parts[1] === 'e2e' && /^[a-z][a-z0-9-]*\.(?:const|utils)$/.test(name) && plainExtension.test(file)
      ? null : `Use .${role} for tests, or <kebab-case>.const/utils/type for E2E support.`;
  }
  if (path.startsWith('scripts/')) {
    return parts.length === 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.test)?$/.test(file.replace(sourceExtension, ''))
      ? null : 'Use scripts/<kebab-case> or scripts/<kebab-case>.test with a supported source extension.';
  }
  if (!path.startsWith('src/')) {
    return null;
  }
  if (/^src\/pages\/(?:_app|_document|_error|\[\[\.\.\.path\]\])\.tsx$/.test(path)) {
    return null;
  }
  if (['Services', 'Storage', 'Endpoints'].includes(root) && parts.length > 3 && !pascalCase.test(parts[2])) {
    return `Use a PascalCase domain directory in src/${root}/<Feature>/.`;
  }
  if (root === 'Services' && parts.includes('Hooks')) {
    return 'Use lowercase hooks/ inside a feature.';
  }
  if (root === 'Services' && parts.includes('Components')) {
    return 'Use lowercase components/ inside a feature.';
  }
  if (root === 'Assets' && ['hooks', 'components'].includes(parts[2])) {
    return 'Use src/Assets/Hooks/ or src/Assets/Components/ with this capitalization.';
  }
  for (const [index, directory] of parts.slice(0, -1).entries()) {
    if ((directory === 'components' || (root === 'Assets' && directory === 'Components')) && !pascalCase.test(parts[index + 1])) {
      return 'Use components/<Component>/ with a PascalCase component directory.';
    }
  }
  const isTest = file.replace(sourceExtension, '').endsWith('.test');
  const name = file.replace(sourceExtension, '').replace(/\.test$/, '');
  const isIndex = name === 'index' && plainExtension.test(file);
  const [subject, ...roles] = name.split('.');
  if (roles.some(role => !camelCase.test(role))) {
    return 'Use camelCase role suffixes such as .type, .const or .validation.';
  }
  if (roles.includes('endpoints')) {
    return 'Omit .endpoints: use src/Endpoints/<Feature>/<feature>.ts.';
  }
  const hookIndex = parts.lastIndexOf('hooks');
  const sharedHookIndex = root === 'Assets' ? parts.lastIndexOf('Hooks') : -1;
  const ownerIndex = Math.max(hookIndex, sharedHookIndex);
  const componentIndex = Math.max(parts.lastIndexOf('components'), root === 'Assets' ? parts.lastIndexOf('Components') : -1);
  if (ownerIndex >= 0) {
    if (componentIndex >= 0) {
      return 'Hooks must not be placed inside component folders.';
    }
    const featureHooks = root === 'Services' && ownerIndex === 3 && parts.length === 5;
    const sharedHooks = root === 'Assets' && sharedHookIndex === 2 && parts.length === 4;
    return (featureHooks || sharedHooks) && (hookName.test(subject) || isIndex) && (isTest || plainExtension.test(file))
      ? null : 'Use flat hooks/use<Purpose>.ts or src/Assets/Hooks/use<Purpose>.ts with matching sidecar/test names.';
  }
  if (/\.styles\.ts$/.test(file)) {
    return null;
  }
  if (componentIndex >= 0) {
    const owner = parts[componentIndex + 1];
    return parts.length === componentIndex + 3 && (isIndex || (subject === owner && (isTest || (roles.length ? plainExtension.test(file) : /\.[jt]sx$/.test(file)))))
      ? null : 'Use components/<Component>/<Component>.tsx with matching sidecar/test names.';
  }
  if (root === 'Endpoints' && !isIndex && roles.length === 0) {
    const feature = parts[2].replace(/^[A-Z]+(?=[A-Z][a-z]|$)/, prefix => prefix.toLowerCase());
    return parts.length === 4 && subject === feature[0].toLowerCase() + feature.slice(1) && roles.length <= 1 && plainExtension.test(file)
      ? null : 'Use src/Endpoints/<Feature>/<feature>.ts or <feature>.type.ts.';
  }
  if (root === 'Storage' && ['slice', 'selectors'].includes(roles[0])) {
    const feature = parts[2].replace(/^[A-Z]+(?=[A-Z][a-z]|$)/, prefix => prefix.toLowerCase());
    return parts.length === 4 && subject === feature[0].toLowerCase() + feature.slice(1) && roles.length === 1 && plainExtension.test(file)
      ? null : 'Use src/Storage/<Feature>/<feature>.slice.ts or <feature>.selectors.ts.';
  }
  if (isIndex || path === 'src/vite-env.d.ts') {
    return null;
  }
  if (hookName.test(subject)) {
    return 'Place hooks in hooks/use<Purpose>.ts, outside component folders.';
  }
  if (/\.[jt]sx$/.test(file)) {
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
  const ownerPaths = new Set(execFileSync('git', base ? ['ls-tree', '-r', '--name-only', '-z', 'HEAD'] : ['ls-files', '--cached', '--full-name', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean));
  const errors = paths.flatMap(path => {
    const error = getNamingError(path, ownerPaths);
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
