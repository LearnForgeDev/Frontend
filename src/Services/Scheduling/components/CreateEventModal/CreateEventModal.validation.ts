import type { ScheduleEventFormValues, ScheduleEventFormValidationResult } from './CreateEventModal.validation.type';
export type { ScheduleEventFormValues, ScheduleEventFormValidationResult } from './CreateEventModal.validation.type';
import { localDateTimeToIso } from '@/Services/Scheduling/utils/time.utils';
import { ERROR_INVALID_TIME_RANGE, ERROR_MISSING_DATE, ERROR_MISSING_TIME, ERROR_MISSING_TITLE } from './CreateEventModal.const';

export function validateScheduleEventForm({
  title,
  date,
  startTime,
  endTime,
}: ScheduleEventFormValues): ScheduleEventFormValidationResult {
  if (!title.trim()) {
    return { error: ERROR_MISSING_TITLE };
  }
  if (!date) {
    return { error: ERROR_MISSING_DATE };
  }
  if (!startTime || !endTime) {
    return { error: ERROR_MISSING_TIME };
  }

  const startUtc = localDateTimeToIso(date, startTime);
  const endUtc = localDateTimeToIso(date, endTime);

  if (!startUtc || !endUtc || new Date(startUtc) >= new Date(endUtc)) {
    return { error: ERROR_INVALID_TIME_RANGE };
  }

  return { error: null, startUtc, endUtc };
}
