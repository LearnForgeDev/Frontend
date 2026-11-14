import type { MeetingInterval } from '@/Services/Scheduling/utils/meeting.utils';

export interface StartMeetingNowDialogProps {
  interval: MeetingInterval | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
