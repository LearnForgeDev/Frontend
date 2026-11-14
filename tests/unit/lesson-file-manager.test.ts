import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.type';
import { LessonsProvider } from '@/Services/Lessons/components/LessonsProvider/LessonsProvider';
import { useLessonsContext } from '@/Storage/LessonsContext/LessonsContext';
import FileManager from '@/Services/Lessons/components/FileManager/FileManager';

const endpoints = vi.hoisted(() => ({ getLessons: vi.fn(), createLesson: vi.fn(), deleteLesson: vi.fn(), upload: vi.fn(), notify: vi.fn() }));
vi.mock('@/Endpoints', () => ({
  lessonsEndpoints: endpoints,
  filesEndpoints: { uploadFileMultipart: endpoints.upload },
}));
vi.mock('@/Assets/Hooks/useNotification/useNotification', () => ({ useNotification: () => ({ createNotification: endpoints.notify }) }));
const clients = new Set<QueryClient>();
let lessons: Lesson[];

function ContextState() {
  const { selectedItemId, search, view } = useLessonsContext();
  return createElement('output', { 'data-testid': 'lesson-state' }, JSON.stringify({ selectedItemId, search, view }));
}

function renderManager() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.add(client);
  const onOpenLesson = vi.fn();
  render(createElement(QueryClientProvider, { client }, createElement(MemoryRouter, { initialEntries: ['/app/schools/school/lessons'] },
    createElement(Routes, null, createElement(Route, {
      path: '/app/schools/:schoolPublicId/lessons',
      element: createElement(LessonsProvider, null, createElement(ContextState), createElement(FileManager, { onOpenLesson })),
    })),
  )));
  return { onOpenLesson };
}

function managerRoot(): HTMLElement {
  const root = screen.getByRole('grid', { name: 'Список файлов' }).parentElement;
  if (!root) {
    throw new Error('The lesson manager root is missing');
  }
  return root;
}

beforeEach(() => {
  vi.resetAllMocks();
  lessons = [
    { id: 'algebra', publicId: 'algebra', title: 'Алгебра' },
    { id: 'geometry', publicId: 'geometry', title: 'Геометрия' },
  ];
  endpoints.getLessons.mockImplementation(async () => lessons);
  endpoints.deleteLesson.mockImplementation(async (_school: string, id: string) => {
    lessons = lessons.filter(lesson => lesson.id !== id);
  });
  endpoints.upload.mockResolvedValue({ publicId: 'uploaded' });
  endpoints.createLesson.mockResolvedValue({ id: 'created', publicId: 'created', title: 'Новый урок' });
});

afterEach(() => {
  cleanup();
  clients.forEach(client => client.clear());
  clients.clear();
});

it('keeps keyboard selection, opening and deletion scoped to the active school', async () => {
  const callbacks = renderManager();
  await screen.findByRole('button', { name: 'Урок: Алгебра' });
  const root = managerRoot();
  fireEvent.keyDown(root, { key: 'ArrowRight' });
  expect(screen.getByTestId('lesson-state').textContent).toContain('algebra');
  fireEvent.keyDown(root, { key: 'ArrowDown' });
  expect(screen.getByTestId('lesson-state').textContent).toContain('algebra');
  fireEvent.keyDown(root, { key: 'ArrowRight' });
  expect(screen.getByTestId('lesson-state').textContent).toContain('geometry');
  fireEvent.keyDown(root, { key: 'Enter' });
  expect(callbacks.onOpenLesson).toHaveBeenCalledWith('geometry', 'Геометрия');
  fireEvent.keyDown(root, { key: 'Delete' });
  expect(screen.getByText('Удалить элемент?')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /^Удалить$/ }));
  await waitFor(() => expect(endpoints.deleteLesson).toHaveBeenCalledWith('school', 'geometry'));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Урок: Геометрия' })).toBeNull());
  expect(screen.getByTestId('lesson-state').textContent).toContain('"selectedItemId":null');
});

