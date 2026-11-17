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
  render(<CourseProgramPanel items={course.items} canManage={false} openingItemPublicId={null} onOpen={open} onEdit={vi.fn()} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.queryByRole('checkbox')).toBeNull();
  expect(screen.getByText('После одобрения преподавателем')).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button', { name: 'Открыть' })[1]);
  expect(open).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'repeated' }));
});

it('disables unavailable and unsupported blocks while letting managers inspect dated content', () => {
  const items = toCourseDetail(makeCourse({ items: [
    makeCourseItem({ availableFromUtc: '2999-01-01T10:00:00Z' }),
    makeCourseItem({ publicId: 'unknown', itemType: 99, position: 1, isRequired: false }),
  ] })).items;
  const props = { items, openingItemPublicId: null, onOpen: vi.fn(), onEdit: vi.fn() };
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
  render(<CourseProgramPanel items={[]} canManage openingItemPublicId={null} onOpen={vi.fn()} onEdit={edit} />);
  fireEvent.click(screen.getByRole('button', { name: 'Собрать программу' }));
  expect(edit).toHaveBeenCalledOnce();
});

it('focuses the matching occurrence once after items load and preserves user focus during progress refresh', () => {
  const scroll = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll });
  const items = toCourseDetail(makeCourse({ items: [makeCourseItem(), makeCourseItem({ publicId: 'repeated', position: 1 })] })).items;
  const props = { canManage: false, openingItemPublicId: null, onOpen: vi.fn(), onEdit: vi.fn() };
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
  const props = { items: toCourseDetail(makeCourse()).items, canManage: false, openingItemPublicId: null, onOpen: vi.fn(), onEdit: vi.fn() };
  const view = render(<CourseProgramPanel {...props} />);
  const open = screen.getByRole('button', { name: 'Открыть' });
  open.focus();
  view.rerender(<CourseProgramPanel {...props} focusItemPublicId="deleted-item" />);
  expect(document.activeElement).toBe(open);
  expect(screen.getByRole('listitem').hasAttribute('tabindex')).toBe(false);
  expect(scroll).not.toHaveBeenCalled();
});

it('shows strict progression locks and lets managers inspect later steps', () => {
  const items = toCourseDetail(makeCourse({ items: [makeCourseItem(), makeCourseItem({ publicId: 'next', position: 1 })] })).items;
  items[1].isUnlocked = false;
  const open = vi.fn();
  const props = { items, openingItemPublicId: null, onOpen: open, onEdit: vi.fn() };
  const view = render(<CourseProgramPanel {...props} canManage={false} />);
  const buttons = screen.getAllByRole('button', { name: 'Открыть' });
  fireEvent.click(buttons[1]);
  expect(open).not.toHaveBeenCalled();
  expect(buttons[1].hasAttribute('disabled')).toBe(true);
  expect(screen.getByText('Сначала пройдите предыдущие обязательные блоки')).toBeTruthy();
  view.rerender(<CourseProgramPanel {...props} canManage />);
  expect(screen.getAllByRole('button', { name: 'Открыть' })[1].hasAttribute('disabled')).toBe(false);
});
