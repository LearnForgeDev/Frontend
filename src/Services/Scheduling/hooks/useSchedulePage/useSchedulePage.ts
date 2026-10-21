import { getAgendaEvents, formatAgendaDate } from '../../utils/agenda.utils';
import { useState } from 'react';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { useScheduleEvents } from '../useScheduleEvents/useScheduleEvents';
import { useScheduleMutations } from '../useScheduleMutations/useScheduleMutations';
import { useIsTeacherOrOwner } from '../useIsTeacherOrOwner/useIsTeacherOrOwner';
import { useHandleEventIdParam } from '../useHandleEventIdParam/useHandleEventIdParam';
import { formatLocalTimeInput, formatEventFullDateTime } from '../../utils/time.utils';
import type { ScheduleEvent } from '../../Scheduling.types';
import { DEFAULT_EVENT_DURATION_MS } from './useSchedulePage.const';

type ScheduleDialog =
  | { type: 'create'; date: Date; startTime?: string; endTime?: string }
  | { type: 'edit' | 'delete'; eventId: string }
  | null;

export function useSchedulePage() {
  const schedule = useScheduleEvents();
  const context = useSchedulingContext();
  const canManage = useIsTeacherOrOwner();
  const { deleteEvent } = useScheduleMutations();
  const [dialog, setDialog] = useState<ScheduleDialog>(null);
  const link = useHandleEventIdParam(schedule.events, schedule.isSuccess);
  const selectedEvent = schedule.events.find(event => event.id === context.selectedEventId) ?? null;
  const dialogEvent = dialog && dialog.type !== 'create'
    ? schedule.events.find(event => event.id === dialog.eventId) ?? null : null;
  const closeDialog = () => setDialog(null);
  const openCreate = () => setDialog({ type: 'create', date: context.selectedDate });
  const openTimeSlot = (date: Date) => setDialog({
    type: 'create', date,
    startTime: formatLocalTimeInput(date),
    endTime: formatLocalTimeInput(new Date(date.getTime() + DEFAULT_EVENT_DURATION_MS)),
  });
  const openEdit = (event: ScheduleEvent) => {
    context.setSelectedEventId(null);
    setDialog({ type: 'edit', eventId: event.id });
  };
  const requestDelete = (eventId: string) => {
    deleteEvent.reset();
    context.setSelectedEventId(null);
    setDialog({ type: 'delete', eventId });
  };
  const confirmDelete = () => {
    if (dialog?.type !== 'delete' || deleteEvent.isPending) return;
    deleteEvent.mutate(dialog.eventId, { onSuccess: closeDialog });
  };

  return {
    ...schedule, canManage, dialog, selectedEvent, dialogEvent, closeDialog, openCreate, openEdit,
    deleteDateLabel: dialogEvent ? formatEventFullDateTime(dialogEvent.start, dialogEvent.end) : '',
    requestDelete, confirmDelete, isDeleting: deleteEvent.isPending, deleteFailed: deleteEvent.isError,
    isLinkUnavailable: link.isUnavailable, dismissLink: link.dismiss,
    closeDetails: () => context.setSelectedEventId(null),
    view: context.view, selectedDate: context.selectedDate,
    agendaEvents: getAgendaEvents(schedule.events, context.selectedDate),
    agendaDateLabel: formatAgendaDate(context.selectedDate),
    gridProps: {
      events: schedule.events, onSelectEvent: context.setSelectedEventId, selectedEventId: context.selectedEventId,
      onSelectTimeSlot: canManage ? openTimeSlot : undefined,
    },
  };
}
