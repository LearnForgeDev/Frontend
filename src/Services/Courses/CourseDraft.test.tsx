import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { CourseDetail } from '@/Endpoints/courses';
import { AxiosError } from 'axios';
import { HTTP_STATUS } from '@/Endpoints/factory/factory.const';
import CoursePage from './CoursePage';
import CoursesPage from './CoursesPage';

const api = vi.hoisted(() => ({
  getCourse: vi.fn(),
  getCourses: vi.fn(),
  getStudents: vi.fn(),
  getLessons: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock('@/Endpoints/courses', () => ({ coursesEndpoints: api }));
vi.mock('@/Endpoints', () => ({ lessonsEndpoints: { getLessons: api.getLessons } }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: api.error, success: api.success }) }));
vi.mock('@/Services/AppShell/hooks/useCurrentSchool', () => ({ useCurrentSchool: () => ({ capabilities: { canTeach: true } }) }));

const course: CourseDetail = {
  publicId: 'course-a', title: 'Алгебра', description: '', lessonCount: 1,
  studentCount: 0, completedLessonCount: null, canManage: true,
  lessons: [{ lessonId: 7, title: 'Уравнения', position: 0, isCompleted: false }], students: [],
};

function setup(detail = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['courses', 'school-a'], [course]);
  client.setQueryData(['courses', 'school-a', 'course-a'], course);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[detail ? '/app/schools/school-a/courses/course-a' : '/app/schools/school-a/courses']}>
        <Routes>
          <Route path="/app/schools/:schoolPublicId/courses" element={<CoursesPage />} />
          <Route path="/app/schools/:schoolPublicId/courses/:coursePublicId" element={<CoursePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}

beforeEach(() => {
  vi.resetAllMocks();
  api.getCourse.mockResolvedValue(course);
  api.getCourses.mockResolvedValue([course]);
  api.getLessons.mockResolvedValue([{ id: '7', title: 'Уравнения' }]);
  api.getStudents.mockResolvedValue([]);
});
afterEach(cleanup);

describe('Черновик курса при обновлении данных', () => {
  it('сохраняет открытую форму при ошибке фонового обновления курса', async () => {
    const client = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Настройки' }));
    const title = await screen.findByRole('textbox', { name: /Название курса/ });
    fireEvent.change(title, { target: { value: 'Новый заголовок' } });
    api.getCourse.mockRejectedValue(new Error('Network Error'));
    await act(async () => { await client.refetchQueries({ queryKey: ['courses', 'school-a', 'course-a'], exact: true }); });
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Название курса/ }).getAttribute('value')).toBe('Новый заголовок'));
    expect(screen.getByText('Не удалось обновить курс. Показываем сохранённые данные.')).toBeDefined();
  });

  it('сохраняет форму создания при ошибке обновления списка', async () => {
    const client = setup(false);
    fireEvent.click(screen.getByRole('button', { name: 'Создать курс' }));
    const title = await screen.findByRole('textbox', { name: /Название курса/ });
    fireEvent.change(title, { target: { value: 'Новый курс' } });
    api.getCourses.mockRejectedValue(new Error('Network Error'));
    await act(async () => { await client.refetchQueries({ queryKey: ['courses', 'school-a'], exact: true }); });
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Название курса/ }).getAttribute('value')).toBe('Новый курс'));
    expect(screen.getByText('Не удалось обновить курсы. Показываем сохранённые данные.')).toBeDefined();
  });

  it('закрывает форму при отзыве права управления в свежем ответе', async () => {
    const client = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Настройки' }));
    await screen.findByRole('textbox', { name: /Название курса/ });
    api.getCourse.mockResolvedValue({ ...course, canManage: false });
    await act(async () => { await client.refetchQueries({ queryKey: ['courses', 'school-a', 'course-a'], exact: true }); });
    await waitFor(() => expect(screen.queryByRole('textbox', { name: /Название курса/ })).toBeNull());
    expect(screen.queryByRole('button', { name: 'Настройки' })).toBeNull();
  });

  it('скрывает сохранённый курс и редактор после запрета доступа', async () => {
    const client = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Настройки' }));
    await screen.findByRole('textbox', { name: /Название курса/ });
    const error = new AxiosError('Forbidden');
    error.status = HTTP_STATUS.FORBIDDEN;
    api.getCourse.mockRejectedValue(error);
    await act(async () => { await client.refetchQueries({ queryKey: ['courses', 'school-a', 'course-a'], exact: true }); });
    await waitFor(() => expect(screen.queryByRole('textbox', { name: /Название курса/ })).toBeNull());
    expect(screen.queryByText('Алгебра')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Настройки' })).toBeNull();
    expect(screen.getByText('Не удалось открыть курс')).toBeDefined();
  });

  it('скрывает сохранённый список и форму создания после запрета доступа', async () => {
    const client = setup(false);
    fireEvent.click(screen.getByRole('button', { name: 'Создать курс' }));
    await screen.findByRole('textbox', { name: /Название курса/ });
    const error = new AxiosError('Forbidden');
    error.status = HTTP_STATUS.FORBIDDEN;
    api.getCourses.mockRejectedValue(error);
    await act(async () => { await client.refetchQueries({ queryKey: ['courses', 'school-a'], exact: true }); });
    await waitFor(() => expect(screen.queryByRole('textbox', { name: /Название курса/ })).toBeNull());
    expect(screen.queryByText('Алгебра')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Создать курс' })).toBeNull();
    expect(screen.getByText('Курсы сейчас недоступны')).toBeDefined();
  });
});
