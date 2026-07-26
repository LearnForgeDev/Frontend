import { useQuery } from '@tanstack/react-query';
import { scheduleEndpoints } from '@/Endpoints';
import { scheduleEventDtoToEvent } from '@/Endpoints';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import type { ScheduleEventDto } from '@/Endpoints/schedule/types';
import type { AppError } from '@/Endpoints';
import type { UseScheduleEventsReturn } from './useScheduleEvents.types';

/**
 * Loads the active school's scheduled sessions from the real
 * `GET /api/ApiSchedule/{schoolPublicId}/events` endpoint. loading/error
 * reflect the actual network call; there is no fixture fallback.
 */
export function useScheduleEvents(): UseScheduleEventsReturn {
  const schoolId = useSchoolId();

  const { data, isLoading, isError, error, refetch } = useQuery<ScheduleEvent[], AppError>({
    queryKey: ['schedule-events', schoolId],
    queryFn: () =>
      scheduleEndpoints.listEvents(schoolId).then((dtos: ScheduleEventDto[]) => dtos.map(scheduleEventDtoToEvent)),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!schoolId,
  });

  return {
    events: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
