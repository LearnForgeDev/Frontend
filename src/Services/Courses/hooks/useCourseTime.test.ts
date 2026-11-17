import { AxiosError, AxiosHeaders } from 'axios';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { CourseTimeOptions } from './useCourseTime.type';
import { useCourseTime } from './useCourseTime';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-17T10:00:00Z'));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('counts background tab-open time cumulatively and flushes when leaving the reader', async () => {
  const activity = vi.fn<CourseTimeOptions['activity']>(() => Promise.resolve());
  const { unmount } = renderHook(() => useCourseTime({ coursePublicId: 'course', itemPublicId: 'item', enabled: true, activity }));
  await act(async () => Promise.resolve());
  expect(activity).toHaveBeenLastCalledWith('course', 'item', { kind: 0, sessionId: expect.any(String), elapsedSeconds: 0 });
  const sessionId = activity.mock.calls[0][2].sessionId;
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  await act(() => vi.advanceTimersByTimeAsync(10_000));
  expect(activity).toHaveBeenLastCalledWith('course', 'item', { kind: 1, sessionId, elapsedSeconds: 10 });
  await act(() => vi.advanceTimersByTimeAsync(2000));
  unmount();
  expect(activity).toHaveBeenLastCalledWith('course', 'item', { kind: 1, sessionId, elapsedSeconds: 12 });
  Reflect.deleteProperty(document, 'visibilityState');
});

it('does not start optional, completed or teacher previews and retries a rejected registration', async () => {
  const activity = vi.fn<CourseTimeOptions['activity']>(() => Promise.resolve());
  activity.mockRejectedValueOnce(new Error('offline'));
  const { result, rerender } = renderHook(({ enabled }) => useCourseTime({ coursePublicId: 'course', itemPublicId: 'item', enabled, activity }), { initialProps: { enabled: false } });
  expect(activity).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await act(async () => Promise.resolve());
  expect(result.current).toBe(true);
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(result.current).toBe(false);
  expect(activity.mock.calls[1][2].kind).toBe(0);
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(activity.mock.calls[2][2]).toMatchObject({ kind: 1, elapsedSeconds: 5 });
  rerender({ enabled: false });
  const sent = activity.mock.calls.length;
  await act(() => vi.advanceTimersByTimeAsync(10_000));
  expect(activity).toHaveBeenCalledTimes(sent);
});


it('reopens a time session after another tab or a teacher reset invalidates it', async () => {
  const activity = vi.fn<CourseTimeOptions['activity']>(() => Promise.resolve());
  const { result } = renderHook(() => useCourseTime({ coursePublicId: 'course', itemPublicId: 'item', enabled: true, activity }));
  await act(async () => Promise.resolve());
  const sessionId = activity.mock.calls[0][2].sessionId;
  activity.mockRejectedValueOnce(new AxiosError('Session changed', undefined, undefined, undefined, {
    status: 409, statusText: 'Conflict', data: {}, headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() },
  }));
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(result.current).toBe(true);
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(activity).toHaveBeenLastCalledWith('course', 'item', { kind: 0, sessionId, elapsedSeconds: 0 });
  expect(result.current).toBe(false);
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(activity).toHaveBeenLastCalledWith('course', 'item', { kind: 1, sessionId, elapsedSeconds: 5 });
});


it('keeps one time report in flight and resumes cumulative reporting after it settles', async () => {
  let finish: () => void = () => undefined;
  const activity = vi.fn<CourseTimeOptions['activity']>().mockImplementationOnce(() => new Promise<void>(resolve => {
    finish = resolve;
  })).mockResolvedValue();
  renderHook(() => useCourseTime({ coursePublicId: 'course', itemPublicId: 'item', enabled: true, activity }));
  await act(() => vi.advanceTimersByTimeAsync(15_000));
  expect(activity).toHaveBeenCalledOnce();
  await act(async () => {
    finish();
    await Promise.resolve();
  });
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(activity).toHaveBeenCalledTimes(2);
  expect(activity.mock.calls[1][2]).toMatchObject({ kind: 1, elapsedSeconds: 20 });
});
