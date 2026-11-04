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
Read executable configuration for technology, commands and CI details.

## Task management

Use the agreed shared issue tracker when task-management work is authorized. Search
for an existing issue before creating one; keep scope, status, blockers and handoff
current. The tracker/board integration is not configured yet. Do not create tasks,
issues or a board unless the owner authorizes that work. Record deferred decisions in docs.

## Find knowledge

| Need | Read |
| --- | --- |
| System boundaries and state ownership | [Architecture](ARCHITECTURE.md) |
| Business rules and current gaps | [Feature map](docs/features/README.md) |
| Implementation discovery | [Naming conventions](docs/guides/naming.md) |
| React component conventions | [Component guide](docs/guides/react-components.md) |
| Environment and deployment approval | [Development setup](docs/guides/development.md) |
| Verification policy | [Testing](docs/guides/testing.md) |
| Isolated work and independent PR review | [Agent workflow](docs/guides/agent-workflow.md) |
| New module documentation | [Feature template](docs/templates/feature.md) |
| All docs | [Documentation index](docs/README.md) |

A separate agent must review the current PR revision before merge. Precommit validates
new/renamed staged paths against naming conventions and validates staged documentation
coverage, local links and length. Business-code changes require a staged knowledge
update in the owning document. CI integration, repository protection and review
enforcement remain pending.
