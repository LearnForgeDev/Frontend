import type { SimpleStudentDto } from '@/Endpoints/students';
import type { CourseDetail, CourseStudentOption } from '@/Services/Courses/Courses.type';

export function getStudentOptions(students: SimpleStudentDto[], course?: CourseDetail) {
  const options = new Map<string, CourseStudentOption>();
  for (const student of course?.students ?? [])
    options.set(student.userPublicId, student);
  for (const student of students) {
    const userPublicId = student.publicId ?? student.userPublicId;
    if (userPublicId) {
      options.set(userPublicId, { userPublicId, displayName: student.name ?? student.userName ?? student.displayName ?? userPublicId });
    }
  }
  return [...options.values()];
}
