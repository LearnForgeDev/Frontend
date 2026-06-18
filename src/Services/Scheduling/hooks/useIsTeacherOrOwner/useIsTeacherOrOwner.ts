import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

/**
 * True when the current user holds Teacher (1) or Owner (2) in their active
 * school. UI gate only — the backend enforces real authorization.
 */
export function useIsTeacherOrOwner(): boolean {
  const user = useGlobalContext((s) => s.auth.user);
  if (!user) return false;

  return user.roles.some((r) => r.schoolId === user.activeSchoolId && r.role >= 1);
}
