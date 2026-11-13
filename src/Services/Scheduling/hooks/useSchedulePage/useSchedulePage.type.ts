

export type ScheduleDialog =
  | { type: 'create'; date: Date; startTime?: string; endTime?: string }
  | { type: 'edit' | 'delete'; eventId: string }
  | null;
