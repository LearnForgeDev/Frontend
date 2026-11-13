import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';
import type { MeetingInterval } from '@/Services/Scheduling/utils/meeting.utils';

export interface UseStartMeetingNowReturn {
  startMeetingNow: (event: ScheduleEvent, interval: MeetingInterval) => Promise<void>;
  isPending: boolean;
}
