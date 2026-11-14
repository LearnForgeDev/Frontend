import type { ScheduleHeaderProps } from './ScheduleHeader.type';
import { Box, Button, IconButton, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import * as profile from '@/Services/Profile/ProfilePage.styles';
import { ViewToggle } from '../ScheduleGrid/ViewToggle';
import { useScheduleNavigation } from '../../hooks/useScheduleNavigation/useScheduleNavigation';
import { HEADER_TITLE_TEXT, TODAY_BUTTON_TEXT, NEW_EVENT_TEXT } from './ScheduleHeader.const';
import type { ScheduleHeaderProps } from './ScheduleHeader.type';
import { styles } from './ScheduleHeader.styles';

export function ScheduleHeader({ canManage, onCreate }: ScheduleHeaderProps) {
  const navigation = useScheduleNavigation();
  return (
    <Box component="header" sx={styles.root}>
      <Box sx={styles.headingRow}>
        <Box sx={profile.headerSx}>
          <Typography component="h1" sx={profile.pageTitleSx}>{HEADER_TITLE_TEXT}</Typography>
          <Typography sx={profile.subtitleSx}>Занятия школы и время для новых встреч.</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} data-testid="schedule-create" onClick={onCreate} sx={styles.createButton}>
            {NEW_EVENT_TEXT}
          </Button>
        )}
      </Box>
      <Box sx={styles.toolbar}>
        <Box sx={styles.navigation}>
          <Box sx={styles.navControls}>
            <Button variant="outlined" color="inherit" data-testid="schedule-today" onClick={navigation.goToday}>{TODAY_BUTTON_TEXT}</Button>
            <IconButton data-testid="schedule-previous" aria-label={navigation.previousLabel} onClick={navigation.goPrevious} sx={styles.arrowButton}><ChevronLeftRoundedIcon /></IconButton>
            <IconButton data-testid="schedule-next" aria-label={navigation.nextLabel} onClick={navigation.goNext} sx={styles.arrowButton}><ChevronRightRoundedIcon /></IconButton>
          </Box>
          <Typography component="h2" sx={styles.period} aria-live="polite">{navigation.title}</Typography>
        </Box>
        <ViewToggle />
      </Box>
    </Box>
  );
}
