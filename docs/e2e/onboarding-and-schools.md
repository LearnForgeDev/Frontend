# Onboarding, invitations and provisioning acceptance

Use isolated test requests/accounts. Administrative decisions must affect only test
data. See [onboarding](../features/onboarding.md), [invitations](../features/students-invitations.md)
and [platform administration](../features/platform-administration.md).

## Onboarding

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| ONB-01 | P0 | Open `/app` as a new user without schools. | Onboarding offers the supported invitation/request-school paths. |
| ONB-02 | P1 | Submit an empty/whitespace school name, then a valid one. | Invalid input does not create a request; valid input is trimmed. |
| ONB-03 | P0 | Request a school and click submit again while pending. | One request is created, its returned identity opens waiting and the pointer belongs to the user. |
| ONB-04 | P0 | Reload a pending request and return through onboarding. | The same request is restored without duplicate creation or uncontrolled polling. |
| ONB-05 | P0 | Approve a request, delay provisioning, then complete it. | Waiting continues until real membership exists; then Today opens and the matching pointer is cleared. |
| ONB-06 | P1 | Reject/fail a request and return to the app. | Terminal polling stops and another valid path is available without redirect loops. |
| ONB-07 | P0 | Keep A's request pointer, authenticate as B and open a foreign request. | B does not inherit A's waiting path; denied reads settle without repeated polling or input loss. |
| ONB-08 | P1 | Fail a request-status read and recover. | Error/retry preserves relevant input and restores the correct state. |
| ONB-09 | P1 | Open waiting with a long school name at narrow, tablet and desktop widths. | Heading, status and forms remain visible without document overflow or overlap. |
| ONB-10 | P1 | Start/restart the waiting game with keyboard/touch; enable reduced motion. | It loads only on request, manages focus, avoids stealing form input and respects reduced motion. |
| ONB-11 | P1 | Traverse selection, waiting, provisioning, rejection and approval. | Setup steps and current-step semantics match actual progress. |

Unknown backend statuses need an explicit contract; do not invent an extra success
state. Approval alone does not establish a ready school.

## Invitations

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| INV-01 | P0 | Create an invitation as owner with role, duration and use limit. | Backend returns a real token; link/QR/copy identify the same invitation at the current origin. |
| INV-02 | P1 | Repeat as teacher and test validation/backend refusal. | Role-specific rights are enforced; invalid limits/dates do not produce false success. |
| INV-03 | P0 | Follow a valid invitation while authenticated and accept it. | Membership and current identity refresh; the target school remains accessible after reload. |
| INV-04 | P0 | Follow an invitation as guest, authenticate/register and continue joining. | The token and validated internal return path survive without manual reinsertion. |
| INV-05 | P1 | Use invalid, expired and exhausted tokens, including reusing a single-use token. | Backend denies invalid joins without granting access; retry remains usable. |
| INV-06 | P1 | Consume the last use from two independent accounts; also join while waiting on a school request. | The limit is atomic; only successful membership is shown and an unrelated request is not silently cancelled. |

QR presence/link equality can be checked without a physical camera. Actual scanning
is a separate device check. Do not assume a manual token input exists merely because
an older scenario described it.

## Platform administration

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| DEV-01 | P1 | Open requests with a separate admin session; repeat with an empty list. | Correct request data or an explicit empty state appears. |
| DEV-02 | P0 | Approve a test request and observe the applicant. | Backend decision persists and the applicant reaches the provisioned school; duplicate decisions are blocked. |
| DEV-03 | P1 | Reject a separate request. | Rejection persists, the list updates and no school appears for that request. |
| DEV-04 | P0 | Open without admin auth and with only ordinary school auth; expire admin auth and fail a request. | Administrative login is distinct from read retry; no unauthorized data or approve/reject operation is allowed. |

External server administration is not a frontend page in this catalogue.
