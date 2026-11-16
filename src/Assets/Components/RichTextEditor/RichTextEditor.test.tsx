import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createEditor } from 'lexical';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RichTextEditor from './RichTextEditor';
import { parseRichTextDocument, richTextFromText } from './RichTextEditor.utils';

afterEach(cleanup);

describe('shared rich text editor', () => {
  it('round trips legacy text without treating it as HTML', () => {
    const document = richTextFromText('Первая строка\n<script>alert(1)</script>');
    const editor = createEditor({ namespace: 'round-trip', onError: error => {
      throw error;
    } });
    const state = editor.parseEditorState(document.state);
    expect(state.toJSON().root.children).toHaveLength(2);
    expect(JSON.stringify(state.toJSON())).toContain('<script>alert(1)</script>');
    expect(parseRichTextDocument(document)).toEqual(document);
    expect(parseRichTextDocument({ ...document, version: 2 })).toBeNull();
    expect(parseRichTextDocument({ ...document, state: { root: { ...document.state.root, children: [{ type: 'html', version: 1, html: '<script>bad</script>' }] } } })).toBeNull();
    expect(parseRichTextDocument({ ...document, state: { root: { ...document.state.root, indent: 'bad' } } })).toBeNull();
    expect(parseRichTextDocument(null)).toBeNull();
  });

  it('renders separate editors without taking focus and can format a selection', async () => {
    const onChange = vi.fn();
    render(<>
      <RichTextEditor label="Ответ на первый вопрос" value={richTextFromText('Первый ответ')} onChange={onChange} />
      <RichTextEditor label="Ответ на второй вопрос" value={richTextFromText('Второй ответ')} onChange={vi.fn()} />
    </>);
    const first = screen.getByRole('textbox', { name: 'Ответ на первый вопрос' });
    const second = screen.getByRole('textbox', { name: 'Ответ на второй вопрос' });
    expect(first.textContent).toBe('Первый ответ');
    expect(second.textContent).toBe('Второй ответ');
    expect(document.activeElement).not.toBe(first);
    expect(document.activeElement).not.toBe(second);
    await act(async () => {
      first.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(first);
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Полужирный' })[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('refreshes read-only content without exposing authoring controls', async () => {
    const { rerender } = render(<RichTextEditor label="Условие" value={richTextFromText('Старое условие')} readOnly />);
    rerender(<RichTextEditor label="Условие" value={richTextFromText('Новое условие')} readOnly />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Условие' }).textContent).toBe('Новое условие'));
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('visibly restores an external editable draft without autosaving it as a new user change', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<RichTextEditor label="Ответ" value={richTextFromText('Ответ с сервера')} onChange={onChange} />);
    rerender(<RichTextEditor label="Ответ" value={richTextFromText('Восстановленный черновик')} onChange={onChange} />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Ответ' }).textContent).toBe('Восстановленный черновик'));
    expect(onChange).not.toHaveBeenCalled();
    rerender(<RichTextEditor label="Ответ" value={richTextFromText('После конфликта')} onChange={onChange} />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Ответ' }).textContent).toBe('После конфликта'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
