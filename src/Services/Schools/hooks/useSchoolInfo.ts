import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints, type SchoolInfo } from '@/Endpoints';
import type { AppError } from '@/Endpoints';

export interface UseSchoolInfoReturn {
  school: SchoolInfo | null;
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
}

/**
 * Loads public info for a single school (id + name) from the real
 * `GET /api/ApiSchool/{schoolPublicId}` endpoint. Durable across reloads, so
 * the school name resolves on direct navigation / deep links — unlike
 * router `location.state`, which is only present when navigating from the list.
 *
 * Returns the whole `SchoolInfo` object (not just the name) so future fields
 * (logo, description, plan…) flow through to consumers without API changes.
 */
export function useSchoolInfo(schoolPublicId: string | undefined): UseSchoolInfoReturn {
  const { data, isLoading, isError, error } = useQuery<SchoolInfo, AppError>({
    queryKey: ['school-info', schoolPublicId],
    queryFn: () => schoolsEndpoints.getSchoolInfo(schoolPublicId as string),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!schoolPublicId,
  });

  return {
    school: data ?? null,
    isLoading,
    isError,
    error: error ?? null,
  };
}
