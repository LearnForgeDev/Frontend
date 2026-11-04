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

## Session restoration and JWT expiry

1. Read the persisted credentials through the auth operation layer.
2. Decode the JWT payload and require a finite numeric `exp` claim.
3. Accept its lifetime only when `exp * 1000 > Date.now()`. Equality means expired;
   do not trust a separately stored expiry value instead of decoding the token.
4. Refresh an expired token before using it. Normalize/check the refreshed identity
   and expiry before making it the current user.
5. Treat missing/malformed credentials and rejected authentication as signed out.
   Retain a useful retry path for temporary network failures.

Decoding does not verify a JWT signature, revocation or membership. A locally
unexpired token is not permission to bypass backend authorization. Protected UI
must not briefly expose unconfirmed account data during startup.

Login and registration validate input, preserve a valid in-app return path through
switching forms and reject external return URLs. Query/hash matter for invitations
and meeting links.

## Logout

Logout clears persisted identity/credentials and account-scoped business state,
prevents in-flight work from restoring that identity, and then performs full-page
navigation to login. Replacing a route inside the running app does not meet the
full-page reload requirement.

## Existing implementation gap

The existing `UserProvider` is a startup wrapper: it runs restoration, displays
loading/retry instead of child routes, and exposes user/set/clear through a context.
It was already in the application; it is not a newly introduced business feature.
Identity currently also appears in query/global state, and selected school is stored
with auth. These paths need consolidation under the required hook/Redux boundary.

Refresh-aware requests now share pending refresh work and retry a rejected request
once after a backend 401. Refresh rate-limit responses have bounded retry handling.
Startup currently calls refresh for a stored refresh-token record. It does not yet
follow the required decode-the-persisted-JWT-first sequence. The current logout
handler clears local identity and changes routes without reloading the page.
These are migration gaps, not promises of existing behavior.

## Verification

Existing tests cover malformed stored sessions, startup rejection, refresh races,
account cache isolation, offline form failures and authentication return paths.
Browser checks also exercise expired local credentials, backend 401 recovery and
late responses after logout; this is not proof of the required full-page logout.
Required coverage must additionally establish decoded JWT expiry boundaries,
current-user-only auth ownership, hook-only access and full-page logout with complete
account cleanup. See [auth acceptance scenarios](../e2e/auth-and-session.md).

## Related features

Recheck [school access](schools-access.md), [onboarding](onboarding.md) and stale
responses when changing session behavior. Do not allow an old session to reappear
once logout or another account has taken ownership.
