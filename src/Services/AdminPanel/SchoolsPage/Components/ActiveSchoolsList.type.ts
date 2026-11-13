import type { UserSchoolInfo } from '@/Endpoints';

export type ActiveSchoolsListProps = {
  schools: UserSchoolInfo[];
  isLoading: boolean;
  activeSchoolPublicId?: string;
  onNavigateToSchool: (school: UserSchoolInfo) => void;
};
