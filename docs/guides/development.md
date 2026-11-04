# Development setup

Use [package.json](../../package.json) for scripts and dependencies, and the
[verification workflow](../../.github/workflows/test.yml) for runtime/toolchain settings.
Follow the repository's executable configuration instead of duplicating versions
or deployment commands in documentation.

## Backend availability

The backend is not guaranteed to be available. Check the existing environment before
assuming an integration flow can run. Every local deployment, including starting a
local backend or its dependencies, requires explicit approval from the project owner.
Prepare the concrete setup and resource needs before requesting that approval.

Do not start a local stack to work around an unavailable backend without approval.
Do not use reverse tunnels. Heavy verification belongs in CI.

## Configuration

Keep machine-specific configuration and credentials out of tracked files. Values
embedded in the browser bundle are public and must not contain secrets. Read the
current environment/configuration definitions when changing API routing or build
behavior; do not copy their defaults into a second source of truth.

For delivery, use the [deployment workflow](../../.github/workflows/deploy.yml).
Any script-specific purpose or caveat belongs with its definition in
[package.json](../../package.json), not repeated here.

See [architecture](../../ARCHITECTURE.md), [naming](naming.md),
[component conventions](react-components.md) and [testing](testing.md) before changing code.
