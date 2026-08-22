import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints/schools/schools.endpoints';
import { SCHOOLS_POLLING_INTERVAL_MS } from '../onboarding.const';
import type {
  SchoolRequestPointer,
  SchoolRequestStatus,
} from '../types/onboarding.types';
import { findApprovedSchool } from '../utils/schoolRequestStatus.utils';

export function useApprovedSchool(
  pointer: SchoolRequestPointer | null,
  status: SchoolRequestStatus | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['my-schools'],
    queryFn: () => schoolsEndpoints.getMySchools(),
    enabled: enabled && Boolean(pointer),
    select: (schools) =>
      pointer ? findApprovedSchool(schools, pointer, status) : null,
    refetchInterval: (query) =>
      query.state.data && pointer && findApprovedSchool(query.state.data, pointer, status)
        ? false
        : SCHOOLS_POLLING_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}
