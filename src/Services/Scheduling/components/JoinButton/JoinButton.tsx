import { Button, CircularProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useJoinWindow } from '@/Services/Scheduling/hooks/useJoinWindow/useJoinWindow';
import { useJoinMeeting } from '@/Services/Scheduling/hooks/useJoinMeeting/useJoinMeeting';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

export interface JoinButtonProps {
  event: ScheduleEvent;
  size?: 'small' | 'medium' | 'large';
}

export function JoinButton({ event, size = 'small' }: JoinButtonProps) {
  const isOpen = useJoinWindow(event);
  const joinMeeting = useJoinMeeting();

  return (
    <Button
      variant="contained"
      size={size}
      color="primary"
      disabled={!isOpen || joinMeeting.isPending}
      startIcon={joinMeeting.isPending ? <CircularProgress size={16} color="inherit" /> : <VideocamIcon />}
      onClick={() => joinMeeting.mutate(event)}
    >
      {isOpen ? 'Войти' : 'Скоро'}
    </Button>
  );
}
