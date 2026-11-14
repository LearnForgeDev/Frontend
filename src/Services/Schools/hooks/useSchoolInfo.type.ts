import type { SchoolInfo, AppError } from '@/Endpoints';

export interface UseSchoolInfoReturn {
  school: SchoolInfo | null;
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
}
