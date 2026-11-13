import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseDto, CourseItemDto, CourseProgressDto } from '@/Endpoints/courses';
import type { CourseInput } from '@/Services/Courses/Courses.type';
import { saveCourse } from '@/Services/Courses/hooks/saveCourse';
import { CourseCreationUncertainError } from '@/Services/Courses/hooks/saveCourse.errors';
import { useCourseQuery, useCoursesQuery } from '@/Services/Courses/hooks/useCourseQueries';
import { courseFormReducer, createCourseForm, getCourseInput } from '@/Services/Courses/hooks/courseFormReducer';
import { toCourseDetail } from '@/Services/Courses/utils/courseMapping';
import CourseProgressPanel from '@/Services/Courses/components/CourseProgressPanel/CourseProgressPanel';

const mocks = vi.hoisted(() => ({
  getCourses: vi.fn(), getCourse: vi.fn(), createCourse: vi.fn(), updateCourse: vi.fn(),
  updateAccess: vi.fn(), addItem: vi.fn(), removeItem: vi.fn(), moveItem: vi.fn(),
  getProgress: vi.fn(), getRoster: vi.fn(), getLessons: vi.fn(), error: vi.fn(),
}));
vi.mock('@/Endpoints/courses', () => ({ coursesEndpoints: mocks }));
vi.mock('@/Endpoints/lessons', () => ({ lessonsEndpoints: mocks }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: mocks.error }) }));

function lessonItem(lessonId: number, position: number): CourseItemDto {
  return {
    id: lessonId, publicId: `item-${lessonId}`, title: `Урок ${lessonId}`, description: null,
    position, itemType: 2, lessonId, file: null, scheduleEventId: null, homeworkId: null,
    isRequired: true, availableFromUtc: null, availableUntilUtc: null,
  };
}

function makeCourse(overrides: Partial<CourseDto> = {}): CourseDto {
  return {
    id: 1, publicId: 'course', title: 'Курс', description: null, authorId: 1,
    createdAt: '', updatedAt: '', canManage: true, items: [lessonItem(1, 0)],
    allowedUserIds: [1], allowedUserPublicIds: ['author', 'student'], allowedGroupIds: [], ...overrides,
  };
}

const progress: CourseProgressDto = {
  coursePublicId: 'course', completedItemsCount: 1, totalRequiredItemsCount: 2, percent: 50,
  startedAt: '', lastActivityAt: '', completedAt: null,
  items: [{ itemPublicId: 'item-1', position: 0, status: 2, startedAt: '', completedAt: '' }],
};
const input: CourseInput = { title: 'Курс', description: '', lessonIds: [1], studentPublicIds: ['student'], groupIds: [], accessMode: 'selected' };
const clients = new Set<QueryClient>();

function queryContext() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.add(client);
  const wrapper = ({ children }: PropsWithChildren) => createElement(QueryClientProvider, { client }, children);
  return { client, wrapper };
}

function saveOptions() {
  return { schoolPublicId: 'school', coursePublicId: 'course', authorPublicId: 'author', input,
    lessons: [{ lessonId: 1, title: 'Урок 1' }, { lessonId: 2, title: 'Урок 2' }], studentIds: ['student'], onCreated: vi.fn() };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getCourse.mockResolvedValue(makeCourse());
  mocks.getCourses.mockResolvedValue([makeCourse()]);
  mocks.getProgress.mockResolvedValue(progress);
  mocks.getRoster.mockResolvedValue({ coursePublicId: 'course', isSchoolWide: false, totalRequiredItemsCount: 2, students: [] });
  mocks.getLessons.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  for (const client of clients) {
    client.clear();
  }
  clients.clear();
});

