import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { makeCourse } from '../utils/course.fixtures';
import { toCourseDetail } from '../utils/courseMapping';
import { useCourseQuery } from './useCourseQueries';

const feature = vi.hoisted(() => ({ read: vi.fn(() => Promise.resolve()), getCourse: vi.fn(), state: { requests: {} } }));
vi.mock('./useCourses', () => ({ useCourses: () => feature }));
beforeEach(() => {
  vi.useFakeTimers();
  feature.read.mockClear();
  feature.getCourse.mockReturnValue(toCourseDetail(makeCourse({ canManage: false })));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('refreshes learner unlocks while open and stops polling and focus reads after leaving', async () => {
  const { unmount } = renderHook(() => useCourseQuery('school', 'course'));
  feature.read.mockClear();
  await act(() => vi.advanceTimersByTimeAsync(15_000));
  expect(feature.read).toHaveBeenCalledExactlyOnceWith({ kind: 'progress', coursePublicId: 'course', refresh: true });
  unmount();
  feature.read.mockClear();
  await act(() => vi.advanceTimersByTimeAsync(30_000));
  await act(async () => {
    window.dispatchEvent(new Event('focus'));
  });
  expect(feature.read).not.toHaveBeenCalled();
});
