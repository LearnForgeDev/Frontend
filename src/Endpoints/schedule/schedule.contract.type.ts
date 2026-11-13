import type { AttendeeRole } from '@/Services/Scheduling/Scheduling.type';

export interface AttendeeDto {
  userPublicId: string;
  displayName: string;
  role: AttendeeRole;
  avatarUrl: string | null;
}

export interface ScheduleEventDto {
  id: string;
  schoolPublicId: string;
  title: string;
  description: string | null;
  startUtc: string;
  endUtc: string;
  room: string;
  hostUserPublicId: string;
  attendees: AttendeeDto[];
}

export interface CreateScheduleEventModel {
  title?: string | null;
  description?: string | null;
  startUtc: string;
  endUtc: string;
  room?: string | null;
  attendeeUserPublicIds?: string[] | null;
  schoolPublicId?: string | null;
}
