import type { ScheduleEventDto } from './schedule.contract.type';
export type { AttendeeDto, ScheduleEventDto, CreateScheduleEventModel } from './schedule.contract.type';
import type { ScheduleEvent, Attendee } from '@/Services/Scheduling/Scheduling.type';

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

/**
 * Response item for `GET /api/ApiSchedule/{schoolPublicId}/events`.
 * Times are ISO-8601 UTC strings (`...Z`), consistent with `ApiFile.uploadedAt`.
 * `room` is the Jitsi room id handed to `POST /api/ApiMeet/token` (as `Room`)
 * to mint a join link — the bridge between the schedule and the Meet endpoint.
 */

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
