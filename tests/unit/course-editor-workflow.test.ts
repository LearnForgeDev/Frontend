import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import type { SaveCourseOptions } from '@/Services/Courses/hooks/saveCourse.type';
import { useCourseEditor } from '@/Services/Courses/hooks/useCourseEditor';
import { useCoursePage } from '@/Services/Courses/hooks/useCoursePage';
import { CourseCreationUncertainError } from '@/Services/Courses/hooks/saveCourse.errors';
import { toCourseDetail } from '@/Services/Courses/utils/courseMapping';
import { getStudentOptions } from '@/Services/Courses/utils/courseOptions';
import { makeCourse, makeCourseItem, makeCourseInput } from '@/Services/Courses/utils/course.fixtures';
import CourseProgramPanel from '@/Services/Courses/components/CourseProgramPanel/CourseProgramPanel';
import CourseStudentsPanel from '@/Services/Courses/components/CourseStudentsPanel/CourseStudentsPanel';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { courseSaved, progressSaved, scopeChanged } from '@/Storage/Courses/courses.slice';

const mocks = vi.hoisted(() => ({ save: vi.fn(), getLessons: vi.fn(), getStudentsSimple: vi.fn(), getStudentGroups: vi.fn(),
  listFiles: vi.fn(), listEvents: vi.fn(), getCourses: vi.fn(), getCourse: vi.fn(), getProgress: vi.fn(), getRoster: vi.fn(),
  success: vi.fn(), error: vi.fn(), setItemProgress: vi.fn(), deleteCourse: vi.fn() }));
vi.mock('@/Endpoints', () => ({ lessonsEndpoints: mocks, studentsEndpoints: mocks, filesEndpoints: mocks, scheduleEndpoints: mocks }));
vi.mock('@/Endpoints/Courses', () => ({ coursesEndpoints: mocks }));
vi.mock('@/Services/Courses/hooks/saveCourse', () => ({ saveCourse: mocks.save }));
vi.mock('@/Services/Homework/hooks/useHomework', () => ({ useHomework: () => ({ homeworks: [], status: 'ready', refresh: vi.fn() }) }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ success: mocks.success, error: mocks.error }) }));

const raw = makeCourse({ publicId: 'created', title: 'Сохранённый курс', allowedUserPublicIds: ['author'],
  items: [makeCourseItem({ publicId: 'item', lessonId: 1 })] });
const lesson = { id: '1', publicId: 'lesson', title: 'Тема' };
const progress = { coursePublicId: 'created', completedItemsCount: 1, totalRequiredItemsCount: 1, percent: 100,
  startedAt: '', lastActivityAt: '', completedAt: '', items: [{ itemPublicId: 'item', position: 0, status: 2, startedAt: '', completedAt: '' }] };

