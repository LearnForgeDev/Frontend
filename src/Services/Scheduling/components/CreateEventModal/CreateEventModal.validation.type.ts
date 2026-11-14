

export interface ScheduleEventFormValues {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

export type ScheduleEventFormValidationResult =
  | { error: string; startUtc?: never; endUtc?: never }
  | { error: null; startUtc: string; endUtc: string };
