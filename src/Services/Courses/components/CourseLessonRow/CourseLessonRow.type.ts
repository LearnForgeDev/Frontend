import type { CourseLesson } from '@/Services/Courses/Courses.type';

export interface CourseLessonRowProps {
  lesson: CourseLesson;
  ordinal: number;
  canManage: boolean;
  isSavingProgress: boolean;
  onOpen: () => void;
  onToggleCompleted: () => void;
}
