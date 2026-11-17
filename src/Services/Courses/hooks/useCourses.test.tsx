import { AxiosError, AxiosHeaders } from 'axios';
import type { SaveCourseOptions } from './saveCourse.type';
import { CourseCreationUncertainError } from './saveCourse.errors';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { coursesEndpoints } from '@/Endpoints/Courses';
import coursesReducer, { courseSaved } from '@/Storage/Courses/courses.slice';
import { makeCourse, makeCourseInput } from '../utils/course.fixtures';
import { toCourseDetail } from '../utils/courseMapping';
import { useCourses } from './useCourses';
import type { CourseProgressDto } from '@/Endpoints/Courses';

const { account, save } = vi.hoisted(() => ({ account: { value: 'teacher' }, save: vi.fn() }));
vi.mock('@/Endpoints', () => ({ filesEndpoints: {}, lessonsEndpoints: {}, scheduleEndpoints: {}, studentsEndpoints: {} }));
vi.mock('./saveCourse', () => ({ saveCourse: save }));
vi.mock('@/Assets/Hooks/useApplicationStore', async () => {
  const redux = await import('react-redux');
  return { useApplicationDispatch: redux.useDispatch, useApplicationSelector: redux.useSelector, useApplicationStore: redux.useStore };
});
vi.mock('@/Storage/useGlobalContext/useGlobalContext', () => ({ useGlobalContext: (selector: (state: { auth: { user: { userPublicId: string } } }) => unknown) => selector({ auth: { user: { userPublicId: account.value } } }) }));
vi.mock('@/Services/Homework/hooks/useHomework', () => ({ useHomework: () => ({
  homeworks: [{ id: 7, publicId: 'homework-guid', title: 'Задание', activeVersion: 1 }, { id: 8, publicId: 'draft-guid', title: 'Черновик', activeVersion: null }],
  status: 'ready', refresh: vi.fn(),
}) }));

const progress: CourseProgressDto = { coursePublicId: 'course', completedItemsCount: 1, totalRequiredItemsCount: 1, percent: 100, startedAt: '', lastActivityAt: '', completedAt: '', items: [] };
function setup() {
  const store = configureStore({ reducer: { courses: coursesReducer } });
  const hook = renderHook(({ school }) => useCourses(school), {
    initialProps: { school: 'school' },
    wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
  });
  return { store, ...hook };
}

afterEach(cleanup);
beforeEach(() => {
  account.value = 'teacher';
  save.mockReset();
  vi.spyOn(coursesEndpoints, 'getCourses').mockResolvedValue([makeCourse()]);
  vi.spyOn(coursesEndpoints, 'getCourse').mockResolvedValue(makeCourse());
  vi.spyOn(coursesEndpoints, 'getRoster').mockResolvedValue({ coursePublicId: 'course', isSchoolWide: false, totalRequiredItemsCount: 1, students: [] });
  vi.spyOn(coursesEndpoints, 'recordActivity').mockResolvedValue(progress);
  vi.spyOn(coursesEndpoints, 'deleteCourse').mockResolvedValue();
  vi.spyOn(coursesEndpoints, 'getMaterial').mockResolvedValue(new Blob(['content']));
});

it('exposes scoped reads, published homework choices and real homework route context', async () => {
  const { result } = setup();
  expect(result.current.getCourse('course')).toBeUndefined();
  await act(() => result.current.read({ kind: 'catalogue' }));
  await act(() => result.current.read({ kind: 'course', coursePublicId: 'course' }));
  expect(result.current.catalogue?.[0].publicId).toBe('course');
  expect(result.current.getCourse('course')?.items[0].publicId).toBe('lesson-item');
  expect(result.current.resources.map(item => item.key)).toEqual(['homework:7']);
  expect(result.current.getHomeworkPath(7, 'course', 'item')).toBe('/app/schools/school/homework/homework-guid?course=course&item=item');
  expect(result.current.getHomeworkPath(99, 'course', 'item')).toBeNull();
  expect(await result.current.getMaterial('course', 'item')).toBeInstanceOf(Blob);
});

