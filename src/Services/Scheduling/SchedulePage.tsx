import { useMemo, useState } from 'react';
import { Alert, Box, Button, IconButton, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SchedulingProvider, useSchedulingContext } from '@/Storage/Context/SchedulingContext';
import { useScheduleEvents } from '@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents';
import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import { useIsTeacherOrOwner } from '@/Services/Scheduling/hooks/useIsTeacherOrOwner/useIsTeacherOrOwner';
import { ViewToggle } from '@/Services/Scheduling/components/ScheduleGrid/ViewToggle';
import { WeekGrid } from '@/Services/Scheduling/components/ScheduleGrid/WeekGrid';
import { DayGrid } from '@/Services/Scheduling/components/ScheduleGrid/DayGrid';
import { AgendaList } from '@/Services/Scheduling/components/ScheduleGrid/AgendaList';
import { UpcomingEventsList } from '@/Services/Scheduling/components/UpcomingEventsList/UpcomingEventsList';
import { EventDetailPanel } from '@/Services/Scheduling/components/EventDetailPanel/EventDetailPanel';
import { CreateEventModal } from '@/Services/Scheduling/components/CreateEventModal/CreateEventModal';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { styles } from './SchedulePage.styles';

function SchedulePageInner() {
  const { events, isLoading, isError, refetch } = useScheduleEvents();
  const { view, selectedDate, setSelectedDate, selectedEventId, setSelectedEventId } = useSchedulingContext();
  const canManage = useIsTeacherOrOwner();
  const { deleteEvent } = useScheduleMutations();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const closeModal = () => {
    setCreateOpen(false);
    setEditingEvent(null);
  };

  const shiftDate = (direction: 1 | -1) => {
    const step = view === 'week' ? 7 : 1;
    const next = new Date(selectedDate);
    next.setUTCDate(next.getUTCDate() + direction * step);
    setSelectedDate(next);
  };

  const gridProps = {
    events,
    onSelectEvent: setSelectedEventId,
    selectedEventId,
  };

  return (
    <Box sx={styles.root}>
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.heading}>
          Расписание
        </Typography>
        <Box sx={styles.headerControls}>
          {view !== 'agenda' && (
            <>
              <IconButton aria-label="previous" onClick={() => shiftDate(-1)} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <IconButton aria-label="next" onClick={() => shiftDate(1)} size="small">
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
          <ViewToggle />
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Новое занятие
            </Button>
          )}
        </Box>
      </Box>

      {isError ? (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={() => refetch()}>Повторить</Button>}
        >
          Не удалось загрузить расписание.
        </Alert>
      ) : isLoading ? (
        <Box sx={styles.body}>
          <Skeleton variant="rounded" height={400} sx={styles.left} />
          <Skeleton variant="rounded" height={400} sx={styles.center} />
          <Skeleton variant="rounded" height={400} sx={styles.right} />
        </Box>
      ) : (
        <Box sx={styles.body}>
          <Box sx={styles.left}>
            <Typography variant="subtitle2" sx={styles.railTitle}>
              Запланированные
            </Typography>
            <UpcomingEventsList events={events} onSelect={setSelectedEventId} selectedEventId={selectedEventId} />
          </Box>

          <Box sx={styles.center}>
            {view === 'week' ? (
              <WeekGrid {...gridProps} />
            ) : view === 'day' ? (
              <DayGrid {...gridProps} />
            ) : (
              <AgendaList {...gridProps} />
            )}
          </Box>

          <Box sx={styles.right}>
            <EventDetailPanel
              event={selectedEvent}
              canManage={canManage}
              isDeleting={deleteEvent.isPending}
              onEdit={(ev) => setEditingEvent(ev)}
              onDelete={(id) =>
                deleteEvent.mutate(id, {
                  onSuccess: () => setSelectedEventId(null),
                })
              }
            />
          </Box>
        </Box>
      )}

      {(createOpen || editingEvent) && (
        <CreateEventModal event={editingEvent} onClose={closeModal} />
      )}
    </Box>
  );
}

export default function SchedulePage() {
  return (
    <SchedulingProvider>
      <SchedulePageInner />
    </SchedulingProvider>
  );
}
