import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseDto, CourseItemDto, CourseProgressDto } from '@/Endpoints/Courses';
import { saveCourse } from '@/Services/Courses/hooks/saveCourse';
import { CourseCreationUncertainError } from '@/Services/Courses/hooks/saveCourse.errors';
import { useCourseQuery, useCoursesQuery } from '@/Services/Courses/hooks/useCourseQueries';
import { courseFormReducer, createCourseForm, getCourseInput } from '@/Services/Courses/hooks/courseFormReducer';
import { toCourseDetail } from '@/Services/Courses/utils/courseMapping';
import CourseProgressPanel from '@/Services/Courses/components/CourseProgressPanel/CourseProgressPanel';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

const mocks = vi.hoisted(() => ({
  getCourses: vi.fn(), getCourse: vi.fn(), createCourse: vi.fn(), updateCourse: vi.fn(), updateItem: vi.fn(),
  updateAccess: vi.fn(), addItem: vi.fn(), removeItem: vi.fn(), moveItem: vi.fn(),
  getProgress: vi.fn(), getRoster: vi.fn(), getLessons: vi.fn(),
}));
vi.mock('@/Endpoints/Courses', () => ({ coursesEndpoints: mocks }));
vi.mock('@/Endpoints', () => ({ lessonsEndpoints: mocks, filesEndpoints: {}, scheduleEndpoints: {}, studentsEndpoints: {} }));
vi.mock('@/Services/Homework/hooks/useHomework', () => ({ useHomework: () => ({ homeworks: [], status: 'ready', refresh: vi.fn() }) }));

function lessonItem(lessonId: number, position: number): CourseItemDto {
  return { id: lessonId, publicId: `item-${lessonId}`, title: `Урок ${lessonId}`, description: null,
    position, itemType: 2, lessonId, file: null, scheduleEventId: null, scheduleEventPublicId: null, homeworkId: null,
    isRequired: true, availableFromUtc: null, availableUntilUtc: null };
}
function makeCourse(overrides: Partial<CourseDto> = {}): CourseDto {
  return { id: 1, publicId: 'course', title: 'Курс', description: null, authorId: 1,
    createdAt: '', updatedAt: '', canManage: true, items: [lessonItem(1, 0)],
    allowedUserIds: [1], allowedUserPublicIds: ['author', 'student'], allowedGroupIds: [], ...overrides };
}
const progress: CourseProgressDto = { coursePublicId: 'course', completedItemsCount: 1, totalRequiredItemsCount: 2, percent: 50,
  startedAt: '', lastActivityAt: '', completedAt: null, items: [{ itemPublicId: 'item-1', position: 0, status: 2, startedAt: '', completedAt: '' }] };
