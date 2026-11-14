import type { UserSchoolInfo } from '@/Endpoints/schools/schools.contract.type';

export type SchoolRequestPointer = {
  userPublicId?: string;
  requestPublicId: string;
  schoolName: string;
  knownSchoolPublicIds: string[];
};

export type SchoolRequestStatus = {
  requestPublicId: string;
  status: string;
  schoolName?: string;
  requestedAt?: string;
  schoolPublicId?: string;
};

export type JoinSchoolResult = {
  school: UserSchoolInfo | null;
};
