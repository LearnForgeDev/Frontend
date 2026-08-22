import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import type { MeetingInterval } from '@/Services/Scheduling/utils/meeting.utils';

export interface UseStartMeetingNowReturn {
  startMeetingNow: (event: ScheduleEvent, interval: MeetingInterval) => Promise<void>;
  isPending: boolean;
}
