# User profile

## Status and scope

Implemented at `/app/profile`: identity/contact display, school roles, upcoming
event, school onboarding, event creation and logout. `/profile` is a legacy redirect.
Identity remains read-only; profile editing and avatar upload are not connected.

## Behavior and rules

Identity belongs to auth; school labels and roles belong to school memberships.
The page composes its public feature hook, which observes the existing auth store
and membership/schedule queries. The upcoming event opens the selected school's
calendar with the event ID. Membership and schedule failures render independently.

Opening profile from a confirmed school route retains that school as the active
selection, including when the route was opened directly. The switcher and school
navigation remain available on profile. The visible Back action restores the recorded
in-app source path, query and fragment. Direct entry, an invalid return path or a
profile loop falls back to the selected confirmed school's Today page, or `/app`
without a school. Back does not depend on external browser history.

The route is outside a school URL. It selects the available stored active school,
otherwise the first teaching membership, otherwise the first membership. The schedule
query and event link both use that confirmed school. With no memberships, no schedule
request or event-creation action is available.

The school-card action opens onboarding. Teachers and owners in the selected school
can open the existing scheduling form. Opening it installs that school as the active
scope so attendee reads and event writes use the same school as the profile. Students
cannot open the form. Closing or successfully saving returns to the profile, and
the scheduling workflow owns validation, persistence and query refresh.

## Data and dependencies

[Authentication](auth-session.md) owns identity/logout; [schools](schools-access.md)
owns memberships and the selected school; [scheduling](scheduling.md) owns events.
The avatar endpoint's existence does not mean the profile page exposes that operation.

## Failure handling and limitations

Missing identity must not render another user's profile. Loading/error/empty school
and event states are distinct. Avoid treating optional email/phone or unavailable
events as confirmed data. Event-creation failure keeps the scheduling form available;
backend authorization remains authoritative even when a teaching action is visible.

## Verification

The logout action clears session credentials and performs full-page navigation to
login even if memberships or schedule data cannot load. Account-scoped drafts survive
logout; private query scope does not cross into the next account.

Existing browser checks cover guest route protection and current logout behavior.
Focused checks cover retained school selection, safe Back navigation, role-limited
creation, scoped event reads and links, independent loading/errors and the card actions.
Separate unit checks establish
the full-page logout operation. Browser journeys additionally cover layout bounds,
event persistence and access from onboarding/waiting. Browser navigation and
real-backend acceptance still require CI verification.

## When changing this feature

Review session/cache isolation, active-school schedule scope and backend profile
contracts before enabling edits or avatar upload.
