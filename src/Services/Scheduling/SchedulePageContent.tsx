import { Alert, Box, Button, Card, Divider, Skeleton } from '@mui/material';
import { ScheduleHeader } from './components/ScheduleHeader/ScheduleHeader';
import { EventDetailModal } from './components/EventDetailModal/EventDetailModal';
import { DeleteEventDialog } from './components/DeleteEventDialog/DeleteEventDialog';
import { WeekGrid } from './components/ScheduleGrid/WeekGrid';
import { ScheduleEventList } from './components/ScheduleEventList/ScheduleEventList';
import { CreateEventModal } from './components/CreateEventModal/CreateEventModal';
import { useSchedulePage } from './hooks/useSchedulePage/useSchedulePage';
import { SelectedScheduleEvent } from './components/SelectedScheduleEvent/SelectedScheduleEvent';
import { ERROR_ALERT_TEXT, RETRY_BUTTON_TEXT, UNAVAILABLE_EVENT_TEXT, SKELETON_HEIGHT_PX } from './SchedulePage.const';
import { styles } from './SchedulePage.styles';

export function SchedulePageContent() {
  const page = useSchedulePage();
  return (
    <Box sx={styles.root}>
      <ScheduleHeader canManage={page.canManage} onCreate={page.openCreate} />
      {page.isLinkUnavailable && <Alert severity="info" onClose={page.dismissLink}>{UNAVAILABLE_EVENT_TEXT}</Alert>}
      {page.isError ? (
        <Alert severity="error" action={<Button color="inherit" onClick={() => { void page.refetch(); }}>{RETRY_BUTTON_TEXT}</Button>}>{ERROR_ALERT_TEXT}</Alert>
      ) : page.isLoading ? (
        <Skeleton variant="rounded" height={SKELETON_HEIGHT_PX} sx={{ borderRadius: '22px' }} aria-label="Загрузка расписания" />
      ) : (
        <Card>
          <Box component="section" aria-label="Календарь занятий" data-testid="schedule-calendar">
            {page.view === 'week' ? <WeekGrid {...page.gridProps} /> : page.view === 'day' ? (
              <Box sx={styles.list}><ScheduleEventList events={page.agendaEvents} dateLabel={page.agendaDateLabel} onSelectEvent={page.gridProps.onSelectEvent} /></Box>
            ) : <Box sx={styles.list}><ScheduleEventList events={page.weekAgendaEvents} dateLabel="Занятия на неделю" emptyText="На эту неделю занятий нет." onSelectEvent={page.gridProps.onSelectEvent} /></Box>}
          </Box>
          {page.summaryEvent && (
            <>
              <Divider />
              <SelectedScheduleEvent event={page.summaryEvent} canManage={page.canManage} onOpen={page.openDetails} onEdit={page.openEdit} onDelete={page.requestDelete} />
            </>
          )}
        </Card>
      )}
      <EventDetailModal event={page.selectedEvent} canManage={page.canManage} isDeleting={page.isDeleting} onClose={page.closeDetails} onEdit={page.openEdit} onDelete={page.requestDelete} />
      {page.dialog?.type === 'create' && <CreateEventModal initialDate={page.dialog.date} initialStartTime={page.dialog.startTime} initialEndTime={page.dialog.endTime} onClose={page.closeDialog} />}
      {page.dialog?.type === 'edit' && page.dialogEvent && <CreateEventModal event={page.dialogEvent} onClose={page.closeDialog} />}
      {page.dialog?.type === 'delete' && page.dialogEvent && <DeleteEventDialog title={page.dialogEvent.title} dateLabel={page.deleteDateLabel} isPending={page.isDeleting} hasError={page.deleteFailed} onCancel={page.closeDialog} onConfirm={page.confirmDelete} />}
    </Box>
  );
}
