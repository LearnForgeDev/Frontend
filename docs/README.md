# LearnForge documentation

Engineering documentation is English. Product-facing text is Russian.

## Orientation and conventions

- [AGENTS.md](../AGENTS.md): working rules, knowledge handoff and task-management boundaries.
- [Architecture](../ARCHITECTURE.md): required system boundaries and current migration gaps.
- [Naming](guides/naming.md): predictable implementation discovery and staged-path enforcement.
- [React components](guides/react-components.md): state access, operations, types and interaction.
- [Development](guides/development.md): environment and local-deployment approval.
- [Testing](guides/testing.md): verification policy and evidence limits.
- [Agent workflow](guides/agent-workflow.md): isolated work and independent PR review.
- [Feature template](templates/feature.md): business knowledge without source-file inventories.

## Business modules

| Area | Documents |
| --- | --- |
| Identity and membership | [Auth](features/auth-session.md), [schools](features/schools-access.md), [onboarding](features/onboarding.md) |
| People | [Students/invitations](features/students-invitations.md), [profile](features/profile.md) |
| Teaching content | [Lessons](features/lessons-editor.md), [courses](features/courses.md), [homework](features/homework.md) |
| School activity | [Today](features/today.md), [scheduling](features/scheduling.md) |
| Collaboration | [Files](features/files.md), [chat](features/chat.md), [calls](features/calls.md) |
| Platform | [Administration](features/platform-administration.md) |

Use the [feature map](features/README.md) to distinguish connected behavior from
requirements and deferred discussions. Calls, courses and styling need later design
discussion; no tasks are created during this docs-only iteration.

## Executable configuration and acceptance

[package.json](../package.json) defines scripts/dependencies. Runtime and execution
settings belong in [verification](../.github/workflows/test.yml) and
[deployment](../.github/workflows/deploy.yml) configuration.

The [acceptance catalogue](e2e/README.md), [coverage summary](e2e/coverage.md) and
[environment policy](e2e/environment.md) describe intended checks and their limits.
Scenario presence is not proof of implementation or a passed test run.
