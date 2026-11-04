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

The owner selected Redux as the sole source of truth for client business state.
The goal is one owner for each domain's records and transitions, with reads and
operations available through its public hook. Agent discoverability alone does
not require this library choice. The backend remains authoritative for persisted
records and rights.

Components and pages must not access store selectors, dispatch, storage adapters or
endpoints directly. The public feature hook exposes both typed data and supported
operations such as get, create, update, delete, refresh and retry. It orchestrates
endpoint calls and applies confirmed results to the store. Do not add meaningless
CRUD methods to a read-only capability.

Store reducers update state without performing I/O. Network and persistence work
belongs behind the hook's operation layer. Existing parallel query/context/global
state paths must be consolidated during migration rather than retained as competing
business sources of truth.

## State migration boundary

This documentation records the approved target. It does not implement or authorize
a runtime migration as part of unrelated fixes. The current application still uses
query caches, global state and contexts; installed dependencies remain defined by
[package.json](package.json).

Migration covers client business records, account and school scope, business drafts,
and persisted snapshots. Local presentation state remains local. Transport clients
may handle requests and retries behind hooks, but must not become a second business
state owner.

Each migration needs an explicitly agreed domain scope. Identify its readers,
writers, persistence and cross-domain dependencies before changing state ownership.
Move the complete domain behind its public hook and remove the replaced state paths
in the same change. Shared ownership changes need a cross-domain plan first.
Preserve authorization, account isolation, stale-response protection, retry and
draft-recovery guarantees, and verify them before replacing the existing paths.
Record completed migration scope and remaining gaps in the owning feature docs.

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
Precommit and CI enforce the configured deterministic checks. Documentation coverage,
local links and length are structural checks; they cannot establish correct business
behavior or truthful prose. Update knowledge when behavior or ownership changes.
Repository merge protection and independent review of the exact PR revision are
separate requirements, described in the [agent workflow](docs/guides/agent-workflow.md).

Keep heavy checks in CI. Any local deployment, including a backend started for
verification, requires explicit approval from the project owner. Backend availability
must not be assumed. Never use reverse tunnels.

Follow [AGENTS.md](AGENTS.md) for language, knowledge handoff, task-management
boundaries and review expectations. Update the owning module when behavior changes;
keep this file about cross-feature decisions and boundaries.
