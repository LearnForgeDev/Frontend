import { useCallback, useEffect } from 'react';
import { useApplicationDispatch, useApplicationSelector, useApplicationStore } from '@/Assets/Hooks/useApplicationStore';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { coursesEndpoints } from '@/Endpoints/Courses';
import { fetchCourseResource } from '@/Storage/Courses/courses.requests';
import { courseRemoved, courseSaved, createCoursesState, operationChanged, progressSaved, scopeChanged } from '@/Storage/Courses/courses.slice';
import type { CourseLocalReadRequest } from '@/Storage/Courses/courses.type';
import { useHomework } from '@/Services/Homework/hooks/useHomework';
import type { CourseInput, CourseProgramItem, CourseResourceOption } from '../Courses.type';
import { toCourseDetail, toCourseSummary } from '../utils/courseMapping';
import { saveCourse } from './saveCourse';
import { CourseCreationUncertainError } from './saveCourse.errors';
import { isCourseItemAvailable } from '../utils/courseProgram.conversion';

const EMPTY_COURSES = createCoursesState();

export function useCourses(schoolPublicId: string) {
  const dispatch = useApplicationDispatch();
  const store = useApplicationStore();
  const accountPublicId = useGlobalContext(state => state.auth.user?.userPublicId ?? '');
  const scope = `${accountPublicId}/${schoolPublicId}`;
  const current = useApplicationSelector(state => state.courses);
  const state = current.scope === scope ? current : EMPTY_COURSES;
  const homework = useHomework();
  useEffect(() => {
    dispatch(scopeChanged(scope));
  }, [dispatch, scope]);

  const read = useCallback(async (request: CourseLocalReadRequest): Promise<void> => {
    if (!accountPublicId || !schoolPublicId) {
      return;
    }
    const base = { scope, schoolPublicId, refresh: request.refresh };
    if (request.kind === 'catalogue' || request.kind === 'options') {
      await dispatch(fetchCourseResource({ ...base, kind: request.kind }));
      return;
    }
    if (request.kind === 'lesson') {
      if (!request.coursePublicId || !request.itemPublicId || request.lessonId === undefined) {
        return;
      }
      await dispatch(fetchCourseResource({ ...base, kind: 'lesson', coursePublicId: request.coursePublicId, itemPublicId: request.itemPublicId, lessonId: request.lessonId }));
      return;
    }
    if (!('coursePublicId' in request) || !request.coursePublicId) {
      return;
    }
    await dispatch(fetchCourseResource({ ...base, kind: request.kind, coursePublicId: request.coursePublicId }));
  }, [accountPublicId, dispatch, schoolPublicId, scope]);

  const run = useCallback(async <T,>(key: string, operation: (accessEpoch: number, assertCurrent: () => void) => Promise<T>) => {
    const initial = store.getState().courses;
    if (initial.scope !== scope || initial.operations[key]) {
      throw new Error('Дождитесь завершения текущего действия');
    }
    const accessEpoch = initial.accessEpoch;
    const assertCurrent = () => {
      const active = store.getState().courses;
      if (active.scope !== scope) {
        throw new Error('Аккаунт или школа изменились. Откройте курс заново.');
      }
      if (active.accessEpoch !== accessEpoch) {
        throw new Error('Доступ к курсу изменился. Обновите курс перед продолжением.');
      }
    };
    dispatch(operationChanged({ scope, key, pending: true }));
    try {
      const result = await operation(accessEpoch, assertCurrent);
      assertCurrent();
      return result;
    } finally {
      dispatch(operationChanged({ scope, key, pending: false }));
    }
  }, [dispatch, scope, store]);

  const save = useCallback((input: CourseInput, coursePublicId: string | undefined, onCreated: (publicId: string) => void, onItemCreated: (clientId: string, publicId: string) => void) => run('save', async (accessEpoch, assertCurrent) => {
    try {
      const saved = await saveCourse({
        schoolPublicId, coursePublicId, authorPublicId: accountPublicId, input,
        studentIds: (state.options?.students ?? []).flatMap(student => student.publicId ?? student.userPublicId ?? []),
        onCreated: course => {
          try {
            assertCurrent();
          } catch {
            throw new CourseCreationUncertainError('Доступ изменился после создания курса. Закройте редактор и обновите список перед продолжением.');
          }
          dispatch(courseSaved({ scope, accessEpoch, course }));
          onCreated(course.publicId);
        },
        onItemCreated: (clientId, publicId) => {
          assertCurrent();
          onItemCreated(clientId, publicId);
        },
      });
      assertCurrent();
      dispatch(courseSaved({ scope, accessEpoch, course: saved }));
      void read({ kind: 'catalogue', refresh: true });
      void read({ kind: saved.canManage ? 'roster' : 'progress', coursePublicId: saved.publicId, refresh: true });
      return toCourseDetail(saved);
    } catch (error) {
      const active = store.getState().courses;
      if (active.scope === scope && active.accessEpoch === accessEpoch) {
        void read({ kind: 'catalogue', refresh: true });
        if (coursePublicId) {
          void read({ kind: 'course', coursePublicId, refresh: true });
        }
      }
      throw error;
    }
  }), [accountPublicId, dispatch, read, run, schoolPublicId, scope, state.options, store]);

  const remove = useCallback((coursePublicId: string) => run(`delete:${coursePublicId}`, async (accessEpoch) => {
    await coursesEndpoints.deleteCourse(schoolPublicId, coursePublicId);
    dispatch(courseRemoved({ scope, accessEpoch, publicId: coursePublicId }));
  }), [dispatch, run, schoolPublicId, scope]);

  const mark = useCallback((coursePublicId: string, item: CourseProgramItem) => run(`progress:${coursePublicId}`, async (accessEpoch) => {
    if (item.itemType === 3 || !isCourseItemAvailable(item)) {
      throw new Error('Прогресс этого блока обновляется автоматически или блок недоступен');
    }
    const progress = await coursesEndpoints.setItemProgress(schoolPublicId, coursePublicId, item.publicId, item.isCompleted ? 0 : 2);
    dispatch(progressSaved({ scope, accessEpoch, progress }));
  }), [dispatch, run, schoolPublicId, scope]);

  const getMaterial = useCallback((coursePublicId: string, itemPublicId: string, signal?: AbortSignal) =>
    run(`material:${coursePublicId}:${itemPublicId}`, () => coursesEndpoints.getMaterial(schoolPublicId, coursePublicId, itemPublicId, signal)), [run, schoolPublicId]);

  const homeworkResources: CourseResourceOption[] = homework.homeworks.filter(item => item.activeVersion !== null).map(item => ({
    key: `homework:${item.id}`, title: item.title,
    reference: {
      title: item.title, itemType: 3, homeworkId: item.id, description: null,
      isRequired: true, availableFromUtc: null, availableUntilUtc: null,
    },
  }));
  const getHomeworkPath = (homeworkId: number, coursePublicId: string, itemPublicId: string) => {
    const assignment = homework.homeworks.find(item => item.id === homeworkId);
    if (!assignment) {
      return null;
    }
    const query = new URLSearchParams({ course: coursePublicId, item: itemPublicId });
    return `/app/schools/${encodeURIComponent(schoolPublicId)}/homework/${encodeURIComponent(assignment.publicId)}?${query.toString()}`;
  };
  return {
    scope, accountPublicId, state, read, save, remove, mark, getMaterial, getHomeworkPath,
    homework, resources: [...state.options?.resources ?? [], ...homeworkResources],
    catalogue: state.catalogue?.map(course => toCourseSummary(course, state.progress[course.publicId])),
    getCourse: (publicId: string) => {
      const course = state.details[publicId];
      return course ? toCourseDetail(course, state.progress[publicId], state.rosters[publicId]) : undefined;
    },
  };
}
