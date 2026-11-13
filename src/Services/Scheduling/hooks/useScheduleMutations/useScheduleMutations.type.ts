import type { UseMutationResult } from '@tanstack/react-query';
import type { ScheduleEvent, CreateScheduleEventInput } from '@/Services/Scheduling/Scheduling.type';
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
