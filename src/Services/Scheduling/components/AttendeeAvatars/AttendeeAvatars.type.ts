import type { Attendee } from '@/Services/Scheduling/Scheduling.type';

export interface AttendeeAvatarsProps {
  attendees: Attendee[];
  max?: number;
}
