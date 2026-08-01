import { useMemo, useState } from 'react';
import { Alert, Box, Button, Skeleton } from '@mui/material';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext.tsx';
import { useScheduleEvents } from '@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents';
import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import { useIsTeacherOrOwner } from '@/Services/Scheduling/hooks/useIsTeacherOrOwner/useIsTeacherOrOwner';
import { useHandleEventIdParam } from '@/Services/Scheduling/hooks/useHandleEventIdParam/useHandleEventIdParam';
import { formatLocalTimeInput } from '@/Services/Scheduling/utils/time.utils';
import { ScheduleHeader } from '@/Services/Scheduling/components/ScheduleHeader/ScheduleHeader';
import { ScheduleSidebar } from '@/Services/Scheduling/components/ScheduleSidebar/ScheduleSidebar';
import { EventDetailModal } from '@/Services/Scheduling/components/EventDetailModal/EventDetailModal';
import { WeekGrid } from '@/Services/Scheduling/components/ScheduleGrid/WeekGrid';
import { DayGrid } from '@/Services/Scheduling/components/ScheduleGrid/DayGrid';
import { AgendaList } from '@/Services/Scheduling/components/ScheduleGrid/AgendaList';
import { CreateEventModal } from '@/Services/Scheduling/components/CreateEventModal/CreateEventModal';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { ERROR_ALERT_TEXT, RETRY_BUTTON_TEXT } from './SchedulePage.const';
import { styles } from './SchedulePage.styles';

export function SchedulePageContent() {
  const { events, isLoading, isError, refetch } = useScheduleEvents();
  const { view, selectedEventId, setSelectedEventId, selectedDate } = useSchedulingContext();
  const canManage = useIsTeacherOrOwner();
  const { deleteEvent } = useScheduleMutations();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [createInitialDate, setCreateInitialDate] = useState<Date | null>(null);
  const [createStartTime, setCreateStartTime] = useState<string | undefined>(undefined);
  const [createEndTime, setCreateEndTime] = useState<string | undefined>(undefined);

  useHandleEventIdParam(events, isLoading);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const closeModal = () => {
    setCreateOpen(false);
    setEditingEvent(null);
    setCreateInitialDate(null);
    setCreateStartTime(undefined);
    setCreateEndTime(undefined);
  };

  const gridProps = {
    events,
    onSelectEvent: setSelectedEventId,
    selectedEventId,
    onSelectTimeSlot: canManage
      ? (targetDate: Date) => {
        const startStr = formatLocalTimeInput(targetDate);
        const endTarget = new Date(targetDate.getTime() + 60 * 60 * 1000);
        const endStr = formatLocalTimeInput(endTarget);
        setCreateInitialDate(targetDate);
        setCreateStartTime(startStr);
        setCreateEndTime(endStr);
        setCreateOpen(true);
      }
      : undefined,
  };

  return (
    <Box sx={styles.root}>
      <ScheduleHeader />

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {RETRY_BUTTON_TEXT}
            </Button>
          }
        >
          {ERROR_ALERT_TEXT}
        </Alert>
      ) : isLoading ? (
        <Box sx={styles.body}>
          <Skeleton variant="rounded" sx={styles.skeletonSidebar} />
          <Skeleton variant="rounded" sx={styles.skeletonMain} />
        </Box>
      ) : (
        <Box sx={styles.body}>
          <Box component="aside" sx={styles.sidebarColumn}>
            <ScheduleSidebar
              events={events}
              canManage={canManage}
              onOpenCreateModal={() => {
                setCreateInitialDate(selectedDate);
                setCreateStartTime(undefined);
                setCreateEndTime(undefined);
                setCreateOpen(true);
              }}
            />
          </Box>

          <Box component="main" sx={styles.mainColumn}>
            {view === 'week' ? (
              <WeekGrid {...gridProps} />
            ) : view === 'day' ? (
              <DayGrid {...gridProps} />
            ) : (
              <AgendaList {...gridProps} />
            )}
          </Box>

          <EventDetailModal
            event={selectedEvent}
            canManage={canManage}
            isDeleting={deleteEvent.isPending}
            onClose={() => setSelectedEventId(null)}
            onEdit={(ev) => setEditingEvent(ev)}
            onDelete={(id) =>
              deleteEvent.mutate(id, {
                onSuccess: () => setSelectedEventId(null),
              })
            }
          />
        </Box>
      )}

      {(createOpen || editingEvent) && (
        <CreateEventModal
          event={editingEvent}
          initialDate={createInitialDate ?? selectedDate}
          initialStartTime={createStartTime}
          initialEndTime={createEndTime}
          onClose={closeModal}
        />
      )}
    </Box>
  );
}
