import { createElement } from 'react';
import type { ReactNode } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { $createParagraphNode, $createTextNode, $getNodeByKey, $getRoot, $getSelection, $isNodeSelection, $nodesOfType, $setSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, KEY_DELETE_COMMAND, REDO_COMMAND, UNDO_COMMAND, createEditor } from 'lexical';
import { LexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { serializedDocumentFromEditorState } from '@lexical/file';
import formatText from '@/Services/Lessons/components/TextEditorComponents/utils/formattingActions';
import { GraphNode } from '@/Services/Lessons/components/TextEditorComponents/nodes/graphNode';
import { $createFileNode, FileNode } from '@/Services/Lessons/components/TextEditorComponents/nodes/FileNode';
import FileComponent from '@/Services/Lessons/components/TextEditorComponents/nodes/FileComponent';
import AutoSavePlugin from '@/Services/Lessons/components/TextEditorComponents/plugins/AutoSavePlugin';
import ToggleIsEditable from '@/Services/Lessons/components/TextEditorComponents/plugins/ToggleIsEditable';

let editor: ReturnType<typeof createEditor>;

beforeEach(() => {
  editor = createEditor({ namespace: 'lesson-test', nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, GraphNode, FileNode], onError: error => {
    throw error;
  } });
  editor.update(() => {
    const paragraph = $createParagraphNode().append($createTextNode('Урок'));
    $getRoot().append(paragraph);
    paragraph.selectEnd();
  }, { discrete: true });
});

afterEach(() => cleanup());

function format(event: string, blockType = 'paragraph') {
  formatText(editor, event, blockType, vi.fn(), vi.fn(), vi.fn(), vi.fn());
}

function withEditor(children: ReactNode) {
  return createElement(LexicalComposerContext.Provider, { value: [editor, { getTheme: () => null }] }, children);
}

it.each(['h1', 'h2', 'quote', 'paragraph'])('formats a selected block as %s without losing its text', async event => {
  await act(async () => format(event));
  editor.getEditorState().read(() => {
    const node = $getRoot().getFirstChild();
    expect(node?.getType()).toBe(event.startsWith('h') ? 'heading' : event);
    expect(node?.getTextContent()).toBe('Урок');
    if (node instanceof HeadingNode) {
      expect(node.getTag()).toBe(event);
    }
  });
});

it('dispatches list, inline format, alignment, history and link commands with their real payloads', async () => {
  const calls: unknown[][] = [];
  const commands = [INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND, TOGGLE_LINK_COMMAND];
  const remove = commands.map(command => editor.registerCommand(command, value => {
    calls.push([command, value]);
    return true;
  }, COMMAND_PRIORITY_LOW));
  await act(async () => {
    ['ol', 'ul', 'bold', 'center', 'undo', 'redo', 'formatInsertLink'].forEach(event => format(event));
  });
  expect(calls).toEqual(commands.map((command, index) => [command, [undefined, undefined, 'bold', 'center', undefined, undefined, 'https://'][index]]));
  remove.forEach(unregister => unregister());
});

it.each([['ul', 'bullet'], ['ol', 'number']])('toggles an existing %s block back to a paragraph', async (event, block) => {
  await act(async () => format(event, block));
  expect(editor.getEditorState().toJSON().root.children[0]?.type).toBe('paragraph');
});

it('opens each insertion modal once and ignores an unknown toolbar event', () => {
  const callbacks = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
  ['insertImage', 'insertVideo', 'insertEquation', 'insertFile', 'unknown'].forEach(event => {
    formatText(editor, event, 'paragraph', callbacks[0], callbacks[1], callbacks[2], callbacks[3]);
  });
  callbacks.forEach(callback => expect(callback).toHaveBeenCalledOnce());
});

