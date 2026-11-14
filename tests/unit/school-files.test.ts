import { createElement } from 'react';
import type { ReactNode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ApiFile } from '@/Endpoints';
import { REQUEST_ERROR_MESSAGES } from '@/Endpoints/factory/factory.const';
import { useFiles } from '@/Services/Schools/FilesPage/hooks/useFiles';
import FilesList from '@/Services/Schools/FilesPage/components/FilesList';

const mocks = vi.hoisted(() => ({ listFiles: vi.fn() }));
vi.mock('@/Endpoints', () => ({ filesEndpoints: mocks }));

function denied() {
  const error = new AxiosError('forbidden');
  error.status = 403;
  return error;
}

function makeScope() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client }, children);
  return { client, wrapper };
}

function renderList(state: Pick<ReturnType<typeof useFiles>, 'files' | 'isLoading' | 'isError' | 'isSuccess' | 'errorMessage' | 'retryFiles'>) {
  return render(createElement(FilesList, {
    ...state, search: '', viewMode: 'grid', handleOpenPreview: vi.fn(),
    handleDownloadFile: vi.fn(), setDeleteConfirmFile: vi.fn(),
  }));
}

beforeEach(() => {
  mocks.listFiles.mockReset();
});
afterEach(() => cleanup());

it('does not show a disabled cached failure or report an idle list as empty', async () => {
  const { client, wrapper } = makeScope();
  await client.fetchQuery({ queryKey: ['files', '', 'files'], queryFn: async () => {
    throw denied();
  } }).catch(() => undefined);
  const { result } = renderHook(() => useFiles(''), { wrapper });
  expect(mocks.listFiles).not.toHaveBeenCalled();
  expect(result.current.isError).toBe(false);
  expect(result.current.isSuccess).toBe(false);
  renderList(result.current);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByText('Файлы не найдены')).toBeNull();
});

it('reports denied access separately from connection failure and retries the same scope explicitly', async () => {
  mocks.listFiles.mockRejectedValueOnce(denied()).mockResolvedValueOnce([]);
  const { wrapper } = makeScope();
  const { result } = renderHook(() => useFiles('school', 'files'), { wrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.errorMessage).toBe(REQUEST_ERROR_MESSAGES.forbidden);
  const view = renderList(result.current);
  expect(screen.getByRole('alert').textContent).toContain(REQUEST_ERROR_MESSAGES.forbidden);
  expect(screen.queryByText(/Проверьте соединение/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocks.listFiles.mock.calls).toEqual([['school', 'files'], ['school', 'files']]);
  view.unmount();
  renderList(result.current);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByText('Файлы не найдены')).toBeTruthy();
});

it('reports an actual transport failure only after the request fails', async () => {
  let reject: (error: AxiosError) => void = () => undefined;
  mocks.listFiles.mockImplementation(() => new Promise((_resolve, fail) => {
    reject = fail;
  }));
  const { wrapper } = makeScope();
  const { result } = renderHook(() => useFiles('school'), { wrapper });
  expect(result.current.isLoading).toBe(true);
  expect(result.current.errorMessage).toBeNull();
  renderList(result.current);
  expect(screen.getByRole('status', { name: 'Загружаем файлы' })).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  await act(async () => reject(new AxiosError('Network Error', 'ERR_NETWORK')));
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.errorMessage).toBe(REQUEST_ERROR_MESSAGES.unavailable);
});

it('shows loading instead of a cached error while a real retry is pending', async () => {
  const { wrapper } = makeScope();
  mocks.listFiles.mockRejectedValueOnce(denied());
  const first = renderHook(() => useFiles('school'), { wrapper });
  await waitFor(() => expect(first.result.current.isError).toBe(true));
  let resolve: (files: ApiFile[]) => void = () => undefined;
  mocks.listFiles.mockImplementation(() => new Promise<ApiFile[]>(done => {
    resolve = done;
  }));
  act(() => first.result.current.retryFiles());
  await waitFor(() => expect(first.result.current.isLoading).toBe(true));
  expect(first.result.current.isError).toBe(false);
  expect(first.result.current.errorMessage).toBeNull();
  await act(async () => resolve([]));
  await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
});