function context() {
  const store = createApplicationStore();
  store.dispatch(scopeChanged('author/school'));
  const wrapper = ({ children }: PropsWithChildren) => createElement(Provider, { store,
    children: createElement(MemoryRouter, { initialEntries: ['/course'] }, children) });
  return { store, wrapper };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getLessons.mockResolvedValue([lesson]);
  mocks.getStudentsSimple.mockResolvedValue([{ publicId: 'student', name: 'Ученик' }]);
  mocks.getStudentGroups.mockResolvedValue([{ id: 7, name: 'Группа' }]);
  mocks.listFiles.mockResolvedValue([]);
  mocks.listEvents.mockResolvedValue([]);
  mocks.save.mockResolvedValue(raw);
  mocks.getCourses.mockResolvedValue([raw]);
  mocks.getCourse.mockResolvedValue(raw);
  mocks.getProgress.mockResolvedValue(progress);
  mocks.getRoster.mockResolvedValue({ coursePublicId: 'created', isSchoolWide: false, totalRequiredItemsCount: 1, students: [] });
  mocks.setItemProgress.mockResolvedValue(progress);
  useGlobalContext.getState().auth.setUser({ userPublicId: 'author', userName: 'Учитель', jwtToken: 'token', refreshToken: 'refresh', exp: 0, userRoles: [] });
});
afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Course editor recovery', () => {
  it('preserves entered metadata while option loading fails and recovers through explicit retry', async () => {
    mocks.getLessons.mockRejectedValueOnce(new Error('offline'));
    const setup = context();
    const { result } = renderHook(() => useCourseEditor('school', vi.fn()), setup);
    act(() => result.current.setField('title', 'Название'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    await act(() => result.current.submit());
    expect(mocks.save).not.toHaveBeenCalled();
    expect(setup.store.getState().courses.requests.options).toMatchObject({ status: 'error', denied: false });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.studentOptions).toEqual([{ userPublicId: 'student', displayName: 'Ученик' }]));
    expect(result.current.isError).toBe(false);
    expect(result.current.form.title).toBe('Название');
  });

  it('reuses a created course after partial save and keeps accepted records in the current Redux scope', async () => {
    mocks.save.mockImplementationOnce((options: SaveCourseOptions) => {
      options.onCreated(raw);
      return Promise.reject(new Error('program failed'));
    });
    const onSaved = vi.fn();
    const setup = context();
    const { result } = renderHook(() => useCourseEditor('school', onSaved), setup);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.setField('title', 'Название');
      result.current.setBlocks(makeCourseInput(raw).blocks);
      result.current.setStudents(['student']);
      result.current.setGroups([7]);
      result.current.setAccessMode('selected');
    });
    await act(() => result.current.submit());
    expect(result.current.errorMessage).toBe('program failed');
    expect(result.current.form.blocks[0].publicId).toBe('item');
    await act(() => result.current.submit());
    expect(onSaved).toHaveBeenCalledOnce();
    expect(mocks.save).toHaveBeenLastCalledWith(expect.objectContaining({ schoolPublicId: 'school', coursePublicId: 'created', authorPublicId: 'author' }));
    expect(setup.store.getState().courses.details.created).toEqual(raw);
    act(() => {
      setup.store.dispatch(courseSaved({ scope: 'author/other-school', accessEpoch: 0, course: makeCourse({ publicId: 'foreign' }) }));
    });
    expect(setup.store.getState().courses.details.foreign).toBeUndefined();
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'created' }));
  });

  it('blocks automatic creation retry when the first outcome is unknown', async () => {
    mocks.save.mockRejectedValue(new CourseCreationUncertainError());
    const { result } = renderHook(() => useCourseEditor('school', vi.fn()), context());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setField('title', 'Название'));
    await act(() => result.current.submit());
    expect(result.current.isSaveBlocked).toBe(true);
    act(() => result.current.setField('description', 'Продолжение'));
    await act(() => result.current.submit());
    expect(mocks.save).toHaveBeenCalledOnce();
    expect(result.current.errorMessage).toContain('обновите список');
  });

  it('preserves assigned students absent from the latest roster and excludes invalid source lesson IDs', async () => {
    const course = toCourseDetail(raw, undefined, { coursePublicId: 'created', isSchoolWide: false, totalRequiredItemsCount: 1,
      students: [{ publicId: 'former', login: 'Сохранённый ученик', avatarUrl: null, isDirectlyAssigned: true, accessGroupIds: [], progress: null }] });
    expect(getStudentOptions([{ publicId: 'student', name: 'Текущее имя' }, { userPublicId: 'fallback', displayName: 'Имя' }, {}], course)).toEqual([
      expect.objectContaining({ userPublicId: 'former', displayName: 'Сохранённый ученик' }),
      { userPublicId: 'student', displayName: 'Текущее имя' }, { userPublicId: 'fallback', displayName: 'Имя' },
    ]);
    mocks.getLessons.mockResolvedValue([lesson, { ...lesson, id: '-1' }, { ...lesson, id: 'not-an-id' }]);
    const { result } = renderHook(() => useCourseEditor('school', vi.fn(), course), context());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.resources.filter(option => option.reference.itemType === 2)).toEqual([
      expect.objectContaining({ title: 'Тема', reference: expect.objectContaining({ lessonId: 1 }) }),
    ]);
  });
});

