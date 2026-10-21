import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatMessages } from './useChatMessages';

const invoke = vi.fn();
const connection = { invoke, on: vi.fn(), off: vi.fn() };
let status = 'connected';
vi.mock('@/Assets/Hooks/useSignalR/chatHub', () => ({ useChatHubConnection: () => ({ connection, status }) }));
vi.mock('@/Storage/useGlobalContext/useGlobalContext', () => ({ useGlobalContext: (selector: (state: unknown) => unknown) => selector({ auth: { user: { userPublicId: 'me', userName: 'Я' } } }) }));
vi.mock('@/Endpoints', () => ({ chatEndpoints: { getBranchHistory: vi.fn().mockResolvedValue([]), getDirectHistory: vi.fn().mockResolvedValue([]) }, filesEndpoints: { getFileUrl: vi.fn() } }));

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => { vi.clearAllMocks(); status = 'connected'; invoke.mockResolvedValue(undefined); });
afterEach(cleanup);

describe('Подтверждение отправки SignalR', () => {
  it('возвращает ошибку сервера вызывающей форме', async () => {
    invoke.mockRejectedValue(new Error('server rejected'));
    const { result } = renderHook(() => useChatMessages({ type: 'branch', schoolPublicId: 'school', threadId: 'chat' }), { wrapper: createWrapper() });
    await act(async () => { await expect(result.current.sendMessage('Текст', ['file'])).rejects.toThrow('server rejected'); });
    expect(invoke).toHaveBeenCalledWith('SendMessageToBreanch', 'school', 'chat', 'Текст', ['file']);
  });

  it('не считает отключённое соединение успешной отправкой', async () => {
    status = 'disconnected';
    const { result } = renderHook(() => useChatMessages({ type: 'direct', schoolPublicId: 'school', threadId: 'person' }), { wrapper: createWrapper() });
    await act(async () => { await expect(result.current.sendMessage('Текст')).rejects.toThrow('Нет соединения'); });
    expect(invoke).not.toHaveBeenCalled();
  });

  it('ожидает подтверждение invoke для личного сообщения', async () => {
    let resolve!: () => void;
    invoke.mockReturnValue(new Promise<void>(done => { resolve = done; }));
    const { result } = renderHook(() => useChatMessages({ type: 'direct', schoolPublicId: 'school', threadId: 'person' }), { wrapper: createWrapper() });
    let completed = false;
    act(() => { void result.current.sendMessage('Текст').then(() => { completed = true; }); });
    await waitFor(() => expect(invoke).toHaveBeenCalledWith('SendMessageToDirect', 'school', 'person', 'Текст', []));
    expect(completed).toBe(false);
    await act(async () => resolve());
    expect(completed).toBe(true);
  });
});
