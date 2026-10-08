import type { CourseDto, CourseItemDto } from '@/Endpoints/courses';

export interface CourseSummary {
  publicId: string;
  title: string;
  description: string;
  lessonCount: number;
  studentCount: number | null;
  completedLessonCount: number | null;
  requiredItemCount: number;
  progressPercent: number | null;
}

export interface CourseLesson {
  lessonId: number;
  itemPublicId: string;
  title: string;
  position: number;
  isCompleted: boolean;
  isRequired: boolean;
  availableFromUtc: string | null;
  availableUntilUtc: string | null;
}

export interface CourseStudentOption {
  userPublicId: string;
  displayName: string;
}

export interface CourseStudent extends CourseStudentOption {
  completedCount: number;
  totalCount: number;
  percentage: number;
  isDirectlyAssigned: boolean;
  accessLabel: string;
}

export interface CourseDetail extends CourseSummary {
  raw: CourseDto;
  canManage: boolean;
  lessons: CourseLesson[];
  otherItems: CourseItemDto[];
  students: CourseStudent[];
}

export interface CourseInput {
  title: string;
  description: string;
  lessonIds: number[];
  studentPublicIds: string[];
  groupIds: number[];
  accessMode: 'selected' | 'school';
}

export interface LessonOption {
  lessonId: number;
  title: string;
}

export type CourseTab = 'lessons' | 'students' | 'progress';
export interface CourseFormState extends CourseInput {
  error: string | null;
}
