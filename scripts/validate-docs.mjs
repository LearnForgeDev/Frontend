import { execFileSync } from 'node:child_process';
import { posix } from 'node:path';
import { pathToFileURL } from 'node:url';

const owners = {
  auth: 'auth-session', usercontext: 'auth-session', querycontext: 'auth-session', useglobalcontext: 'auth-session',
  appshell: 'schools-access', adminpanel: 'schools-access', schools: 'schools-access', forbidden: 'schools-access', notfound: 'schools-access',
  students: 'students-invitations', invites: 'students-invitations', lessons: 'lessons-editor', lessonscontext: 'lessons-editor',
  developer: 'platform-administration', schedule: 'scheduling', schedulingcontext: 'scheduling',
  branches: 'chat', usechatcontext: 'chat', meet: 'calls', settings: 'README',
};
const schoolPages = { FilesPage: 'files', CallsPage: 'calls', ChatsPage: 'chat', StudentsPage: 'students-invitations', LessonsPage: 'lessons-editor' };

export function getFeatureDocument(path) {
  if (!/^src\/(?:Services|Storage|Endpoints)\/.*\.[jt]sx?$/.test(path) || /(?:\.test|\.styles)\.[jt]sx?$/.test(path) || posix.basename(path) === 'index.ts') return null;
  const [, root, feature, page] = path.split('/');
  if (!page || ['factory', 'checkhealth'].includes(feature.toLowerCase())) return 'ARCHITECTURE.md';
  const name = root === 'Services' && feature === 'Schools' && schoolPages[page]
    ? schoolPages[page]
    : owners[feature.toLowerCase()] ?? feature.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `docs/features/${name}.md`;
}

function prose(text) {
  let fence = null;
  return text.split(/\r?\n/).map(line => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
      return '';
    }
    return fence ? '' : line.replace(/(`+).*?\1/g, '');
  }).join('\n');
}

function headings(text) {
  const result = new Set();
  const counts = new Map();
  for (const [, heading] of text.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const label = inlineLinks(heading).reduceRight((value, link) => value.slice(0, link.start) + link.label + value.slice(link.end), heading);
    const slug = label.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/\s/g, '-');
    const count = counts.get(slug) ?? 0;
    counts.set(slug, count + 1);
    result.add(count ? `${slug}-${count}` : slug);
  }
  return result;
}

function destination(text, start) {
  let end = start;
  let depth = 0;
  const angle = text[start] === '<';
  let target = '';
  if (angle) end++;
  while (end < text.length) {
    const char = text[end];
    if (char === '\\' && /[!-/:-@\[-`{-~]/.test(text[end + 1] ?? '')) {
      target += text[end + 1];
      end += 2;
      continue;
    }
    if (angle && char === '>') return { target, end: end + 1 };
    if (angle && /[<\r\n]/.test(char)) return null;
    if (!angle && (/\s/.test(char) || (char === ')' && depth === 0))) break;
    if (!angle && char === '(') depth++;
    if (!angle && char === ')') depth--;
    target += char;
    end++;
  }
  return angle || depth ? null : { target, end };
}

function inlineLinks(text) {
  const result = [];
  for (const match of text.matchAll(/(?<!\\)!?\[([^\]\n]*)\]\(\s*/g)) {
    const parsed = destination(text, match.index + match[0].length);
    if (!parsed) continue;
    const close = text.slice(parsed.end).match(/^\s*(?:(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))\s*)?\)/);
    if (close) result.push({ target: parsed.target, label: match[1], start: match.index, end: parsed.end + close[0].length });
  }
  return result;
}

