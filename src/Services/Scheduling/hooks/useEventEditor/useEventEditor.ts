import { useReducer } from 'react';
import { useSchoolStudents } from '../useSchoolStudents/useSchoolStudents';
import { useScheduleMutations } from '../useScheduleMutations/useScheduleMutations';
import { validateScheduleEventForm } from '../../components/CreateEventModal/CreateEventModal.validation';
import { ERROR_EMPTY_AUDIENCE } from '../../components/CreateEventModal/CreateEventModal.const';
import { createEventEditorForm, eventEditorReducer, getEventAttendeeOptions } from './useEventEditor.utils';
import type { EventEditorField, EventEditorOptions } from './useEventEditor.types';

export function useEventEditor(options: EventEditorOptions) {
  const { event, onClose } = options;
  const [form, dispatch] = useReducer(eventEditorReducer, options, createEventEditorForm);
  const students = useSchoolStudents();
  const { createEvent, updateEvent } = useScheduleMutations();
  const mutation = event ? updateEvent : createEvent;
  const attendeeOptions = getEventAttendeeOptions(students.students, event?.attendees);
  const selectedAttendees = attendeeOptions.filter(attendee => form.attendeeIds.includes(attendee.userPublicId));
  const isAudienceUnavailable = students.isLoading || students.isError;

  const submit = () => {
    if (mutation.isPending || isAudienceUnavailable) return;
    const validation = validateScheduleEventForm(form);
    const error = validation.error ?? (!form.attendeeIds.length && !form.withoutAttendees ? ERROR_EMPTY_AUDIENCE : null);
    dispatch({ type: 'error', error });
    if (error || validation.error !== null) return;
    const input = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      startUtc: validation.startUtc,
      endUtc: validation.endUtc,
      room: event?.room,
      attendeeUserPublicIds: form.attendeeIds,
    };
    if (event) updateEvent.mutate({ eventId: event.id, input }, { onSuccess: onClose });
    else createEvent.mutate(input, { onSuccess: onClose });
  };

  return {
    form, attendeeOptions, selectedAttendees, submit,
    isEdit: Boolean(event), isSaving: mutation.isPending, isAudienceUnavailable,
    studentsLoading: students.isLoading, studentsError: students.isError, retryStudents: students.refetch,
    hasStudents: students.studentIds.length > 0,
    setField: (field: EventEditorField, value: string) => dispatch({ type: 'field', field, value }),
    setAttendees: (ids: string[]) => dispatch({ type: 'attendees', ids }),
    selectAllStudents: () => dispatch({ type: 'attendees', ids: students.studentIds }),
    setWithoutAttendees: (value: boolean) => dispatch({ type: 'withoutAttendees', value }),
  };
}
