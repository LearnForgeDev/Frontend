import type { CourseDto } from '@/Endpoints/Courses';
import type { CourseInput } from '../Courses.type';

export interface SaveCourseOptions {
  schoolPublicId: string;
  coursePublicId?: string;
  authorPublicId: string;
  input: CourseInput;
  studentIds: string[];
  onCreated: (course: CourseDto) => void;
  onItemCreated: (clientId: string, publicId: string) => void;
}
