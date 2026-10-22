import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ReactNode } from 'react';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { SCHOOL_REQUEST_POLLING_INTERVAL_MS } from '../onboarding.const';
import { useSchoolRequestStatus } from './useSchoolRequestStatus';

vi.mock('@/Endpoints/auth/auth.endpoints', () => ({
  authEndpoints: { getSchoolRequestStatus: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.resetAllMocks();
  focusManager.setFocused(undefined);
});

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

describe('Опрос заявки', () => {
  it('останавливает автоматические запросы после отказа в доступе', async () => {
    vi.useFakeTimers();
    focusManager.setFocused(true);
    const error = new AxiosError('Нет доступа');
    error.status = 403;
    vi.mocked(authEndpoints.getSchoolRequestStatus).mockRejectedValue(error);
    const { result } = renderHook(() => useSchoolRequestStatus('foreign-request'), { wrapper });
    await act(() => vi.advanceTimersByTimeAsync(SCHOOL_REQUEST_POLLING_INTERVAL_MS * 3));
    expect(authEndpoints.getSchoolRequestStatus).toHaveBeenCalledTimes(1);
    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('обновляет ожидающую заявку без повторного начального экрана загрузки', async () => {
    vi.useFakeTimers();
    focusManager.setFocused(true);
    vi.mocked(authEndpoints.getSchoolRequestStatus).mockResolvedValue({
      requestPublicId: 'own-request', status: 'Pending',
    });
    const { result } = renderHook(() => useSchoolRequestStatus('own-request'), { wrapper });
    await act(() => vi.advanceTimersByTimeAsync(SCHOOL_REQUEST_POLLING_INTERVAL_MS));
    expect(authEndpoints.getSchoolRequestStatus).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.status).toBe('Pending');
  });
});
