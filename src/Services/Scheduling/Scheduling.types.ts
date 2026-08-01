/**
 * Domain models for the Scheduling (calendar) feature.
 *
 * These are a 1:1 adaptation of the wire DTOs in `@/Endpoints/schedule.types`
 * — the only transform is renaming the ISO time fields (`startUtc`/`endUtc`
 * → `start`/`end`), the same pattern `apiFileToLesson` applies for Files.
 * No field exists here that the backend contract does not return.
 */

import { AuthRole } from '@/Assets/Types/commonTypes.ts';

/** Alias for global AuthRole (0=Student, 1=Teacher, 2=Owner). */
export type AttendeeRole = AuthRole;
export const AttendeeRole = AuthRole;

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
