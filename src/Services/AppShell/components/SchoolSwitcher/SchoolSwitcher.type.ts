import type { UserSchoolInfo } from '@/Endpoints';

export type SchoolSwitcherProps = {
  schools: UserSchoolInfo[];
  currentSchool?: UserSchoolInfo;
  compact?: boolean;
  iconOnly?: boolean;
  onSelectSchool: (school: UserSchoolInfo) => void;
  onOpenSchoolList: () => void;
};
