import type { Attendee } from '@/Services/Scheduling/Scheduling.types';

export interface AttendeeAvatarsProps {
  attendees: Attendee[];
  max?: number;
}
