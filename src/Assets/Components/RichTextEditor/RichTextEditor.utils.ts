import type { RichTextDocument } from './RichTextEditor.type';
import type { SerializedLexicalNode } from 'lexical';

function isSerializedNode(value: unknown, depth = 0): value is SerializedLexicalNode {
  if (depth > 64 || !value || typeof value !== 'object' || !('type' in value) || typeof value.type !== 'string'
    || !('version' in value) || value.version !== 1) {
    return false;
  }
  const allowed = ['root', 'paragraph', 'text', 'linebreak', 'tab', 'heading', 'quote', 'list', 'listitem', 'code', 'code-highlight', 'link', 'autolink'];
  if (!allowed.includes(value.type)) {
    return false;
  }
  if (value.type === 'text' && (!('text' in value) || typeof value.text !== 'string')) {
    return false;
  }
  return !('children' in value) || (Array.isArray(value.children) && value.children.every(child => isSerializedNode(child, depth + 1)));
}

export function parseRichTextDocument(value: unknown): RichTextDocument | null {
  if (!value || typeof value !== 'object' || !('format' in value) || value.format !== 'lexical'
    || !('version' in value) || value.version !== 1 || !('state' in value) || !value.state
    || typeof value.state !== 'object' || !('root' in value.state)) {
    return null;
  }
  const root = value.state.root;
  if (!root || typeof root !== 'object' || !('type' in root) || root.type !== 'root' || !('version' in root) || root.version !== 1
    || !('children' in root) || !Array.isArray(root.children) || !root.children.every(child => isSerializedNode(child))
    || !('direction' in root) || (root.direction !== null && root.direction !== 'ltr' && root.direction !== 'rtl')
    || !('indent' in root) || typeof root.indent !== 'number' || !Number.isFinite(root.indent)
    || !('format' in root) || typeof root.format !== 'string' || !['', 'left', 'start', 'center', 'right', 'end', 'justify'].includes(root.format)) {
    return null;
  }
  const direction = root.direction === 'ltr' || root.direction === 'rtl' ? root.direction : null;
  const format = root.format === 'left' || root.format === 'start' || root.format === 'center' || root.format === 'right'
    || root.format === 'end' || root.format === 'justify' ? root.format : '';
  return { format: 'lexical', version: 1, state: { root: { type: 'root', version: 1, children: root.children, direction, indent: root.indent, format } } };
}

export function richTextFromText(text: string): RichTextDocument {
  return {
    format: 'lexical',
    version: 1,
    state: {
      root: {
        type: 'root', version: 1, direction: null, format: '', indent: 0,
        children: text.split('\n').map(line => ({
          type: 'paragraph', version: 1, direction: null, format: '', indent: 0,
          children: line ? [{ type: 'text', version: 1, text: line, detail: 0, format: 0, mode: 'normal', style: '' }] : [],
        })),
      },
    },
  };
}
