import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useCreateChatCallInvite } from './useCreateChatCallInvite';

const getMeetToken = vi.fn();
const showError = vi.fn();
vi.mock('@/Endpoints', () => ({ meetEndpoints: { getMeetToken: (...args: unknown[]) => getMeetToken(...args) } }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: showError }) }));
vi.mock('@/Storage/globalNotificationStore', () => ({ useGlobalNotificationStore: () => vi.fn() }));

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

afterEach(() => { cleanup(); onlineManager.setOnline(true); vi.clearAllMocks(); });

it('ошибка оффлайн завершает создание приглашения и не отправляет его после возвращения сети', async () => {
  onlineManager.setOnline(false);
  getMeetToken.mockRejectedValue(new Error('offline'));
  const sendMessage = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useCreateChatCallInvite({
    thread: { id: 'chat', type: 'branch', name: 'Группа', schoolPublicId: 'school' }, sendMessage,
  }), { wrapper: createWrapper() });
  act(() => result.current.createCallInvite());
  await waitFor(() => expect(showError).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(getMeetToken).toHaveBeenCalledTimes(1);
  expect(sendMessage).not.toHaveBeenCalled();
  onlineManager.setOnline(true);
  expect(getMeetToken).toHaveBeenCalledTimes(1);
});
