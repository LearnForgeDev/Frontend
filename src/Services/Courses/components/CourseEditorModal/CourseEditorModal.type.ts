import type { CourseDetail } from '@/Services/Courses/Courses.type';

export interface CourseEditorModalProps {
  schoolPublicId: string;
  course?: CourseDetail;
  onClose: () => void;
  onSaved: (course: CourseDetail) => void;
}
