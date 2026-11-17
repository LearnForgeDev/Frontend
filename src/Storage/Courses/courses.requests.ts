import { createAsyncThunk } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { coursesEndpoints } from '@/Endpoints/Courses';
import { filesEndpoints, lessonsEndpoints, scheduleEndpoints, studentsEndpoints } from '@/Endpoints';
import type { CourseResourceOption } from '@/Services/Courses/Courses.type';
import { parseLessonContent } from '@/Services/Courses/utils/lessonContent';
import type { CourseEditorOptions, CourseReadRequest, CourseReadResult, CoursesState } from './courses.type';

export function courseRequestKey(request: CourseReadRequest) {
  switch (request.kind) {
    case 'catalogue':
    case 'options':
      return request.kind;
    case 'lesson':
      return `lesson:${request.coursePublicId}:${request.itemPublicId}`;
    default:
      return `${request.kind}:${request.coursePublicId}`;
  }
}

async function getEditorOptions(schoolPublicId: string): Promise<CourseEditorOptions> {
  const [lessons, files, events, students, groups] = await Promise.all([
    lessonsEndpoints.getLessons(schoolPublicId), filesEndpoints.listFiles(schoolPublicId),
    scheduleEndpoints.listEvents(schoolPublicId), studentsEndpoints.getStudentsSimple(schoolPublicId),
    studentsEndpoints.getStudentGroups(schoolPublicId),
  ]);
  const fields = { description: null, isRequired: true, availableFromUtc: null, availableUntilUtc: null };
  return {
    students, groups,
    resources: [
      ...lessons.flatMap<CourseResourceOption>(lesson => {
        const lessonId = Number(lesson.id);
        return Number.isSafeInteger(lessonId) && lessonId > 0 ? [{
          key: `lesson:${lessonId}`, title: lesson.title,
          reference: { ...fields, completionRule: 2, requiredSeconds: 60, completeAfterUtc: null, title: lesson.title, itemType: 2 as const, lessonId },
        }] : [];
      }),
      ...files.map<CourseResourceOption>(file => ({ key: `file:${file.publicId}`, title: file.fileName,
        reference: { ...fields, completionRule: 1, requiredSeconds: null, completeAfterUtc: null, title: file.fileName, itemType: 0 as const, filePublicId: file.publicId } })),
      ...events.map<CourseResourceOption>(event => ({
        key: `call:${event.id}`, title: event.title,
        reference: { ...fields, completionRule: 5, requiredSeconds: null, completeAfterUtc: null, title: event.title, itemType: 1 as const, scheduleEventPublicId: event.id },
      })),
    ],
  };
}

async function readResource(request: CourseReadRequest, canManage: boolean): Promise<CourseReadResult> {
  const school = request.schoolPublicId;
  switch (request.kind) {
    case 'catalogue':
      return { kind: request.kind, value: await coursesEndpoints.getCourses(school) };
    case 'options':
      return { kind: request.kind, value: await getEditorOptions(school) };
    case 'course':
      return { kind: request.kind, coursePublicId: request.coursePublicId, value: await coursesEndpoints.getCourse(school, request.coursePublicId) };
    case 'progress':
      return { kind: request.kind, coursePublicId: request.coursePublicId, value: await coursesEndpoints.getProgress(school, request.coursePublicId) };
    case 'roster':
      return { kind: request.kind, coursePublicId: request.coursePublicId, value: await coursesEndpoints.getRoster(school, request.coursePublicId) };
    case 'lesson': {
      if (!canManage) {
        await coursesEndpoints.recordActivity(school, request.coursePublicId, request.itemPublicId, { kind: 0, sessionId: crypto.randomUUID(), elapsedSeconds: 0 });
      }
      const lesson = await lessonsEndpoints.getLessonById(school, String(request.lessonId));
      if (!lesson.lessonJsonFile) {
        throw new Error('Содержимое статьи недоступно');
      }
      const content = await filesEndpoints.getFileContent(school, lesson.lessonJsonFile.publicId);
      return { kind: request.kind, itemPublicId: request.itemPublicId, value: parseLessonContent(content) };
    }
  }
}

export const fetchCourseResource = createAsyncThunk<CourseReadResult, CourseReadRequest, {
  state: { courses: CoursesState };
  rejectValue: { message: string; denied: boolean; sourceOnly: boolean };
}>('courses/read', async (request, api) => {
  try {
    const canManage = 'coursePublicId' in request && api.getState().courses.details[request.coursePublicId]?.canManage === true;
    return await readResource(request, canManage);
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    return api.rejectWithValue({
      message: 'Не удалось загрузить данные курса. Попробуйте ещё раз.',
      denied: status === 401 || status === 403 || status === 404,
      sourceOnly: request.kind === 'lesson' && (status === 403 || status === 404),
    });
  }
}, {
  condition: (request, api) => {
    const state = api.getState().courses;
    const previous = state.requests[courseRequestKey(request)];
    return state.scope === request.scope && previous?.status !== 'pending' && (request.refresh === true || previous?.status !== 'success');
  },
});
