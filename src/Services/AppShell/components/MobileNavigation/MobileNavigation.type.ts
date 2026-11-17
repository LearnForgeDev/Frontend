import type { UserSchoolInfo } from '@/Endpoints';
import type { AppNavigationItem } from '../../AppShell.type';

export type MobileNavigationProps = {
  items: AppNavigationItem[];
  schools: UserSchoolInfo[];
  currentSchool: UserSchoolInfo | undefined;
  onSelectSchool: (school: UserSchoolInfo) => void;
  onOpenSchoolList: () => void;
  activeItemId?: string;
  onSelect: (item: AppNavigationItem) => void;
};
