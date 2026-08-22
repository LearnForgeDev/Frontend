import type { UserSchoolInfo } from '@/Endpoints/schools/types';
import {
  SCHOOL_REQUEST_APPROVED_STATUSES,
  SCHOOL_REQUEST_PENDING_STATUSES,
  SCHOOL_REQUEST_REJECTED_STATUSES,
} from '../onboarding.const';
import type {
  SchoolRequestPointer,
  SchoolRequestStatus,
} from '../types/onboarding.types';

export type SchoolRequestViewState =
  | 'approved'
  | 'pending'
  | 'provisioning'
  | 'rejected';

export function getSchoolRequestViewState(status?: string): SchoolRequestViewState {
  if (status && SCHOOL_REQUEST_APPROVED_STATUSES.has(status)) {
    return 'approved';
  }

  if (status && SCHOOL_REQUEST_REJECTED_STATUSES.has(status)) {
    return 'rejected';
  }

  return 'pending';
}

export function shouldPollSchoolRequest(status?: string): boolean {
  return !status || SCHOOL_REQUEST_PENDING_STATUSES.has(status);
}

export function findApprovedSchool(
  schools: UserSchoolInfo[],
  pointer: SchoolRequestPointer,
  status?: SchoolRequestStatus,
): UserSchoolInfo | null {
  if (status?.schoolPublicId) {
    return schools.find((school) => school.schoolPublicId === status.schoolPublicId) ?? null;
  }

  const newSchool = schools.find(
    (school) => !pointer.knownSchoolPublicIds.includes(school.schoolPublicId),
  );
  if (newSchool) {
    return newSchool;
  }

  const normalizedName = pointer.schoolName.trim().toLocaleLowerCase('ru');
  const matchingSchools = schools.filter(
    (school) => school.schoolName.trim().toLocaleLowerCase('ru') === normalizedName,
  );

  return matchingSchools.length === 1 ? matchingSchools[0] : null;
}
