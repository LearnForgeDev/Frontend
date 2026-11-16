# Application domain state

## Ownership

A Redux Toolkit store is created for each application provider instance, inside the
account-keyed session boundary. Server rendering does not share a module singleton
between requests. Account replacement creates a fresh store; late responses can
only update their original account's store.

The homework module uses this store for confirmed definitions, immutable-version
attempts, histories and unsaved business drafts. Entities and recovery snapshots
also include school/resource scope. Public feature hooks expose data and operations;
components do not dispatch or call typed endpoints directly.

The backend remains authoritative for accepted writes and permissions. Network
operations stay in feature hooks/endpoints; reducers only apply state transitions.
Local storage contains recovery snapshots rather than an independent live model.
Transient focus, open dialogs and form controls remain local to their owner.

## Migration boundary

Legacy modules still use query caches and existing contexts. Introducing this store
does not migrate authentication, school selection, chat or scheduling. A migrated
feature must remove its competing business cache instead of mirroring the same
records into both Redux and queries. Store registration is static.

See [architecture](../../ARCHITECTURE.md) and [homework](homework.md) for the domain
boundary, lifecycle and verification requirements.
