import type { UserIdentity } from '@/Assets/Types/commonTypes';

export function matchesRefreshedSession(
  stored: string | null,
  refreshed: UserIdentity,
  authenticatedUserPublicId?: string,
): boolean {
  if (!stored || authenticatedUserPublicId !== refreshed.userPublicId) return false;
  try {
    const current: unknown = JSON.parse(stored);
    return Boolean(
      current && typeof current === 'object' &&
      'userPublicId' in current && current.userPublicId === refreshed.userPublicId &&
      'jwtToken' in current && current.jwtToken === refreshed.jwtToken &&
      'refreshToken' in current && current.refreshToken === refreshed.refreshToken,
    );
  } catch {
    return false;
  }
}
