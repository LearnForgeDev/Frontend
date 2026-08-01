import { Box, Button, Divider, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext.tsx';
import { MiniCalendar } from '@/Services/Scheduling/components/MiniCalendar/MiniCalendar';
import { UpcomingEventsList } from '@/Services/Scheduling/components/UpcomingEventsList/UpcomingEventsList';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { styles } from './ScheduleSidebar.styles';

export interface ScheduleSidebarProps {
  events: ScheduleEvent[];
  canManage: boolean;
  onOpenCreateModal: () => void;
}

export function ScheduleSidebar({ events, canManage, onOpenCreateModal }: ScheduleSidebarProps) {
  const { selectedDate, setSelectedDate, selectedEventId, setSelectedEventId } = useSchedulingContext();

  return (
    <Box sx={styles.root}>
      {canManage && (
        <Box sx={styles.createButtonWrapper}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={styles.createButton}
            onClick={onOpenCreateModal}
          >
            Новое занятие
          </Button>
        </Box>
      )}

      <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <Divider sx={styles.sectionDivider} />

      <Box sx={styles.upcomingContainer}>
        <Typography variant="caption" sx={styles.upcomingTitle}>
          Ближайшие
        </Typography>
        <UpcomingEventsList
          events={events}
          onSelect={setSelectedEventId}
          selectedEventId={selectedEventId}
        />
      </Box>
    </Box>
  );
}
