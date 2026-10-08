import type { CourseDetail, CourseStudent, CourseSummary } from '@/Endpoints/courses';
import {
  LESSON_PLURAL_FORMS,
  PERCENT_SCALE,
  PLURAL_RULES,
  STUDENT_PLURAL_FORMS,
} from './courseFormatting.const';

function formatCount(count: number, forms: readonly [string, string, string]) {
  const rule = PLURAL_RULES.select(count);
  const word = rule === 'one' ? forms[0] : rule === 'few' ? forms[1] : forms[2];
  return `${count} ${word}`;
}

export const formatLessonCount = (count: number) => formatCount(count, LESSON_PLURAL_FORMS);
export const formatStudentCount = (count: number) => formatCount(count, STUDENT_PLURAL_FORMS);

export function getCourseProgress(completed: number, total: number) {
  return total > 0 ? Math.floor(Math.min(completed, total) / total * PERCENT_SCALE) : 0;
}

export function getCourseProgressLabel(course: CourseSummary) {
  return `Пройдено ${course.completedLessonCount ?? 0} из ${course.lessonCount}`;
}

export function getStudentProgress(student: CourseStudent, course: CourseDetail) {
  const lessonIds = new Set(course.lessons.map(lesson => lesson.lessonId));
  const completed = new Set(student.completedLessonIds.filter(id => lessonIds.has(id))).size;
  return {
    completed,
    percentage: getCourseProgress(completed, course.lessons.length),
    label: `Пройдено ${completed} из ${course.lessons.length}`,
  };
}

export function getCourseProgressRows(course: CourseDetail) {
  return course.students.map(student => {
    const progress = getStudentProgress(student, course);
    return { ...student, ...progress, isComplete: course.lessons.length > 0 && progress.completed === course.lessons.length };
  });
}
