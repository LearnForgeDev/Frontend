import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseDto } from '@/Endpoints/courses';
import type { SaveCourseOptions } from '@/Services/Courses/hooks/saveCourse.type';
import { useCourseEditor } from '@/Services/Courses/hooks/useCourseEditor';
import { useCoursePage } from '@/Services/Courses/hooks/useCoursePage';
import { CourseCreationUncertainError } from '@/Services/Courses/hooks/saveCourse.errors';
import { toCourseDetail } from '@/Services/Courses/utils/courseMapping';
import { getLessonOptions, getStudentOptions } from '@/Services/Courses/utils/courseOptions';
import CourseLessonsPanel from '@/Services/Courses/components/CourseLessonsPanel/CourseLessonsPanel';
import CourseStudentsPanel from '@/Services/Courses/components/CourseStudentsPanel/CourseStudentsPanel';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

const mocks = vi.hoisted(() => ({ save: vi.fn(), getLessons: vi.fn(), getStudentsSimple: vi.fn(), getStudentGroups: vi.fn(),
  success: vi.fn(), error: vi.fn(), query: vi.fn(), setItemProgress: vi.fn(), deleteCourse: vi.fn() }));
vi.mock('@/Endpoints', () => ({ lessonsEndpoints: mocks, studentsEndpoints: mocks }));
vi.mock('@/Endpoints/courses', () => ({ coursesEndpoints: mocks }));
vi.mock('@/Services/Courses/hooks/saveCourse', () => ({ saveCourse: mocks.save }));
vi.mock('@/Services/Courses/hooks/useCourseQueries', () => ({ useCourseQuery: mocks.query }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ success: mocks.success, error: mocks.error }) }));

const raw: CourseDto = {
  id: 1, publicId: 'created', title: 'Сохранённый курс', description: null, authorId: 1,
  createdAt: '', updatedAt: '', canManage: true, allowedUserIds: [1], allowedUserPublicIds: ['author'], allowedGroupIds: [],
  items: [{ id: 1, publicId: 'item', position: 0, itemType: 2, title: 'Урок', description: null, file: null,
    lessonId: 1, scheduleEventId: null, homeworkId: null, isRequired: true, availableFromUtc: null, availableUntilUtc: null }],
};
const lesson = { id: '1', publicId: 'lesson', title: 'Тема' };
const clients = new Set<QueryClient>();

function context() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
  clients.add(client);
  const wrapper = ({ children }: PropsWithChildren) => createElement(QueryClientProvider, { client }, createElement(MemoryRouter, { initialEntries: ['/course'] }, children));
  return { client, wrapper };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getLessons.mockResolvedValue([lesson]);
  mocks.getStudentsSimple.mockResolvedValue([{ publicId: 'student', name: 'Ученик' }]);
  mocks.getStudentGroups.mockResolvedValue([{ id: 7, name: 'Группа' }]);
  mocks.save.mockResolvedValue(raw);
  mocks.query.mockReturnValue({ data: toCourseDetail(raw), progressQuery: { isSuccess: true }, rosterQuery: {} });
  useGlobalContext.getState().auth.setUser({ userPublicId: 'author', userName: 'Учитель', jwtToken: 'token', refreshToken: 'refresh', exp: 0, userRoles: [] });
});

afterEach(() => {
  cleanup();
  for (const client of clients) {
    client.clear();
  }
  clients.clear();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Course editor recovery', () => {
  it('preserves entered metadata while option loading fails and recovers through explicit retry', async () => {
    mocks.getLessons.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useCourseEditor('school', vi.fn()), context());
    act(() => result.current.setField('title', 'Название'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    act(() => result.current.submit());
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledWith('Не удалось загрузить уроки и учеников. Попробуйте ещё раз.');
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.studentOptions).toEqual([{ userPublicId: 'student', displayName: 'Ученик' }]));
    expect(result.current.isError).toBe(false);
    expect(result.current.form.title).toBe('Название');
  });

  it('reuses an already created course after a partial save and scopes cache updates to that school', async () => {
    mocks.save.mockImplementationOnce((options: SaveCourseOptions) => {
      options.onCreated(raw);
      return Promise.reject(new Error('program failed'));
    });
    const onSaved = vi.fn();
    const setup = context();
    setup.client.setQueryData(['courses', 'other-school'], ['other-record']);
    const { result } = renderHook(() => useCourseEditor('school', onSaved), setup);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.setField('title', 'Название');
      result.current.setLessons([1]);
      result.current.setStudents(['student']);
      result.current.setGroups([7]);
      result.current.setAccessMode('selected');
    });
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.errorMessage).toBeTruthy());
    expect(result.current.form.lessonIds).toEqual([1]);
    act(() => result.current.submit());
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(mocks.save).toHaveBeenLastCalledWith(expect.objectContaining({ schoolPublicId: 'school', coursePublicId: 'created', authorPublicId: 'author' }));
    expect(setup.client.getQueryData(['courses', 'school', 'created'])).toEqual(raw);
    expect(setup.client.getQueryData(['courses', 'other-school'])).toEqual(['other-record']);
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'created' }));
  });

  it('blocks automatic creation retry when the first outcome is unknown', async () => {
    mocks.save.mockRejectedValue(new CourseCreationUncertainError());
    const { result } = renderHook(() => useCourseEditor('school', vi.fn()), context());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setField('title', 'Название'));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.isSaveBlocked).toBe(true));
    act(() => result.current.setField('description', 'Продолжение'));
    act(() => result.current.submit());
    expect(mocks.save).toHaveBeenCalledOnce();
    expect(result.current.errorMessage).toContain('проверьте список курсов');
  });

  it('preserves assigned options absent from the latest roster and rejects invalid lesson IDs', () => {
    const course = toCourseDetail(raw, undefined, { coursePublicId: 'created', isSchoolWide: false, totalRequiredItemsCount: 1,
      students: [{ publicId: 'former', login: 'Сохранённый ученик', avatarUrl: null, isDirectlyAssigned: true, accessGroupIds: [], progress: null }] });
    expect(getStudentOptions([{ publicId: 'student', name: 'Текущее имя' }, { userPublicId: 'fallback', displayName: 'Имя' }, {}], course)).toEqual([
      expect.objectContaining({ userPublicId: 'former', displayName: 'Сохранённый ученик' }),
      { userPublicId: 'student', displayName: 'Текущее имя' }, { userPublicId: 'fallback', displayName: 'Имя' },
    ]);
    expect(getLessonOptions([lesson, { ...lesson, id: '-1' }, { ...lesson, id: 'not-an-id' }], course)).toEqual([{ lessonId: 1, title: 'Тема' }]);
  });
});