it('records automatic activity and serializes writes', async () => {
  const { result, store } = setup();
  const item = toCourseDetail(makeCourse()).items[0];
  let finish: (value: CourseProgressDto) => void = () => undefined;
  vi.mocked(coursesEndpoints.recordActivity).mockImplementationOnce(() => new Promise(resolve => {
    finish = resolve;
  }));
  let pending = Promise.resolve();
  act(() => {
    pending = result.current.activity('course', item.publicId, { kind: 0, sessionId: 'session', elapsedSeconds: 0 });
  });
  await expect(result.current.activity('course', item.publicId, { kind: 0, sessionId: 'session', elapsedSeconds: 0 })).rejects.toThrow('Дождитесь');
  await act(async () => {
    finish(progress);
    await pending;
  });
  expect(store.getState().courses.progress.course.percent).toBe(100);
  expect(store.getState().courses.operations['activity:course:lesson-item']).toBe(false);
  await act(() => result.current.remove('course'));
  expect(coursesEndpoints.deleteCourse).toHaveBeenCalledWith('school', 'course');
  expect(store.getState().courses.progress.course).toBeUndefined();
});

it('stores known created identity and rejects a late save after switching accounts', async () => {
  const { result, rerender, store } = setup();
  const created = vi.fn();
  const itemCreated = vi.fn();
  save.mockImplementationOnce(async (options) => {
    options.onCreated(makeCourse());
    options.onItemCreated('local', 'server');
    return makeCourse();
  });
  await act(() => result.current.save(makeCourseInput(), undefined, created, itemCreated));
  expect(created).toHaveBeenCalledWith('course');
  expect(itemCreated).toHaveBeenCalledWith('local', 'server');
  expect(store.getState().courses.details.course.publicId).toBe('course');
  let finish: (course: ReturnType<typeof makeCourse>) => void = () => undefined;
  save.mockImplementationOnce(() => new Promise(resolve => {
    finish = resolve;
  }));
  let pending = Promise.resolve(toCourseDetail(makeCourse()));
  act(() => {
    pending = result.current.save(makeCourseInput(), 'course', created, itemCreated);
  });
  account.value = 'other';
  rerender({ school: 'school' });
  finish(makeCourse());
  await act(async () => {
    await expect(pending).rejects.toThrow('Аккаунт или школа изменились');
  });
  expect(store.getState().courses.details).toEqual({});
  expect(result.current.catalogue).toBeUndefined();
});

it('does not read private records without identity and clears old-school data', async () => {
  const { result, store, rerender } = setup();
  act(() => {
    store.dispatch(courseSaved({ scope: 'teacher/school', accessEpoch: 0, course: makeCourse() }));
  });
  expect(result.current.getCourse('course')).toBeTruthy();
  rerender({ school: 'other-school' });
  expect(result.current.getCourse('course')).toBeUndefined();
  account.value = '';
  rerender({ school: 'other-school' });
  await act(() => result.current.read({ kind: 'catalogue' }));
  expect(coursesEndpoints.getCourses).not.toHaveBeenCalled();
});


function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>(finish => {
    resolve = finish;
  });
  return { promise, resolve };
}