describe('Course audience and mixed program controls', () => {
  it('offers creation only for an empty manager program and opens occurrences by item identity', () => {
    const onEdit = vi.fn();
    const onOpen = vi.fn();
    const onToggleCompleted = vi.fn();
    const props = { items: [], canManage: false, isSavingProgress: false, openingItemPublicId: null, onOpen, onToggleCompleted, onEdit };
    const view = render(createElement(CourseProgramPanel, props));
    expect(screen.getByText('Программа пока пуста')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Собрать программу' })).toBeNull();
    view.rerender(createElement(CourseProgramPanel, { ...props, canManage: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Собрать программу' }));
    expect(onEdit).toHaveBeenCalledOnce();
    const selected = toCourseDetail(raw).items;
    view.rerender(createElement(CourseProgramPanel, { ...props, items: selected }));
    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'item' }));
    expect(onToggleCompleted).toHaveBeenCalledWith(selected[0]);
    view.rerender(createElement(CourseProgramPanel, { ...props, items: selected, isSavingProgress: true }));
    expect(screen.getByRole('checkbox')).toHaveProperty('disabled', true);
  });

  it('keeps assigned students separate from the empty state and its management action', () => {
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
  it('removes the deleted course from Redux, retains another course and returns to the catalogue', async () => {
    const setup = context();
    setup.store.dispatch(courseSaved({ scope: 'author/school', accessEpoch: 0, course: raw }));
    setup.store.dispatch(courseSaved({ scope: 'author/school', accessEpoch: 0, course: makeCourse({ publicId: 'retained' }) }));
    setup.store.dispatch(progressSaved({ scope: 'author/school', accessEpoch: 0, progress }));
    mocks.deleteCourse.mockImplementation(async () => {
      mocks.getCourse.mockRejectedValue(Object.assign(new AxiosError('gone'), { response: { status: 404 } }));
    });
    const { result } = renderHook(() => ({ page: useCoursePage('school', 'created'), location: useLocation() }), setup);
    await waitFor(() => expect(result.current.page.query.isFetching).toBe(false));
    act(() => result.current.page.setDialog('delete'));
    act(() => result.current.page.deleteCourse());
    await waitFor(() => expect(result.current.location.pathname).toBe('/app/schools/school/courses'));
    expect(mocks.deleteCourse).toHaveBeenCalledWith('school', 'created');
    expect(setup.store.getState().courses.details.created).toBeUndefined();
    expect(setup.store.getState().courses.progress.created).toBeUndefined();
    expect(setup.store.getState().courses.rosters.created).toBeUndefined();
    expect(setup.store.getState().courses.details.retained.publicId).toBe('retained');
    expect(mocks.success).toHaveBeenCalledWith('Курс удалён');
  });

  it('does not write unknown progress and toggles completion by stable program-item identity', async () => {
    const course = toCourseDetail({ ...raw, canManage: false });
    mocks.getCourse.mockResolvedValue({ ...raw, canManage: false });
    let release: () => void = () => undefined;
    mocks.getProgress.mockImplementation(() => new Promise(resolve => {
      release = () => resolve(progress);
    }));
    const { result } = renderHook(() => useCoursePage('school', 'created'), context());
    await waitFor(() => expect(result.current.course).toBeTruthy());
    act(() => result.current.markItem(course.items[0]));
    expect(mocks.setItemProgress).not.toHaveBeenCalled();
    await act(async () => release());
    await waitFor(() => expect(result.current.query.progressQuery.isSuccess).toBe(true));
    act(() => result.current.markItem(course.items[0]));
    await waitFor(() => expect(mocks.setItemProgress).toHaveBeenCalledWith('school', 'created', 'item', 2));
    act(() => result.current.closeDialog());
    expect(result.current.dialog).toBeNull();
  });
});
