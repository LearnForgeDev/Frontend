# User profile

## Status and scope

Implemented as a read-only account overview at `/app/profile`: identity/contact
display, school roles, upcoming event and logout. `/profile` is a legacy redirect.
Profile editing and avatar upload are not connected user workflows.

## Behavior and rules

Identity belongs to auth; school labels and roles belong to school memberships.
Under the required architecture, the page obtains both through public feature hooks.
Existing direct store/query access is a migration gap, not the target boundary. The upcoming event uses existing schedule data and opens the
selected school's calendar with the event ID. Membership and schedule failures are
rendered independently.

The route is outside a school URL; schedule scope selection
can use the persisted active school. Do not invent a route school ID or mix an event
from one school with a link to another.

## Data and dependencies

[Authentication](auth-session.md) owns identity/logout; [schools](schools-access.md)
owns memberships and the selected school; [scheduling](scheduling.md) owns events.
The avatar endpoint's existence does not mean the profile page exposes that operation.

## Failure handling and limitations

Missing identity must not render another user's profile. Loading/error/empty school
and event states are distinct. Avoid treating optional email/phone or unavailable
events as confirmed data. Do not add speculative profile writes to a read-only page.

## Verification

The logout action clears session credentials and performs full-page navigation to
login even if memberships or schedule data cannot load. Account-scoped drafts survive
logout; private query scope does not cross into the next account.

Existing browser checks cover guest route protection and current logout behavior.
Browser journeys now cover profile identity/roles, event navigation and access from
onboarding/waiting. Focused unit checks establish the full-page logout operation;
browser navigation and real-backend acceptance still require CI verification.

## When changing this feature

Review session/cache isolation, active-school schedule scope and backend profile
contracts before enabling edits or avatar upload.
