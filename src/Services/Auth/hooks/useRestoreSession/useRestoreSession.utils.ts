import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';

type StoredSession = Pick<UserIdentity, 'refreshToken' | 'activeSchoolPublicId'>;

export function getSessionStorageSnapshot(): string | null {
  try {
    return localStorage.getItem(USER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readStoredSession(value: string): StoredSession | null {
  try {
    const identity: unknown = JSON.parse(value);
    if (
      !identity || typeof identity !== 'object' ||
      !('refreshToken' in identity) || typeof identity.refreshToken !== 'string' ||
      !identity.refreshToken.trim()
    ) {
      return null;
    }
    return {
      refreshToken: identity.refreshToken,
      ...('activeSchoolPublicId' in identity && typeof identity.activeSchoolPublicId === 'string'
        ? { activeSchoolPublicId: identity.activeSchoolPublicId }
        : {}),
    };
  } catch {
    return null;
  }
}
