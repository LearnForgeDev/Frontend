import { createApiClient } from './factory';
import config from '../config';
import type { ScheduleEventDto, CreateScheduleEventDto } from './schedule.types';

/* ============================================================================
 * ENDPOINT INVESTIGATION — where does a calendar event come from?
 * ----------------------------------------------------------------------------
 * A scheduled tutoring session needs to persist, queryable per-school: title,
 * description, start time, end time, attendees, and a join target (room).
 * Every documented endpoint group was evaluated as a data source:
 *
 *   - ApiAuth   (REJECT): identity, sessions, school invites. No event concept.
 *   - ApiSchool (REJECT): school provisioning metadata. No per-event fields.
 *   - ApiBreanches (REJECT): a "branch" is a persistent group-chat channel
 *       (Name, Description, files). Not a time-boxed occurrence with attendees.
 *   - ApiFiles  (REJECT — closest analog): this is what Lessons repurposed via
 *       the `lesson::{title}::{id}::{status}.lesson` filename trick + JSON body.
 *       It is NOT reusable here: (a) no server-side date-range query — you'd GET
 *       every file in the school and parse client-side, pathological for a
 *       calendar; (b) a lesson genuinely IS a document (its Lexical body needs
 *       blob storage), so Files is its legitimate home; a session is a
 *       relational record with no document body. Encoding ISO times + an
 *       attendee list into a filename is abuse, not repurposing.
 *   - ApiMeet   (ACCEPT, but as join-link provider only): POST /api/ApiMeet/token
 *       mints a Jitsi roomUrl for a room *now*. It is the join mechanism, never
 *       the schedule. The calendar feeds this endpoint an event's `room`.
 *
 * CONCLUSION: no existing resource can legitimately hold event data. We
 * forward-declare a new, school-scoped `ApiSchedule` resource following the
 * exact conventions in the API (ApiX prefix, {schoolPublicId} first route
 * segment, role-gated POST/DELETE, bare-array list response like
 * GET /api/ApiFiles/{schoolId}). The event's `room` bridges to the existing
 * ApiMeet/token to produce the join link.
 *
 * This is a forward-declared REAL contract for the backend team (see
 * docs/contracts/ApiSchedule.md in the backend repo) — not a mock or fixture.
 * Until the backend ships it, these calls return real empty/loading/error
 * states, handled honestly by the UI.
 * ========================================================================== */

const apiClient = createApiClient(config.endpointUrl);

export const scheduleEndpoints = {
  /**
   * GET /api/ApiSchedule/{schoolPublicId}/events
   * List the school's scheduled sessions. Any authenticated member.
   */
  async listEvents(schoolId: number | string): Promise<ScheduleEventDto[]> {
    const response = await apiClient.get<ScheduleEventDto[]>(`/api/ApiSchedule/${schoolId}/events`);
    return response.data;
  },

  /**
   * POST /api/ApiSchedule/{schoolPublicId}/events
   * Create a scheduled session. Teacher/Owner only.
   */
  async createEvent(schoolId: number | string, dto: CreateScheduleEventDto): Promise<ScheduleEventDto> {
    const response = await apiClient.post<ScheduleEventDto>(`/api/ApiSchedule/${schoolId}/events`, dto);
    return response.data;
  },

  /**
   * DELETE /api/ApiSchedule/{schoolPublicId}/events/{eventId}
   * Delete a scheduled session. Teacher/Owner only.
   */
  async deleteEvent(schoolId: number | string, eventId: string): Promise<void> {
    await apiClient.delete(`/api/ApiSchedule/${schoolId}/events/${eventId}`);
  },
};
