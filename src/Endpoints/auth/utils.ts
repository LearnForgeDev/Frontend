import { AuthRole, type UserIdentity } from '@/Assets/Types/commonTypes';
import { isAxiosError } from 'axios';
import { MILLISECONDS_PER_SECOND, REFRESH_RETRY_DELAY_MS } from './auth.const';

export function parseJwt (token: string): unknown {
    const base64Url = token.split('.')[1];
    const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
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
  if (
    !('jwtToken' in value) || typeof value.jwtToken !== 'string' || !value.jwtToken.trim() ||
    !('refreshToken' in value) || typeof value.refreshToken !== 'string' || !value.refreshToken.trim() ||
    !('userName' in value) || typeof value.userName !== 'string' || !value.userName.trim() ||
    !('userPublicId' in value) || typeof value.userPublicId !== 'string' || !value.userPublicId.trim() ||
    !('userRoles' in value) || !Array.isArray(value.userRoles) || !value.userRoles.every(isUserRole)
  ) {
    return null;
  }
  const exp = getJwtExpiry(value.jwtToken);
  if (exp === null || exp <= Date.now()) return null;
  return {
    jwtToken: value.jwtToken, refreshToken: value.refreshToken,
    userPublicId: value.userPublicId, userName: value.userName, userRoles: value.userRoles, exp,
    ...('activeSchoolPublicId' in value && typeof value.activeSchoolPublicId === 'string' ? { activeSchoolPublicId: value.activeSchoolPublicId } : {}),
    ...('email' in value && typeof value.email === 'string' ? { email: value.email } : {}),
    ...('phone' in value && typeof value.phone === 'string' ? { phone: value.phone } : {}),
  };
}

function isUserRole(value: unknown): value is UserIdentity['userRoles'][number] {
  return Boolean(value && typeof value === 'object' &&
    'role' in value && (value.role === AuthRole.STUDENT || value.role === AuthRole.TEACHER || value.role === AuthRole.OWNER) &&
    'schoolId' in value && typeof value.schoolId === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value.schoolId) &&
    'userId' in value && typeof value.userId === 'number' && Number.isFinite(value.userId));
}

export function getJwtExpiry(token: string): number | null {
  try {
    const claims = parseJwt(token);
    if (!claims || typeof claims !== 'object' || !('exp' in claims)) return null;
    const exp = claims.exp;
    if (typeof exp !== 'number' || !Number.isFinite(exp)) return null;
    const expiry = exp * MILLISECONDS_PER_SECOND;
    return Number.isFinite(expiry) ? expiry : null;
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
