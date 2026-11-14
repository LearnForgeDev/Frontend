import type { CourseSummary } from '@/Services/Courses/Courses.type';

export interface CoursesListProps {
  courses: CourseSummary[];
  onOpenCourse: (coursePublicId: string) => void;
}
