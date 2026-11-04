# Authentication and session acceptance

These are acceptance criteria, not a claim of passing tests. See the
[auth contract](../features/auth-session.md) for current behavior and required changes.
All quoted user-facing messages must remain Russian in the product.

## Forms

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| AUTH-01 | P0 | As a guest, open `/` and `/auth`. | Both lead to login with username, password and submit controls. |
| AUTH-02 | P0 | Switch between login and registration. | The correct form opens without protected content appearing. |
| AUTH-03 | P0 | Submit valid credentials by button and, separately, Enter. | The valid return path opens; default entry selects a school or onboarding. |
| AUTH-04 | P0 | Use an incorrect password or unknown account. | A useful Russian error appears, input can be corrected and no user is authenticated. |
| AUTH-05 | P1 | Submit empty and partly completed forms. | Required input is validated before a request; protected data remains inaccessible. |
| AUTH-06 | P1 | Toggle password visibility in each password field. | Visibility changes without changing the value. |
| AUTH-07 | P0 | Register a unique account, then sign in again. | A real account exists and onboarding is reachable without a restoration loop. |
| AUTH-08 | P1 | Use mismatching passwords, then correct them; try an existing username. | Invalid input or duplicate identity produces an appropriate error without signing in as another user. |
| AUTH-09 | P1 | Open auth forms while signed in; separately lose network during submission. | Authenticated users reach the app; failed submission settles and can be retried. |

## Session lifecycle

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| SESSION-01 | P0 | Reload a protected route with valid persisted credentials; repeat in a new context. | The session is restored through the auth hook, without treating a stored identity alone as authorization. |
| SESSION-02 | P0 | Open each ordinary protected route as a guest, including onboarding. | Login preserves a valid internal return path; no protected UI flashes. Administrative login is checked separately. |
| SESSION-03 | P0 | Store malformed JSON or an identity without usable credentials. | Invalid auth is cleared and protected UI never mounts. |
| SESSION-04 | P0 | Use a forged unexpired token or expired token with invalid refresh credentials. | Backend rejection clears invalid auth; decoding does not substitute for server authorization. |
| SESSION-05 | P1 | Expire access credentials while retaining valid refresh credentials, then read protected data. | Refresh succeeds before use and the operation completes without an infinite loop. |
| SESSION-06 | P0 | Start with a stored session while backend confirmation is unavailable; restore service and retry. | A retryable blocking state protects data and does not falsely report permanent logout. |
| SESSION-07 | P0 | Log out from a populated account, then use history and protected links. | Account state and credentials are cleared; full-page navigation to login occurs. This reload is a required change, not current router-only behavior. |
| SESSION-08 | P1 | Delay a refresh/read, log out or change account, then release the old response. | The old user and data cannot be restored. |
| SESSION-09 | P1 | Start several reads with expired access credentials; repeat with invalid refresh credentials. | Restoration is bounded; account state remains consistent and no cascade of repeated sign-outs occurs. |
| SESSION-10 | P0 | Decode persisted tokens with future, equal-to-now, past, missing and malformed `exp` claims. | Only a finite numeric future expiry passes the lifetime check; expired credentials require refresh before use. A separately stored expiry cannot override the JWT. |

Also apply account/school isolation checks from [cross-cutting acceptance](cross-cutting.md).
