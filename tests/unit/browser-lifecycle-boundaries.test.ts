import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTodayClock } from '@/Services/Today/hooks/useTodayClock/useTodayClock';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.doUnmock('@/Assets/Components/GlobalToastContainer/GlobalToastContainer');
});

it('refreshes today immediately when a suspended tab becomes visible', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-14T10:00:00Z'));
  let visibility: DocumentVisibilityState = 'hidden';
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
  const { result } = renderHook(() => useTodayClock([]));
  const original = result.current.getTime();
  vi.setSystemTime(new Date('2026-11-14T10:15:00Z'));
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(result.current.getTime()).toBe(original);
  visibility = 'visible';
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(result.current.toISOString()).toBe('2026-11-14T10:15:00.000Z');
});

it('reports unavailable toast rendering and still expires queued notifications', async () => {
  const failure = new Error('The notification renderer failed to load.');
  vi.doMock('@/Assets/Components/GlobalToastContainer/GlobalToastContainer', () => {
    throw failure;
  });
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { ToastSeverity, useToast, useToastStore } = await import('@/Storage/useToastStore');
  await waitFor(() => expect(log).toHaveBeenCalledWith('Failed to load the toast container', expect.any(Error)));
  vi.useFakeTimers();
  const { result } = renderHook(useToast);
  act(() => {
    result.current.success('Урок сохранён');
    result.current.error('Не удалось отправить сообщение');
  });
  expect(useToastStore.getState().toasts.map(toast => toast.severity)).toEqual([ToastSeverity.SUCCESS, ToastSeverity.ERROR]);
  act(() => {
    vi.advanceTimersByTime(4999);
  });
  expect(useToastStore.getState().toasts.every(toast => toast.visible)).toBe(true);
  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(useToastStore.getState().toasts.every(toast => !toast.visible)).toBe(true);
  act(() => {
    vi.advanceTimersByTime(500);
  });
  expect(useToastStore.getState().toasts).toEqual([]);
});
