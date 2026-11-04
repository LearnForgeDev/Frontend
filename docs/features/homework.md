# Homework

## Status and scope

Not implemented as a connected frontend workflow. There is no homework route,
homework service module or dedicated homework endpoint module in this checkout.
This page records the boundary so future agents do not infer a complete feature
from the course contract.

## Behavior and rules

The implemented rule is preservation: existing non-lesson course items must not be
discarded by the simplified lesson program editor. A homework reference in a DTO
does not establish assignment creation, student submission or teacher assessment.

## Data and dependencies

Homework can be referenced by the [course](courses.md) contract. No complete
frontend model for assignment/submission ownership or persistence exists yet.
Do not derive student completion or a grade from course-item presence alone.

## Failure handling and limitations

Before implementation, establish these product/backend decisions:

- Who creates an assignment, and whether its audience is a course, school or explicit students.
- Assignment availability, deadlines, timezone rules and late-submission behavior.
- Submission format, attachment permissions, revisions and teacher feedback.
- Assessment states, resubmission rights and how progress relates to grading.
- Whether assignments and submissions survive removal of a course or student membership.

These are open questions, not approved requirements. Document the agreed lifecycle
and real endpoints before treating homework as a supported module.

## Verification

Course mapping checks guard unsupported-program editing. They do not test homework behavior. There are no
dedicated homework unit or browser tests; [course scenarios](../e2e/courses.md)
also mark non-lesson creation as unavailable.

## When changing this feature

Update this status, the [feature index](README.md), courses, student access and file
contracts when a real homework workflow is introduced. Add behavioral tests for its
agreed lifecycle instead of treating a new screen as complete coverage.
