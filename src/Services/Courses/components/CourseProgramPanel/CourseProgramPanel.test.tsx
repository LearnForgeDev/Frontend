import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { makeCourse, makeCourseItem } from '../../utils/course.fixtures';
import { toCourseDetail } from '../../utils/courseMapping';
import CourseProgramPanel from './CourseProgramPanel';

const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
afterEach(() => {
  cleanup();
  if (scrollDescriptor) {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollDescriptor);
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  }
});

it('renders mixed items by stable identity and never offers manual homework completion', () => {
  const course = toCourseDetail(makeCourse({ items: [
    makeCourseItem(),
    makeCourseItem({ publicId: 'repeated', position: 1 }),
    makeCourseItem({ publicId: 'homework', itemType: 3, homeworkId: 9, lessonId: null, position: 2, title: 'Задание' }),
  ] }));
  const open = vi.fn();
  const mark = vi.fn();
  render(<CourseProgramPanel items={course.items} canManage={false} isSavingProgress={false} openingItemPublicId={null} onOpen={open} onToggleCompleted={mark} onEdit={vi.fn()} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  expect(screen.getByText('Зачёт после проверки')).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button', { name: 'Открыть' })[1]);
  expect(open).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'repeated' }));
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  expect(mark).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'lesson-item' }));
});

it('disables unavailable and unsupported blocks while letting managers inspect dated content', () => {
  const items = toCourseDetail(makeCourse({ items: [
    makeCourseItem({ availableFromUtc: '2999-01-01T10:00:00Z' }),
    makeCourseItem({ publicId: 'unknown', itemType: 99, position: 1, isRequired: false }),
  ] })).items;
  const props = { items, isSavingProgress: false, openingItemPublicId: null, onOpen: vi.fn(), onToggleCompleted: vi.fn(), onEdit: vi.fn() };
  const view = render(<CourseProgramPanel {...props} canManage={false} />);
  expect(screen.getAllByRole('button', { name: 'Открыть' }).every(button => button.hasAttribute('disabled'))).toBe(true);
  expect(screen.getByText('Блок сейчас недоступен')).toBeTruthy();
  expect(screen.getByText('Необязательный')).toBeTruthy();
  view.rerender(<CourseProgramPanel {...props} canManage />);
  expect(screen.getAllByRole('button', { name: 'Открыть' })[0].hasAttribute('disabled')).toBe(false);
  expect(screen.queryByRole('checkbox')).toBeNull();
});

it('offers program creation in an empty manager view', () => {
  const edit = vi.fn();
  render(<CourseProgramPanel items={[]} canManage isSavingProgress={false} openingItemPublicId={null} onOpen={vi.fn()} onToggleCompleted={vi.fn()} onEdit={edit} />);
  fireEvent.click(screen.getByRole('button', { name: 'Собрать программу' }));
  expect(edit).toHaveBeenCalledOnce();
});

it('focuses the matching occurrence once after items load and preserves user focus during progress refresh', () => {
  const scroll = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll });
  const items = toCourseDetail(makeCourse({ items: [makeCourseItem(), makeCourseItem({ publicId: 'repeated', position: 1 })] })).items;
  const props = { canManage: false, isSavingProgress: false, openingItemPublicId: null, onOpen: vi.fn(), onToggleCompleted: vi.fn(), onEdit: vi.fn() };
  const view = render(<CourseProgramPanel {...props} items={[]} focusItemPublicId="repeated" />);
  expect(scroll).not.toHaveBeenCalled();
  view.rerender(<CourseProgramPanel {...props} items={items} focusItemPublicId="repeated" />);
  const target = screen.getByTestId('course-item-repeated');
  expect(document.activeElement).toBe(target);
  expect(scroll).toHaveBeenCalledExactlyOnceWith({ block: 'center' });
  const firstButton = screen.getAllByRole('button', { name: 'Открыть' })[0];
  firstButton.focus();
  view.rerender(<CourseProgramPanel {...props} items={items.map(item => ({ ...item, isCompleted: true }))} focusItemPublicId="repeated" />);
  expect(document.activeElement).toBe(firstButton);
  expect(scroll).toHaveBeenCalledOnce();
  view.rerender(<CourseProgramPanel {...props} items={items} focusItemPublicId="lesson-item" />);
  expect(document.activeElement).toBe(screen.getByTestId('course-item-lesson-item'));
  expect(scroll).toHaveBeenCalledTimes(2);
});

it('does not move focus for a missing or absent return target', () => {
  const scroll = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll });
  const props = { items: toCourseDetail(makeCourse()).items, canManage: false, isSavingProgress: false, openingItemPublicId: null, onOpen: vi.fn(), onToggleCompleted: vi.fn(), onEdit: vi.fn() };
  const view = render(<CourseProgramPanel {...props} />);
  const open = screen.getByRole('button', { name: 'Открыть' });
  open.focus();
  view.rerender(<CourseProgramPanel {...props} focusItemPublicId="deleted-item" />);
  expect(document.activeElement).toBe(open);
  expect(screen.getByRole('listitem').hasAttribute('tabindex')).toBe(false);
  expect(scroll).not.toHaveBeenCalled();
});
