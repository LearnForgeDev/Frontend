import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { CourseDetail } from '@/Endpoints/courses';
import { useCoursePage } from './useCoursePage';

const api = vi.hoisted(() => ({ getCourse: vi.fn(), setLessonProgress: vi.fn(), error: vi.fn() }));
vi.mock('@/Endpoints/courses', () => ({ coursesEndpoints: api }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: api.error, success: vi.fn() }) }));

const course: CourseDetail = {
  publicId: 'course-a', title: 'Алгебра', description: '', lessonCount: 1,
  studentCount: 1, completedLessonCount: 0, canManage: false,
  lessons: [{ lessonId: 7, title: 'Уравнения', position: 0, isCompleted: false }], students: [],
};

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => useCoursePage('school-a', 'course-a'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>
    ),
  });
}

beforeEach(() => { vi.resetAllMocks(); api.getCourse.mockResolvedValue(course); });
afterEach(cleanup);

describe('Сохранённый прогресс курса', () => {
  it('не увеличивает прогресс при ошибке сервера', async () => {
    api.setLessonProgress.mockRejectedValue(new Error('Network Error'));
    const { result } = setup();
    await waitFor(() => expect(result.current.course).toBeDefined());
    act(() => result.current.markLesson(course.lessons[0]));
    await waitFor(() => expect(result.current.progress.isError).toBe(true));
    expect(result.current.course?.completedLessonCount).toBe(0);
    expect(result.current.course?.lessons[0].isCompleted).toBe(false);
    expect(api.error).toHaveBeenCalled();
  });

  it('показывает новое значение только после подтверждения сервера', async () => {
    let resolveProgress!: (value: CourseDetail) => void;
    api.setLessonProgress.mockImplementation(() => new Promise<CourseDetail>(resolve => { resolveProgress = resolve; }));
    const { result } = setup();
    await waitFor(() => expect(result.current.course).toBeDefined());
    act(() => result.current.markLesson(course.lessons[0]));
    await waitFor(() => expect(result.current.progress.isPending).toBe(true));
    expect(result.current.course?.completedLessonCount).toBe(0);
    const updated = { ...course, completedLessonCount: 1, lessons: [{ ...course.lessons[0], isCompleted: true }] };
    api.getCourse.mockResolvedValue(updated);
    await act(async () => resolveProgress(updated));
    await waitFor(() => expect(result.current.course?.completedLessonCount).toBe(1));
    expect(api.setLessonProgress).toHaveBeenCalledWith('school-a', 'course-a', 7, true);
  });
});
