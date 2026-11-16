import type { ReactNode } from 'react';
import type { SerializedDocument } from '@lexical/file';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { coursesEndpoints } from '@/Endpoints/Courses';
import { filesEndpoints, lessonsEndpoints } from '@/Endpoints';
import coursesReducer, { courseSaved, scopeChanged } from '@/Storage/Courses/courses.slice';
import { fetchCourseResource } from '@/Storage/Courses/courses.requests';
import { makeCourse } from '../utils/course.fixtures';
import { useCourseLesson } from './useCourseLesson';

vi.mock('@/Endpoints', () => ({
  filesEndpoints: { getFileContent: vi.fn() }, lessonsEndpoints: { getLessonById: vi.fn() },
  scheduleEndpoints: {}, studentsEndpoints: {},
}));
vi.mock('@/Assets/Hooks/useApplicationStore', async () => {
  const redux = await import('react-redux');
  return { useApplicationDispatch: redux.useDispatch, useApplicationSelector: redux.useSelector, useApplicationStore: redux.useStore };
});
vi.mock('@/Storage/useGlobalContext/useGlobalContext', () => ({
  useGlobalContext: (selector: (state: { auth: { user: { userPublicId: string } } }) => unknown) => selector({ auth: { user: { userPublicId: 'student' } } }),
}));
vi.mock('@/Services/Homework/hooks/useHomework', () => ({ useHomework: () => ({ homeworks: [] }) }));
vi.mock('react-router-dom', () => ({ useSearchParams: () => [new URLSearchParams('item=lesson-item')] }));

afterEach(cleanup);

it.each([
  ['lesson', 403], ['lesson', 404], ['file', 403], ['file', 404],
] as const)('retains an authorized course when its source %s returns %i without retrying indefinitely', async (source, status) => {
  const store = configureStore({ reducer: { courses: coursesReducer } });
  const course = makeCourse({ canManage: false });
  const request = { kind: 'lesson' as const, scope: 'student/school', schoolPublicId: 'school', coursePublicId: 'course', itemPublicId: 'lesson-item', lessonId: 10 };
  const document: SerializedDocument = {
    editorState: { root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } },
    lastSaved: 0, source: 'LearnForge', version: 'test',
  };
  const lesson = { id: '10', publicId: 'lesson', title: 'Урок', lessonJsonFile: { publicId: 'file', fileName: 'lesson.json', storageKey: 'key' } };
  const lessonRead = vi.mocked(lessonsEndpoints.getLessonById).mockResolvedValue(lesson);
  const fileRead = vi.mocked(filesEndpoints.getFileContent).mockResolvedValue(JSON.stringify(document));
  vi.spyOn(coursesEndpoints, 'getCourse').mockResolvedValue(course);
  vi.spyOn(coursesEndpoints, 'getProgress').mockResolvedValue({ coursePublicId: 'course', completedItemsCount: 0, totalRequiredItemsCount: 1, percent: 0, startedAt: '', lastActivityAt: '', completedAt: null, items: [] });
  store.dispatch(scopeChanged(request.scope));
  store.dispatch(courseSaved({ scope: request.scope, accessEpoch: 0, course }));
  await store.dispatch(fetchCourseResource(request));
  expect(store.getState().courses.lessons['lesson-item']).toEqual(document);
  const denied = new AxiosError('denied');
  denied.response = { status, statusText: '', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
  const sourceRead = source === 'lesson' ? lessonRead : fileRead;
  sourceRead.mockRejectedValueOnce(denied).mockImplementation(() => new Promise<never>(() => undefined));
  const { result } = renderHook(() => useCourseLesson('school', 'course', '10'), {
    wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
  });
  await act(async () => undefined);
  expect(sourceRead).toHaveBeenCalledTimes(2);
  expect(coursesEndpoints.getCourse).toHaveBeenCalledOnce();
  expect(result.current.course?.canManage).toBe(false);
  expect(result.current.isError).toBe(true);
  expect(result.current.content).toBeUndefined();
  expect(store.getState().courses.accessEpoch).toBe(0);
  store.dispatch(fetchCourseResource.fulfilled({ kind: 'lesson', itemPublicId: 'lesson-item', value: document }, 'stale', request));
  expect(store.getState().courses.lessons['lesson-item']).toBeUndefined();
  if (source === 'lesson') {
    lessonRead.mockResolvedValueOnce(lesson);
  } else {
    fileRead.mockResolvedValueOnce(JSON.stringify(document));
  }
  await act(() => result.current.retry());
  expect(result.current.content).toEqual(document);
  expect(result.current.isError).toBe(false);
});
