import type { CourseDto, CourseItemDto, CourseItemUpdateInput } from '@/Endpoints/Courses';

export interface CourseSummary {
  publicId: string;
  title: string;
  description: string;
  lessonCount: number;
  itemCount: number;
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

export type CourseBlock =
  | { kind: 'supported'; clientId: string; publicId: string | null; input: CourseItemUpdateInput }
  | { kind: 'unsupported'; clientId: string; publicId: string; original: CourseItemDto };

export interface CourseProgramItem {
  block: CourseBlock;
  publicId: string;
  position: number;
  title: string;
  description: string;
  itemType: number;
  isRequired: boolean;
  isCompleted: boolean;
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
  items: CourseProgramItem[];
  lessons: CourseLesson[];
  otherItems: CourseItemDto[];
  students: CourseStudent[];
}

export interface CourseInput {
  title: string;
  description: string;
  blocks: CourseBlock[];
  sourceItemPublicIds: string[];
  studentPublicIds: string[];
  groupIds: number[];
  accessMode: 'selected' | 'school';
}

export interface CourseResourceOption {
  key: string;
  title: string;
  reference: CourseItemUpdateInput;
}

export type CourseTab = 'lessons' | 'students' | 'progress';

export interface CourseFormState extends CourseInput {
  error: string | null;
}
