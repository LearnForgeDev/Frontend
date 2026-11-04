# Business feature map

Use this map to find the owner of a business rule before changing code. Status
describes connected frontend behavior, not feature completeness or a passing test run.
School routes below start at `/app/schools/:schoolPublicId`.

| Feature | Scope and route | Status |
| --- | --- | --- |
| [Authentication and session](auth-session.md) | Login, registration, restore, logout; `/auth/*` | Implemented |
| [Schools and access](schools-access.md) | Membership, school switching, navigation, guards; `/app`, `/app/schools` | Implemented |
| [Onboarding](onboarding.md) | Request a school, wait for provisioning, join by invitation; `/onboarding/*` | Implemented |
| [Students and invitations](students-invitations.md) | Student roster and invitation lifecycle; `students` | Implemented; group management UI absent |
| [Lessons and editor](lessons-editor.md) | Lesson catalogue, rich document, publishing and drafts; `lessons/*` | Implemented; mobile editing restricted |
| [Courses](courses.md) | Programs, audience, lesson access and progress; `courses/*` | Partial; architecture discussion deferred |
| [Scheduling](scheduling.md) | Events, attendees, calendar and meeting entry; `schedule` | Implemented |
| [Today](today.md) | Current-day summary and shortcuts; `today` | Implemented |
| [Files and materials](files.md) | Upload, listing, download, preview and delete; `files` | Implemented; preview formats limited |
| [Chat](chat.md) | Branch/direct messages, attachments and call invitations; `chats` | Connected; local-first retention/update UX required |
| [Calls](calls.md) | Backend-authorized meeting entry; `calls` | Connected; architecture discussion deferred |
| [Profile](profile.md) | Identity, school roles, upcoming event and logout; `/app/profile` | Read-only profile |
| [Platform administration](platform-administration.md) | Provisioning requests and separate admin login; `/developer` | Implemented |
| [Homework](homework.md) | Course-item contract fragment | Not implemented as a frontend workflow |

## Shared foundations

- [Architecture](../../ARCHITECTURE.md): dependency boundaries and state ownership.
- [React component guide](../guides/react-components.md): how to implement UI.
- [Testing](../guides/testing.md): configured checks and limitations.
- [AGENTS.md](../../AGENTS.md): knowledge handoff and working rules.
- [Naming](../guides/naming.md): discover implementation by convention.
- [Feature template](../templates/feature.md): add a new business capability.

## Boundaries of the current product

The route configuration defines which screens are connected.
Settings, the old school overview/layout and old admin dashboard files are not
independent current routes. A service registry entry does not expose a route.

Standalone whiteboard collaboration, grading, quizzes and marketplace workflows
are not connected. Meeting endpoint helpers mention whiteboard archival and screen
sharing, but that does not establish a complete frontend feature. Define and document
their scope before implementing them.

The [E2E catalogue](../e2e/README.md) is an acceptance-scenario reference; use its
[coverage map](../e2e/coverage.md) to distinguish executable tests from desired checks.