describe('Course audience and lesson controls', () => {
  it('offers management actions only for an empty manager program and opens the selected lesson by ID', () => {
    const onEdit = vi.fn();
    const onOpenLesson = vi.fn();
    const onToggleCompleted = vi.fn();
    const props = { lessons: [], canManage: false, isSavingProgress: false, onOpenLesson, onToggleCompleted, onEdit };
    const view = render(createElement(CourseLessonsPanel, props));
    expect(screen.getByText('Нет доступных уроков')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Добавить уроки' })).toBeNull();
    view.rerender(createElement(CourseLessonsPanel, { ...props, canManage: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Добавить уроки' }));
    expect(onEdit).toHaveBeenCalledOnce();
    const selected = toCourseDetail(raw).lessons;
    view.rerender(createElement(CourseLessonsPanel, { ...props, lessons: selected }));
    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onOpenLesson).toHaveBeenCalledWith(1);
    expect(onToggleCompleted).toHaveBeenCalledWith(selected[0]);
    view.rerender(createElement(CourseLessonsPanel, { ...props, lessons: selected, isSavingProgress: true }));
    expect(screen.getByRole('checkbox')).toHaveProperty('disabled', true);
  });

  it('keeps the assigned-student list separate from its empty state and management action', () => {
    const onEdit = vi.fn();
    const view = render(createElement(CourseStudentsPanel, { students: [], onEdit }));
    fireEvent.click(screen.getByRole('button', { name: 'Добавить учеников' }));
    expect(onEdit).toHaveBeenCalledOnce();
    view.rerender(createElement(CourseStudentsPanel, { students: [{ userPublicId: 'student', displayName: 'Ученик', completedCount: 0, totalCount: 1,
      percentage: 0, isDirectlyAssigned: false, accessLabel: 'Через группу' }], onEdit }));
    expect(screen.getByText('Ученик')).toBeTruthy();
    expect(screen.getByText('Через группу')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Изменить состав' }));
    expect(onEdit).toHaveBeenCalledTimes(2);
  });
});

describe('Course page accepted writes', () => {
  it('removes only the deleted course cache, retains another school and returns to the catalogue', async () => {
    mocks.deleteCourse.mockResolvedValue(undefined);
    const setup = context();
    for (const key of ['courses', 'course-progress', 'course-roster']) {
      setup.client.setQueryData([key, 'school', 'created'], { old: true });
      setup.client.setQueryData([key, 'other-school', 'created'], { retained: true });
    }
    const { result } = renderHook(() => ({ page: useCoursePage('school', 'created'), location: useLocation() }), setup);
    act(() => result.current.page.setDialog('delete'));
    act(() => result.current.page.deleteCourse());
    await waitFor(() => expect(result.current.location.pathname).toBe('/app/schools/school/courses'));
    expect(mocks.deleteCourse).toHaveBeenCalledWith('school', 'created');
    for (const key of ['courses', 'course-progress', 'course-roster']) {
      expect(setup.client.getQueryData([key, 'school', 'created'])).toBeUndefined();
      expect(setup.client.getQueryData([key, 'other-school', 'created'])).toEqual({ retained: true });
    }
    expect(mocks.success).toHaveBeenCalledWith('Курс удалён');
  });

  it('does not write progress before it is known and toggles completion by program-item identity', async () => {
    mocks.setItemProgress.mockResolvedValue({ coursePublicId: 'created' });
    const course = toCourseDetail({ ...raw, canManage: false });
    mocks.query.mockReturnValue({ data: course, progressQuery: { isSuccess: false }, rosterQuery: {} });
    const { result, rerender } = renderHook(() => useCoursePage('school', 'created'), context());
    act(() => result.current.markLesson(course.lessons[0]));
    expect(mocks.setItemProgress).not.toHaveBeenCalled();
    mocks.query.mockReturnValue({ data: course, progressQuery: { isSuccess: true }, rosterQuery: {} });
    rerender();
    act(() => result.current.markLesson(course.lessons[0]));
    await waitFor(() => expect(mocks.setItemProgress).toHaveBeenCalledWith('school', 'created', 'item', 2));
    act(() => result.current.closeDialog());
    expect(result.current.dialog).toBeNull();
  });
});