function deniedAccess() {
  const denied = new AxiosError('denied');
  denied.response = { status: 403, statusText: '', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
  return denied;
}

it('does not restore protected data or navigate when a previously accepted save arrives after denial', async () => {
  const { result, store } = setup();
  await act(() => result.current.read({ kind: 'course', coursePublicId: 'course' }));
  const saved = deferred<ReturnType<typeof makeCourse>>();
  save.mockReturnValueOnce(saved.promise);
  const navigateAfterSave = vi.fn();
  let pending = Promise.resolve(toCourseDetail(makeCourse()));
  act(() => {
    pending = result.current.save(makeCourseInput(), 'course', vi.fn(), vi.fn());
  });
  const completed = pending.then(navigateAfterSave);
  const rejected = expect(completed).rejects.toThrow('Доступ к курсу изменился');
  vi.mocked(coursesEndpoints.getCourse).mockRejectedValueOnce(deniedAccess());
  await act(() => result.current.read({ kind: 'course', coursePublicId: 'course', refresh: true }));
  expect(store.getState().courses.operations.save).toBe(true);
  await act(async () => {
    saved.resolve(makeCourse());
    await rejected;
  });
  expect(navigateAfterSave).not.toHaveBeenCalled();
  expect(store.getState().courses.details).toEqual({});
  expect(store.getState().courses.catalogue).toBeNull();
  expect(store.getState().courses.operations.save).toBe(false);
  expect(coursesEndpoints.getCourses).not.toHaveBeenCalled();
  await act(() => result.current.read({ kind: 'course', coursePublicId: 'course', refresh: true }));
  expect(result.current.getCourse('course')?.title).toBe('Курс');
});

it.each(['delete', 'progress', 'material'] as const)('rejects stale %s completion even after a new authorized read', async kind => {
  const { result, store } = setup();
  const deletion = deferred<void>();
  const grading = deferred<CourseProgressDto>();
  const material = deferred<Blob>();
  vi.mocked(coursesEndpoints.deleteCourse).mockReturnValueOnce(deletion.promise);
  vi.mocked(coursesEndpoints.recordActivity).mockReturnValueOnce(grading.promise);
  vi.mocked(coursesEndpoints.getMaterial).mockReturnValueOnce(material.promise);
  let pending: Promise<unknown> = Promise.resolve();
  act(() => {
    if (kind === 'delete') {
      pending = result.current.remove('course');
    } else if (kind === 'progress') {
      pending = result.current.activity('course', 'lesson-item', { kind: 0, sessionId: 'session', elapsedSeconds: 0 });
    } else {
      pending = result.current.getMaterial('course', 'item');
    }
  });
  const success = vi.fn();
  const rejected = expect(pending.then(success)).rejects.toThrow('Доступ к курсу изменился');
  vi.mocked(coursesEndpoints.getCourse).mockRejectedValueOnce(deniedAccess());
  await act(() => result.current.read({ kind: 'course', coursePublicId: 'course', refresh: true }));
  await act(() => result.current.read({ kind: 'course', coursePublicId: 'course', refresh: true }));
  await act(async () => {
    deletion.resolve();
    grading.resolve(progress);
    material.resolve(new Blob(['protected']));
    await rejected;
  });
  expect(success).not.toHaveBeenCalled();
  expect(result.current.getCourse('course')?.title).toBe('Курс');
  expect(store.getState().courses.progress).toEqual({});
  expect(Object.values(store.getState().courses.operations)).not.toContain(true);
});

it.each(['course', 'item'] as const)('guards late %s creation callbacks and retains safe retry behavior', async kind => {
  const { result, store } = setup();
  const courseCreated = vi.fn();
  const itemCreated = vi.fn();
  let finish: () => void = () => undefined;
  save.mockImplementationOnce((options: SaveCourseOptions) => new Promise((resolve, reject) => {
    finish = () => {
      try {
        if (kind === 'course') {
          options.onCreated(makeCourse());
        } else {
          options.onItemCreated('local', 'created-item');
        }
        resolve(makeCourse());
      } catch (error) {
        reject(error);
      }
    };
  }));
  let pending = Promise.resolve(toCourseDetail(makeCourse()));
  act(() => {
    pending = result.current.save(makeCourseInput(), kind === 'course' ? undefined : 'course', courseCreated, itemCreated);
  });
  const rejected = kind === 'course' ? expect(pending).rejects.toBeInstanceOf(CourseCreationUncertainError) : expect(pending).rejects.toThrow('Доступ к курсу изменился');
  vi.mocked(coursesEndpoints.getCourse).mockRejectedValueOnce(deniedAccess());
  await act(() => result.current.read({ kind: 'course', coursePublicId: 'course', refresh: true }));
  await act(async () => {
    finish();
    await rejected;
  });
  expect(courseCreated).not.toHaveBeenCalled();
  expect(itemCreated).not.toHaveBeenCalled();
  expect(store.getState().courses.details).toEqual({});
  expect(store.getState().courses.operations.save).toBe(false);
});


it('refreshes the roster only after teacher approval succeeds and releases a rejected approval lock', async () => {
  const { result, store } = setup();
  const item = toCourseDetail(makeCourse()).items[0];
  const approve = vi.spyOn(coursesEndpoints, 'setStudentProgress').mockResolvedValue(progress);
  await act(() => result.current.approve('course', 'student', item, 2));
  expect(approve).toHaveBeenLastCalledWith('school', 'course', item.publicId, 'student', 2);
  expect(coursesEndpoints.getRoster).toHaveBeenCalledOnce();
  expect(store.getState().courses.rosters.course.students).toEqual([]);
  approve.mockRejectedValueOnce(new Error('approval failed'));
  await act(async () => {
    await expect(result.current.approve('course', 'student', item, 0)).rejects.toThrow('approval failed');
  });
  expect(coursesEndpoints.getRoster).toHaveBeenCalledOnce();
  expect(store.getState().courses.operations['approve:course']).toBe(false);
  await act(() => result.current.approve('course', 'student', item, 0));
  expect(coursesEndpoints.getRoster).toHaveBeenCalledTimes(2);
});
