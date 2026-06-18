/**
 * Domain models for the Scheduling (calendar) feature.
 *
 * These are a 1:1 adaptation of the wire DTOs in `@/Endpoints/schedule.types`
 * — the only transform is renaming the ISO time fields (`startUtc`/`endUtc`
 * → `start`/`end`), the same pattern `apiFileToLesson` applies for Files.
 * No field exists here that the backend contract does not return.
 */

/** Role encoded the same way as `User.roles`: 0=Student, 1=Teacher, 2=Owner. */
export type AttendeeRole = 0 | 1 | 2;

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
  /** ISO-8601 UTC start instant. */
  start: string;
  /** ISO-8601 UTC end instant. */
  end: string;
  /** Jitsi room identifier — fed to `POST /api/ApiMeet/token` as `Room`. */
  room: string;
  hostUserPublicId: string;
  attendees: Attendee[];
}

/** A school member, used to populate the attendee picker in the create form. */
export interface Member {
  userPublicId: string;
  displayName: string;
}

/** Payload for creating a scheduled event (mirrors backend CreateScheduleEventModel). */
export interface CreateScheduleEventInput {
  title: string;
  description: string | null;
  startUtc: string;
  endUtc: string;
  room?: string;
  attendeeUserPublicIds: string[];
}
