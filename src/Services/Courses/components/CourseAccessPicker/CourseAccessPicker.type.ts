import type { CourseInput } from '../../Courses.type';
import type { StudentGroupDto } from '@/Endpoints/students';

export interface CourseAccessPickerProps {
  mode: CourseInput['accessMode'];
  onModeChange: (mode: CourseInput['accessMode']) => void;
  groups: StudentGroupDto[];
  selectedGroupIds: number[];
  onGroupsChange: (ids: number[]) => void;
  disabled: boolean;
}