describe('Course save recovery and program preservation', () => {
  it('reorders the retained program, adds new lessons and removes only omitted lessons', async () => {
    const existing = makeCourse({ items: [lessonItem(1, 0), lessonItem(3, 1)] });
    const refreshed = makeCourse({ items: [lessonItem(1, 0), lessonItem(2, 2)] });
    const saved = makeCourse({ items: [lessonItem(2, 0), lessonItem(1, 1)] });
    mocks.getCourse.mockResolvedValueOnce(existing).mockResolvedValueOnce(refreshed).mockResolvedValueOnce(saved);
    const options = saveOptions();
    options.input = { ...input, lessonIds: [2, 1] };
    await expect(saveCourse(options)).resolves.toEqual(saved);
    expect(mocks.addItem).toHaveBeenCalledWith('school', 'course', expect.objectContaining({ lessonId: 2, position: 2, title: 'Урок 2' }));
    expect(mocks.removeItem).toHaveBeenCalledWith('school', 'course', 'item-3');
    expect(mocks.moveItem).toHaveBeenCalledWith('school', 'course', 'item-2', 0);
    expect(mocks.updateAccess).toHaveBeenLastCalledWith('school', 'course', { allowedUserPublicIds: ['author', 'student'], allowedGroupIds: [] });
    expect(options.onCreated).not.toHaveBeenCalled();
  });

  it('records a newly created identity before a later write can fail', async () => {
    const created = makeCourse({ items: [] });
    mocks.createCourse.mockResolvedValue(created);
    mocks.updateCourse.mockRejectedValue(new Error('metadata failed'));
    const options = { ...saveOptions(), coursePublicId: undefined };
    await expect(saveCourse(options)).rejects.toThrow('metadata failed');
    expect(options.onCreated).toHaveBeenCalledWith(created);
    expect(mocks.createCourse).toHaveBeenCalledWith('school', { title: input.title, description: input.description, allowedUserPublicIds: ['author'], allowedGroupIds: [] });
    expect(mocks.addItem).not.toHaveBeenCalled();
  });

  it('distinguishes unknown creation outcomes from a definitive client rejection', async () => {
    const options = { ...saveOptions(), coursePublicId: undefined };
    mocks.createCourse.mockRejectedValueOnce(new Error('disconnected'));
    await expect(saveCourse(options)).rejects.toBeInstanceOf(CourseCreationUncertainError);
    const denied = Object.assign(new AxiosError('denied'), { response: { status: 400 } });
    mocks.createCourse.mockRejectedValueOnce(denied);
    await expect(saveCourse(options)).rejects.toBe(denied);
    expect(options.onCreated).not.toHaveBeenCalled();
    await expect(saveCourse({ ...options, authorPublicId: '' })).rejects.toThrow('Войдите в аккаунт заново');
    expect(mocks.createCourse).toHaveBeenCalledTimes(2);
  });

  it('protects unsupported program items and rejects lessons lost during saving', async () => {
    mocks.getCourse.mockResolvedValueOnce(makeCourse({ items: [{ ...lessonItem(1, 0), itemType: 0, lessonId: null }] }));
    await expect(saveCourse(saveOptions())).rejects.toThrow('Программа изменилась');
    expect(mocks.updateCourse).not.toHaveBeenCalled();
    mocks.getCourse.mockResolvedValue(makeCourse());
    await expect(saveCourse({ ...saveOptions(), input: { ...input, lessonIds: [99] } })).rejects.toThrow('Урок больше недоступен');
    mocks.getCourse.mockResolvedValueOnce(makeCourse()).mockResolvedValueOnce(makeCourse({ items: [] }));
    await expect(saveCourse(saveOptions())).rejects.toThrow('Не удалось сохранить программу');
    expect(mocks.updateAccess).not.toHaveBeenCalled();
  });
});

