# Scheduling and call acceptance

See [scheduling](../features/scheduling.md) and [calls](../features/calls.md).
The call architecture discussion is deferred; this catalogue does not select a redesign.
Use distinct roles, controlled dates/timezones and real backend authorization.

## Scheduling

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| SCHEDULE-01 | P0 | Open populated and empty calendars in each supported view. | Correct school events and intervals appear; empty does not hide a read failure. |
| SCHEDULE-02 | P1 | Navigate previous/next periods, choose dates and return to Today. | Selection, labels and events remain consistent, including past dates and overlapping intervals. |
| SCHEDULE-03 | P0 | Create a titled event with explicit attendees or explicit no-students choice. | UTC interval, room and exact participants persist and authorized invitees can read it. |
| SCHEDULE-04 | P1 | Create through an available calendar slot. | Form interval matches the selected slot and its configured default duration. |
| SCHEDULE-05 | P1 | Omit required values; use equal/reversed times; then correct them. | Invalid writes are blocked and correction permits submission. |
| SCHEDULE-06 | P0 | Edit date/time/description and reload. | The new values persist without silently dropping room or attendees. |
| SCHEDULE-07 | P1 | Rename inline, cancel and fail saving in separate cases. | Only confirmed edits are presented as saved and other fields are preserved. |
| SCHEDULE-08 | P0 | Request deletion, cancel, then confirm; fail a separate deletion. | Cancel preserves the event; success closes the dialog; failure keeps retry/cancel usable. |
| SCHEDULE-09 | P1 | Open an event deep link, a missing ID and a read failure; recover and close. | Only the correct event opens and failure does not prematurely establish absence. |
| SCHEDULE-10 | P1 | Export/open an external-calendar link. | The link identifies the correct title and UTC interval; third-party account login is outside the basic check. |
| SCHEDULE-11 | P0 | Request management actions as student through UI and direct API. | Management controls and writes are denied without changing events. |
| SCHEDULE-12 | P1 | Fail reads, writes and attendee loading, then recover. | Error/retry is useful, input remains and unknown attendance cannot silently become school-wide. |

Attendance is deliberate; choosing all students is a separate action. Test at least
two controlled timezones, midnight overlap and invalid intervals. Recurring-event
management is not a connected workflow.

## Meeting entry

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| CALL-01 | P0 | Check learner/teacher entry before, at and after the configured join window. | Availability updates without reload and respects role/time boundaries; backend rights are checked separately. |
| CALL-02 | P0 | Enter from an event/Today card and an authorized room link. | Correct school, room and title reach a real backend authorization operation. |
| CALL-03 | P0 | Request a room as authorized participant, guest, outsider and restricted user. | Only permitted users receive access; one successful owner request is insufficient evidence. |
| CALL-04 | P1 | Open no/blank room, fail authorization/network and use retry/close. | Empty, pending and failed states are useful and do not loop indefinitely. |
| CALL-05 | P1 | In an approved media environment, join/leave, toggle fullscreen and change room. | The old client/resources are released and the new room does not retain the previous one. |
| CALL-06 | P0 | Invite selected participants and inspect their direct messages. | Only selected valid recipients get the matching school/room link, excluding the sender. |
| CALL-07 | P1 | Send no recipients, induce partial/full delivery failure and client-load failure. | Delivery claims match actual success and recovery remains usable. |
| CALL-08 | P0 | In an approved media environment, join with two users and test devices/leave. | Both receive media and leaving frees resources; a token test does not satisfy this criterion. |

A local media/backend deployment requires owner approval. Refer to executable
configuration for current environment settings; do not infer media support from them.
