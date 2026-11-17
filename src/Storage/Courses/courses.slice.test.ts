import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { coursesEndpoints } from '@/Endpoints/Courses';
import { filesEndpoints, lessonsEndpoints, scheduleEndpoints, studentsEndpoints } from '@/Endpoints';
import { makeCourse, makeCourseItem } from '@/Services/Courses/utils/course.fixtures';
import coursesReducer, { courseRemoved, courseSaved, operationChanged, progressSaved, scopeChanged } from './courses.slice';
import { courseRequestKey, fetchCourseResource } from './courses.requests';
import type { CourseDto } from '@/Endpoints/Courses';

function storeFor(scope = 'teacher/school') {
  const store = configureStore({ reducer: { courses: coursesReducer } });
  store.dispatch(scopeChanged(scope));
  return store;
}

afterEach(() => vi.restoreAllMocks());

describe('Course domain state', () => {
  it.each([403, 404])('treats an article activity %i as course denial before reading the independent source', async status => {
    const store = storeFor();
    const scope = 'teacher/school';
    store.dispatch(courseSaved({ scope, accessEpoch: 0, course: makeCourse({ canManage: false }) }));
    const denied = new AxiosError('denied');
    denied.response = { status, statusText: '', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
    vi.spyOn(coursesEndpoints, 'recordActivity').mockRejectedValue(denied);
    vi.spyOn(lessonsEndpoints, 'getLessonById');
    await store.dispatch(fetchCourseResource({ kind: 'lesson', scope, schoolPublicId: 'school', coursePublicId: 'course', itemPublicId: 'lesson-item', lessonId: 10 }));
    expect(lessonsEndpoints.getLessonById).not.toHaveBeenCalled();
    expect(store.getState().courses.details.course).toBeUndefined();
    expect(store.getState().courses.accessEpoch).toBe(1);
    expect(store.getState().courses.requests['course:course']).toMatchObject({ status: 'error', denied: true });
  });

  it('ignores late responses and operations belonging to a previous account or school', async () => {
    const store = storeFor();
    let finish: (course: CourseDto) => void = () => undefined;
    vi.spyOn(coursesEndpoints, 'getCourse').mockImplementation(() => new Promise(resolve => {
      finish = resolve;
    }));
    const pending = store.dispatch(fetchCourseResource({ kind: 'course', scope: 'teacher/school', schoolPublicId: 'school', coursePublicId: 'course' }));
    store.dispatch(scopeChanged('other/school'));
    finish(makeCourse());
    await pending;
    expect(store.getState().courses.details).toEqual({});
    store.dispatch(courseSaved({ scope: 'teacher/school', accessEpoch: 0, course: makeCourse() }));
    store.dispatch(operationChanged({ scope: 'teacher/school', key: 'save', pending: true }));
    expect(store.getState().courses.operations).toEqual({});
    expect(store.getState().courses.catalogue).toBeNull();
  });

  it('deduplicates reads while pending and retains stale values only on temporary failures', async () => {
    const store = storeFor();
    vi.spyOn(coursesEndpoints, 'getCourse').mockResolvedValue(makeCourse());
    const request = { kind: 'course' as const, scope: 'teacher/school', schoolPublicId: 'school', coursePublicId: 'course' };
    await Promise.all([store.dispatch(fetchCourseResource(request)), store.dispatch(fetchCourseResource(request))]);
    expect(coursesEndpoints.getCourse).toHaveBeenCalledOnce();
    await store.dispatch(fetchCourseResource(request));
    expect(coursesEndpoints.getCourse).toHaveBeenCalledOnce();
    vi.mocked(coursesEndpoints.getCourse).mockRejectedValueOnce(new Error('offline'));
    await store.dispatch(fetchCourseResource({ ...request, refresh: true }));
    expect(store.getState().courses.details.course.title).toBe('Курс');
    expect(store.getState().courses.requests['course:course']).toMatchObject({ status: 'error', denied: false });
    const denied = new AxiosError('denied');
    denied.response = { status: 403, statusText: '', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
    vi.mocked(coursesEndpoints.getCourse).mockRejectedValueOnce(denied);
    await store.dispatch(fetchCourseResource({ ...request, refresh: true }));
    expect(store.getState().courses.details.course).toBeUndefined();
    expect(store.getState().courses.requests['course:course']).toMatchObject({ status: 'error', denied: true });
  });

  it('loads catalogue, options, progress and roster without putting remote effects in reducers', async () => {
    const store = storeFor();
    vi.spyOn(coursesEndpoints, 'getCourses').mockResolvedValue([makeCourse()]);
    vi.spyOn(lessonsEndpoints, 'getLessons').mockResolvedValue([{ id: '10', publicId: 'lesson', title: 'Урок' }]);
    vi.spyOn(filesEndpoints, 'listFiles').mockResolvedValue([{ publicId: 'file', fileName: 'Файл', sizeBytes: 1, uploadedAt: '', storageKey: 'key' }]);
    vi.spyOn(scheduleEndpoints, 'listEvents').mockResolvedValue([{ id: 'event-guid', schoolPublicId: 'school', title: 'Занятие', description: null, startUtc: '', endUtc: '', room: '', hostUserPublicId: 'teacher', attendees: [] }]);
    vi.spyOn(studentsEndpoints, 'getStudentsSimple').mockResolvedValue([{ publicId: 'student', name: 'Ученик' }]);
    vi.spyOn(studentsEndpoints, 'getStudentGroups').mockResolvedValue([{ id: 1, name: 'Группа' }]);
    const base = { scope: 'teacher/school', schoolPublicId: 'school' };
    await store.dispatch(fetchCourseResource({ ...base, kind: 'catalogue' }));
    await store.dispatch(fetchCourseResource({ ...base, kind: 'options' }));
    const state = store.getState().courses;
    expect(state.catalogue).toHaveLength(1);
    expect(state.options?.resources.map(option => option.reference.itemType)).toEqual([2, 0, 1]);
    expect(state.options?.resources[2].reference).toMatchObject({ scheduleEventPublicId: 'event-guid' });
    store.dispatch(courseSaved({ scope: base.scope, accessEpoch: 0, course: makeCourse({ title: 'Изменённый' }) }));
    expect(store.getState().courses.catalogue?.[0].title).toBe('Изменённый');
    store.dispatch(courseSaved({ scope: base.scope, accessEpoch: 0, course: makeCourse({ publicId: 'new' }) }));
    expect(store.getState().courses.catalogue).toHaveLength(2);
    const progress = { coursePublicId: 'course', completedItemsCount: 1, totalRequiredItemsCount: 1, percent: 100, startedAt: '', lastActivityAt: '', completedAt: '', items: [] };
    vi.spyOn(coursesEndpoints, 'getProgress').mockResolvedValue(progress);
    vi.spyOn(coursesEndpoints, 'getRoster').mockResolvedValue({ coursePublicId: 'course', isSchoolWide: false, totalRequiredItemsCount: 1, students: [] });
    await store.dispatch(fetchCourseResource({ ...base, kind: 'progress', coursePublicId: 'course' }));
    await store.dispatch(fetchCourseResource({ ...base, kind: 'roster', coursePublicId: 'course' }));
    expect(store.getState().courses.rosters.course.students).toEqual([]);
    store.dispatch(progressSaved({ scope: base.scope, accessEpoch: 0, progress }));
    expect(store.getState().courses.progress.course.percent).toBe(100);
    store.dispatch(courseRemoved({ scope: base.scope, accessEpoch: 0, publicId: 'course' }));
    expect(store.getState().courses.progress.course).toBeUndefined();
    expect(store.getState().courses.details.course).toBeUndefined();
    expect(store.getState().courses.catalogue).toHaveLength(1);
    expect(courseRequestKey({ ...base, kind: 'lesson', coursePublicId: 'course', itemPublicId: 'item', lessonId: 10 })).toBe('lesson:course:item');
  });

  it('does not confuse denied catalogue with a confirmed empty catalogue', async () => {
    const store = storeFor();
    vi.spyOn(coursesEndpoints, 'getCourses').mockResolvedValue([makeCourse({ items: [makeCourseItem()] })]);
    const request = { scope: 'teacher/school', schoolPublicId: 'school', kind: 'catalogue' as const };
    await store.dispatch(fetchCourseResource(request));
    const denied = new AxiosError('denied');
    denied.response = { status: 404, data: '', statusText: '', headers: {}, config: { headers: new AxiosHeaders() } };
    vi.mocked(coursesEndpoints.getCourses).mockRejectedValueOnce(denied);
    await store.dispatch(fetchCourseResource({ ...request, refresh: true }));
    expect(store.getState().courses.catalogue).toBeNull();
    expect(store.getState().courses.requests.catalogue.status).toBe('error');
  });

  it('invalidates sibling reads so an older success cannot restore a course after access denial', async () => {
    const store = storeFor();
    let finishCourse: (course: CourseDto) => void = () => undefined;
    let finishCatalogue: (courses: CourseDto[]) => void = () => undefined;
    vi.spyOn(coursesEndpoints, 'getCourse').mockImplementation(() => new Promise(resolve => {
      finishCourse = resolve;
    }));
    vi.spyOn(coursesEndpoints, 'getCourses').mockImplementation(() => new Promise(resolve => {
      finishCatalogue = resolve;
    }));
    const denied = new AxiosError('denied');
    denied.response = { status: 403, statusText: '', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
    vi.spyOn(coursesEndpoints, 'getProgress').mockRejectedValue(denied);
    const base = { scope: 'teacher/school', schoolPublicId: 'school' };
    const course = store.dispatch(fetchCourseResource({ ...base, kind: 'course', coursePublicId: 'course' }));
    const catalogue = store.dispatch(fetchCourseResource({ ...base, kind: 'catalogue' }));
    await store.dispatch(fetchCourseResource({ ...base, kind: 'progress', coursePublicId: 'course' }));
    finishCourse(makeCourse());
    finishCatalogue([makeCourse()]);
    await Promise.all([course, catalogue]);
    expect(store.getState().courses.details).toEqual({});
    expect(store.getState().courses.catalogue).toBeNull();
    expect(store.getState().courses.requests['course:course']).toMatchObject({ status: 'error', denied: true });
    vi.mocked(coursesEndpoints.getCourse).mockResolvedValue(makeCourse());
    await store.dispatch(fetchCourseResource({ ...base, kind: 'course', coursePublicId: 'course', refresh: true }));
    expect(store.getState().courses.details.course.title).toBe('Курс');
  });

  it('rejects writes from an older access epoch without preventing an authorized reload', async () => {
    const store = storeFor();
    const scope = 'teacher/school';
    const accessEpoch = store.getState().courses.accessEpoch;
    store.dispatch(courseSaved({ scope, accessEpoch, course: makeCourse() }));
    store.dispatch(operationChanged({ scope, key: 'save', pending: true }));
    const denied = new AxiosError('denied');
    denied.response = { status: 403, statusText: '', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
    vi.spyOn(coursesEndpoints, 'getCourse').mockRejectedValueOnce(denied);
    const request = { kind: 'course' as const, scope, schoolPublicId: 'school', coursePublicId: 'course', refresh: true };
    await store.dispatch(fetchCourseResource(request));
    expect(store.getState().courses.accessEpoch).toBe(accessEpoch + 1);
    expect(store.getState().courses.operations.save).toBe(true);
    const progress = { coursePublicId: 'course', completedItemsCount: 1, totalRequiredItemsCount: 1, percent: 100, startedAt: '', lastActivityAt: '', completedAt: '', items: [] };
    store.dispatch(courseSaved({ scope, accessEpoch, course: makeCourse() }));
    store.dispatch(progressSaved({ scope, accessEpoch, progress }));
    expect(store.getState().courses.details).toEqual({});
    expect(store.getState().courses.progress).toEqual({});
    vi.mocked(coursesEndpoints.getCourse).mockResolvedValue(makeCourse({ title: 'Свежий доступ' }));
    await store.dispatch(fetchCourseResource(request));
    store.dispatch(courseRemoved({ scope, accessEpoch, publicId: 'course' }));
    expect(store.getState().courses.details.course.title).toBe('Свежий доступ');
    store.dispatch(operationChanged({ scope, key: 'save', pending: false }));
    expect(store.getState().courses.operations.save).toBe(false);
    const currentEpoch = store.getState().courses.accessEpoch;
    store.dispatch(progressSaved({ scope, accessEpoch: currentEpoch, progress }));
    expect(store.getState().courses.progress.course.percent).toBe(100);
    store.dispatch(courseRemoved({ scope, accessEpoch: currentEpoch, publicId: 'course' }));
    expect(store.getState().courses.details.course).toBeUndefined();
  });

});


it('checks learner progression before fetching a deep-linked article and recovers unavailable content', async () => {
  const store = storeFor('student/school');
  store.dispatch(courseSaved({ scope: 'student/school', accessEpoch: 0, course: makeCourse({ canManage: false }) }));
  const blocked = new AxiosError('locked');
  blocked.response = { status: 409, statusText: 'Conflict', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
  const activity = vi.spyOn(coursesEndpoints, 'recordActivity').mockRejectedValueOnce(blocked);
  const lesson = vi.spyOn(lessonsEndpoints, 'getLessonById').mockResolvedValue({ id: '10', publicId: 'article', title: 'Статья' });
  const content = vi.spyOn(filesEndpoints, 'getFileContent').mockResolvedValue(JSON.stringify({ editorState: { root: { type: 'root', children: [] } } }));
  const request = { kind: 'lesson' as const, scope: 'student/school', schoolPublicId: 'school', coursePublicId: 'course', itemPublicId: 'lesson-item', lessonId: 10, refresh: true };
  await store.dispatch(fetchCourseResource(request));
  expect(lesson).not.toHaveBeenCalled();
  expect(content).not.toHaveBeenCalled();
  expect(store.getState().courses.lessons).toEqual({});
  activity.mockResolvedValue({ coursePublicId: 'course', completedItemsCount: 0, totalRequiredItemsCount: 1, percent: 0, startedAt: '', lastActivityAt: '', completedAt: null, items: [] });
  await store.dispatch(fetchCourseResource(request));
  expect(store.getState().courses.requests['lesson:course:lesson-item']).toMatchObject({ status: 'error', denied: false });
  expect(content).not.toHaveBeenCalled();
  lesson.mockResolvedValue({ id: '10', publicId: 'article', title: 'Статья', lessonJsonFile: { publicId: 'document', fileName: 'article.json', storageKey: 'key' } });
  await store.dispatch(fetchCourseResource(request));
  expect(content).toHaveBeenCalledWith('school', 'document');
  expect(store.getState().courses.requests['lesson:course:lesson-item'].status).toBe('success');
  expect(store.getState().courses.lessons['lesson-item'].editorState.root.children).toEqual([]);
});
