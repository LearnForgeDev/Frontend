import type { CourseStudent } from '../../Courses.type';

export interface CourseStudentsPanelProps {
  students: CourseStudent[];
  onEdit: () => void;
}
