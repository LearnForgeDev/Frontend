import type { UserSchoolInfo } from '@/Endpoints/schools/schools.contract.type';

export interface SchoolSelectionInput {
  schools: UserSchoolInfo[];
  routeSchoolPublicId?: string;
  activeSchoolPublicId?: string;
}
