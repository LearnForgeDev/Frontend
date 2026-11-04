# Feature document template

Create `docs/features/<feature>.md` and register it in the [feature index](../features/README.md).
Keep it shorter than 300 lines. Follow [naming conventions](../guides/naming.md) for
implementation discovery; do not add a source-file map.

## Status and scope

State which business capability is connected and which changes are requirements,
proposals or deferred decisions. Name actors and routes only where they explain behavior.

## Behavior and rules

Explain workflows, transitions, permissions and invariants. Include the rationale
for a non-obvious rule. Do not describe requested behavior as already implemented.

## Data ownership

Describe the domain's authoritative state, persistence scope and related features.
Distinguish local recovery data from confirmed backend state. Components consume
these through the feature hook, following the shared architecture.

## Failures and open decisions

Describe recovery, races and unsupported paths. Capture unresolved product decisions
without selecting a design or creating a task unless asked.

## Verification

Describe important behavioral assertions, actual coverage and gaps. Link acceptance
scenarios when useful, not individual implementation/test files. Knowledge-handoff
instructions are in [AGENTS.md](../../AGENTS.md).
