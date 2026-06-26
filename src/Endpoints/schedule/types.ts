import type { ScheduleEvent, Attendee, AttendeeRole } from '@/Services/Scheduling/Scheduling.types';

/**
 * Request/response DTOs for the forward-declared `ApiSchedule` resource.
 *
 * These mirror, field-for-field, the contract documented at the top of
 * `schedule.endpoints.ts`. No field appears here that the proposed backend
 * does not return — the domain types in `Scheduling.types.ts` are a 1:1
 * adaptation (the only transform is the ISO field rename, the same pattern
 * `apiFileToLesson` uses for Files).
 */

/** A single attendee as returned inside a ScheduleEvent. */
export interface AttendeeDto {
  userPublicId: string;
  displayName: string;
  role: AttendeeRole;
  avatarUrl: string | null;
}

/**
 * Response item for `GET /api/ApiSchedule/{schoolPublicId}/events`.
 * Times are ISO-8601 UTC strings (`...Z`), consistent with `ApiFile.uploadedAt`.
 * `room` is the Jitsi room id handed to `POST /api/ApiMeet/token` (as `Room`)
 * to mint a join link — the bridge between the schedule and the Meet endpoint.
 */
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

export function scheduleEventDtoToEvent(dto: ScheduleEventDto): ScheduleEvent {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    start: dto.startUtc,
    end: dto.endUtc,
    room: dto.room,
    hostUserPublicId: dto.hostUserPublicId,
    attendees: dto.attendees.map(
      (a): Attendee => ({
        userPublicId: a.userPublicId,
        displayName: a.displayName,
        role: a.role,
        avatarUrl: a.avatarUrl,
      }),
    ),
  };
}
