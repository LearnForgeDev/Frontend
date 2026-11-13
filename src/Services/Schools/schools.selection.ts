import { getSchoolCapabilities } from '@/Services/AppShell/utils/getSchoolCapabilities';
import type { SchoolSelectionInput } from './schools.type';

export function resolveSchoolSelection({ schools, routeSchoolPublicId, activeSchoolPublicId }: SchoolSelectionInput) {
  const availableSchools = schools.filter(school => getSchoolCapabilities(school.roles).canAccessSchool);
  if (routeSchoolPublicId) {
    return availableSchools.find(school => school.schoolPublicId === routeSchoolPublicId);
  }
  return availableSchools.find(school => school.schoolPublicId === activeSchoolPublicId)
    ?? availableSchools.find(school => getSchoolCapabilities(school.roles).canTeach)
    ?? availableSchools[0];
}
