import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { scheduleEndpoints } from '@/Endpoints/schedule.endpoints';
import { scheduleEventDtoToEvent } from '@/Endpoints/schedule.types';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { appErrorMessage } from '@/Services/Scheduling/utils/appErrorMessage';
import type { ScheduleEvent, CreateScheduleEventInput } from '@/Services/Scheduling/Scheduling.types';
import type { AppError } from '@/Endpoints/factory';

export interface UpdateScheduleEventVars {
  eventId: string;
  input: CreateScheduleEventInput;
}

export interface UseScheduleMutationsReturn {
  createEvent: UseMutationResult<ScheduleEvent, AppError, CreateScheduleEventInput>;
  updateEvent: UseMutationResult<ScheduleEvent, AppError, UpdateScheduleEventVars>;
  deleteEvent: UseMutationResult<void, AppError, string>;
}

/**
 * Create / delete scheduled events through the real ApiSchedule endpoints.
 * Both invalidate the events query; failures surface a notification.
 */
export function useScheduleMutations(): UseScheduleMutationsReturn {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);

  const notifyError = (error: AppError, title: string, fallback: string) => {
    showNotification({
      id: `${title}-${Date.now()}`,
      title,
      subtitle: appErrorMessage(error, fallback),
      priority: 'high',
      time: 5000,
    });
  };

  const createEvent = useMutation<ScheduleEvent, AppError, CreateScheduleEventInput>({
    mutationFn: (input) =>
      scheduleEndpoints.createEvent(schoolId, input).then(scheduleEventDtoToEvent),
    onError: (error) => notifyError(error, 'Ошибка создания занятия', 'Не удалось создать занятие.'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-events', schoolId] });
    },
  });

  const updateEvent = useMutation<ScheduleEvent, AppError, UpdateScheduleEventVars>({
    mutationFn: ({ eventId, input }) =>
      scheduleEndpoints.updateEvent(schoolId, eventId, input).then(scheduleEventDtoToEvent),
    onError: (error) => notifyError(error, 'Ошибка изменения занятия', 'Не удалось изменить занятие.'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-events', schoolId] });
    },
  });

  const deleteEvent = useMutation<void, AppError, string>({
    mutationFn: (eventId) => scheduleEndpoints.deleteEvent(schoolId, eventId),
    onError: (error) => notifyError(error, 'Ошибка удаления занятия', 'Не удалось удалить занятие.'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-events', schoolId] });
    },
  });

  return { createEvent, updateEvent, deleteEvent };
}
