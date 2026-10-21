import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { scheduleEndpoints } from '@/Endpoints';
import { scheduleEventDtoToEvent } from '@/Endpoints';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import { useToast } from '@/Storage/useToastStore';
import { SCHEDULE_MUTATION_ERRORS } from './useScheduleMutations.const';
import type { ScheduleEvent, CreateScheduleEventInput } from '@/Services/Scheduling/Scheduling.types';
import type { AppError } from '@/Endpoints';

export interface UpdateScheduleEventVars {
  eventId: string;
  input: CreateScheduleEventInput;
}

export interface UseScheduleMutationsReturn {
  createEvent: UseMutationResult<ScheduleEvent, AppError, CreateScheduleEventInput>;
  updateEvent: UseMutationResult<ScheduleEvent, AppError, UpdateScheduleEventVars>;
  deleteEvent: UseMutationResult<void, AppError, string>;
}

export function useScheduleMutations(): UseScheduleMutationsReturn {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const toast = useToast();
  const invalidateEvents = () => queryClient.invalidateQueries({ queryKey: ['schedule-events', schoolId] });

  const createEvent = useMutation<ScheduleEvent, AppError, CreateScheduleEventInput>({
    networkMode: 'always',
    mutationFn: (input) =>
      scheduleEndpoints.createEvent(schoolId, {
        ...input,
        room: input.room ?? crypto.randomUUID(),
      }).then(scheduleEventDtoToEvent),
    onError: () => toast.error(SCHEDULE_MUTATION_ERRORS.create),
    onSettled: invalidateEvents,
  });

  const updateEvent = useMutation<ScheduleEvent, AppError, UpdateScheduleEventVars>({
    networkMode: 'always',
    mutationFn: ({ eventId, input }) =>
      scheduleEndpoints.updateEvent(schoolId, eventId, input).then(scheduleEventDtoToEvent),
    onError: () => toast.error(SCHEDULE_MUTATION_ERRORS.update),
    onSettled: invalidateEvents,
  });

  const deleteEvent = useMutation<void, AppError, string>({
    networkMode: 'always',
    mutationFn: (eventId) => scheduleEndpoints.deleteEvent(schoolId, eventId),
    onError: () => toast.error(SCHEDULE_MUTATION_ERRORS.delete),
    onSettled: invalidateEvents,
  });

  return { createEvent, updateEvent, deleteEvent };
}
