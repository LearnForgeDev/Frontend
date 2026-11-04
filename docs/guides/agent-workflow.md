# Agent development workflow

## Start with knowledge

Read [AGENTS.md](../../AGENTS.md), [architecture](../../ARCHITECTURE.md),
[naming conventions](naming.md) and the [owning module](../features/README.md).
Confirm current code behavior before treating a required design as implemented.

Use a separate worktree for each task and preserve unrelated changes. Name the
chat after the supplied ticket when there is one. Rebase onto the fresh target
branch before final PR verification; prefer amend when it fits the change.

## Task-management boundary

Agents should create/manage work in an agreed shared tracker when that work is
authorized. Search before creating duplicates, and maintain scope, owner, state,
blockers and handoff. Tracker/board selection and integration are not configured.
Do not create tasks, issues or a communication board unless the owner authorizes that work.
Deferred calls/course/styling decisions remain discussion notes in the owning docs.

## Implementation and verification

Follow the public-hook/state boundary and concrete endpoint contracts. Keep UI text
Russian and engineering docs/replies English. Do not add comments or reverse tunnels.
Backend availability is not guaranteed; every local deployment requires explicit
owner approval. Heavy verification belongs in CI.

Use [testing policy](testing.md) and executable configuration for checks. Path naming is checked for new/renamed staged files in precommit. Documentation
coverage, local links and length are checked against the staged snapshot; stage the
owning knowledge update with business-code changes. CI integration remains pending.

## Review before merge

A separate reviewing agent must inspect the exact PR revision, its relevant behavior,
tests and changed business knowledge. The implementing agent's self-check is not a
substitute. Record the reviewed revision, actionable findings and verification limits.
Resolve findings and review changed revisions before merge.

With one human developer, agent review needs its own defined reviewer integration
and repository enforcement. Do not assume self-approval or a bot's arbitrary review
satisfies the repository's rules. This integration is not configured by docs work.

## Handoff and cleanup

Follow the knowledge-handoff instruction in [AGENTS.md](../../AGENTS.md). Report what
changed, what actually ran and what remains unverified. Draft PR authorization does
not authorize merge or deployment.

Preserve work in the agreed delivery location before removing a worktree. Remove it
only after checking that no unique changes will be discarded.
