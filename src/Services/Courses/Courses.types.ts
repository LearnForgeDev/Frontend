import type { CourseInput } from '@/Endpoints/courses';

export interface LessonOption {
  lessonId: number;
  title: string;
}

export type CourseTab = 'lessons' | 'students' | 'progress';

export interface CourseFormState extends CourseInput {
  error: string | null;
}
