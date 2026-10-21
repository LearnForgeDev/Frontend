import { act, cleanup, fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiFile } from '@/Endpoints';
import { useFilePreview } from './useFilePreview';
import { usePreviewMedia } from './usePreviewMedia';

const mocks = vi.hoisted(() => ({ getFileBlob: vi.fn(), toast: vi.fn() }));
vi.mock('@/Endpoints', () => ({ filesEndpoints: { getFileBlob: mocks.getFileBlob } }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: mocks.toast }) }));

function makeFile(id: string, extension = 'txt'): ApiFile {
  return { publicId: id, fileName: `${id}.${extension}`, sizeBytes: 1, uploadedAt: '', storageKey: id };
}

function makeBlob(text: string): Blob {
  return Object.assign(new Blob([text]), {
    text: async () => text,
    slice: () => Object.assign(new Blob([text]), { text: async () => text.slice(0, '%PDF-'.length) }),
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function PreviewHarness({ blob }: { blob: Blob }) {
  const { mediaRef, isLoading, onLoad } = usePreviewMedia<HTMLImageElement>(blob);
  return <img ref={mediaRef} alt="Фото" aria-busy={isLoading} onLoad={onLoad} />;
}

beforeEach(() => {
  mocks.getFileBlob.mockReset();
  mocks.toast.mockReset();
});

afterEach(() => cleanup());

describe('Запрос предпросмотра', () => {
  it('запоздалый ответ A не заменяет содержимое B', async () => {
    const first = deferred<Blob>();
    const second = deferred<Blob>();
    mocks.getFileBlob.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result, rerender } = renderHook(({ file }) => useFilePreview('school', file), {
      wrapper: makeWrapper(), initialProps: { file: makeFile('a') },
    });
    const signal = mocks.getFileBlob.mock.calls[0][2] as AbortSignal;
    rerender({ file: makeFile('b') });
    expect(signal.aborted).toBe(true);
    await act(async () => second.resolve(makeBlob('B')));
    await waitFor(() => expect(result.current.data?.text).toBe('B'));
    await act(async () => first.resolve(makeBlob('A')));
    expect(result.current.data?.text).toBe('B');
    expect(mocks.toast).not.toHaveBeenCalled();
  });

  it('повторное открытие того же файла не получает ответ закрытого просмотра', async () => {
    const first = deferred<Blob>();
    const second = deferred<Blob>();
    mocks.getFileBlob.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const wrapper = makeWrapper();
    const original = renderHook(() => useFilePreview('school', makeFile('a')), { wrapper });
    const signal = mocks.getFileBlob.mock.calls[0][2] as AbortSignal;
    original.unmount();
    const reopened = renderHook(() => useFilePreview('school', makeFile('a')), { wrapper });
    expect(signal.aborted).toBe(true);
    await act(async () => second.resolve(makeBlob('Новое')));
    await waitFor(() => expect(reopened.result.current.data?.text).toBe('Новое'));
    await act(async () => first.resolve(makeBlob('Старое')));
    expect(reopened.result.current.data?.text).toBe('Новое');
  });

  it.each(['txt', 'png', 'pdf'])('даёт повтор после ошибки загрузки %s', async (extension) => {
    mocks.getFileBlob.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(makeBlob('%PDF-test'));
    const { result } = renderHook(() => useFilePreview('school', makeFile('a', extension)), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mocks.toast).toHaveBeenCalledOnce();
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.isError).toBe(false);
    expect(mocks.getFileBlob).toHaveBeenCalledTimes(2);
  });

  it('не загружает формат без предпросмотра', () => {
    const { result } = renderHook(() => useFilePreview('school', makeFile('a', 'zip')), { wrapper: makeWrapper() });
    expect(result.current.supported).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(mocks.getFileBlob).not.toHaveBeenCalled();
  });

  it('не открывает ответ с чужим содержимым как PDF', async () => {
    mocks.getFileBlob.mockResolvedValue(makeBlob('<html>Ошибка</html>'));
    const { result } = renderHook(() => useFilePreview('school', makeFile('a', 'pdf')), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('Ресурс изображения', () => {
  it('освобождает все созданные URL в StrictMode', () => {
    const create = vi.fn(() => `blob:preview-${Math.random()}`);
    const revoke = vi.fn();
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = create;
      static revokeObjectURL = revoke;
    });
    const view = render(<StrictMode><PreviewHarness blob={makeBlob('image')} /></StrictMode>);
    expect(view.getByAltText('Фото').getAttribute('aria-busy')).toBe('true');
    fireEvent.load(view.getByAltText('Фото'));
    expect(view.getByAltText('Фото').getAttribute('aria-busy')).toBe('false');
    view.unmount();
    expect(revoke.mock.calls.map(([url]) => url).sort()).toEqual(create.mock.results.map(({ value }) => value).sort());
    vi.unstubAllGlobals();
  });
});
