import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import type { Member } from '@/Services/Scheduling/Scheduling.types';
import type { AppError } from '@/Endpoints';
import type { UseSchoolMembersReturn } from './useSchoolMembers.types';

/**
 * Loads the active school's members for the attendee picker, from the real
 * `GET /api/ApiSchool/{schoolId}/members` endpoint.
 */
export function useSchoolMembers(): UseSchoolMembersReturn {
  const schoolId = useSchoolId();

  const { data, isLoading, isError, error } = useQuery<Member[], AppError>({
    queryKey: ['school-members', schoolId],
    queryFn: () => schoolsEndpoints.listMembers(schoolId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!schoolId,
  });

  return {
    members: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
  };
}
