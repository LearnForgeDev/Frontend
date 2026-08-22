import { useQuery } from '@tanstack/react-query';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { SCHOOL_REQUEST_POLLING_INTERVAL_MS } from '../onboarding.const';
import type { SchoolRequestStatus } from '../types/onboarding.types';
import { shouldPollSchoolRequest } from '../utils/schoolRequestStatus.utils';

export function useSchoolRequestStatus(requestPublicId?: string) {
  return useQuery({
    queryKey: ['school-request-status', requestPublicId],
    queryFn: async () => {
      const status = await authEndpoints.getSchoolRequestStatus(requestPublicId!);
      return status as SchoolRequestStatus;
    },
    enabled: Boolean(requestPublicId),
    refetchInterval: (query) =>
      shouldPollSchoolRequest(query.state.data?.status)
        ? SCHOOL_REQUEST_POLLING_INTERVAL_MS
        : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
