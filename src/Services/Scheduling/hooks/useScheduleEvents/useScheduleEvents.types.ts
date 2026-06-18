import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import type { AppError } from '@/Endpoints/factory';

export interface UseScheduleEventsReturn {
  events: ScheduleEvent[];
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
  refetch: () => void;
}
