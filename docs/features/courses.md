# Courses

## Status and scope

Course catalogue/details, lesson programs, audience selection, roster/progress and
lesson reading are connected. Creating non-lesson program items is not a complete
frontend workflow. Course architecture discussion is explicitly deferred.

## Existing behavior to preserve during discussion

Course-specific backend permission governs management. A school teaching role alone
does not authorize every course. Learners see assigned content and their own progress.

The lesson-only editor protects programs containing unsupported item types or duplicate
lesson references. It must not discard data it cannot represent. Restricted audience
changes preserve other valid assignments; removing students must not accidentally
make a course school-wide.

Current saves span several backend operations. Partial failure or an unknown creation
result must not silently duplicate a course. Progress belongs to a program item, not
merely to a lesson title. Deleting a course is distinct from deleting source lessons.

## Course direction, 2026-11-17

The owner wants a teacher-built progression of file, rich-text lesson, scheduled-call
and homework steps. Teachers choose each step's completion conditions. Exact unlock
rules, supported completion signals and behavior after editing a step are still
being discussed. This direction is not yet implemented in this branch.

Course cards and headers omit student counts. Enrollment management and learner
progress remain available through their existing controls.

Related modules: [lessons](lessons-editor.md), [students](students-invitations.md) and
[homework](homework.md).

## Verification boundary

Existing unit coverage includes mapping, audience preservation and failure recovery.
Browser checks cover an unavailable course API without presenting an empty catalogue;
successful course program/audience/progress workflows remain unverified. See [course acceptance scenarios](../e2e/courses.md).

Course lesson reading uses a browser-loaded editor. Import failure must expose
recovery and account exit through the application boundary.
