import type { SimpleStudentDto } from '@/Endpoints/students';
import type { Attendee, Member } from '../../Scheduling.types';
import { formatLocalDateInput, isoToLocalDateInput, isoToLocalTimeInput } from '../../utils/time.utils';
import { DEFAULT_START_TIME, DEFAULT_END_TIME } from '../../components/CreateEventModal/CreateEventModal.const';
import type { EventEditorAction, EventEditorForm, EventEditorOptions } from './useEventEditor.types';

export function createEventEditorForm({ event, initialDate, initialStartTime, initialEndTime }: EventEditorOptions): EventEditorForm {
  return {
    title: event?.title ?? '',
    description: event?.description ?? '',
    date: event ? isoToLocalDateInput(event.start) : formatLocalDateInput(initialDate),
    startTime: event ? isoToLocalTimeInput(event.start) : initialStartTime ?? DEFAULT_START_TIME,
    endTime: event ? isoToLocalTimeInput(event.end) : initialEndTime ?? DEFAULT_END_TIME,
    attendeeIds: event?.attendees.map(attendee => attendee.userPublicId) ?? [],
    withoutAttendees: Boolean(event && event.attendees.length === 0),
    error: null,
  };
}

export function eventEditorReducer(state: EventEditorForm, action: EventEditorAction): EventEditorForm {
  if (action.type === 'field') return { ...state, [action.field]: action.value, error: null };
  if (action.type === 'attendees') return { ...state, attendeeIds: [...new Set(action.ids)], withoutAttendees: false, error: null };
  if (action.type === 'withoutAttendees') return { ...state, withoutAttendees: action.value, attendeeIds: [], error: null };
  return { ...state, error: action.error };
}

export function getEventAttendeeOptions(students: SimpleStudentDto[], attendees: Attendee[] = []): Member[] {
  const options = new Map<string, Member>();
  for (const attendee of attendees) options.set(attendee.userPublicId, attendee);
  for (const student of students) {
    const userPublicId = student.publicId || student.userPublicId;
    if (!userPublicId) continue;
    const displayName = student.displayName || student.fullName || student.name || student.userName || student.studentName || student.user?.fullName || student.user?.name || student.user?.userName || userPublicId;
    options.set(userPublicId, { userPublicId, displayName });
  }
  return [...options.values()];
}
