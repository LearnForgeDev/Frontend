import { getAgendaEvents, getWeekAgendaEvents, formatAgendaDate } from '../../utils/agenda.utils';
import { useState } from 'react';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { useScheduleEvents } from '../useScheduleEvents/useScheduleEvents';
import { useScheduleMutations } from '../useScheduleMutations/useScheduleMutations';
import { useIsTeacherOrOwner } from '../useIsTeacherOrOwner/useIsTeacherOrOwner';
import { useHandleEventIdParam } from '../useHandleEventIdParam/useHandleEventIdParam';
import { formatLocalTimeInput, formatEventFullDateTime } from '../../utils/time.utils';
import type { ScheduleEvent } from '../../Scheduling.type';
import { DEFAULT_EVENT_DURATION_MS } from './useSchedulePage.const';

import type { ScheduleDialog } from './useSchedulePage.type';

export function useSchedulePage() {
  const schedule = useScheduleEvents();
  const context = useSchedulingContext();
  const canManage = useIsTeacherOrOwner();
  const { deleteEvent } = useScheduleMutations();
  const [dialog, setDialog] = useState<ScheduleDialog>(null);
  const [summaryEventId, setSummaryEventId] = useState<string | null>(null);
  const link = useHandleEventIdParam(schedule.events, schedule.isSuccess);
  const selectedEvent = schedule.events.find(event => event.id === context.selectedEventId) ?? null;
  const dialogEvent = dialog && dialog.type !== 'create'
    ? schedule.events.find(event => event.id === dialog.eventId) ?? null : null;
  const closeDialog = () => setDialog(null);
  const selectEvent = (id: string) => {
    setSummaryEventId(id);
    context.setSelectedEventId(null);
  };
  const openDetails = (id: string) => {
    setSummaryEventId(id);
    context.setSelectedEventId(id);
  };
  const closeDetails = () => {
    setSummaryEventId(context.selectedEventId);
    context.setSelectedEventId(null);
  };
  const openCreate = () => setDialog({ type: 'create', date: context.selectedDate });
  const openTimeSlot = (date: Date) => {
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59);
    const end = new Date(Math.min(date.getTime() + DEFAULT_EVENT_DURATION_MS, dayEnd.getTime()));
    setDialog({ type: 'create', date, startTime: formatLocalTimeInput(date), endTime: formatLocalTimeInput(end) });
  };
  const openEdit = (event: ScheduleEvent) => {
    setSummaryEventId(event.id);
    context.setSelectedEventId(null);
    setDialog({ type: 'edit', eventId: event.id });
  };
  const requestDelete = (eventId: string) => {
    setSummaryEventId(eventId);
    deleteEvent.reset();
    context.setSelectedEventId(null);
    setDialog({ type: 'delete', eventId });
  };
  const confirmDelete = () => {
    if (dialog?.type !== 'delete' || deleteEvent.isPending) {
      return;
    }
    deleteEvent.mutate(dialog.eventId, { onSuccess: closeDialog });
  };

  return {
    ...schedule, canManage, dialog, selectedEvent, dialogEvent, closeDialog, openCreate, openEdit,
    deleteDateLabel: dialogEvent ? formatEventFullDateTime(dialogEvent.start, dialogEvent.end) : '',
    requestDelete, confirmDelete, isDeleting: deleteEvent.isPending, deleteFailed: deleteEvent.isError,
    isLinkUnavailable: link.isUnavailable, dismissLink: link.dismiss,
    closeDetails, openDetails,
    summaryEvent: selectedEvent ?? schedule.events.find(event => event.id === summaryEventId) ?? null,
    view: context.view, selectedDate: context.selectedDate,
    agendaEvents: getAgendaEvents(schedule.events, context.selectedDate),
    agendaDateLabel: formatAgendaDate(context.selectedDate),
    weekAgendaEvents: getWeekAgendaEvents(schedule.events, context.selectedDate),
    gridProps: {
      events: schedule.events, onSelectEvent: selectEvent, selectedEventId: context.selectedEventId ?? summaryEventId,
      onSelectTimeSlot: canManage ? openTimeSlot : undefined,
    },
  };
}
