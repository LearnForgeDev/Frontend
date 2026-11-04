# LearnForge architecture

This is the intended architecture. Existing code still needs migration to some of
these rules; current behavior and gaps belong in the [feature docs](docs/features/README.md).
Installed technologies and versions are defined by [package.json](package.json).
Runtime and delivery settings belong in the [verification](.github/workflows/test.yml)
and [deployment](.github/workflows/deploy.yml) workflows.

## Business boundaries

The frontend presents school workflows and manages interaction and recovery.
The backend owns durable business records, membership, authorization and accepted
writes. File storage owns uploaded bytes; realtime transport delivers updates;
the meeting service owns conference media.

Organize around capabilities: authentication, schools, students, lessons, courses,
scheduling, materials, chat and calls. A module can have several screens. Sharing a
school URL does not make all modules one feature.

## Access business state through the feature hook

The required dependency direction is:

```text
Page / component → public feature hook → typed endpoints
                                  ↕
                              Redux store
                                  ↕
                        persistence adapters
```

Redux is the required sole source of truth for client business state. This is an
explicit architecture decision, not a claim that the current dependency migration
has happened. The backend remains authoritative for persisted records and rights.

Components and pages must not access store selectors, dispatch, storage adapters or
endpoints directly. The public feature hook exposes both typed data and supported
operations such as get, create, update, delete, refresh and retry. It orchestrates
endpoint calls and applies confirmed results to the store. Do not add meaningless
CRUD methods to a read-only capability.

Store reducers update state without performing I/O. Network and persistence work
belongs behind the hook's operation layer. Existing parallel query/context/global
state paths must be consolidated during migration rather than retained as competing
business sources of truth.

## State ownership

| State | Owner |
| --- | --- |
| Current authenticated user | Auth slice only |
| School membership and selected school | School domain state |
| Lessons, courses, events, files and chat records | Their domain slices |
| Unsaved business drafts | Owning domain, scoped to user/school/resource |
| Open dialog, focus, transient form input | Local component or feature-hook state |
| Navigation | Router, accessed through the appropriate page/hook boundary |
| Persisted local snapshot | Persistence adapter; hydrated into the store through the hook |

Do not put school selection, chat records or unrelated feature data in auth.
Persisted snapshots are a recovery mechanism, not another object that components
can read instead of the store. Isolate persisted data by account and school.

## Components and contracts

Pages compose features. Components render typed data and call hook operations.
Domain rules should be testable independently of rendering. Shared UI must not
import product-specific store or endpoint modules.

Endpoint requests, successful responses and documented error responses must have
concrete types derived from backend Swagger/OpenAPI. Do not expose an endpoint as
`unknown` or `any` when the backend declares its schema. Keep unexpected failures
explicit without weakening the normal contract. Local JSON still needs parsing and
validation; a type assertion does not validate stored data.

Use [naming conventions](docs/guides/naming.md) to discover implementation. Keep
business docs focused on rules instead of maintaining source-file link inventories.

## Authentication and access

Decode a persisted JWT and require a finite expiry with `exp * 1000 > Date.now()`.
An expired token must be refreshed before use; invalid credentials must be cleared.
Local decoding checks expiry, not signature validity, revocation or membership.
The backend must confirm protected operations.

Auth exposes the current user through its feature hook. Logout clears user identity,
credentials and account-scoped business state, then performs full-page navigation
to login. Late requests must not restore the previous user during cleanup.
See [authentication](docs/features/auth-session.md) for required behavior and gaps.

School capabilities derive from the membership of that school. Domain permissions
can be narrower than teaching capability. Platform administration uses separate
credentials and does not follow from school ownership.

## Recovery and synchronization

Keep pending, empty, denied and failed states distinct. Retain input on failure,
prevent duplicate submission and confirm a write before describing it as persisted.
Do not blindly retry an operation whose server outcome is unknown.

Protect scope and version ownership: an old account cannot repopulate the store,
one file response cannot replace another preview, and an old save cannot clear a
newer draft. Clean up external resources when their owning scope ends.

Chat must retain locally available records until the backend supplies replacement
information. A transport failure or elapsed time alone must not erase history.
Components show whether chat information is updating, not transport connection states.
Local SQL persistence is under consideration; no engine or schema has been selected.
See [chat](docs/features/chat.md).

## Decisions deferred for discussion

- [Calls](docs/features/calls.md): architecture review is deferred; the current design is not endorsed.
- [Courses](docs/features/courses.md): architecture discussion is deferred.
- Styling: move away from `.styles.ts` and `sx`; select the replacement before a migration.

These are discussion boundaries, not tasks created by this documentation change.
Do not choose replacement libraries or redesign these modules as part of docs work.

## Verification and delivery

Use the [testing policy](docs/guides/testing.md) and owning executable configuration.
New/renamed staged paths receive precommit naming validation. Staged documentation
is checked for feature coverage, local links and length; business-code changes
require an owning knowledge update. CI integration remains pending. Neither validator
proves exported-symbol casing, correct business behavior or truthful prose.

Keep heavy checks in CI. Any local deployment, including a backend started for
verification, requires explicit approval from the project owner. Backend availability
must not be assumed. Never use reverse tunnels.

Follow [AGENTS.md](AGENTS.md) for language, knowledge handoff, task-management
boundaries and review expectations. Update the owning module when behavior changes;
keep this file about cross-feature decisions and boundaries.
