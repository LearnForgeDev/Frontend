# Platform administration

## Status and scope

Implemented at `/developer`: list school provisioning requests and approve/reject
them. This is a platform operation with a separate backend administrative session,
not a permission automatically granted to a school owner.

## Behavior and rules

The page is registered separately from the ordinary protected app shell. It loads
the provisioning list and treats backend admin authentication as authoritative.
Unauthorized/expired sessions offer administrative login; transport/server failures
offer retry. Approval/rejection invalidates the request query, and concurrent
decision buttons are disabled while a mutation is pending.

The admin login belongs to the backend. An ordinary user identity or school-owner
capability must not be substituted for it. Approval is a decision; the user's
onboarding flow still waits for provisioned membership before entering the school.

## Data and dependencies

Provisioning endpoints use the base HTTP client and backend administrative cookies,
not the normal user's refresh-aware request path. Backend responses are normalized
at the feature boundary. The platform page and [onboarding](onboarding.md) observe
different parts of the same provisioning lifecycle.

## Failure handling and limitations

Distinguish missing admin authentication from network failure. Reauthentication must
allow returning to request management. Never put the admin TOTP secret or its values
in committed examples, board messages or reusable test state.
Old `AdminPanel` dashboards and marketplace placeholders are not this workflow.

## Verification

Admin contract/error tests cover response
normalization and login-vs-network errors. Admin browser tests
exercise separate login and recovery after session expiry. Additional onboarding journeys now cover approval/rejection followed by the
applicant's provisioned-school entry.

## When changing this feature

Review provisioning contracts, administrator-session handling and the
[onboarding waiting state](onboarding.md). Keep school and platform privileges separate.