it('inserts a graph only when the editor has a range selection', async () => {
  await act(async () => format('insertGraphic'));
  editor.getEditorState().read(() => expect($nodesOfType(GraphNode)).toHaveLength(1));
  editor.update(() => $setSelection(null), { discrete: true });
  const snapshot = editor.getEditorState().toJSON();
  await act(async () => {
    format('insertGraphic');
    format('h1');
  });
  expect(editor.getEditorState().toJSON()).toEqual(snapshot);
});

it.each([[512, '512 B'], [1536, '1.5 KB'], [1048576, '1.0 MB'], [undefined, '']])('presents a downloadable file with size %s', (sizeBytes, sizeText) => {
  render(withEditor(createElement(FileComponent, { nodeKey: 'missing', fileName: 'Урок.pdf', url: '/protected/file', sizeBytes })));
  const download = screen.getByRole('link');
  expect(download.getAttribute('href')).toBe('/protected/file');
  expect(download.getAttribute('download')).toBe('Урок.pdf');
  expect(download.getAttribute('rel')).toBe('noopener noreferrer');
  expect(screen.getByText('Урок.pdf').parentElement?.textContent).toBe(`Урок.pdf${sizeText}`);
});

it('selects a clicked file and deletes its real Lexical node, then unregisters on unmount', async () => {
  let key = '';
  editor.update(() => {
    const file = $createFileNode({ fileName: 'Урок.pdf', url: '/file' });
    $getRoot().append(file);
    key = file.getKey();
  }, { discrete: true });
  const view = render(withEditor(createElement(FileComponent, { nodeKey: key, fileName: 'Урок.pdf', url: '/file' })));
  const inside = new MouseEvent('click', { bubbles: true });
  screen.getByText('Урок.pdf').dispatchEvent(inside);
  await act(async () => {
    editor.dispatchCommand(CLICK_COMMAND, inside);
  });
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    expect($isNodeSelection(selection) && selection.has(key)).toBe(true);
  });
  const outside = new MouseEvent('click');
  document.body.dispatchEvent(outside);
  await act(async () => {
    expect(editor.dispatchCommand(CLICK_COMMAND, outside)).toBe(false);
  });
  const deletion = new KeyboardEvent('keydown', { key: 'Delete', cancelable: true });
  await act(async () => {
    editor.dispatchCommand(KEY_DELETE_COMMAND, deletion);
  });
  expect(deletion.defaultPrevented).toBe(true);
  editor.getEditorState().read(() => expect($getNodeByKey(key)).toBeNull());
  view.unmount();
  expect(editor.dispatchCommand(CLICK_COMMAND, inside)).toBe(false);
});

it('emits changed documents once, skips selection-only updates and stops listening after unmount', async () => {
  const onDraft = vi.fn();
  const initialDocument = serializedDocumentFromEditorState(editor.getEditorState());
  const view = render(withEditor(createElement(AutoSavePlugin, { onDraft, initialDocument })));
  await act(async () => {
    editor.update(() => $getRoot().getFirstChild()?.selectStart());
  });
  expect(onDraft).not.toHaveBeenCalled();
  await act(async () => {
    editor.update(() => $getRoot().append($createParagraphNode().append($createTextNode('Урок 2'))));
  });
  expect(onDraft).toHaveBeenCalledOnce();
  expect(onDraft.mock.calls[0]?.[0]).toMatchObject({ editorState: editor.getEditorState().toJSON() });
  view.unmount();
  await act(async () => {
    editor.update(() => $getRoot().append($createParagraphNode().append($createTextNode('Урок 3'))));
  });
  expect(onDraft).toHaveBeenCalledOnce();
});

it('keeps editability aligned with changing external permissions', () => {
  const view = render(withEditor(createElement(ToggleIsEditable, { isEditable: false })));
  expect(editor.isEditable()).toBe(false);
  view.rerender(withEditor(createElement(ToggleIsEditable, { isEditable: true })));
  expect(editor.isEditable()).toBe(true);
  view.rerender(withEditor(createElement(ToggleIsEditable)));
  expect(editor.isEditable()).toBe(false);
});
