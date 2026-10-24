import type { ReactNode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { saveCourse } from './saveCourse';
import { useCourseEditor } from './useCourseEditor';

vi.mock('./saveCourse', () => ({ saveCourse: vi.fn() }));

afterEach(() => { cleanup(); onlineManager.setOnline(true); });

it('снимает блокировку сохранения без сети и оставляет заполненную форму', async () => {
  const client = new QueryClient();
  client.setQueryData(['course-editor-options', 'school'], { lessons: [], students: [], groups: [] });
  vi.mocked(saveCourse).mockRejectedValueOnce(new Error('Сеть недоступна'));
  onlineManager.setOnline(false);
  const onSaved = vi.fn();
  const { result } = renderHook(() => useCourseEditor('school', onSaved), {
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  act(() => result.current.setField('title', 'Мой курс'));
  act(() => result.current.submit());
  await waitFor(() => expect(saveCourse).toHaveBeenCalledOnce());
  await waitFor(() => expect(result.current.isSaving).toBe(false));
  expect(result.current.errorMessage).toBeTruthy();
  expect(result.current.form.title).toBe('Мой курс');
  expect(onSaved).not.toHaveBeenCalled();
  client.clear();
});
