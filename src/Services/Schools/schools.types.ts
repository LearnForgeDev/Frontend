import type { UserSchoolInfo } from '@/Endpoints/schools/types';

export interface SchoolSelectionInput {
  schools: UserSchoolInfo[];
  routeSchoolPublicId?: string;
  activeSchoolPublicId?: string;
}
