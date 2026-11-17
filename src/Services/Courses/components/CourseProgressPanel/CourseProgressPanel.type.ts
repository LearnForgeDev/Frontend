import type { CourseDetail, CourseProgramItem } from '@/Services/Courses/Courses.type';

export interface CourseProgressPanelProps {
  course: CourseDetail;
  isApproving: boolean;
  onApproveItem: (studentPublicId: string, item: CourseProgramItem, status: 0 | 2) => void;
}
