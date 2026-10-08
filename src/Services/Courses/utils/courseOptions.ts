import type { CourseDetail, CourseStudentOption } from '@/Endpoints/courses';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { LessonOption } from '../Courses.types';

export function getLessonOptions(lessons: Lesson[], course?: CourseDetail): LessonOption[] {
  const options = new Map<number, LessonOption>();
  for (const lesson of course?.lessons ?? []) {
    options.set(lesson.lessonId, { lessonId: lesson.lessonId, title: lesson.title });
  }
  for (const lesson of lessons) {
    const lessonId = Number(lesson.id);
    if (Number.isSafeInteger(lessonId) && lessonId > 0) {
      options.set(lessonId, { lessonId, title: lesson.title });
    }
  }
  return [...options.values()];
}

export function getStudentOptions(students: CourseStudentOption[], course?: CourseDetail) {
  const options = new Map<string, CourseStudentOption>();
  for (const student of [...course?.students ?? [], ...students]) {
    options.set(student.userPublicId, student);
  }
  return [...options.values()];
}
