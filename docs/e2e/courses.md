# Course acceptance

Courses use flat typed blocks. These are acceptance goals; scenario presence alone
does not prove execution against the real backend.
See [course scope](../features/courses.md).

Use real backend contracts, authorized course managers, independent learners,
groups and published articles. Basic fixtures alone do not prove all these contracts.

## Catalogue and creation

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| COURSE-01 | P0 | Open courses with different roles and assignments. | Only accessible courses appear; management and learner progress match permissions. |
| COURSE-02 | P1 | Search titles/descriptions with case/whitespace variants; clear; repeat empty. | Results match the filter; no matches differs from no courses and from a failed read. |
| COURSE-03 | P0 | Create metadata, ordered typed blocks and an audience; inspect backend and reload. | One real course has the intended program/access; intermediate saves do not expose it to extra users. |
| COURSE-04 | P1 | Test required fields and configured validation limits, correct input and cancel. | Invalid/cancelled creation does not persist a course; valid correction can proceed. |

## Program, audience and progress

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| COURSE-05 | P0 | Edit metadata and reload catalogue/detail. | Changes persist without changing course identity. |
| COURSE-06 | P0 | Add/remove/reorder typed items and reload. | Program order matches without duplicates; source resources remain in the school. |
| COURSE-07 | P0 | Test school-wide, selected-student and group access independently. | Authorized learners can read; unassigned users cannot; roster explains access source. |
| COURSE-08 | P0 | Revoke user/group access after warming their state. | Subsequent confirmed denial hides protected course and progress data. |
| COURSE-09 | P0 | Open a program article as learner and return. | Correct published content is read-only and return reaches the same course. |
| COURSE-10 | P1 | Request absent/out-of-program articles, unavailable courses and failed content reads. | No foreign document appears; retry rereads the intended resource. |
| COURSE-11 | P0 | Satisfy configured completion rules and reload in two learner accounts; attempt a learner manual-status bypass. | Progress persists independently with correct totals; automatic/teacher rules cannot be bypassed. |
| COURSE-12 | P1 | Compare manager roster and learner progress; test no items/no students. | Counts match the backend, zero totals are safe and learners cannot read another learner's roster. |
| COURSE-13 | P0 | Cancel deletion, then confirm. | Cancel preserves the course; confirmed deletion returns to catalogue without deleting source resources. |
| COURSE-14 | P1 | Fail metadata, roster, progress reads and a progress write. | Unknown progress is not confirmed zero; failed writes do not appear persisted; retry is useful. |
| COURSE-15 | P1 | Fail a later save stage after creation; separately lose the creation response. | A known course identity is reused; an uncertain creation does not automatically create a duplicate. |
| COURSE-16 | P1 | Edit mixed programs with repeated resources and unknown item types. | Supported typed blocks stay editable; unknown payloads and independent occurrence identities are preserved. |
| COURSE-17 | P0 | Request a later step before completing its required predecessors; include optional steps. | The server rejects locked access; optional steps never block the path. |
| COURSE-18 | P1 | Keep an article tab open in the background, leave, reopen and reload. | Persisted time accumulates only while open and completes at the configured threshold. |
| COURSE-19 | P0 | Change a completed block, cancel the save choice, then separately keep/reset completion; retry a partial save. | Cancel preserves the draft; keep retains completion; reset affects changed blocks only and retries do not reset already-saved blocks again. |
| COURSE-20 | P0 | Configure submitted versus approved homework and review failing/passing attempts. | Submission completes the first mode; approval waits for a passing reviewed attempt. |
| COURSE-21 | P1 | Delete homework that has attempts after checking course progress. | Deletion is rejected specifically for retained attempt history; history IDs, versions, scores and submissions remain unchanged. |

Verify the backend-provided management capability and source permissions separately.
Preserve assignments outside the editable student selection. Mixed-path browser
scenarios cover typed navigation, linear locks, timed and teacher-approved progress,
keep/reset choices, source preservation and warmed-access revocation. Scenarios
require the companion backend; their presence does not claim a successful CI run.
Group access and every failure stage remain separate acceptance work.

## Fixture lifecycle

Course fixtures retain strict deletion cleanup for the course itself. Homework
with attempts is intentionally undeletable through the public API, so its fixture
does not register an impossible hard-delete cleanup. The retention scenario checks
the specific rejection and unchanged history instead. These records use unique
identities and remain until the isolated CI backend database volume is destroyed.
An explicitly configured shared test backend retains immutable attempt history,
matching the existing homework fixture lifecycle.
