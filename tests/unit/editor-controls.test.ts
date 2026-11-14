import { createElement, createRef } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { createCommand } from 'lexical';
import { afterEach, expect, it, vi } from 'vitest';
import { useResizable } from '@/Assets/Hooks/useResizable';
import ToolbarDropdown from '@/Services/Lessons/components/TextEditorComponents/ui/ToolbarDropdown';

const dispatchCommand = vi.hoisted(() => vi.fn());
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [{ dispatchCommand }],
}));

afterEach(() => cleanup());

it('keeps the controlled toolbar selection on first render and after external changes', () => {
  const buttons = [
    { label: 'Обычный', icon: '', event: 'paragraph' },
    { label: 'Заголовок', icon: '', event: 'heading' },
  ];
  const action = vi.fn();
  const { rerender } = render(createElement(ToolbarDropdown, { buttons, value: 'heading', action }));
  expect(screen.getByRole('button', { name: 'Заголовок' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Заголовок' }));
  fireEvent.click(screen.getByTestId('editor-paragraph'));
  expect(action).toHaveBeenCalledWith('paragraph');
  expect(screen.getByRole('button', { name: 'Обычный' })).toBeTruthy();
  rerender(createElement(ToolbarDropdown, { buttons, value: 'paragraph', action }));
  rerender(createElement(ToolbarDropdown, { buttons, value: 'heading', action }));
  expect(screen.getByRole('button', { name: 'Заголовок' })).toBeTruthy();
});

it('restores externally supplied dimensions after a local resize', () => {
  const elementRef = createRef<HTMLDivElement>();
  const resizeCommand = createCommand();
  const { result, rerender } = renderHook(({ width, height }) => useResizable({
    width, height, elementRef, resizeCommand, nodeKey: 'image',
  }), { initialProps: { width: 200, height: 100 } });
  const resizeHandle = render(createElement('div', {
    ref: elementRef,
    'data-testid': 'resize-handle',
    onMouseDown: event => result.current.handleResizeStart(event, 'se'),
  }));
  fireEvent.mouseDown(screen.getByTestId('resize-handle'), { clientX: 0, clientY: 0 });
  fireEvent.mouseMove(document, { clientX: 100, clientY: 10 });
  expect(result.current.currentWidth).toBe(300);
  expect(result.current.currentHeight).toBe(150);
  fireEvent.mouseUp(document);
  expect(dispatchCommand).toHaveBeenCalledWith(resizeCommand, { nodeKey: 'image', width: 300, height: 150 });
  act(() => rerender({ width: 80, height: 60 }));
  expect(result.current.currentWidth).toBe(80);
  expect(result.current.currentHeight).toBe(60);
  resizeHandle.unmount();
});
