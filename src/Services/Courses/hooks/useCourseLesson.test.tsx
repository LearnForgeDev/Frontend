import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCourseLesson } from './useCourseLesson';
import type { CourseDetail } from '@/Endpoints/courses';

const api = vi.hoisted(() => ({
  getCourse: vi.fn(),
  getLessonById: vi.fn(),
  getFileContent: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/Endpoints/courses', () => ({ coursesEndpoints: { getCourse: api.getCourse } }));
vi.mock('@/Endpoints', () => ({
  lessonsEndpoints: { getLessonById: api.getLessonById },
  filesEndpoints: { getFileContent: api.getFileContent },
}));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: api.error }) }));

const course: CourseDetail = {
  publicId: 'course-a', title: 'Алгебра', description: '', lessonCount: 1,
  studentCount: 1, completedLessonCount: 0, canManage: false,
  lessons: [{ lessonId: 7, title: 'Уравнения', position: 0, isCompleted: false }], students: [],
};
const content = { root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 } };

function setup(lessonId = '7') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => useCourseLesson('school-a', 'course-a', lessonId), {
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  api.getCourse.mockResolvedValue(course);
  api.getLessonById.mockResolvedValue({ lessonJsonFile: { publicId: 'file-a' } });
  api.getFileContent.mockResolvedValue(JSON.stringify(content));
});
afterEach(cleanup);

describe('Просмотр урока курса', () => {
  it('не загружает урок, которого нет в назначенном курсе', async () => {
    const { result } = setup('99');
    await waitFor(() => expect(result.current.course).toBeDefined());
    expect(result.current.lesson).toBeUndefined();
    expect(api.getLessonById).not.toHaveBeenCalled();
    expect(api.getFileContent).not.toHaveBeenCalled();
  });

  it('читает серверный JSON урока с проверкой принадлежности курсу', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.content?.editorState).toEqual(content));
    expect(api.getLessonById).toHaveBeenCalledWith('school-a', '7');
    expect(api.getFileContent).toHaveBeenCalledWith('school-a', 'file-a');
  });

  it('завершает загрузку ошибкой при недоступных метаданных', async () => {
    api.getLessonById.mockRejectedValue(new Error('Network Error'));
    const { result } = setup();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(api.getFileContent).not.toHaveBeenCalled();
    expect(api.error).toHaveBeenCalledWith('Не удалось загрузить урок. Попробуйте ещё раз.');
  });

  it('не показывает повреждённое содержимое как пустой урок', async () => {
    api.getFileContent.mockResolvedValue('{"unexpected":true}');
    const { result } = setup();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.content).toBeUndefined();
  });
});
