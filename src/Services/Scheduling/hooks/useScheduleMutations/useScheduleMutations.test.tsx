import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useScheduleMutations } from './useScheduleMutations';

const deleteEvent = vi.fn();
const showError = vi.fn();
vi.mock('@/Endpoints', () => ({ scheduleEndpoints: { deleteEvent: (...args: unknown[]) => deleteEvent(...args) }, scheduleEventDtoToEvent: vi.fn() }));
vi.mock('../useSchoolId/useSchoolId', () => ({ useSchoolId: () => 'school' }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: showError }) }));

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

afterEach(() => { cleanup(); onlineManager.setOnline(true); });

it('удаление оффлайн завершает ошибку и освобождает подтверждение для повтора или отмены', async () => {
  onlineManager.setOnline(false);
  deleteEvent.mockRejectedValue(new Error('offline'));
  const { result } = renderHook(() => useScheduleMutations(), { wrapper: createWrapper() });
  act(() => result.current.deleteEvent.mutate('event'));
  await waitFor(() => expect(result.current.deleteEvent.isError).toBe(true));
  expect(result.current.deleteEvent.isPending).toBe(false);
  expect(showError).toHaveBeenCalledTimes(1);
  expect(deleteEvent).toHaveBeenCalledWith('school', 'event');
  onlineManager.setOnline(true);
  expect(deleteEvent).toHaveBeenCalledTimes(1);
});
