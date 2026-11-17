# Courses

## Status and scope

Courses provide a flat ordered path of article, file, scheduled-class and homework
blocks. Teachers select existing resources, customize each block title/description,
reorder or remove blocks, choose completion conditions or make blocks optional and set an availability
window. A resource may appear more than once. The path is strictly linear: a learner
can open a block only after all earlier required blocks are complete. Optional
blocks have no completion condition, do not affect the denominator and never delay
later blocks. Sections and branching are outside this model.

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

New steps default to file opening, one minute of reading, the scheduled call end
or homework approval. Teachers can change these conditions before saving.

Teachers choose each block's completion condition. Files complete after a successful
authorized opening. Lessons complete after the configured accumulated time with the
lesson open in a tab, including background-tab time. Teachers enter whole minutes;
the API stores seconds. Leaving the reader stops counting, and reopening resumes
from persisted time. There is no activity or visibility detection. If another tab or a reset invalidates
the current time session, reporting opens a new session automatically. The server
keeps accumulated time unless the teacher resets it.

Homework can complete after submission or after approval. Approval keeps the existing
rule: a Checked attempt meeting that attempt version's passing score. Historical
passes survive later publication. Calls use Jitsi through the existing scheduled
event. A call can complete at its scheduled end, at a teacher-selected timestamp,
or after manual teacher confirmation for that learner. Manual confirmation and
reset controls live in the teacher's progress view. Learners cannot manually check
automatic or teacher-approved blocks complete.

The backend owns unlock decisions, automatic completion, accumulated time and
teacher approvals. Course navigation checks the latest access before opening a
resource; direct course lesson reads also validate the item. Progress polls while
the course is open so time-based call completion appears without a reload.

Course resource labels use «Статьи» and «Файлы»; identifiers and source APIs retain
their existing names. Course cards and headers omit student counts. Enrollment and progress management
remain available. Back navigation belongs in the course and lesson headers.

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

When an existing block's content, source or completion settings change, saving asks
the teacher whether to keep or reset earned completion for changed blocks. Continuing
to edit cancels that save. The chosen policy travels with each update; a reset clears
that block's stored completion and time. The reset policy applies only to changed blocks. Unchanged blocks keep their
progress even when the teacher resets other edited blocks in the same save. Retrying
a partial save does not reset a block already saved, including normalized titles
and equivalent timestamp formats returned by the backend.

Read failures differ from empty results. Temporary refresh failures may retain
previously authorized data with a warning. A source lesson or its content file returning
403/404 clears that block's cached document and shows a retryable error. It preserves
the authorized course and progress, so automatic course refresh does not repeatedly
reload the denied source. A later visit or explicit retry checks source access again.
Course-endpoint denial, including the activity check before reading an article,
or an expired session removes protected course, roster,
progress and lesson state and advances an access epoch. Reads started before
that denial and writes/material downloads carrying an older epoch cannot restore
protected data, report success or navigate. Pending writes still settle before their
operation locks clear. A fresh authorized read can restore access normally.
After course access denial, the reader waits for explicit retry, focus or another
visit before reloading the course. Clearing denied state does not trigger a reread.
Failed progress writes do not appear persisted.
Refreshing or returning to the course rereads backend progress after homework review.

## Verification

Focused tests cover mixed reference mapping, duplicate identities, safe multi-stage
saves, uncertainty, audience preservation, scoped Redux reads and editor recovery.
Component tests exercise mixed program actions and block authoring controls.
Focused progression checks cover locked actions, completion-rule authoring,
keep/reset confirmation and tab-time accumulation. Browser scenarios cover real
teacher/student mixed paths, persisted independent
progress, source preservation and warmed-access revocation. They require the
companion backend revision and run in CI; adding them is not a claim of execution.
See [course acceptance scenarios](../e2e/courses.md) and [testing policy](../guides/testing.md).

Related modules: [lessons](lessons-editor.md), [students](students-invitations.md),
[files](files.md), [scheduling](scheduling.md) and [homework](homework.md).
