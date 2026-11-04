# Testing policy

Executable details belong in [package.json](../../package.json), the
[verification workflow](../../.github/workflows/test.yml) and the
[deployment workflow](../../.github/workflows/deploy.yml). Read the implementation
of a check before changing it; do not duplicate hook contents, runner defaults,
versions or build limits in prose.

## Choosing verification

Use focused tests for changed business rules and failure paths. Run lightweight
checks as appropriate. Heavy builds, backend environments and browser suites belong
in CI. Any local deployment requires explicit approval from the project owner.
Never use reverse tunnels to make a test environment available.

A PR must pass the configured checks before merge. Independent agent review applies
to the exact PR revision. Workflow presence alone does not establish repository
merge enforcement; inspect the actual repository settings when configuring it.

## What to test

- Domain state is accessed through the public feature hook and has one client owner.
- Endpoint operations preserve concrete Swagger request/response/error contracts.
- Account and school changes cannot expose previous data or accept late responses.
- Forms retain input on failure and do not submit duplicate writes.
- JWT expiry is decoded and checked, refresh failures are handled, and logout clears
  account state before full-page navigation.
- Draft, uploaded bytes and published resource are distinct outcomes.
- Chat retains authorized local information during failed refresh, applies confirmed
  backend updates and presents data-update progress rather than connection states.
- Resource cleanup and retry work after replacement, unmount and failed setup.

Unit tests should assert behavior rather than mirror implementation. Integration
checks should observe real persisted results, including a second authorized user
when the workflow shares data. A success toast alone does not prove persistence.

Use stable data and controlled time for boundary cases. A browser clock does not
change server token/expiration rules. Keep test data scoped so parallel users and
schools cannot interfere.

## Documentation and naming checks

`validate:docs` checks the Git index, not unstaged files. Staged Markdown must be
shorter than 300 lines, and local links/heading fragments must resolve in the same
snapshot. External links are not fetched.

Business features must have a nonempty owning document. Implementation changes in
Services, Storage or Endpoints require a staged update to that document, including
deletions and moves; tests, styles and barrel-only changes are excluded. New features
use a kebab-case doc name. Legacy feature names and school-contained modules map to
their existing business docs; shared infrastructure maps to architecture. Removing
a whole feature and its doc is valid when no remaining references require it.

Naming is checked for new/renamed staged paths before commit; an all-tracked-path
audit includes legacy violations. See [naming](naming.md) and package scripts for
scope. CI integration is still pending.

Knowledge handoff is required by [AGENTS.md](../../AGENTS.md). Automated checks can
verify structure and links; they cannot establish that a business explanation is true.

## Coverage evidence

Use the [acceptance catalogue](../e2e/README.md) and [coverage summary](../e2e/coverage.md)
to distinguish implemented assertions from desired tests. Existing coverage does
not yet prove all the architecture requirements above.

A captured screenshot is diagnostic evidence. Visual regression requires an
explicit baseline comparison. Meeting-token tests do not prove working audio/video.
Record what was actually run and its limitations in the handoff.
