import { isAxiosError } from 'axios';
import { HTTP_STATUS } from '@/Endpoints/factory/factory.const';
import { getRequestErrorMessage } from '@/Endpoints/factory/factory.utils';
import { AUTH_ERROR_MESSAGES } from './AuthFlowContext.const';

export function getAuthErrorMessage(error: unknown, mode: keyof typeof AUTH_ERROR_MESSAGES): string {
  const status = isAxiosError(error) ? error.response?.status ?? error.status : undefined;
  if (mode === 'login' && status === HTTP_STATUS.UNAUTHORIZED) return AUTH_ERROR_MESSAGES.login;
  return getRequestErrorMessage(error, AUTH_ERROR_MESSAGES[mode]);
}
