import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

export function useSchoolId(): number {
  const schoolId = useGlobalContext((s) => s.auth.user?.activeSchoolId);
  if (!schoolId) throw new Error('No active school — user must be logged in');
  return schoolId;
}