describe('Course query permissions and independent failures', () => {
  it('loads learner progress while keeping a manager course independent of it', async () => {
    mocks.getCourses.mockResolvedValue([makeCourse({ canManage: false }), makeCourse({ publicId: 'managed' })]);
    const { result } = renderHook(() => useCoursesQuery('school'), queryContext());
    await waitFor(() => expect(result.current.data?.[0].progressPercent).toBe(50));
    expect(mocks.getProgress).toHaveBeenCalledTimes(1);
    expect(mocks.getProgress).toHaveBeenCalledWith('school', 'course');
    expect(result.current.data?.[1].progressPercent).toBeNull();
  });

  it('retains known metadata after a server failure but hides it after revoked access', async () => {
    const { result } = renderHook(() => useCoursesQuery('school'), queryContext());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    mocks.getCourses.mockRejectedValueOnce(Object.assign(new AxiosError('unavailable'), { status: 503 }));
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.data?.[0].title).toBe('Курс');
    expect(result.current.isBlocked).toBe(false);
    mocks.getCourses.mockRejectedValueOnce(Object.assign(new AxiosError('forbidden'), { status: 403 }));
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.isBlocked).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.isBlocked).toBe(true);
    expect(result.current.isAccessError).toBe(true);
    expect(mocks.error).toHaveBeenCalledTimes(2);
  });

  it('keeps a manager course visible when its roster fails and scopes every read to the school', async () => {
    mocks.getRoster.mockRejectedValue(new Error('roster offline'));
    const { result } = renderHook(() => useCourseQuery('school-b', 'course'), queryContext());
    await waitFor(() => expect(result.current.rosterQuery.isError).toBe(true));
    expect(result.current.data?.title).toBe('Курс');
    expect(result.current.data?.students).toEqual([]);
    expect(mocks.getCourse).toHaveBeenCalledWith('school-b', 'course');
    expect(mocks.getRoster).toHaveBeenCalledWith('school-b', 'course');
    expect(mocks.getLessons).toHaveBeenCalledWith('school-b');
    expect(mocks.getProgress).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledOnce();
  });

  it('distinguishes unavailable learner progress from zero completion and handles a failed detail read', async () => {
    mocks.getCourse.mockResolvedValue(makeCourse({ canManage: false }));
    mocks.getProgress.mockRejectedValue(new Error('progress offline'));
    const { result } = renderHook(() => useCourseQuery('school', 'course'), queryContext());
    await waitFor(() => expect(result.current.progressQuery.isError).toBe(true));
    expect(result.current.data?.completedLessonCount).toBeNull();
    expect(mocks.getRoster).not.toHaveBeenCalled();
    mocks.getCourse.mockRejectedValueOnce(Object.assign(new AxiosError('gone'), { status: 404 }));
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.isAccessError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.isAccessError).toBe(true);
    expect(mocks.error).toHaveBeenCalledTimes(2);
  });

  it('does not fetch an unscoped catalogue or detail', () => {
    renderHook(() => useCoursesQuery(''), queryContext());
    renderHook(() => useCourseQuery('', 'course'), queryContext());
    expect(mocks.getCourses).not.toHaveBeenCalled();
    expect(mocks.getCourse).not.toHaveBeenCalled();
  });
});

describe('Course form and displayed progress', () => {
  it('preserves audience choices and form input while clearing an earlier validation error', () => {
    let form = createCourseForm();
    form = courseFormReducer(form, { type: 'error', error: 'Повторите' });
    form = courseFormReducer(form, { type: 'field', field: 'title', value: '  Название  ' });
    form = courseFormReducer(form, { type: 'field', field: 'description', value: '  Описание  ' });
    form = courseFormReducer(form, { type: 'lessons', lessonIds: [1, 2] });
    form = courseFormReducer(form, { type: 'students', studentPublicIds: ['student'] });
    form = courseFormReducer(form, { type: 'groups', groupIds: [7] });
    form = courseFormReducer(form, { type: 'access', accessMode: 'selected' });
    expect(form.error).toBeNull();
    expect(courseFormReducer(form, { type: 'move', lessonId: 1, direction: -1 })).toBe(form);
    expect(courseFormReducer(form, { type: 'move', lessonId: 99, direction: 1 })).toBe(form);
    const moved = courseFormReducer(form, { type: 'move', lessonId: 1, direction: 1 });
    expect(getCourseInput(moved)).toEqual({ title: 'Название', description: 'Описание', lessonIds: [2, 1], studentPublicIds: ['student'], groupIds: [7], accessMode: 'selected' });
    expect(form.lessonIds).toEqual([1, 2]);
  });

  it('shows unavailable progress separately from an empty program and completed learner progress', () => {
    const view = render(createElement(CourseProgressPanel, { course: toCourseDetail(makeCourse({ items: [] })) }));
    expect(screen.getByText('Прогресс появится вместе с программой')).toBeTruthy();
    view.rerender(createElement(CourseProgressPanel, { course: toCourseDetail(makeCourse()) }));
    expect(screen.getByText('Пока нет данных о прогрессе')).toBeTruthy();
    view.rerender(createElement(CourseProgressPanel, { course: toCourseDetail(makeCourse({ canManage: false }), { ...progress, totalRequiredItemsCount: 1, percent: 100 }) }));
    expect(screen.getByRole('heading', { name: 'Мой прогресс' })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Прогресс: Мой прогресс' }).getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByText('Пройден')).toBeTruthy();
  });
});
