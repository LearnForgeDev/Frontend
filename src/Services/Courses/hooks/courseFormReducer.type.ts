import type { CourseBlock, CourseInput } from '../Courses.type';

export type CourseFormAction =
  | { type: 'field'; field: 'title' | 'description'; value: string }
  | { type: 'blocks'; blocks: CourseBlock[] }
  | { type: 'created'; clientId: string; publicId: string }
  | { type: 'students'; studentPublicIds: string[] }
  | { type: 'groups'; groupIds: number[] }
  | { type: 'access'; accessMode: CourseInput['accessMode'] }
  | { type: 'error'; error: string | null };
