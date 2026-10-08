import { AxiosError, isAxiosError } from 'axios';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { HTTP_STATUS, REQUEST_ERROR_MESSAGES, SAFE_RETRY_METHODS } from './factory.const';

export function shouldRetryRequest(failureCount: number, error: unknown, retryCount: number): boolean {
  if (failureCount >= retryCount || !isAxiosError(error)) return false;
  if (!SAFE_RETRY_METHODS.includes(error.config?.method?.toLowerCase() ?? '')) return false;
  if (error.code === 'ERR_CANCELED') return false;

  const status = error.response?.status ?? error.status;
  return !status || status >= HTTP_STATUS.SERVER_ERROR;
}

export function getRequestErrorMessage(error: unknown, fallback: string = REQUEST_ERROR_MESSAGES.generic): string {
  if (!isAxiosError(error)) return fallback;

  const status = error.response?.status ?? error.status;
  if (!status || status >= HTTP_STATUS.SERVER_ERROR) return REQUEST_ERROR_MESSAGES.unavailable;

  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return REQUEST_ERROR_MESSAGES.unauthorized;
    case HTTP_STATUS.FORBIDDEN:
      return REQUEST_ERROR_MESSAGES.forbidden;
    case HTTP_STATUS.NOT_FOUND:
      return REQUEST_ERROR_MESSAGES.notFound;
    case HTTP_STATUS.BAD_REQUEST:
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return REQUEST_ERROR_MESSAGES.invalid;
    case HTTP_STATUS.CONFLICT:
      return REQUEST_ERROR_MESSAGES.conflict;
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return REQUEST_ERROR_MESSAGES.tooManyRequests;
    default:
      return fallback;
  }
}

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

export function createUnauthenticatedError() {
  const error = new AxiosError(REQUEST_ERROR_MESSAGES.unauthorized, String(HTTP_STATUS.UNAUTHORIZED));
  error.status = HTTP_STATUS.UNAUTHORIZED;
  return error;
}
