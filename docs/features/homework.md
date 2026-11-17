# Homework

Back navigation uses circular arrow-only controls in each local page header.
Accessible names and titles retain the assignment, roster and course return
destinations, including the originating course item query parameters.

## Status and scope

School routes under `homework` connect a catalogue, teacher authoring, student
attempts and teacher review. Durable definitions, versions, authorization, attempts
and feedback belong to the backend. The workflow requires the companion versioned
homework contract; the frontend does not emulate missing backend capabilities.

## Authoring and audiences

Teachers compose ordered questions with checklist, single choice, short text,
rich-text response or file upload answers. Each question starts with one maximum
point; fractional points and partial credit are supported. New assignments default
to a passing threshold equal to the sum of question points. The editor recomputes
that value while the auto policy is enabled. A teacher can disable it and enter an
explicit threshold, including zero. Existing assignments retain their saved policy;
publication freezes the resulting numeric threshold into the immutable version.
Required questions, deadline and maximum attempts retain the backend rules.

Question prompts and long answers use the shared versioned Lexical format plus a
plain-text fallback. Choice keys and teacher hints are teacher-only backend fields.
The hint icon opens a nonmodal anchored panel with separate teacher and student
inputs. Its arrow follows the icon when the panel shifts or opens above it near a
viewport edge. A student sees only a nonempty student hint. Frontend hiding does not
replace backend projection or resource authorization.

Homework audiences are explicit school students and groups. Empty user/group lists
mean school-wide access. A course audience does not grant access to its referenced
homework or files. Source homework deletion is refused while attempts or course
references exist.
Opening homework from a course retains its stable item ID through attempts and the
return link, so the course can restore the student's original place in the path.
An attempt opened from a course returns directly to that course and item through
its circular back control. Without course context, it returns to the assignment
and preserves the current query parameters.

## Immutable versions and publication

A published definition is immutable. Editing creates or resumes one mutable draft;
publishing fixes its exact version. Only online Draft/Returned attempts with valid
per-tab leases block publication. A tab heartbeats every 15 seconds; leases expire
on the backend after 45 seconds. SignalR invalidates data and REST remains authoritative;
periodic reads and online/focus refresh recover missed notifications.
Assignment-detail invalidation refreshes both the version/publication state and the
student attempt roster, so new submissions and reviews appear without reloading.
The catalogue refreshes on entry, browser focus and reconnection while retaining
unsaved authoring input; an earlier successful read is not permanent freshness.

A queued version prevents new attempts but permits existing attempts to resume.
Teachers can cancel the fixed queue to edit again. Offline drafts keep their
original definition and can resume after a newer version publishes. Attempt screens
explain the pinned version and publication queue without switching the student's
questions or answer identities.

A teacher can arm a selected online blocker's 60-second forced finish. The server
owns the immutable deadline; disconnecting or canceling publication does not stop
it. The first server-time sample accounts for real client clock skew. Later samples
advance a monotonic clock and cannot rewind it, even when a newer DTO was delayed
in transit. A separate deadline timer freezes text
controls between display ticks, and input handlers recheck the current deadline.
At the deadline, writes and upload
completion stop, and the backend submits persisted work once with missing answers
worth zero. A local unsaved answer must never be presented as submitted.
Teacher attempt rows retain the absolute deadline and countdown after publication
or queue cancellation. The armed deadline is shown only for Draft/Returned attempts,
using that attempt's server-time sample, and disappears after submission or review.

## Attempts and recovery

Starting resumes an editable attempt before creating another; start and submit are
idempotent. Normal submission immediately freezes answer controls before saving and
submitting the final snapshot. Drafts are scoped by
account, school, attempt, immutable version, question and tab. Redux owns current
business records/drafts; local snapshots provide recovery. Logout replaces the
account store. Scope identifiers keep delayed reads from appearing in another school.
Detail and roster reads share a per-attempt server-time check, so a delayed history
response cannot replace a newer pinned attempt, review draft or assessment status.

Autosave serializes writes. A successful older save clears only its exact draft
and advances the revision of newer edits. Revision conflicts preserve local text
and require an explicit server reload. Separate tab snapshots do not overwrite one
another. When several local snapshots differ, the latest is restored and the others
remain available as a plain-text download. Storage failure is shown separately.

## Files, grading and feedback

Question images use the authorized homework upload bucket and attachment endpoint.
The limit is ten images per question, each up to 10 MB. File-answer questions use
their attempt/question-specific presign, transfer and completion operations, with
five files up to 20 MB each. Only completed uploads count as attached work.

Reviewers can select normalized rectangles on PNG/JPEG/WebP answer images and add
comments. Keyboard controls and a textual list provide alternatives to dragging.
Each annotation has a stable UUID and answer-file UUID; backend ownership, MIME,
bounds and nonempty-text checks remain authoritative. Other attachments support
download and ordinary answer comments. Authorized image bytes are loaded through
the homework endpoints; object URLs are canceled/revoked on replacement or unmount.

Teacher review drafts remain private until a final Checked or Returned operation
atomically releases scores, comments and annotations. Draft scores may be empty;
a finished check grades every question within zero and its maximum points.
Submission/review revisions protect against stale reviewers. Released submission
snapshots remain readable when a student revises the current answers.

A course homework item completes only after a Checked passing attempt at its pinned
version's threshold. Historical passes survive later publication. The frontend
never manually completes a homework item.

## Verification and limits

Focused checks cover question/review validation, version/tab recovery, scope
isolation, delayed saves, answer revisions, private reviews and authorized uploads.
Browser scenarios exercise real teacher/student publication, submission, review and
forced finish against the pinned companion backend in CI. A test's presence is not
evidence of a passed remote run. No backend or frontend deployment is performed by
this feature change.

See [application state](application.md), [files](files.md), [courses](courses.md)
and [lesson editing](lessons-editor.md) when changing shared contracts.