function queryContext() {
  const store = createApplicationStore();
  const wrapper = ({ children }: PropsWithChildren) => createElement(Provider, { store, children });
  return { store, wrapper };
}
function saveOptions(course = makeCourse()) {
  return { schoolPublicId: 'school', coursePublicId: 'course', authorPublicId: 'author',
    input: getCourseInput(createCourseForm(toCourseDetail(course))), studentIds: ['student'], onCreated: vi.fn(), onItemCreated: vi.fn() };
}
function httpFailure(status: number) {
  return Object.assign(new AxiosError('read failed'), { response: { status } });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getCourse.mockResolvedValue(makeCourse());
  mocks.getCourses.mockResolvedValue([makeCourse()]);
  mocks.getProgress.mockResolvedValue(progress);
  mocks.getRoster.mockResolvedValue({ coursePublicId: 'course', isSchoolWide: false, totalRequiredItemsCount: 2, students: [] });
  mocks.getLessons.mockResolvedValue([]);
  mocks.updateCourse.mockResolvedValue(makeCourse());
  mocks.updateItem.mockResolvedValue(lessonItem(1, 0));
  mocks.updateAccess.mockResolvedValue(undefined);
  mocks.removeItem.mockResolvedValue(undefined);
  mocks.moveItem.mockResolvedValue(undefined);
  useGlobalContext.getState().auth.setUser({ userPublicId: 'author', userName: 'Учитель', jwtToken: 'token', refreshToken: 'refresh', exp: 0, userRoles: [] });
});
afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Course save recovery and mixed program preservation', () => {
  it('reorders retained occurrences, adds a new block and removes only the omitted occurrence', async () => {
    const existing = makeCourse({ items: [lessonItem(1, 0), lessonItem(3, 1)] });
    const refreshed = makeCourse({ items: [lessonItem(1, 0), lessonItem(2, 2)] });
    const saved = makeCourse({ items: [lessonItem(2, 0), lessonItem(1, 1)] });
    mocks.getCourse.mockResolvedValueOnce(existing).mockResolvedValueOnce(refreshed).mockResolvedValueOnce(saved);
    mocks.addItem.mockResolvedValue(lessonItem(2, 2));
    const options = saveOptions(existing);
    const added = createCourseForm(toCourseDetail(makeCourse({ items: [lessonItem(2, 0)] }))).blocks[0];
    if (added.kind !== 'supported') {
      throw new Error('Expected a supported lesson fixture');
    }
    options.input.blocks = [{ ...added, publicId: null, clientId: 'new-occurrence' }, options.input.blocks[0]];
    await expect(saveCourse(options)).resolves.toEqual(saved);
    expect(mocks.addItem).toHaveBeenCalledWith('school', 'course', expect.objectContaining({ lessonId: 2, position: 2, title: 'Урок 2' }));
    expect(options.onItemCreated).toHaveBeenCalledWith('new-occurrence', 'item-2');
    expect(mocks.removeItem).toHaveBeenCalledWith('school', 'course', 'item-3');
    expect(mocks.moveItem).toHaveBeenCalledWith('school', 'course', 'item-2', 0);
    expect(mocks.updateAccess).toHaveBeenLastCalledWith('school', 'course', { allowedUserPublicIds: ['author', 'student'], allowedGroupIds: [] });
    expect(options.onCreated).not.toHaveBeenCalled();
  });
  it('records the new course identity before a later metadata write can fail', async () => {
    const created = makeCourse({ items: [] });
    mocks.createCourse.mockResolvedValue(created);
    mocks.updateCourse.mockRejectedValue(new Error('metadata failed'));
    const options = { ...saveOptions(created), coursePublicId: undefined };
    await expect(saveCourse(options)).rejects.toThrow('metadata failed');
    expect(options.onCreated).toHaveBeenCalledWith(created);
    expect(mocks.createCourse).toHaveBeenCalledWith('school', { title: 'Курс', description: '', allowedUserPublicIds: ['author'], allowedGroupIds: [] });
    expect(mocks.addItem).not.toHaveBeenCalled();
  });
  it('distinguishes uncertain creation from definitive rejection and rejects a missing identity', async () => {
    const options = { ...saveOptions(makeCourse({ items: [] })), coursePublicId: undefined };
    mocks.createCourse.mockRejectedValueOnce(new Error('disconnected'));
    await expect(saveCourse(options)).rejects.toBeInstanceOf(CourseCreationUncertainError);
    const denied = httpFailure(400);
    mocks.createCourse.mockRejectedValueOnce(denied);
    await expect(saveCourse(options)).rejects.toBe(denied);
    expect(options.onCreated).not.toHaveBeenCalled();
    await expect(saveCourse({ ...options, authorPublicId: '' })).rejects.toThrow('Войдите в аккаунт заново');
    expect(mocks.createCourse).toHaveBeenCalledTimes(2);
  });
  it('preserves unknown blocks, rejects concurrent additions and detects lost items before publishing audience', async () => {
    const unknown = { ...lessonItem(9, 1), itemType: 99, lessonId: null };
    const mixed = makeCourse({ items: [lessonItem(1, 0), unknown] });
    mocks.getCourse.mockResolvedValue(mixed);
    await saveCourse(saveOptions(mixed));
    expect(mocks.updateItem).toHaveBeenCalledTimes(1);
    expect(mocks.removeItem).not.toHaveBeenCalled();
    mocks.updateCourse.mockClear();
    await expect(saveCourse(saveOptions())).rejects.toThrow('Программа изменилась');
    expect(mocks.updateCourse).not.toHaveBeenCalled();
    mocks.updateAccess.mockClear();
    mocks.getCourse.mockResolvedValueOnce(makeCourse()).mockResolvedValueOnce(makeCourse({ items: [] }));
    await expect(saveCourse(saveOptions())).rejects.toThrow('Не удалось сохранить программу');
    expect(mocks.updateAccess).not.toHaveBeenCalled();
  });
});

