import type { JoinButtonProps } from './JoinButton.type';
export type { JoinButtonProps } from './JoinButton.type';
import { Button, CircularProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useJoinWindow } from '@/Services/Scheduling/hooks/useJoinWindow/useJoinWindow';
import { useJoinMeeting } from '@/Services/Scheduling/hooks/useJoinMeeting/useJoinMeeting';
import { useIsTeacherOrOwner } from '@/Services/Scheduling/hooks/useIsTeacherOrOwner/useIsTeacherOrOwner';

import { getCallButtonText } from './utils';

export function JoinButton({ event, size = 'small' }: JoinButtonProps) {
  const canManage = useIsTeacherOrOwner();
  const { canJoin, isFuture } = useJoinWindow(event, canManage);
  const joinMeeting = useJoinMeeting();

  return (
    <Button
      data-testid="schedule-join"
      variant="contained"
      size={size}
      color="primary"
      disabled={!canJoin || joinMeeting.isPending}
      startIcon={joinMeeting.isPending ? <CircularProgress size={16} color="inherit" /> : <VideocamIcon />}
      onClick={() => joinMeeting.mutate(event)}
    >
      {getCallButtonText(canJoin, isFuture)}
    </Button>
  );
}