function links(text) {
  const references = new Map();
  for (const match of text.matchAll(/^ {0,3}\[([^\]]+)\]:\s*/gm)) {
    const parsed = destination(text, match.index + match[0].length);
    if (parsed && parsed.end > match.index + match[0].length) references.set(match[1].toLowerCase(), parsed.target);
  }
  const targets = inlineLinks(text).map(link => link.target);
  for (const [, label, reference] of text.matchAll(/!?\[([^\]]+)\]\[([^\]]*)\]/g)) {
    const target = references.get((reference || label).toLowerCase());
    targets.push(target ?? `!missing-reference:${reference || label}`);
  }
  for (const target of references.values()) targets.push(target);
  return targets;
}

export function getDocumentationErrors({ documents, paths, check = 'all' }) {
  const errors = [];
  const targets = new Set(paths);
  for (const path of paths) {
    let parent = posix.dirname(path);
    while (parent !== '.') {
      targets.add(parent);
      parent = posix.dirname(parent);
    }
  }
  const content = new Map([...documents].map(([path, text]) => [path, prose(text)]));
  const fragments = new Map([...documents].map(([path, text]) => [path, headings(text.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, ''))]));
  for (const [path, text] of check === 'coverage' ? [] : documents) {
    const lines = text.replace(/\r?\n$/, '').split(/\r?\n/).length;
    if (lines >= 300) errors.push(`${path}: ${lines} lines; documentation must be shorter than 300 lines.`);
    for (const target of links(content.get(path))) {
      if (target.startsWith('!missing-reference:')) {
        errors.push(`${path}: undefined link reference ${target.slice(19)}.`);
        continue;
      }
      if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('//')) continue;
      const [location, fragment] = target.split('#');
      let destination;
      let anchor;
      try {
        destination = location ? posix.normalize(posix.join(posix.dirname(path), decodeURIComponent(location.split('?')[0]))) : path;
        anchor = fragment === undefined ? null : decodeURIComponent(fragment);
      } catch {
        errors.push(`${path}: invalid URL encoding in ${target}.`);
        continue;
      }
      if (location.startsWith('/') || !targets.has(destination)) errors.push(`${path}: broken local link ${target}.`);
      else if (anchor && documents.has(destination) && !fragments.get(destination).has(anchor)) errors.push(`${path}: missing heading in ${target}.`);
    }
  }
  if (check === 'content') return errors;
  const ownersByPath = new Map(paths.map(path => [path, getFeatureDocument(path)]).filter(([, document]) => document));
  for (const document of new Set(ownersByPath.values())) {
    if (!documents.has(document) || !content.get(document).replace(/^\s*#.*$/gm, '').trim()) {
      const owner = [...ownersByPath].find(([, candidate]) => candidate === document)[0];
      errors.push(`${owner}: missing feature documentation ${document}; add and stage it.`);
    }
  }
  return errors;
}

function run() {
  const git = args => execFileSync('git', args, { encoding: 'utf8' });
  let base = null;
  let check = 'all';
  const args = process.argv.slice(2);
  while (args.length) {
    const option = args.shift();
    const value = args.shift();
    if (option === '--base' && value && !base) base = git(['rev-parse', '--verify', '--end-of-options', `${value}^{commit}`]).trim();
    else if (option === '--check' && ['all', 'content', 'coverage'].includes(value)) check = value;
    else throw new Error('Usage: npm run validate:docs -- [--base REF] [--check all|content|coverage]');
  }
  const paths = git(base ? ['ls-tree', '-r', '--name-only', '-z', 'HEAD'] : ['ls-files', '--cached', '--full-name', '-z']).split('\0').filter(Boolean);
  const documents = new Map(paths.filter(path => path.endsWith('.md')).map(path => [path, git(['show', `${base ? 'HEAD' : ''}:${path}`])]));
  const errors = getDocumentationErrors({ documents, paths, check });
  if (errors.length) {
    console.error(`Documentation check failed (${errors.length}):\n${errors.map(error => `  ${error}`).join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Documentation ${check} check passed: ${documents.size} ${base ? 'committed' : 'staged'} documents verified.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run();
  } catch (error) {
    console.error(`Documentation check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
