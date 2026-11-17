import type { CourseActivityInput } from '@/Endpoints/Courses';

export interface CourseTimeOptions {
  coursePublicId: string;
  itemPublicId: string | undefined;
  enabled: boolean;
  activity: (coursePublicId: string, itemPublicId: string, input: CourseActivityInput) => Promise<void>;
}
