import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints, type SchoolInfo } from '@/Endpoints';
import type { AppError } from '@/Endpoints';

export interface UseSchoolInfoReturn {
  school: SchoolInfo | null;
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
}

const STALE_TIME_5_MINUTES = 5 * 60 * 1000;

export function useSchoolInfo(schoolPublicId?: string): UseSchoolInfoReturn {
  const { data, isLoading, isError, error } = useQuery<SchoolInfo, AppError>({
    queryKey: ['school-info', schoolPublicId],
    queryFn: () => schoolsEndpoints.getSchoolInfo(schoolPublicId!),
    staleTime: STALE_TIME_5_MINUTES,
    enabled: !!schoolPublicId,
  });

  if (!schoolPublicId) {
    return {
      school: null,
      isLoading: false,
      isError: true,
      error: {
        code: '400',
        message: 'No school public ID was passed',
      },
    };
  }

  return {
    school: data ?? null,
    isLoading,
    isError,
    error: error ?? null,
  };
}
