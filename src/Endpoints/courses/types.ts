export interface CourseSummary {
  publicId: string;
  title: string;
  description: string;
  lessonCount: number;
  studentCount: number;
  completedLessonCount: number | null;
}

export interface CourseLesson {
  lessonId: number;
  title: string;
  position: number;
  isCompleted: boolean;
}

export interface CourseStudentOption {
  userPublicId: string;
  displayName: string;
}

export interface CourseStudent extends CourseStudentOption {
  completedLessonIds: number[];
}

export interface CourseDetail extends CourseSummary {
  canManage: boolean;
  lessons: CourseLesson[];
  students: CourseStudent[];
}

export interface CourseInput {
  title: string;
  description: string;
  lessonIds: number[];
  studentPublicIds: string[];
}
