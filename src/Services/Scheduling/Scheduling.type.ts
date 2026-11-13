import type { AuthRole } from '@/Assets/Types/commonTypes.ts';

export type AttendeeRole = AuthRole;

export interface Attendee {
  userPublicId: string;
  displayName: string;
  role: AttendeeRole;
  avatarUrl: string | null;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  room: string;
  hostUserPublicId: string;
  attendees: Attendee[];
}

export interface Member {
  userPublicId: string;
  displayName: string;
}

export interface CreateScheduleEventInput {
  title: string;
  description: string | null;
  startUtc: string;
  endUtc: string;
  room?: string;
  attendeeUserPublicIds: string[];
}
