import { Box, Button, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ViewToggle } from '../ScheduleGrid/ViewToggle';
import { useScheduleNavigation } from '../../hooks/useScheduleNavigation/useScheduleNavigation';
import { HEADER_TITLE_TEXT, TODAY_BUTTON_TEXT, NEW_EVENT_TEXT, PREVIOUS_PERIOD_TEXT, NEXT_PERIOD_TEXT } from './ScheduleHeader.const';
import { styles } from './ScheduleHeader.styles';

interface ScheduleHeaderProps {
  canManage: boolean;
  onCreate: () => void;
}

export function ScheduleHeader({ canManage, onCreate }: ScheduleHeaderProps) {
  const navigation = useScheduleNavigation();
  return (
    <Box component="header" sx={styles.root}>
      <Box sx={styles.leftGroup}>
        <Typography variant="h5" component="h1" sx={styles.heading}>{HEADER_TITLE_TEXT}</Typography>
        <Box sx={styles.navControls}>
          <Button variant="outlined" size="small" color="inherit" sx={styles.todayButton} onClick={navigation.goToday}>{TODAY_BUTTON_TEXT}</Button>
          <IconButton aria-label={PREVIOUS_PERIOD_TEXT} onClick={navigation.goPrevious} size="small"><ChevronLeftIcon /></IconButton>
          <IconButton aria-label={NEXT_PERIOD_TEXT} onClick={navigation.goNext} size="small"><ChevronRightIcon /></IconButton>
        </Box>
        <Typography component="h2" sx={styles.monthYearTitle}>{navigation.title}</Typography>
      </Box>
      <Box sx={styles.rightGroup}>
        {canManage && <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={styles.mobileCreate}>{NEW_EVENT_TEXT}</Button>}
        <ViewToggle />
      </Box>
    </Box>
  );
}
