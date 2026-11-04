# Naming and implementation discovery

This is the required naming convention for new and migrated code. Precommit validates
new and renamed staged paths. Existing filenames remain legacy exceptions until
renamed; changing a file's contents does not migrate its name. CI wiring is still pending.

## Canonical locations

`Feature` and `Component` are PascalCase; `feature` is its camelCase identifier.
Feature directories are PascalCase in Services, Storage and Endpoints alike.
Filenames such as `auth.ts` may use the camelCase form; the feature directory is `Auth`.
Use established domain names consistently, such as `Auth`, `Schools`, `Lessons`,
`Courses`, `Scheduling`, `Files`, `Chat`, `Calls` and `Homework`.

| Responsibility | Convention |
| --- | --- |
| Feature root | `src/Services/<Feature>/` |
| Page | `<Feature>Page.tsx` or a descriptive `<Purpose>Page.tsx` in its feature |
| Component | `components/<Component>/<Component>.tsx` |
| Component props | `<Component>.types.ts` when a separate type file is useful |
| Public feature hook | `hooks/use<Feature>.ts` |
| Internal hook | `hooks/use<Purpose>.ts` |
| Domain state | `src/Storage/<Feature>/<feature>.slice.ts` |
| Internal selectors | `src/Storage/<Feature>/<feature>.selectors.ts` |
| Endpoint operations | `src/Endpoints/<Feature>/<feature>.ts` |
| Endpoint contracts | `src/Endpoints/<Feature>/<feature>.types.ts` |
| Validation | `<subject>.validation.ts` |
| Domain conversion/calculation | `<subject>.<purpose>.ts` |
| Constants | `<subject>.const.ts` |
| Unit/component test | `<subject>.test.ts` or `<subject>.test.tsx` beside its owner |
| Browser workflow test | `tests/e2e/<feature>.spec.ts` in kebab-case |
| Business documentation | `docs/features/<feature>.md` in kebab-case |

Keep hooks flat in the feature-level `hooks/` or shared `src/Assets/Hooks/` directory.
Hooks must not live inside component folders or their own per-hook directories.
Name hook sidecars beside the hook, such as `useAuth.types.ts` and `useAuth.test.ts`.
Endpoint files omit the redundant `.endpoints` suffix; new `.endpoints.ts` paths fail.

Do not add a style-file naming rule until the replacement styling approach is agreed.
Do not move unrelated legacy files just to make one feature change conform.

## Names that reveal the boundary

Export components and domain types in PascalCase, hooks as `use<Purpose>` and
functions/operations in camelCase. Constants that represent fixed values use
UPPER_SNAKE_CASE. A feature hook owns the supported operation vocabulary rather than
making components combine endpoint methods and store selectors themselves.

Avoid generic names such as `data`, `helper` or `manager` when a domain name is
available. Keep backend field names faithful to the declared contract; a naming
cleanup must not silently rename a transport field or hub operation.

## Finding implementation

Start with the business feature, then search for its public `use<Feature>` hook.
Follow its operations into the domain slice and endpoint module. Search by role
suffix (`Page`, `.slice`, `.validation`, `.test`, `.spec`) when the
implementation is being moved. Use exact symbol search for existing legacy owners.

Documentation records business rules and verification expectations, not links to
individual implementation/test files. A code map is unnecessary when naming and
boundaries are reliable. Configuration references such as [package.json](../../package.json)
and [CI](../../.github/workflows/test.yml) remain the source of executable details.

## Enforcement

Use `npm run validate:naming` for the staged-path check and `-- --all` to audit all
tracked paths, including legacy violations. The check reports each offending path
and expected convention, and exits unsuccessfully before the existing lint check.
Renames are checked as new destinations, so a legacy name cannot be moved unchanged
into another nonconforming path. Unstaged files and deletions are excluded.

The validator checks path/file naming for components, hooks, domain state, endpoints,
logic, tests, scripts and feature docs. Shared component/hook roots use the existing
`src/Assets/Components` and `src/Assets/Hooks` capitalization. Unit tests under the
existing `tests/unit` directory use kebab-case names with `.test.ts`. Barrels may use
`index.ts`, but their owning directory must still follow its convention.
Styling filenames are excluded while the replacement approach is undecided.

Exported-symbol casing and semantic boundaries remain review rules; this path
validator does not inspect declarations or prove a file's business responsibility.
The same validator should be wired to CI with an explicit change-base policy, rather
than treating an empty CI staging area as a passing naming check.

Naming validation cannot prove correct business behavior or truthful documentation.
The documentation validator separately enforces feature coverage, staged knowledge
updates, short files and valid local documentation links. The agent must still update business knowledge as required by AGENTS.md.
