import { HTTP_STATUS } from '@/Endpoints/factory/factory.const';

export const COURSE_ACCESS_ERROR_STATUSES = new Set<number>([
  HTTP_STATUS.UNAUTHORIZED,
  HTTP_STATUS.FORBIDDEN,
  HTTP_STATUS.NOT_FOUND,
]);
