import { Box, Button, Skeleton, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useScheduleEvents } from '@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents';
import { JoinButton } from '@/Services/Scheduling/components/JoinButton/JoinButton';
import { findEventsForDate, formatEventTimeRange } from '@/Services/Scheduling/utils/time.utils';
import { styles } from './ScheduleDashboardWidget.styles';

/** Compact "today's sessions" widget for the school overview page. */
export function ScheduleDashboardWidget() {
  const navigate = useNavigate();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const { events, isLoading, isError } = useScheduleEvents();

  const today = findEventsForDate(events, new Date()).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  return (
    <Box className="admin-card" sx={styles.root}>
      <Box sx={styles.header}>
        <Typography component="h3" sx={styles.title}>
          Сегодня
        </Typography>
        <Button
          size="small"
          onClick={() => navigate(`/admin/schools/${schoolPublicId}/schedule`)}
        >
          Открыть календарь
        </Button>
      </Box>

      {isError ? (
        <Typography variant="body2" color="error">
          Не удалось загрузить расписание.
        </Typography>
      ) : isLoading ? (
        <Skeleton variant="rounded" height={64} />
      ) : today.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          На сегодня занятий нет.
        </Typography>
      ) : (
        <Box sx={styles.list}>
          {today.map((event) => (
            <Box key={event.id} sx={styles.row}>
              <Box sx={styles.rowText}>
                <Typography sx={styles.eventTitle}>{event.title}</Typography>
                <Typography sx={styles.eventTime}>
                  {formatEventTimeRange(event.start, event.end)}
                </Typography>
              </Box>
              <JoinButton event={event} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
