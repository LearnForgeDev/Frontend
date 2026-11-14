import { createElement } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import RenameLessonDialog from '@/Services/Lessons/components/RenameLessonDialog/RenameLessonDialog';
import { useRenameLesson } from '@/Services/Lessons/hooks/useRenameLesson';
import type { UpdateLessonRequest } from '@/Endpoints/lessons/types';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.type';

const endpoints = vi.hoisted(() => ({ update: vi.fn<(school: string, id: string, request: UpdateLessonRequest) => Promise<Lesson>>(), success: vi.fn(), error: vi.fn() }));
vi.mock('@/Endpoints', () => ({ lessonsEndpoints: { updateLesson: endpoints.update } }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => endpoints }));
const lesson = { id: 'lesson', publicId: 'lesson', title: 'Исходный урок' };
const clients = new Set<QueryClient>();

function queryClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  clients.add(client);
  return client;
}

beforeEach(() => vi.resetAllMocks());
afterEach(() => {
  cleanup();
  clients.forEach(client => client.clear());
  clients.clear();
});

it('validates a blank title, retains an unsuccessful edit and retries the trimmed value', async () => {
  const onClose = vi.fn();
  const client = queryClient();
  client.setQueryData(['lessons', 'school'], [lesson]);
  client.setQueryData(['lessons', 'other-school'], [lesson]);
  render(createElement(QueryClientProvider, { client }, createElement(RenameLessonDialog, { schoolPublicId: 'school', lesson, onClose })));
  const input = screen.getByRole('textbox', { name: 'Название урока' });
  fireEvent.change(input, { target: { value: '   ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить название' }));
  expect(await screen.findByText('Введите название урока')).toBeTruthy();
  expect(endpoints.update).not.toHaveBeenCalled();
  endpoints.update.mockRejectedValueOnce(new Error('offline'));
  fireEvent.change(input, { target: { value: '  Новый урок  ' } });
  expect(screen.queryByText('Введите название урока')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить название' }));
  expect(await screen.findByText('Не удалось сохранить название. Попробуйте ещё раз.')).toBeTruthy();
  expect(input).toHaveProperty('value', '  Новый урок  ');
  expect(endpoints.error).toHaveBeenCalledWith('Не удалось сохранить название урока.');
  expect(onClose).not.toHaveBeenCalled();
  endpoints.update.mockResolvedValueOnce({ ...lesson, title: 'Новый урок' });
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить название' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(endpoints.update).toHaveBeenLastCalledWith('school', 'lesson', { title: 'Новый урок' });
  expect(endpoints.success).toHaveBeenCalledWith('Название сохранено');
  expect(client.getQueryData(['lesson', 'school', 'lesson'])).toMatchObject({ title: 'Новый урок' });
  expect(client.getQueryData(['lessons', 'school'])).toEqual([{ ...lesson, title: 'Новый урок' }]);
  expect(client.getQueryData(['lessons', 'other-school'])).toEqual([lesson]);
});

it('blocks duplicate submit and close while saving, then permits close after failure', async () => {
  let rejectSave: (reason: Error) => void = () => {
    throw new Error('Saving has not started');
  };
  endpoints.update.mockImplementation(() => new Promise((_resolve, reject) => {
    rejectSave = reject;
  }));
  const client = queryClient();
  const onClose = vi.fn();
  const { result } = renderHook(() => useRenameLesson('school', lesson, onClose), {
    wrapper: ({ children }) => createElement(QueryClientProvider, { client }, children),
  });
  let pending: Promise<void> | undefined;
  act(() => {
    pending = result.current.submit();
  });
  await waitFor(() => expect(result.current.isSaving).toBe(true));
  await act(async () => result.current.submit());
  act(() => result.current.close());
  expect(endpoints.update).toHaveBeenCalledOnce();
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => {
    rejectSave(new Error('offline'));
    await pending;
  });
  await waitFor(() => expect(result.current.isSaving).toBe(false));
  act(() => result.current.close());
  expect(onClose).toHaveBeenCalledOnce();
});
