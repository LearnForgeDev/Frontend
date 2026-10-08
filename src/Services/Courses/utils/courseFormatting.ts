import type { CourseDetail, CourseStudent, CourseSummary } from '@/Services/Courses/Courses.types';
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
  return `Пройдено ${course.completedLessonCount ?? 0} из ${course.requiredItemCount}`;
}

export function getStudentProgress(student: CourseStudent) {
  return { completed: student.completedCount, percentage: student.percentage, label: `${student.completedCount} из ${student.totalCount}` };
}

export function getCourseProgressRows(course: CourseDetail) {
  if (!course.canManage) return course.completedLessonCount === null ? [] : [{
    userPublicId: 'current', displayName: 'Мой прогресс',
    completed: course.completedLessonCount, percentage: course.progressPercent ?? 0,
    label: `${course.completedLessonCount} из ${course.requiredItemCount}`,
    isComplete: course.requiredItemCount > 0 && course.completedLessonCount === course.requiredItemCount,
  }];
  return course.students.map(student => ({
    ...student, ...getStudentProgress(student),
    isComplete: student.totalCount > 0 && student.completedCount === student.totalCount,
  }));
}
