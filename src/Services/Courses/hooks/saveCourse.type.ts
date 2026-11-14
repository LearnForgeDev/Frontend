import type { CourseDto } from '@/Endpoints/courses';
import type { CourseInput, LessonOption } from '../Courses.type';

export interface SaveCourseOptions {
  schoolPublicId: string;
  coursePublicId?: string;
  authorPublicId: string;
  input: CourseInput;
  lessons: LessonOption[];
  studentIds: string[];
  onCreated: (course: CourseDto) => void;
}
