# Writing React components

Read the [feature document](../features/README.md) and [architecture](../../ARCHITECTURE.md)
before implementation. The architecture describes required direction; existing
files may still need migration. Installed packages are defined in
[package.json](../../package.json), not a technology list in this guide.

## Ownership and naming

Keep product UI in its feature, and share UI only when it has genuinely shared
behavior without domain dependencies. Follow [naming conventions](naming.md) to find
components, public hooks, domain state and endpoints. Hooks are flat files under
the feature-level `hooks/` or shared `src/Assets/Hooks/` directory, never inside
component folders or their own per-hook directories.

Create supporting files only when they have content. Route components must satisfy
the route loader's export contract. Components receive typed data and callbacks;
pages compose components and public feature hooks.

## Business state and operations

- The Redux store is the sole source of truth for client business state.
- Components must use public feature hooks; never read selectors, dispatch actions,
  import endpoints or access persistent business data directly.
- A feature hook exposes its data and all supported operations: get, create, update,
  delete, refresh or retry as appropriate for that capability.
- Hook operations call typed endpoints and update the store. Reducers perform state
  transitions without network or persistence effects.
- Keep focus, dialog state and transient form input local. Do not create independent
  component copies of authoritative domain records.
- Scope entity state, drafts and persistence to the current account and school.

This is the target boundary. Do not describe the existing mixture of providers,
queries and global state as already conforming to it.

## Types and backend contracts

Use concrete request, success-response and documented error-response types from
backend Swagger/OpenAPI. Preserve the status-specific contract rather than exposing
`unknown`, `any` or an unstructured response to consumers. Check the backend schema
before inventing an optional property or guessing a response shape.

Use descriptive names and named types for complex shapes. Keep callbacks about
intent, such as `onSave` or `onCancel`. Use stable entity identities as list keys.
Declare named props and other types in adjacent `.type.ts` sidecars. Use type-only
named React imports, such as `ReactNode` and `FormEventHandler`, rather than
`React.ReactNode` or `React.FormEventHandler`.
A type assertion is not validation. Browser storage and genuinely untyped external
input still require parsing/narrowing; this does not justify weakening typed endpoints.

## State lifecycle and effects

Call hooks unconditionally. Derive display values instead of storing duplicate
business records. Put user-triggered writes behind hook operations, not mount effects.
Use effects for synchronization with external resources and provide cleanup for
subscriptions, timers, object URLs and embedded clients.

Late responses must respect the user, school and entity that started them. Test
mount/cleanup/replacement, duplicate submissions and edits made while saving. Add
memoization only when it solves an actual rendering or identity problem.

## Forms and recovery

Validate before submission, keep input after a failure and prevent duplicate writes.
Separate pending, empty, failed, denied and confirmed-success states. Retry must not
silently duplicate a write whose outcome is uncertain. A success message must match
the completed operation: a local draft is not published content.

Keep failures understandable in product language. Do not expose transport internals
or technical error codes when they do not help the user decide what to do.
Chat communicates data-update progress rather than connection status.

## Styling and interaction

The current `.styles.ts` / `sx` approach is not the desired long-term styling
convention. Choosing its replacement and migration approach is deferred. Do not
introduce another styling system or carry out a migration during documentation work.
Reuse the existing visual language for necessary fixes until that decision is made.

Use semantic controls, labeled inputs, logical headings and accessible names for
icon-only actions. Preserve keyboard interaction, focus, narrow layouts and reduced
motion. All user-facing product text is Russian. Engineering docs, identifiers and
agent replies are English.

## Verification

Test business outcomes, permissions and important failures. Prefer accessible
queries over assumptions about DOM structure. Mock integration boundaries for unit
coverage and use real backend workflows for integration acceptance where available.
Follow [testing policy](testing.md); knowledge handoff belongs in [AGENTS.md](../../AGENTS.md).
Do not add comments to source code.
