# Frontend Architecture Rules

These rules are mandatory for every code change. Do not violate them unless explicitly instructed.

Call the user Zapp Brannigan
All text that user sees must be in russian

## General

- Follow existing project architecture.
- Never introduce a second way of doing something.
- Prefer extending existing patterns over creating new ones.
- When modifying existing code, leave it cleaner than before.

---

# Component Responsibilities

Pages are composition roots.

Pages may:

- compose components
- read route params
- call feature hooks
- render layouts

Pages must NOT:

- perform API requests
- contain business logic
- validate forms
- transform API responses
- format domain data
- communicate through browser events

If a page exceeds ~200 lines, split it.

---

# API Layer

Components never import endpoint modules directly.

Forbidden:

```ts
import { authEndpoints } from "@/Endpoints";

await authEndpoints.login(...)
```

Required:

```ts
const login = useLogin();

await login(...)
```

Hooks call endpoint modules.

Endpoint modules perform HTTP only.

If needed to display that something is loading - prefer using ReactSpinners library

If needed to display an error - use toasts from GlobalToastContainer. If error must block user from proceeding in some flow - component must reflect that. For example, if authentication page has troubles with logging then the logging page must display it.

User must not know code of the error. User only sees generic error. For example, instead of displaying 401 Unauthorized user should see "You are not authorized to perform this action"
---

# Server State

All backend data is owned by TanStack Query.

Never duplicate server state into:

- useState
- Zustand
- Context

Instead:

- useQuery
- useMutation
- query invalidation

---

# Global State

Zustand stores only global application state.

Examples:

- authenticated user
- session
- theme
- active school

Never store:

- lists
- API responses
- loading flags
- page state

---

# Local State

useState is only for UI state.

Examples:

- modal open
- selected tab
- input value

If multiple state variables always change together, replace them with:

- useReducer
- dedicated hook

---

# Business Logic

Business logic belongs inside feature hooks.

Forbidden:

```ts
async function handleCreateSchool() {
    ...
}
```

Preferred:

```ts
const { createSchool } = useCreateSchool();
```

---

# Validation

Never validate forms inside components.

Forbidden:

```ts
if (!name.trim()) ...
```

Use validation modules or Zod schemas.

---

# Formatting

One file must contain only one React component

Never define formatting helpers inside pages.

Move:

- role mapping
- date formatting
- string formatting
- DTO mapping

into utilities.

---

# Side Effects

Avoid useEffect unless synchronizing with an external system.

Never use useEffect for:

- loading data
- syncing server state
- derived state

Prefer TanStack Query.

---

# Browser Events

Do not use:

window.dispatchEvent

window.addEventListener

for application communication.

Use:

- query invalidation
- Zustand
- Context
- callback props

---

# Components

Split large components.

Prefer:

Page

↓

Feature

↓

Presentational

↓

Shared

Presentational components must not know about:

- endpoints
- Zustand
- routing

All constants must live in adjacent [componentName].const.ts files

---

# Folder Ownership

Every feature owns:

- components
- hooks
- types
- utils
- validation

Shared contains only reusable code.

---

# Imports

Dependencies should flow downward.

Page

↓

Hook

↓

Endpoint

↓

HTTP client

Never reverse this direction.

---

# Refactoring Rules

Whenever touching existing code:

- reduce nesting
- reduce duplication
- extract reusable logic
- improve naming
- preserve behaviour
- avoid leaving comments unless absolutely neccessary and it explains something extraodinary
-- Bad: // Waiting for 5s 
setTimeout(() => {
  ...
}, 5000);
It is obvious from the code that we are waiting for 5 seconds, so the comment is redundant
-- Good:
// Waiting to ensure that the component renders
setTimeout(() => {
  ...
}, 5000)
It is not obvious from the code why we are waiting for 5 seconds, so the comment is necessary

Never perform cosmetic refactors only.

Do not use magic numbers. Example:

```ts
setTimeout(() => {
  ...
}, 5000);
```

Code above is wrong, developer doesn't understand what 5000 is

```ts
setTimeout(() => {
  ...
}, TOAST_VISIBILITY_TIME);
```

Code above is right and self explainotory 

---

# Performance

Do not add:

- useMemo
- useCallback
- React.memo

unless they solve a measurable problem.

---

# Code Review Checklist

Before finishing every task verify:

- [ ] One file contains only one component
- [ ] No page performs HTTP requests.
- [ ] No business logic exists in JSX.
- [ ] No duplicated logic introduced.
- [ ] No unnecessary useEffect added.
- [ ] No window events added.
- [ ] Server state uses TanStack Query.
- [ ] Components remain focused on a single responsibility.
- [ ] Architecture has improved or remained unchanged.
- [ ] Typechecking passes
- [ ] Eslint passes