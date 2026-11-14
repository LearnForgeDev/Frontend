import type { CourseLesson } from '@/Services/Courses/Courses.type';

export interface CourseLessonsPanelProps {
  lessons: CourseLesson[];
  canManage: boolean;
  isSavingProgress: boolean;
  onOpenLesson: (lessonId: number) => void;
  onToggleCompleted: (lesson: CourseLesson) => void;
  onEdit: () => void;
}
