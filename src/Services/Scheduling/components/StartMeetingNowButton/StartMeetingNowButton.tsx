import { useState } from 'react';
import { Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { StartMeetingNowDialog } from '@/Services/Scheduling/components/StartMeetingNowDialog/StartMeetingNowDialog';
import { useJoinWindow } from '@/Services/Scheduling/hooks/useJoinWindow/useJoinWindow';
import { useStartMeetingNow } from '@/Services/Scheduling/hooks/useStartMeetingNow/useStartMeetingNow';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { moveMeetingToTimestamp, type MeetingInterval } from '@/Services/Scheduling/utils/meeting.utils';
import { START_MEETING_NOW_BUTTON_TEXT } from './StartMeetingNowButton.const';

export interface StartMeetingNowButtonProps {
  event: ScheduleEvent;
}

export function StartMeetingNowButton({ event }: StartMeetingNowButtonProps) {
  const [interval, setInterval] = useState<MeetingInterval | null>(null);
  const { isFuture } = useJoinWindow(event, true);
  const { startMeetingNow, isPending } = useStartMeetingNow();

  if (!isFuture) {
    return null;
  }

  const handleOpenConfirmation = () => {
    setInterval(moveMeetingToTimestamp(event, Date.now()));
  };

  const handleConfirm = () => {
    if (!interval) return;

    startMeetingNow(event, interval)
      .then(() => setInterval(null))
      .catch(() => undefined);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<PlayArrowIcon />}
        onClick={handleOpenConfirmation}
      >
        {START_MEETING_NOW_BUTTON_TEXT}
      </Button>
      <StartMeetingNowDialog
        interval={interval}
        isPending={isPending}
        onCancel={() => setInterval(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
