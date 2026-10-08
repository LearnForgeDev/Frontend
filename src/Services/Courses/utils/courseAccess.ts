import { isAxiosError } from 'axios';
import { HTTP_STATUS } from '@/Endpoints/factory/factory.const';
import { COURSE_ACCESS_ERROR_STATUSES } from './courseAccess.const';

function getCourseErrorStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status ?? error.status : undefined;
}

export function isCourseAccessError(error: unknown) {
  const status = getCourseErrorStatus(error);
  return status !== undefined && COURSE_ACCESS_ERROR_STATUSES.has(status);
}

export function canRetainCourseData(error: unknown) {
  const status = getCourseErrorStatus(error);
  return status === undefined || status >= HTTP_STATUS.SERVER_ERROR;
}
