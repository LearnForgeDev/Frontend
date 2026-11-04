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

Use the [testing policy](testing.md) and [CI configuration](../../.github/workflows/test.yml)
for required checks. Local validators inspect the staged snapshot; CI validates the
committed PR changes against their base. Update business knowledge when behavior,
contracts, ownership or failure handling changes. If existing docs remain accurate,
explain that outcome in the PR description for the reviewer to assess.

## Review before merge

Before merge, complete these steps:

1. Push the final revision and record its full commit SHA.
2. Invoke a separate agent with a review-only task in an isolated worktree at that
   SHA, or use an agreed independent reviewer integration. Supply the PR scope,
   base revision and relevant verification results. Do not ask the reviewer to edit.
3. Have the reviewer inspect behavior, tests and business knowledge, including any
   explanation that existing docs remain accurate.
4. Record the reviewed SHA, findings and verification limits in the PR description
   or an authorized PR review. Address each actionable finding.
5. After any new commit or rebase, request review of the new SHA. An earlier review
   does not approve the changed revision.

The implementing agent's self-check does not satisfy independent review. With one
human developer, the owner checks that the recorded review matches the final SHA
and that CI passes before merging. Agent review is a manual policy until a reviewer
integration and repository rules enforce it.

Require the aggregate `ci` status through repository branch protection or a ruleset.
These workflow files do not configure those repository settings or an automated
agent-review requirement. Do not treat a green status as proof of independent review.

## Handoff and cleanup

Follow the knowledge-handoff instruction in [AGENTS.md](../../AGENTS.md). Report what
changed, what actually ran and what remains unverified. Draft PR authorization does
not authorize merge or deployment.

Preserve work in the agreed delivery location before removing a worktree. Remove it
only after checking that no unique changes will be discarded.