describe('Public course reads and independent failures', () => {
  it('loads learner progress without requesting progress for manager catalogue entries', async () => {
    mocks.getCourses.mockResolvedValue([makeCourse({ canManage: false }), makeCourse({ publicId: 'managed' })]);
    const { result } = renderHook(() => useCoursesQuery('school'), queryContext());
    await waitFor(() => expect(result.current.data?.[0].progressPercent).toBe(50));
    expect(mocks.getProgress).toHaveBeenCalledTimes(1);
    expect(mocks.getProgress).toHaveBeenCalledWith('school', 'course');
    expect(result.current.data?.[1].progressPercent).toBeNull();
  });
  it('retains authorized metadata on temporary failure and clears it after confirmed denial', async () => {
    const { result } = renderHook(() => useCoursesQuery('school'), queryContext());
    await waitFor(() => expect(result.current.data?.[0].title).toBe('Курс'));
    mocks.getCourses.mockRejectedValueOnce(httpFailure(503));
    await act(() => result.current.refetch());
    expect(result.current.data?.[0].title).toBe('Курс');
    expect(result.current.isBlocked).toBe(false);
    expect(result.current.isError).toBe(true);
    mocks.getCourses.mockRejectedValueOnce(httpFailure(403));
    await act(() => result.current.refetch());
    expect(result.current.isBlocked).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.feature.state.requests.catalogue).toMatchObject({ status: 'error', denied: true });
  });
  it('keeps a manager course visible when roster refresh fails and scopes all reads', async () => {
    mocks.getRoster.mockRejectedValue(new Error('roster offline'));
    const { result } = renderHook(() => useCourseQuery('school-b', 'course'), queryContext());
    await waitFor(() => expect(result.current.rosterQuery.isError).toBe(true));
    expect(result.current.data?.title).toBe('Курс');
    expect(result.current.data?.students).toEqual([]);
    expect(mocks.getCourse).toHaveBeenCalledWith('school-b', 'course');
    expect(mocks.getRoster).toHaveBeenCalledWith('school-b', 'course');
    expect(mocks.getLessons).not.toHaveBeenCalled();
    expect(mocks.getProgress).not.toHaveBeenCalled();
  });
  it('distinguishes missing progress from zero completion and hides denied course details', async () => {
    mocks.getCourse.mockResolvedValue(makeCourse({ canManage: false }));
    mocks.getProgress.mockRejectedValue(new Error('progress offline'));
    const { result } = renderHook(() => useCourseQuery('school', 'course'), queryContext());
    await waitFor(() => expect(result.current.progressQuery.isError).toBe(true));
    expect(result.current.data?.completedLessonCount).toBeNull();
    expect(mocks.getRoster).not.toHaveBeenCalled();
    mocks.getCourse.mockRejectedValue(httpFailure(404));
    await act(() => result.current.refetch());
    expect(result.current.isBlocked).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.feature.state.progress).toEqual({});
  });
  it('does not fetch catalogue or details without a selected school', () => {
    renderHook(() => useCoursesQuery(''), queryContext());
    renderHook(() => useCourseQuery('', 'course'), queryContext());
    expect(mocks.getCourses).not.toHaveBeenCalled();
    expect(mocks.getCourse).not.toHaveBeenCalled();
  });
});

describe('Course form and displayed progress', () => {
  it('preserves audience and item identities while replacing block order without mutating the original form', () => {
    let form = createCourseForm(toCourseDetail(makeCourse({ items: [lessonItem(1, 0), lessonItem(2, 1)] })));
    form = courseFormReducer(form, { type: 'error', error: 'Повторите' });
    form = courseFormReducer(form, { type: 'field', field: 'title', value: '  Название  ' });
    form = courseFormReducer(form, { type: 'field', field: 'description', value: '  Описание  ' });
    form = courseFormReducer(form, { type: 'students', studentPublicIds: ['student'] });
    form = courseFormReducer(form, { type: 'groups', groupIds: [7] });
    form = courseFormReducer(form, { type: 'access', accessMode: 'selected' });
    expect(form.error).toBeNull();
    const moved = courseFormReducer(form, { type: 'blocks', blocks: [...form.blocks].reverse() });
    const saved = getCourseInput(moved);
    expect(saved).toMatchObject({ title: 'Название', description: 'Описание', sourceItemPublicIds: ['item-1', 'item-2'], studentPublicIds: ['student'], groupIds: [7], accessMode: 'selected' });
    expect(saved.blocks.map(block => block.publicId)).toEqual(['item-2', 'item-1']);
    expect(form.blocks.map(block => block.publicId)).toEqual(['item-1', 'item-2']);
  });
  it('distinguishes unknown progress, an empty program and a completed learner program', () => {
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
