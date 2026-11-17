import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useCourseLesson } from './useCourseLesson';

const { read, courseQuery } = vi.hoisted(() => {
  const read = vi.fn();
  return { read, courseQuery: { data: { canManage: false, lessons: [{ itemPublicId: 'first', lessonId: 7, isUnlocked: true, availableFromUtc: null, availableUntilUtc: null }] }, feature: { read, state: { requests: {}, lessons: {} } }, isLoading: false, isError: false, isFetching: false, refetch: vi.fn() } };
});
vi.mock('./useCourseQueries', () => ({ useCourseQuery: () => courseQuery }));
vi.mock('react-router-dom', () => ({ useSearchParams: () => [new URLSearchParams('item=first')] }));

afterEach(cleanup);
beforeEach(() => read.mockClear());

it('checks the source lesson again on each visit instead of retaining a published document forever', () => {
  const first = renderHook(() => useCourseLesson('school', 'course', '7'));
  expect(read).toHaveBeenLastCalledWith({ kind: 'lesson', coursePublicId: 'course', itemPublicId: 'first', lessonId: 7, refresh: true });
  first.unmount();
  renderHook(() => useCourseLesson('school', 'course', '7'));
  expect(read).toHaveBeenCalledTimes(2);
});

it('does not read a different duplicate item when its stable identity is absent', () => {
  renderHook(() => useCourseLesson('school', 'course', '8'));
  expect(read).not.toHaveBeenCalled();
});
