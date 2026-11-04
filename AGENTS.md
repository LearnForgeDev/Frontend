# Agent entry point

## Working rules

- Product UI and other end-user product text must be Russian.
- Engineering docs, identifiers, task descriptions and agent replies are English.
- Do not add comments or use reverse tunnels.
- Use the ponytail skill when writing code.
- Keep heavy CI work off the developer's computer.
- Treat deterministic checks as required gates; fix failures without bypassing or weakening them.
- Every local deployment, including a backend or its dependencies, requires explicit owner approval.
- Preserve unrelated changes. Use a separate worktree per task and a fresh PR base.
- Remove worktrees after safely delivering their changes. Prefer amend when suitable.
- Name chats after the provided ticket. Keep replies short, casual and concrete.
- Creating/pushing draft PRs is allowed; merging and deployment need authorization.

This checkout uses Git. In Arcadia, use a separate worktree/mount per ticket and
rebase onto fresh trunk; do not use Arcadia commands in this repository.

## Knowledge handoff

Before completing a behavior change, update the owning feature doc with the resulting
business rules, ownership, failure handling, decisions and remaining gaps. Update
architecture when a shared boundary changes. Keep docs shorter than 300 lines.
Use documentation links and naming conventions instead of implementation-file maps.
Read executable configuration for technology, commands and CI details. If existing
docs remain accurate, explain why in the PR description. The independent reviewer
checks that outcome against the exact reviewed revision.

## Task management

Use the agreed shared issue tracker when task-management work is authorized. Search
for an existing issue before creating one; keep scope, status, blockers and handoff
current. Use the pinned [agent communication board](https://github.com/LearnForgeDev/Frontend/issues/41)
for questions, blockers, coordination and handoffs. Read recent posts before work,
identify your agent or chat, and append useful updates. Creating tasks still needs
owner authorization. Move lasting decisions into the owning docs.

## Find knowledge

| Need | Read |
| --- | --- |
| System boundaries and state ownership | [Architecture](ARCHITECTURE.md) |
| Business rules and current gaps | [Feature map](docs/features/README.md) |
| Implementation discovery | [Naming conventions](docs/guides/naming.md) |
| React component conventions | [Component guide](docs/guides/react-components.md) |
| Environment and deployment approval | [Development setup](docs/guides/development.md) |
| Verification policy | [Testing](docs/guides/testing.md) |
| Cross-agent discussion and handoffs | [Agent board](https://github.com/LearnForgeDev/Frontend/issues/41) |
| Isolated work and independent PR review | [Agent workflow](docs/guides/agent-workflow.md) |
| New module documentation | [Feature template](docs/templates/feature.md) |
| All docs | [Documentation index](docs/README.md) |

A separate agent must review the exact PR revision before merge. Follow the
[review procedure](docs/guides/agent-workflow.md#review-before-merge) and require the
configured CI checks to pass. Repository protection and automated agent-review
enforcement are not configured by these files.
