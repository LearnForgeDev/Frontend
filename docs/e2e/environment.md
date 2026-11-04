# Browser environment and isolation

Use the existing runner/fixtures rather than creating a parallel test system.
Executable configuration is defined by [package.json](../../package.json), the
[verification workflow](../../.github/workflows/test.yml) and the
[test backend environment](../../tests/backend/compose.yml). Read them for versions,
commands, pinned revisions, ports and data setup instead of copying those details here.

## Approval boundary

The backend is not guaranteed to be available. Every local deployment, including
starting a backend, database, storage service or media environment for verification,
requires explicit owner approval. Prepare the concrete resource/setup proposal before
requesting approval. Heavy tests belong in CI. Never use reverse tunnels.

## Data and identity

Use isolated test users/schools and disposable data. Fixtures must not write to
production or another developer's database. Keep administrative credentials separate
from ordinary school roles. Never commit tokens, administrative secrets or reusable
authenticated browser state.

Use one independent browser context per user. A shared authenticated state is suitable
only when deliberately testing another session of the same account. Include a real
second school in isolation checks; a random missing school ID is not equivalent.

## Observable outcomes

Create/update through the UI when that is the workflow under test. Use the API for
setup, independent result verification and teardown without replacing the behavior
being claimed. Identify resources by returned identity, not first/last list position.

Check confirmed writes after reload and, where relevant, in an independent user's
context. Preserve exact bytes for upload/download checks. A toast or local echo alone
is not evidence of persistence or realtime delivery.

## Timing and failures

Register response observations before the triggering action and use bounded,
condition-based waits. Avoid fixed delays. Control UI time for UI timers; server
expiration and authorization still need matching backend conditions.

Prefer real contracts for integration success paths. A deliberately mocked failure
is a separate interface test, not proof of backend integration. Keep uncaught page
errors and failed scripts/styles visible in test results.

## Cleanup and limits

Teardown owns created entities and disposable infrastructure even when a test fails.
No test should depend on another test having left records behind. Release listeners,
connections, media clients and object URLs when their owning scope changes.

The present token checks do not establish working meeting media. Valid image preview has separate fixtures; intentionally invalid PDF/image bytes
establish only failure handling, not successful rendering of a valid PDF. Retain these distinctions in the verification report.
