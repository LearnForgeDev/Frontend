# Scheduling and event participation

## Status and scope

Implemented at `schedule`: calendar/agenda navigation, event creation/update/delete,
attendee selection, event deep links and entry into embedded calls. Teachers and
owners get teaching actions; backend authorization still decides each write.

## Behavior and rules

The schedule uses the shared page hierarchy with one creation action and one
period/view toolbar. Day lists the selected day's events. Events lists the selected
week once per event, with one empty state when the week has no events. Week shows
seven full-day timeline columns on desktop and seven dated list groups below the
medium breakpoint, including empty dates. All three controls remain available at
320px and 444px without horizontal clipping.

Desktop Week retains every hour from 00:00 through 23:00 and initially scrolls to
10:00. Overlapping visible blocks use separate columns; overnight records are clipped
to each displayed day rather than dropped. The initial narrow view is Day. Day
navigation advances one date; Week and Events advance seven dates. Today returns to
the current local date, and period labels include the actual day/week boundaries.

Selecting an event opens its inline summary. Its explicit details action opens the
existing description, attendees, calendar export and meeting controls. Teaching
users can edit or request deletion directly from the summary. Deep links retain the
existing details-dialog behavior. The summary stores only an event ID and follows
current query data after writes, rather than retaining a second event record.

Creation defaults to the selected date and keeps the form's full time choices. The
Day list replaces its former timeline; desktop Week retains hour-slot creation.
The final hour defaults its end to 23:59 so the one-date form starts with a valid
interval instead of crossing midnight.
The former mini-calendar/sidebar is replaced by the approved single-toolbar layout.

Event forms require a title, date and valid start/end time with start before end.
Local form time is converted to UTC for transport and formatted locally for display.
The current form uses one date, so it cannot directly create a cross-midnight range.

Attendance is explicit: choose students or choose an event without students. An
empty untouched selection must not silently invite the school. Existing event
attendees remain available while editing even if not present in the simple roster.

Event links use `?eventId=...`; opening a link must wait for successful event loading
before deciding that the event is unavailable. Calendar navigation allows past days
and supports returning to Today.

Deletion opens a confirmation dialog. Cancel keeps the event; successful deletion
closes the dialog, while failure leaves retry/cancel available.

Joining navigates to the school's `calls` route with room/title parameters. The call
page obtains authorization/token data separately. Starting an event now first moves
the event interval while preserving duration and attendees, then enters the room.

## Data and dependencies

Event records are scoped to the school and use the declared backend contract.
The same event data feeds [Today](today.md) and [Profile](profile.md). Server dates
are authoritative instants; view selection and form input are local UI state.
Room names in a URL are references, not a grant of meeting access.

The shared schedule reader accepts an explicit school scope for account-level pages;
otherwise it uses the existing route/active-school scope. An explicit empty scope
disables the query. Profile chooses its school from confirmed memberships and sets
that same active scope before opening the existing event form.

## Failure handling and limitations

Do not interpret a failed event query as an empty schedule. Keep forms available
after failed writes and allow explicit retry/cancel. Preserve attendee choices when
changing an event. Server-side participation/time-window rules must be checked
against the backend, not inferred from a frontend join button.

## Verification

- Schedule rules, time/audit boundaries and form/access validation.
- Attendee selection, offline delete and deep-link recovery.
- Core browser creation, permissions and mobile navigation.
- Day/week/agenda composition, overlap positioning and period boundaries.
- CI browser checks and desktop/320px/444px captures cover all seven narrow-week
  dates, untruncated controls, early/late events and inline selection before details.

## When changing this feature

Review [Today clocks](today.md), [calls](calls.md), student IDs and timezone/DST
boundaries. See [schedule/call scenarios](../e2e/schedule-and-calls.md).
