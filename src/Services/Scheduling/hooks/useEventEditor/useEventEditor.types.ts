import type { ScheduleEvent } from '../../Scheduling.types';
import type { ScheduleEventFormValues } from '../../components/CreateEventModal/CreateEventModal.validation';

export interface EventEditorOptions {
  event?: ScheduleEvent | null;
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  onClose: () => void;
}

export interface EventEditorForm extends ScheduleEventFormValues {
  description: string;
  attendeeIds: string[];
  withoutAttendees: boolean;
  error: string | null;
}

export type EventEditorField = 'title' | 'description' | 'date' | 'startTime' | 'endTime';

export type EventEditorAction =
  | { type: 'field'; field: EventEditorField; value: string }
  | { type: 'attendees'; ids: string[] }
  | { type: 'withoutAttendees'; value: boolean }
  | { type: 'error'; error: string | null };
