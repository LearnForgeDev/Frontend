import type { SchoolRole } from '@/Endpoints/schools/schools.contract.type';
import type { SchoolCapabilities } from '../AppShell.type';

export function getSchoolCapabilities(roles: SchoolRole[]): SchoolCapabilities {
  const isOwner = roles.includes('Owner');
  const isTeacher = roles.includes('Teacher');
  const isStudent = roles.includes('Student');

  return {
    canAccessSchool: isStudent || isTeacher || isOwner,
    canTeach: isTeacher || isOwner,
    canManageSchool: isOwner,
  };
}
