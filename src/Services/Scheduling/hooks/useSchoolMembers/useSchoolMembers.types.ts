import type { Member } from '@/Services/Scheduling/Scheduling.types';
import type { AppError } from '@/Endpoints';

export interface UseSchoolMembersReturn {
  members: Member[];
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
}
