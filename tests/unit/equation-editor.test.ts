import { createElement, createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import EquationEditor from '@/Services/Lessons/components/TextEditorComponents/ui/EquationEditor';

afterEach(() => cleanup());

it('uses the inline contract to render a single-line field and forward its DOM ref', () => {
  const ref = createRef<HTMLInputElement>();
  const setEquation = vi.fn();
  render(createElement(EquationEditor, { inline: true, equation: 'x', setEquation, ref }));
  const field = screen.getByRole('textbox');
  expect(field.tagName).toBe('INPUT');
  expect(ref.current).toBe(field);
  fireEvent.change(field, { target: { value: 'x + 1' } });
  expect(setEquation).toHaveBeenCalledWith('x + 1');
});

it('uses a multiline field for block equations and forwards a callback ref', () => {
  const ref = vi.fn();
  render(createElement(EquationEditor, { inline: false, equation: 'x', setEquation: vi.fn(), ref }));
  const field = screen.getByRole('textbox');
  expect(field.tagName).toBe('TEXTAREA');
  expect(ref).toHaveBeenCalledWith(field);
});
