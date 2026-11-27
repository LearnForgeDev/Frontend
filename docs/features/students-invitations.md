# Students and invitations

## Status and scope

Implemented at `students` inside a school: student listing, links to direct chat and
invitation creation/listing/editing/rotation/revocation and group management.
The route requires teaching capability.

## Behavior and rules

The roster displays names, contact information and group labels from backend data.
Opening chat uses the student's public ID; an unresolved ID disables the action.
Loading, empty roster and failed loading are distinct states.

Teachers and owners can create and rename school groups and replace their member
lists. The backend accepts active school members with tenant records. Changes
refresh the roster group labels. Groups use stable IDs, so renaming one preserves
its resource assignments. A create retry uses the original ID and can recover a
confirmed write. Deleting requires an empty group with no linked resources.

An invitation carries a role, expiration and use limit. Generated links point to
`/onboarding?invite=...` with an encoded token. The UI distinguishes revoked,
expired, exhausted and active invitations. Editing requires an integer limit not
below uses already consumed and an expiration within the configured future window.
Rotation replaces the link; revocation invalidates it. Successful writes refresh
the school-scoped invitation list.

## Data and dependencies

The backend owns invitation validity, role authorization and atomic consumption.
Client-side status is a presentation of known data, not permission to join.
Student and invitation records are school-scoped. Joining updates identity/membership through [onboarding](onboarding.md).

## Failure handling and limitations

Expired links, exhausted limits and disallowed role changes must remain failures.
The final available use must not be granted to multiple concurrent requests.
Role-specific invitation rights must be verified on the backend; `canTeach` alone
does not authorize every invitation operation.
If group reads fail, the panel offers retry. Failed writes keep form inputs.
The backend rejects foreign members and deletion of groups in use. Student
editing and removal remain separate workflows.

[Homework](homework.md) reuses the school roster and existing group read contracts
to choose an assignment audience. Selecting those entries grants homework access;
it does not create a student or group, or grant access to a containing course.

## Verification

Invitation unit tests cover return-path and
update validation. Browser invitation tests cover
management, rotation/removal, concurrent last-use consumption, expiration and
teacher restrictions. Additional browser journeys cover invitation lifecycle through
the UI and role restrictions. Core checks cover student-management route access.

## When changing this feature

Recheck [onboarding](onboarding.md), [school capabilities](schools-access.md),
[chat links](chat.md), [course audiences](courses.md) and [event attendees](scheduling.md).
