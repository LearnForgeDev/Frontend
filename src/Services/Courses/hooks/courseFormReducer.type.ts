import type { CourseInput } from '../Courses.type';

export type CourseFormAction =
  | { type: 'field'; field: 'title' | 'description'; value: string }
  | { type: 'lessons'; lessonIds: number[] }
  | { type: 'students'; studentPublicIds: string[] }
  | { type: 'groups'; groupIds: number[] }
  | { type: 'access'; accessMode: CourseInput['accessMode'] }
  | { type: 'move'; lessonId: number; direction: -1 | 1 }
  | { type: 'error'; error: string | null };
