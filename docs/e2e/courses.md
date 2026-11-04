# Course acceptance

Course architecture discussion is deferred. These are existing acceptance goals,
not approval of a replacement design or evidence that the full suite exists.
See [course scope](../features/courses.md).

Use real backend contracts, authorized course managers, independent learners,
groups and published lessons. Basic fixtures alone do not prove all these contracts.

## Catalogue and creation

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| COURSE-01 | P0 | Open courses with different roles and assignments. | Only accessible courses appear; management and learner progress match permissions. |
| COURSE-02 | P1 | Search titles/descriptions with case/whitespace variants; clear; repeat empty. | Results match the filter; no matches differs from no courses and from a failed read. |
| COURSE-03 | P0 | Create metadata, two ordered lessons and an audience; inspect backend and reload. | One real course has the intended program/access; intermediate saves do not expose it to extra users. |
| COURSE-04 | P1 | Test required fields and configured validation limits, correct input and cancel. | Invalid/cancelled creation does not persist a course; valid correction can proceed. |

## Program, audience and progress

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| COURSE-05 | P0 | Edit metadata and reload catalogue/detail. | Changes persist without changing course identity. |
| COURSE-06 | P0 | Add/remove/reorder lesson items and reload. | Program order matches without duplicates; source lessons remain in the school. |
| COURSE-07 | P0 | Test school-wide, selected-student and group access independently. | Authorized learners can read; unassigned users cannot; roster explains access source. |
| COURSE-08 | P0 | Revoke user/group access after warming their state. | Subsequent confirmed denial hides protected course and progress data. |
| COURSE-09 | P0 | Open a program lesson as learner and return. | Correct published content is read-only and return reaches the same course. |
| COURSE-10 | P1 | Request absent/out-of-program lessons, unavailable courses and failed content reads. | No foreign document appears; retry rereads the intended resource. |
| COURSE-11 | P0 | Mark/unmark completion and reload in two learner accounts. | Each learner's progress persists independently with correct totals. |
| COURSE-12 | P1 | Compare manager roster and learner progress; test no items/no students. | Counts match the backend, zero totals are safe and learners cannot read another learner's roster. |
| COURSE-13 | P0 | Cancel deletion, then confirm. | Cancel preserves the course; confirmed deletion returns to catalogue without deleting source lessons. |
| COURSE-14 | P1 | Fail metadata, roster, progress reads and a progress write. | Unknown progress is not confirmed zero; failed writes do not appear persisted; retry is useful. |
| COURSE-15 | P1 | Fail a later save stage after creation; separately lose the creation response. | A known course identity is reused; an uncertain creation does not automatically create a duplicate. |
| COURSE-16 | P1 | Open mixed-type or duplicate-lesson programs and edit supported metadata. | The simplified form does not overwrite unsupported program data. |

Verify course-specific management rights rather than assuming every school teacher
can edit every course. Preserve assignments outside the editable student selection.
Homework, grading and non-lesson creation are not established frontend workflows.
