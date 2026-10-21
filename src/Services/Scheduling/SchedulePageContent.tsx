import { Alert, Box, Button, Skeleton } from '@mui/material';
import { ScheduleHeader } from './components/ScheduleHeader/ScheduleHeader';
import { ScheduleSidebar } from './components/ScheduleSidebar/ScheduleSidebar';
import { EventDetailModal } from './components/EventDetailModal/EventDetailModal';
import { DeleteEventDialog } from './components/DeleteEventDialog/DeleteEventDialog';
import { WeekGrid } from './components/ScheduleGrid/WeekGrid';
import { DayGrid } from './components/ScheduleGrid/DayGrid';
import { AgendaList } from './components/ScheduleGrid/AgendaList';
import { CreateEventModal } from './components/CreateEventModal/CreateEventModal';
import { useSchedulePage } from './hooks/useSchedulePage/useSchedulePage';
import { ERROR_ALERT_TEXT, RETRY_BUTTON_TEXT, UNAVAILABLE_EVENT_TEXT } from './SchedulePage.const';
import { styles } from './SchedulePage.styles';

export function SchedulePageContent() {
  const page = useSchedulePage();
  return (
    <Box sx={styles.root}>
      <ScheduleHeader canManage={page.canManage} onCreate={page.openCreate} />
      {page.isLinkUnavailable && <Alert severity="info" onClose={page.dismissLink}>{UNAVAILABLE_EVENT_TEXT}</Alert>}
      {page.isError ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={page.refetch}>{RETRY_BUTTON_TEXT}</Button>}>{ERROR_ALERT_TEXT}</Alert>
      ) : page.isLoading ? (
        <Box sx={styles.body}>
          <Skeleton variant="rounded" sx={styles.skeletonSidebar} />
          <Skeleton variant="rounded" sx={styles.skeletonMain} />
        </Box>
      ) : (
        <Box sx={styles.body}>
          <Box component="aside" sx={styles.sidebarColumn}>
            <ScheduleSidebar events={page.events} canManage={page.canManage} onOpenCreateModal={page.openCreate} />
          </Box>
          <Box component="main" sx={styles.mainColumn}>
            {page.view === 'week' ? <WeekGrid {...page.gridProps} /> : page.view === 'day' ? <DayGrid {...page.gridProps} /> : <AgendaList {...page.gridProps} events={page.agendaEvents} dateLabel={page.agendaDateLabel} />}
          </Box>
          <EventDetailModal event={page.selectedEvent} canManage={page.canManage} isDeleting={page.isDeleting} onClose={page.closeDetails} onEdit={page.openEdit} onDelete={page.requestDelete} />
        </Box>
      )}
      {page.dialog?.type === 'create' && <CreateEventModal initialDate={page.dialog.date} initialStartTime={page.dialog.startTime} initialEndTime={page.dialog.endTime} onClose={page.closeDialog} />}
      {page.dialog?.type === 'edit' && page.dialogEvent && <CreateEventModal event={page.dialogEvent} onClose={page.closeDialog} />}
      {page.dialog?.type === 'delete' && page.dialogEvent && <DeleteEventDialog title={page.dialogEvent.title} dateLabel={page.deleteDateLabel} isPending={page.isDeleting} hasError={page.deleteFailed} onCancel={page.closeDialog} onConfirm={page.confirmDelete} />}
    </Box>
  );
}
