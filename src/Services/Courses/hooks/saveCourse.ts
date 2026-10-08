import { coursesEndpoints, type CourseDto } from '@/Endpoints/courses';
import type { CourseInput, LessonOption } from '../Courses.types';
import { isAxiosError } from 'axios';
import { HTTP_STATUS } from '@/Endpoints/factory/factory.const';
import { CourseCreationUncertainError } from './saveCourse.errors';
import { getCourseAudience, getRestrictedCourseAudience } from '../utils/courseAudience';
import { COURSE_ITEM_TYPES } from '../utils/courseMapping.const';

interface SaveCourseOptions {
  schoolPublicId: string;
  coursePublicId?: string;
  authorPublicId: string;
  input: CourseInput;
  lessons: LessonOption[];
  studentIds: string[];
  onCreated: (course: CourseDto) => void;
}

export async function saveCourse({ schoolPublicId, coursePublicId, authorPublicId, input, lessons, studentIds, onCreated }: SaveCourseOptions) {
  if (!authorPublicId) throw new Error('Войдите в аккаунт заново');
  const metadata = { title: input.title, description: input.description };
  let current: CourseDto;
  if (coursePublicId) current = await coursesEndpoints.getCourse(schoolPublicId, coursePublicId);
  else {
    try {
      current = await coursesEndpoints.createCourse(schoolPublicId, { ...metadata, allowedUserPublicIds: [authorPublicId], allowedGroupIds: [] });
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status && status >= HTTP_STATUS.BAD_REQUEST && status < HTTP_STATUS.SERVER_ERROR) throw error;
      throw new CourseCreationUncertainError();
    }
  }
  if (!coursePublicId) onCreated(current);
  const publicId = current.publicId;
  const audience = getCourseAudience(input, current.allowedUserPublicIds ?? [], studentIds, authorPublicId);
  const restricted = coursePublicId ? getRestrictedCourseAudience({
    allowedUserPublicIds: current.allowedUserPublicIds ?? [], allowedGroupIds: current.allowedGroupIds,
  }, audience, authorPublicId) : null;
  if (restricted) await coursesEndpoints.updateAccess(schoolPublicId, publicId, restricted);
  await coursesEndpoints.updateCourse(schoolPublicId, publicId, metadata);
  const program = [...current.items].sort((a, b) => a.position - b.position);
  const editableProgram = program.every(item => item.itemType === COURSE_ITEM_TYPES.LESSON) && new Set(program.map(item => item.lessonId)).size === program.length;
  if (editableProgram) {
    let nextPosition = program.reduce((position, item) => Math.max(position, item.position + 1), 0);
    for (const lessonId of input.lessonIds) {
      if (program.some(item => item.lessonId === lessonId)) continue;
      const lesson = lessons.find(option => option.lessonId === lessonId);
      if (!lesson) throw new Error('Урок больше недоступен');
      await coursesEndpoints.addItem(schoolPublicId, publicId, {
        title: lesson.title, lessonId, itemType: COURSE_ITEM_TYPES.LESSON,
        position: nextPosition++, isRequired: true,
      });
    }
    for (const item of program.filter(item => !input.lessonIds.includes(item.lessonId!))) {
      await coursesEndpoints.removeItem(schoolPublicId, publicId, item.publicId);
    }
    const refreshed = await coursesEndpoints.getCourse(schoolPublicId, publicId);
    const ordered = [...refreshed.items].sort((a, b) => a.position - b.position);
    for (const [position, lessonId] of input.lessonIds.entries()) {
      const index = ordered.findIndex(item => item.lessonId === lessonId);
      if (index < 0) throw new Error('Не удалось сохранить программу');
      if (index !== position || ordered[index].position !== position) {
        await coursesEndpoints.moveItem(schoolPublicId, publicId, ordered[index].publicId, position);
        const [item] = ordered.splice(index, 1);
        ordered.splice(position, 0, item);
        ordered.forEach((entry, order) => { entry.position = order; });
      }
    }
  }
  await coursesEndpoints.updateAccess(schoolPublicId, publicId, audience);
  return coursesEndpoints.getCourse(schoolPublicId, publicId);
}
