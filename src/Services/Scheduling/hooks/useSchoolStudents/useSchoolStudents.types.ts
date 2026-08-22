import type { AppError, SimpleStudentDto } from '@/Endpoints';

export interface UseSchoolStudentsReturn {
  students: SimpleStudentDto[];
  studentIds: string[];
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
  refetch: () => void;
}
