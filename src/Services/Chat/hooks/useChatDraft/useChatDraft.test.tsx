import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChatDraft } from './useChatDraft';

vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: vi.fn() }) }));
const file = { publicId: 'file-a', fileName: 'Задание.pdf' };

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

afterEach(cleanup);

describe('Черновик сообщения', () => {
  it('ошибка сохраняет текст и вложения, повтор очищает их только после подтверждения', async () => {
    const request = deferred();
    const send = vi.fn().mockReturnValueOnce(request.promise).mockResolvedValue(undefined);
    const { result } = renderHook(() => useChatDraft({ draftKey: 'school:branch:a', onSendMessage: send }), { wrapper: createWrapper() });
    act(() => { result.current.setText('  Домашнее задание  '); result.current.selectFiles([file]); });
    act(() => result.current.submit());
    await waitFor(() => expect(send).toHaveBeenCalledWith('Домашнее задание', ['file-a']));
    expect(result.current.text).toBe('  Домашнее задание  ');
    expect(result.current.files).toHaveLength(1);
    await act(async () => request.reject(new Error('network')));
    await waitFor(() => expect(result.current.error).toContain('Не удалось отправить'));
    expect(result.current.text).toBe('  Домашнее задание  ');
    expect(result.current.files).toHaveLength(1);
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.text).toBe(''));
    expect(result.current.files).toEqual([]);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('быстрые повторные действия создают один запрос', async () => {
    const request = deferred();
    const send = vi.fn(() => request.promise);
    const { result } = renderHook(() => useChatDraft({ draftKey: 'a', onSendMessage: send }), { wrapper: createWrapper() });
    act(() => result.current.setText('Сообщение'));
    act(() => { result.current.submit(); result.current.submit(); result.current.submit(); });
    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    await act(async () => request.resolve());
  });

  it('подтверждение не стирает новый текст и повторно прикреплённый файл', async () => {
    const request = deferred();
    const send = vi.fn(() => request.promise);
    const { result } = renderHook(() => useChatDraft({ draftKey: 'a', onSendMessage: send }), { wrapper: createWrapper() });
    act(() => { result.current.setText('Первое'); result.current.selectFiles([file]); });
    act(() => result.current.submit());
    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    const selectionId = result.current.files[0].selectionId;
    act(() => { result.current.setText('Следующее'); result.current.removeFile(selectionId); });
    act(() => result.current.selectFiles([file, { publicId: 'file-b', fileName: 'Ответ.pdf' }]));
    await act(async () => request.resolve());
    await waitFor(() => expect(result.current.isSending).toBe(false));
    expect(result.current.text).toBe('Следующее');
    expect(result.current.files.map(item => item.publicId)).toEqual(['file-a', 'file-b']);
  });

  it('завершение запроса предыдущего диалога не очищает текущий черновик', async () => {
    const request = deferred();
    const send = vi.fn(() => request.promise);
    const { result, rerender } = renderHook(({ key }) => useChatDraft({ draftKey: key, onSendMessage: send }), { initialProps: { key: 'a' }, wrapper: createWrapper() });
    act(() => result.current.setText('Для Анны'));
    act(() => result.current.submit());
    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    rerender({ key: 'b' });
    act(() => result.current.setText('Для Ивана'));
    await act(async () => request.resolve());
    await waitFor(() => expect(result.current.isSending).toBe(false));
    expect(result.current.text).toBe('Для Ивана');
    rerender({ key: 'a' });
    expect(result.current.text).toBe('');
  });

  it('без соединения сохраняет редактируемый черновик и не отправляет', () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useChatDraft({ draftKey: 'a', onSendMessage: send, disabled: true }), { wrapper: createWrapper() });
    act(() => result.current.setText('Оффлайн'));
    act(() => result.current.submit());
    expect(send).not.toHaveBeenCalled();
    expect(result.current.text).toBe('Оффлайн');
  });
});
