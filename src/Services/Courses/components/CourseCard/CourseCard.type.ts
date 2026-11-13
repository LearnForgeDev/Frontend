import type { CourseSummary } from '@/Services/Courses/Courses.type';

export interface CourseCardProps {
  course: CourseSummary;
  onOpen: () => void;
}
