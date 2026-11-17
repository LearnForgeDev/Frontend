import type { SerializedDocument } from '@lexical/file';
import type { CourseDto, CourseProgressDto, CourseRosterDto } from '@/Endpoints/Courses';
import type { SimpleStudentDto, StudentGroupDto } from '@/Endpoints/students';
import type { CourseResourceOption } from '@/Services/Courses/Courses.type';

export interface CourseEditorOptions {
  resources: CourseResourceOption[];
  students: SimpleStudentDto[];
  groups: StudentGroupDto[];
}

export type CourseLocalReadRequest = { refresh?: boolean } & (
  | { kind: 'catalogue' | 'options' }
  | { kind: 'course' | 'progress' | 'roster'; coursePublicId: string }
  | { kind: 'lesson'; coursePublicId: string; itemPublicId: string; lessonId: number }
);

export type CourseReadRequest = CourseLocalReadRequest & { scope: string; schoolPublicId: string };

export type CourseReadResult =
  | { kind: 'catalogue'; value: CourseDto[] }
  | { kind: 'options'; value: CourseEditorOptions }
  | { kind: 'course'; coursePublicId: string; value: CourseDto }
  | { kind: 'progress'; coursePublicId: string; value: CourseProgressDto }
  | { kind: 'roster'; coursePublicId: string; value: CourseRosterDto }
  | { kind: 'lesson'; itemPublicId: string; value: SerializedDocument };

export type CourseRequestStatus =
  | { status: 'idle' }
  | { status: 'pending'; requestId: string }
  | { status: 'success' }
  | { status: 'error'; message: string; denied: boolean };

export interface CoursesState {
  scope: string;
  accessEpoch: number;
  catalogue: CourseDto[] | null;
  details: Record<string, CourseDto>;
  progress: Record<string, CourseProgressDto>;
  rosters: Record<string, CourseRosterDto>;
  lessons: Record<string, SerializedDocument>;
  options: CourseEditorOptions | null;
  requests: Record<string, CourseRequestStatus>;
  operations: Record<string, boolean>;
}