it('debounces search, clears it with Escape and preserves opening in list view', async () => {
  const callbacks = renderManager();
  await screen.findByRole('button', { name: 'Урок: Алгебра' });
  fireEvent.change(screen.getByPlaceholderText('Поиск уроков...'), { target: { value: 'АЛГ' } });
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Урок: Геометрия' })).toBeNull());
  expect(screen.getByTestId('lesson-state').textContent).toContain('АЛГ');
  fireEvent.keyDown(managerRoot(), { key: 'Escape' });
  await screen.findByRole('button', { name: 'Урок: Геометрия' });
  expect(screen.getByPlaceholderText('Поиск уроков...')).toHaveProperty('value', '');
  fireEvent.click(screen.getByRole('button', { name: /^Список$/ }));
  fireEvent.doubleClick(screen.getByRole('button', { name: 'Урок: Алгебра, статус: черновик' }));
  expect(callbacks.onOpenLesson).toHaveBeenCalledWith('algebra', 'Алгебра');
  fireEvent.click(screen.getByRole('button', { name: 'Сортировка по возрастанию' }));
  expect(screen.getByRole('button', { name: 'Сортировка по убыванию' })).toBeTruthy();
});

it('uploads supported dropped files sequentially and refreshes only after their completion', async () => {
  renderManager();
  await screen.findByRole('button', { name: 'Урок: Алгебра' });
  const image = new File(['image'], 'image.PNG', { type: 'image/png' });
  const document = new File(['document'], 'lesson.docx');
  fireEvent.drop(managerRoot(), { dataTransfer: { files: [image, new File(['ignored'], 'program.exe'), document] } });
  await waitFor(() => expect(endpoints.upload).toHaveBeenCalledTimes(2));
  expect(endpoints.upload).toHaveBeenNthCalledWith(1, 'school', image, undefined, undefined, 'lessons');
  expect(endpoints.upload).toHaveBeenNthCalledWith(2, 'school', document, undefined, undefined, 'lessons');
  await waitFor(() => expect(endpoints.getLessons).toHaveBeenCalledTimes(2));
  expect(screen.queryByText('Загрузка файлов...')).toBeNull();
  fireEvent.drop(managerRoot(), { dataTransfer: { files: [] } });
  expect(endpoints.upload).toHaveBeenCalledTimes(2);
});

it('recovers a failed list through retry and leaves failed uploads out of the confirmed list', async () => {
  endpoints.getLessons.mockRejectedValueOnce(new Error('offline'));
  renderManager();
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  await screen.findByRole('button', { name: 'Урок: Алгебра' });
  endpoints.upload.mockRejectedValueOnce(new Error('storage failed'));
  fireEvent.drop(managerRoot(), { dataTransfer: { files: [new File(['data'], 'failed.pdf')] } });
  await waitFor(() => expect(endpoints.upload).toHaveBeenCalledOnce());
  await waitFor(() => expect(screen.queryByText('Загрузка файлов...')).toBeNull());
  expect(endpoints.getLessons).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('button', { name: 'Урок: Алгебра' })).toBeTruthy();
});

it('creates a lesson only after its initial document is uploaded and opens the server identity', async () => {
  const callbacks = renderManager();
  await screen.findByRole('button', { name: 'Урок: Алгебра' });
  fireEvent.click(screen.getByRole('button', { name: 'Создать новый урок' }));
  await waitFor(() => expect(callbacks.onOpenLesson).toHaveBeenCalledWith('created', 'Новый урок'));
  expect(endpoints.createLesson).toHaveBeenCalledWith('school', { title: 'Новый урок', description: '', lessonJsonFilePublicId: 'uploaded' });
  expect(endpoints.upload.mock.invocationCallOrder[0]).toBeLessThan(endpoints.createLesson.mock.invocationCallOrder[0] ?? 0);
  expect(endpoints.notify).toHaveBeenCalledWith('Урок успешно создан', undefined, 'success');
});
