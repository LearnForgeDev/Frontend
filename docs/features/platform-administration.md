# Platform administration

## Status and scope

Platform administration belongs to the backend. The frontend `/developer` page,
its request-management controls and administrative endpoint helpers have been removed.
Opening that frontend path uses the ordinary not-found page.

## Behavior and ownership

Open `/SoftAdmin` on the backend base URL to authenticate through `/SoftAdmin/Login`.
School provisioning management remains available through the backend `/Admin/Schools`
page and administrative API. Administrative authentication uses its own session and
TOTP; an ordinary user identity or school-owner capability does not grant access.
Never store administrative secrets in frontend code or reusable browser test state.

Approval is a backend decision. The [onboarding](onboarding.md) waiting flow still
requires provisioned membership before entering the school. Removing the frontend
page does not change request submission, polling, approval or rejection contracts.

## Verification and limits

Browser journeys authenticate an independent backend administrator through the
existing test helper and perform provisioning decisions through the backend API.
They check applicant entry after approval, rejection recovery, unauthenticated and
expired-session denial. Navigation checks confirm that `/developer` is not a page.
These scenarios require the configured isolated backend in CI; local source checks
do not establish a passing backend administrative journey.
