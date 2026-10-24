import { isAxiosError } from 'axios';
import { HTTP_STATUS } from '@/Endpoints/factory/factory.const';

export function isSchoolRequestUnavailable(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status ?? error.status;
  return status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN || status === HTTP_STATUS.NOT_FOUND;
}
