import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { isAxiosError } from 'axios';
import { MILLISECONDS_PER_SECOND, REFRESH_RETRY_DELAY_MS } from './auth.const';

export function parseJwt (token: string): {
    "userId": string,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string,
    "exp": string,
    "iss": string,
    "aud": string,
} {
    const base64Url = token.split('.')[1];
    const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        window.atob(base64)
            .split('')
            .map(
                (c) => {
                    return '%' + ('00' + c.charCodeAt(0)
                        .toString(16))
                        .slice(-2);
                }
            )
            .join('')
    );

    return JSON.parse(jsonPayload);
}

export function normalizeRestoredSession(value: unknown): UserIdentity | null {
  if (!value || typeof value !== 'object') return null;
  const identity = value as Partial<UserIdentity>;
  if (
    typeof identity.jwtToken !== 'string' || !identity.jwtToken.trim() ||
    typeof identity.refreshToken !== 'string' || !identity.refreshToken.trim() ||
    typeof identity.userName !== 'string' || !identity.userName.trim() ||
    typeof identity.userPublicId !== 'string' || !identity.userPublicId.trim() ||
    !Array.isArray(identity.userRoles)
  ) {
    return null;
  }
  try {
    const exp = Number(parseJwt(identity.jwtToken).exp) * MILLISECONDS_PER_SECOND;
    if (!Number.isFinite(exp) || exp <= Date.now()) return null;
    return { ...identity, exp } as UserIdentity;
  } catch {
    return null;
  }
}

export function getRefreshRetryDelay(error: unknown): number {
  if (!isAxiosError(error)) return REFRESH_RETRY_DELAY_MS;
  const retryAfter: unknown = error.response?.headers['retry-after'];
  if (typeof retryAfter !== 'string' && typeof retryAfter !== 'number') return REFRESH_RETRY_DELAY_MS;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * MILLISECONDS_PER_SECOND;
  const retryAt = Date.parse(String(retryAfter));
  return Number.isFinite(retryAt) ? Math.max(0, retryAt - Date.now()) : REFRESH_RETRY_DELAY_MS;
}
