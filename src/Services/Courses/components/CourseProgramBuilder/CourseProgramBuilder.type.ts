import type { CourseBlock, CourseResourceOption } from '../../Courses.type';

export interface CourseProgramBuilderProps {
  blocks: CourseBlock[];
  resources: CourseResourceOption[];
  disabled: boolean;
  onChange: (blocks: CourseBlock[]) => void;
}
