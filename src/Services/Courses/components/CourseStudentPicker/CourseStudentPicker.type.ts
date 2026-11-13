import type { CourseStudentOption } from '@/Services/Courses/Courses.type';

export interface CourseStudentPickerProps {
  options: CourseStudentOption[];
  selectedIds: string[];
  onChange: (studentPublicIds: string[]) => void;
  disabled: boolean;
}
