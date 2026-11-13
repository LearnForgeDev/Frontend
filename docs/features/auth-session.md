# Authentication and current user

## Status and scope

Login, registration, restoration and logout are connected. The required architecture
below is not fully implemented yet. Normal authentication is separate from
[platform administration](platform-administration.md).

## Required public contract

The auth slice holds only information about the current authenticated user. Selected
school, memberships and other feature data belong to their own domains. Credentials
must be managed through the auth boundary without exposing them to UI consumers.

The public auth hook exposes the current user and supported operations, including
login, registration, session restoration, user updates where supported, and logout.
Components must not access a store, endpoint, provider context or browser identity
record directly. Operations call typed endpoints and update the single Redux state.
Use [naming conventions](../guides/naming.md) to discover that boundary.

Auth identity roles use the backend's public school GUID as a string `schoolId`;
`userId` remains numeric and the role is a supported numeric enum value. Login,
refresh and session restoration validate this shape and preserve nonempty role lists.
The current-user store derives its role type from that identity contract. Numeric or
malformed school IDs are rejected rather than treated as legacy alternatives.

## Session restoration and JWT expiry

1. Read the persisted credentials through the auth operation layer.
2. Decode the JWT payload and require a finite numeric `exp` claim.
3. Accept its lifetime only when `exp * 1000 > Date.now()`. Equality means expired;
   do not trust a separately stored expiry value instead of decoding the token.
4. Refresh an expired token before using it. Normalize/check the refreshed identity
   and expiry before making it the current user.
5. Treat missing/malformed credentials and rejected authentication as signed out.
   Retain a useful retry path for temporary network failures.

Public routes remain available while restoration is pending or failed. Restoration
starts only after browser mount; rendering a public page on the server neither reads
credentials nor starts authentication. Protected routes wait for confirmation and
offer an immediate way to discard the saved session and open login, including during
a slow request. Failed restoration also offers retry without granting access.

Login and registration redirect an already confirmed user only while the current
JWT has a valid decoded lifetime. Auth records that expiry in memory when installing
credentials, updates it on token rotation and clears it on logout. The redirect hook
reads this metadata without consulting browser storage or requesting the backend.
Visiting login after expiry opens the form even offline or with cached private data;
that visit alone does not discard a potentially usable refresh token. The separately
persisted `exp` field does not decide whether the form is accessible.

Decoding does not verify a JWT signature, revocation or membership. A locally
unexpired token is not permission to bypass backend authorization. Protected UI
must not briefly expose unconfirmed account data during startup.

Login and registration validate input, preserve a valid in-app return path through
switching forms and reject external return URLs. Query/hash matter for invitations
and meeting links.
Both forms submit named native input values, including autofill or input entered
before hydration attaches change listeners. Submission first reconciles those values
with form state, then validates and sends them. Validation and request failures keep
the entered values available for correction and retry; public forms do not wait for
a hydration gate to accept input.
Both native forms use POST so named credentials are not appended to the URL if
submission happens before JavaScript handles the event.

## Passwords and browser saving

Registration requires at least 12 Unicode code points, including a Unicode letter and
a Unicode decimal digit. The frontend checks before sending; the backend owns
enforcement for all clients. Passwords are not trimmed or transformed. Login accepts
existing passwords without applying the new-account policy.

After hydration, the login button and Enter key capture the current native form
values from the button or keyboard event and start the API request without dispatching native
submission. An explicit form-submit event uses the same value capture and validation.
Username/current-password autocomplete remains available, and failed or pending
requests retain the same visible fields and input. Only a confirmed, normalized
authentication response requests password saving through the browser Credential
Management API. Unsupported or rejected browser storage never blocks authentication.
Browser and extension save prompts remain controlled by their own heuristics; this
flow avoids sending an unverified native submission signal, but native prompt behavior
still needs a manual check in the affected browser.

## Logout

Logout clears persisted identity/credentials and account-scoped business state,
prevents in-flight work from restoring that identity, and then performs full-page
navigation to login. Replacing a route inside the running app does not meet the
full-page reload requirement.

The shared logout operation now performs this full-page navigation. Onboarding and
waiting screens offer it directly. Cleanup removes session credentials and replaces
account query scope; account-scoped lesson drafts remain available to their owner.
Discarding a pending restore cancels its observer and rejects its late identity.
The root rendering-error screen also offers logout/login alongside full-page retry,
so a failed section import does not remove the session escape.

## Existing implementation gap

The existing `UserProvider` runs restoration and exposes user/set/clear and recovery
status through a context. Protected routes own its loading and recovery gate; the
provider always renders public child routes.
It was already in the application; it is not a newly introduced business feature.
Identity currently also appears in query/global state, and selected school is stored
with auth. These paths need consolidation under the required hook/Redux boundary.
That migration needs its own agreed scope under the
[state migration boundary](../../ARCHITECTURE.md#state-migration-boundary).
An unrelated authentication fix must preserve the current state lifecycle rather
than start a partial migration.

Refresh-aware requests now share pending refresh work and retry a rejected request
once after a backend 401. Refresh rate-limit responses have bounded retry handling.
Protected requests decode the JWT's finite numeric expiry instead of trusting stored
`exp`. A rejected refresh, invalid refreshed identity or repeated protected 401 clears
the session only while that request still owns the credentials. Transient failures
retain credentials for retry; ordinary resource 403 does not sign the user out.
Joining by invitation has a dedicated exception: a repeated join-school 401 after
successful refresh rejects the invitation operation while retaining the confirmed
session. Its refresh still runs normally and rejected refresh credentials still sign
the user out. Other protected operations retain final-401 session invalidation.
Responses from a previous account or a logged-out session cannot complete protected
operations or install an invitation response as the current user.
Startup confirms an untrusted stored record through refresh, including a legacy
record containing only a refresh token. An already confirmed identity with a valid
decoded JWT may be reused when account query scope changes within the running app.
The remaining context/query/global ownership paths still need the agreed migration.

## Verification

Existing tests cover malformed stored sessions, startup rejection, refresh races,
account cache isolation, offline form failures and authentication return paths.
Focused unit checks cover public rendering during restore, immediate escape, retry,
late restore rejection, full-page logout and definitive refresh invalidation.
Browser checks also exercise expired local credentials, backend 401 recovery and
late responses after logout. Full browser verification belongs in CI.
Required coverage must additionally establish decoded JWT expiry boundaries,
current-user-only auth ownership, hook-only access and full-page logout with complete
account cleanup. See [auth acceptance scenarios](../e2e/auth-and-session.md).

## Related features

Recheck [school access](schools-access.md), [onboarding](onboarding.md) and stale
responses when changing session behavior. Do not allow an old session to reappear
once logout or another account has taken ownership.
