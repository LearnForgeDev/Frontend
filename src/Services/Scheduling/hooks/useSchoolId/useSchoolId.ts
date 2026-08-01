import { useParams } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';

export function useSchoolId(): string {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const user = useGlobalContext((s) => s.auth.user);

  const resolvedSchoolId =
    schoolPublicId ||
    user?.activeSchoolPublicId ||
    (user?.activeSchoolId ? String(user.activeSchoolId) : '');

  return resolvedSchoolId || '';
}
