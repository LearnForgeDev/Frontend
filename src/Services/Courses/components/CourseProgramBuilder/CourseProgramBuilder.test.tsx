import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { CourseBlock, CourseResourceOption } from '../../Courses.type';
import { makeCourseInput } from '../../utils/course.fixtures';
import CourseProgramBuilder from './CourseProgramBuilder';

afterEach(cleanup);

it('adds a repeated source as a separate block, then edits and reorders by client id', () => {
  let blocks: CourseBlock[] = makeCourseInput().blocks;
  const reference = blocks[0];
  if (reference.kind !== 'supported') {
    throw new Error('Expected supported fixture');
  }
  const resources: CourseResourceOption[] = [{ key: 'lesson', title: 'Урок школы', reference: reference.input }];
  const changed = vi.fn((next: CourseBlock[]) => {
    blocks = next;
  });
  const props = { resources, disabled: false, onChange: changed };
  const view = render(<CourseProgramBuilder {...props} blocks={blocks} />);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Выберите: урок' }));
  fireEvent.click(screen.getByRole('option', { name: 'Урок школы' }));
  fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
  expect(blocks).toHaveLength(2);
  expect(blocks[1].clientId).not.toBe(blocks[0].clientId);
  expect(blocks[1].publicId).toBeNull();
  view.rerender(<CourseProgramBuilder {...props} blocks={blocks} />);
  const added = within(screen.getAllByRole('listitem')[1]);
  fireEvent.change(added.getByRole('textbox', { name: 'Название блока' }), { target: { value: 'Повторение' } });
  view.rerender(<CourseProgramBuilder {...props} blocks={blocks} />);
  fireEvent.click(screen.getByRole('button', { name: 'Переместить «Повторение» выше' }));
  expect(blocks[0].kind === 'supported' && blocks[0].input.title).toBe('Повторение');
  view.rerender(<CourseProgramBuilder {...props} blocks={blocks} />);
  fireEvent.click(screen.getByRole('button', { name: 'Убрать «Повторение» из курса' }));
  expect(blocks).toHaveLength(1);
});

it('edits optionality, description and availability and exposes the homework palette', () => {
  const blocks = makeCourseInput().blocks;
  const changed = vi.fn();
  render(<CourseProgramBuilder blocks={blocks} resources={[]} disabled={false} onChange={changed} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Описание блока' }), { target: { value: 'Для повторения' } });
  expect(changed).toHaveBeenLastCalledWith([expect.objectContaining({ input: expect.objectContaining({ description: 'Для повторения' }) })]);
  fireEvent.change(screen.getByRole('combobox', { name: 'Условие прохождения' }), { target: { value: '0' } });
  expect(changed).toHaveBeenLastCalledWith([expect.objectContaining({ input: expect.objectContaining({ isRequired: false }) })]);
  fireEvent.change(screen.getByLabelText('Доступен с'), { target: { value: '2026-11-17T10:00' } });
  expect(changed).toHaveBeenLastCalledWith([expect.objectContaining({ input: expect.objectContaining({ availableFromUtc: expect.stringContaining('2026-11-17') }) })]);
  fireEvent.change(screen.getByLabelText('Доступен до'), { target: { value: '2026-11-18T10:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Домашнее задание' }));
  expect(screen.getByRole('combobox', { name: 'Выберите: домашнее задание' }).getAttribute('value')).toBe('');
  expect(screen.getByRole('button', { name: 'Добавить' }).hasAttribute('disabled')).toBe(true);
});
