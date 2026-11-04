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

Documentation validation checks the Git index locally and the committed snapshot
in CI. Markdown must be shorter than 300 lines, and local links and heading fragments
must resolve in that snapshot. External links are not fetched.

Business features must have a nonempty owning document. New features use a kebab-case
doc name. Legacy feature names and school-contained modules map to their business
docs; shared infrastructure maps to architecture. Removing a whole feature and its
doc is valid when no remaining references require it.

Update the owning document when behavior, contracts, ownership or failure handling
changes. For mechanical changes that leave existing knowledge accurate, explain why
in the PR description. The independent reviewer validates that outcome against the
reviewed SHA. Structural coverage does not require a meaningless prose edit.

Naming validation covers new and renamed paths, using staged paths locally and the
PR base in CI. An all-tracked-path audit also includes legacy violations. See
[naming](naming.md) for conventions and executable configuration for scope.

CI runs documentation content, documentation coverage and validator regressions as
separate jobs. The aggregate `ci` result fails when any required job fails or skips.
Knowledge handoff remains required by [AGENTS.md](../../AGENTS.md). Automated checks
verify structure and links; independent review checks the business explanation.

## Coverage evidence

CI publishes the full application coverage report and checks executable lines added
or modified against the PR base. The changed-line minimum belongs in the executable
coverage policy. Application lines absent from the report fail that check. A change
with no added executable application lines has no changed-line score.

Use the [acceptance catalogue](../e2e/README.md) and [coverage summary](../e2e/coverage.md)
to distinguish implemented assertions from desired tests. Existing coverage does
not yet prove all the architecture requirements above.

A captured screenshot is diagnostic evidence. Visual regression requires an
explicit baseline comparison. Meeting-token tests do not prove working audio/video.
Record what was actually run and its limitations in the handoff.
