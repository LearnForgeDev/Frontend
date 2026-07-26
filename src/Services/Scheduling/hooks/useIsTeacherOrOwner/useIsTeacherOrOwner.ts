import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import type { UserSchoolInfo } from '@/Endpoints/schools/types';

/** Role names (from GET /api/ApiSchool/my-schools) that may manage a school. */
const MANAGER_ROLES = new Set(['Teacher', 'Owner', 'Founder', 'Admin']);

/**
 * True when the current user can manage the *school currently being viewed*
 * (Teacher/Owner). Derived from the real `GET /api/ApiSchool/my-schools`
 * response, which is keyed by `schoolPublicId` (matching the route) and is
 * durable across page reloads — unlike the in-memory auth store, whose roles
 * are lost on a full page load. UI gate only; the backend enforces real authz.
 */
export function useIsTeacherOrOwner(): boolean {
  const schoolId = useSchoolId();

  const { data } = useQuery({
    queryKey: ['my-schools'],
    queryFn: () => schoolsEndpoints.getMySchools(),
    staleTime: 5 * 60 * 1000,
  });

  const school = data?.find((s: UserSchoolInfo) => s.schoolPublicId === schoolId);
  return !!school?.roles?.some((role: string) => MANAGER_ROLES.has(role));
}
