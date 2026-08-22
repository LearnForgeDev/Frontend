import type { UserSchoolInfo } from '@/Endpoints/schools/types';

export type SchoolRequestPointer = {
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
