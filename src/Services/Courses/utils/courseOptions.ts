import type { SimpleStudentDto } from '@/Endpoints/students';
import type { CourseDetail, CourseStudentOption } from '@/Services/Courses/Courses.types';
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

export function getStudentOptions(students: SimpleStudentDto[], course?: CourseDetail) {
  const options = new Map<string, CourseStudentOption>();
  for (const student of course?.students ?? []) options.set(student.userPublicId, student);
  for (const student of students) {
    const userPublicId = student.publicId ?? student.userPublicId;
    if (userPublicId) options.set(userPublicId, { userPublicId, displayName: student.name ?? student.userName ?? student.displayName ?? userPublicId });
  }
  return [...options.values()];
}
