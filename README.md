# LearnForge frontend

A multi-school learning application for lessons, courses, scheduling, materials,
chat and calls. Product UI is Russian; engineering documentation and agent replies
are English.

- [Agent instructions](AGENTS.md): working rules and knowledge handoff.
- [Architecture](ARCHITECTURE.md): boundaries and intended development direction.
- [Feature map](docs/features/README.md): business rules, current behavior and open decisions.
- [Documentation index](docs/README.md): development and acceptance guidance.

Scripts and installed technologies are defined in [package.json](package.json).
Toolchain and verification settings are in the [CI workflow](.github/workflows/test.yml);
delivery is defined in the [deployment workflow](.github/workflows/deploy.yml).

Read [development setup](docs/guides/development.md) before running integrations.
Backend availability is not guaranteed, and every local deployment requires the
project owner's explicit approval. Keep heavy checks in CI and never use reverse tunnels.
