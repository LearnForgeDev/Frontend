# Courses

## Status and scope

Courses provide a flat ordered path of lesson, material, scheduled-class and homework
blocks. Teachers select existing resources, customize each block title/description,
reorder or remove blocks, mark them required or optional and set an availability
window. A resource may appear more than once. Sections and prerequisite unlocking
are outside this model.

## Ownership and access

The backend owns course records, audience, item identity and learner progress. The
public course hook owns supported client operations; Redux owns loaded course
business state. Forms, open dialogs and authorized material preview URLs stay local.
Changing account or school clears the active course scope and rejects late responses.

The backend-provided `canManage` capability governs editing. The frontend does
not infer that capability from course authorship or replace backend authorization. Course audience can be school-wide, selected students or
selected groups. Saving student selections preserves other valid user assignments.
Removing the last student never implicitly opens the course to the whole school.

Source lessons, schedule events and homework keep their independent access rules.
Adding a block does not broaden source permissions. The homework picker lists
accessible assignments with an active published version, including an older active
version while a replacement is queued. Removing a block or deleting a course never
deletes the source resource.

## Program and progress

Every occurrence has its own item UUID. Repeated lesson references retain separate
positions and progress. Lesson links carry that item identity back into the course
reader. Materials load through the authorized course-item file endpoint; image/PDF
previews and downloads use temporary browser URLs that are revoked on replacement
or exit. Scheduled-class blocks open the existing schedule event by its public UUID.
Homework blocks open the shared homework workflow with course/item return context.
Returning from homework keeps the originating item UUID in the URL. Once the
program loads, that occurrence receives focus and scrolls into view. Progress
refreshes do not repeat the jump; absent or removed item IDs leave focus alone.

Availability starts inclusively and ends exclusively, in UTC. Forms display local
browser time. Managers may inspect dated content; learner actions are disabled
outside the window and the backend remains responsible for authorization.

Learners manually mark supported non-homework blocks complete or incomplete.
Required blocks determine the progress denominator. Homework completion is owned by
the backend and requires a Checked attempt meeting that attempt version's passing
score. Historical passes survive later publication; opening/submitting homework
alone does not complete its course block. There is no manual homework completion.

Unknown or malformed item types remain visible and retain their original payload
when other parts of the course change. They are not converted into lesson blocks.

## Saving and failures

Saves span metadata, item and audience operations. New courses stay restricted to
the author until their program is saved. Existing audience reductions happen before
program edits; additions happen only after success. Partial failures retain form
input and known created course/item identities for retry. An uncertain creation
response blocks retry until the user reloads, preventing automatic duplication.
Its recovery notice remains visible when the user edits other form fields.
Unexpected concurrently added/deleted program items require reopening the editor.

Read failures differ from empty results. Temporary refresh failures may retain
previously authorized data with a warning. A source lesson or its content file returning
403/404 clears that block's cached document and shows a retryable error. It preserves
the authorized course and progress, so automatic course refresh does not repeatedly
reload the denied source. A later visit or explicit retry checks source access again.
Course-endpoint denial or an expired session removes protected course, roster,
progress and lesson state and advances an access epoch. Reads started before
that denial and writes/material downloads carrying an older epoch cannot restore
protected data, report success or navigate. Pending writes still settle before their
operation locks clear. A fresh authorized read can restore access normally.
Failed progress writes do not appear persisted.
Refreshing or returning to the course rereads backend progress after homework review.

## Verification

Focused tests cover mixed reference mapping, duplicate identities, safe multi-stage
saves, uncertainty, audience preservation, scoped Redux reads and editor recovery.
Component tests exercise mixed program actions and block authoring controls.
Browser scenarios cover real teacher/student mixed paths, persisted independent
progress, source preservation and warmed-access revocation. They require the
companion backend revision and run in CI; adding them is not a claim of execution.
See [course acceptance scenarios](../e2e/courses.md) and [testing policy](../guides/testing.md).

Related modules: [lessons](lessons-editor.md), [students](students-invitations.md),
[files](files.md), [scheduling](scheduling.md) and [homework](homework.md).
