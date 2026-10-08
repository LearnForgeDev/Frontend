import type { CourseInput } from '@/Services/Courses/Courses.types';
import { COURSE_DESCRIPTION_MAX_LENGTH, COURSE_LESSON_MAX_COUNT, COURSE_STUDENT_MAX_COUNT, COURSE_TITLE_MAX_LENGTH } from './courseValidation.const';

export function validateCourse(input: CourseInput): string | null {
  if (!input.title.trim()) return 'Введите название курса';
  if (input.title.trim().length > COURSE_TITLE_MAX_LENGTH) {
    return `Название не должно превышать ${COURSE_TITLE_MAX_LENGTH} символов`;
  }
  if (input.description.length > COURSE_DESCRIPTION_MAX_LENGTH) {
    return `Описание не должно превышать ${COURSE_DESCRIPTION_MAX_LENGTH} символов`;
  }
  if (input.lessonIds.length > COURSE_LESSON_MAX_COUNT) {
    return `В курсе может быть не больше ${COURSE_LESSON_MAX_COUNT} уроков`;
  }
  if (input.studentPublicIds.length > COURSE_STUDENT_MAX_COUNT) {
    return `В курсе может быть не больше ${COURSE_STUDENT_MAX_COUNT} учеников`;
  }
  return null;
}
