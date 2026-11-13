import { getRedirectPath } from '@/Services/Auth/Pages/AuthLayout/AuthLayout.utils';

export function getProfileReturnPath(state: unknown, schoolPublicId?: string): string {
  const fallback = schoolPublicId ? `/app/schools/${encodeURIComponent(schoolPublicId)}/today` : '/app';
  const fromLocation = state && typeof state === 'object' && 'profileReturnTo' in state && typeof state.profileReturnTo === 'string'
    ? state.profileReturnTo : undefined;
  const path = getRedirectPath({ fromLocation });
  return path === '/app' || path.startsWith('/app/profile') ? fallback : path;
}
