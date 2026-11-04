# Onboarding and school provisioning

## Status and scope

Implemented: `/onboarding`, invitation acceptance and
`/onboarding/waiting/:requestPublicId`. Provisioning decisions belong to the separate
[platform administration](platform-administration.md) workflow.

## Behavior and rules

A user can request a school or follow an invitation. Request creation records the
memberships known before the request and the returned request public ID, then opens
the waiting page. The pointer is associated with the user; another account must not
inherit an earlier user's waiting route.

The shared onboarding header offers direct logout on selection and waiting screens,
without requiring the profile to load. It clears the current session and opens login
with a full-page navigation. Pending or failed session restoration also offers login
recovery before any protected onboarding content is shown.

Polling continues only for appropriate nonterminal states and stops on errors.
An unavailable request offers a way back. Approval alone does not prove the school
is usable: the waiting flow polls memberships until the approved school is visible,
then clears the matching pointer and redirects to that school's Today page.

Joining sends the invitation to the backend, installs the normalized returned
identity and refreshes memberships. It opens the newly discovered school, or the
school list if the target cannot be established safely.

## Data and dependencies

Backend request status and memberships are authoritative. A local pointer is only a
navigation hint. Use returned request IDs rather than inferring one from a school
name. Invitation tokens travel in the onboarding URL and survive authentication.

The waiting screen lazily loads the dinosaur game only after explicit interaction.
It supports keyboard/touch input and reduced-motion behavior.

## Failure handling and limitations

Keep request input on failure, distinguish unavailable requests from transient
failures and avoid uncontrolled polling. An approval/provisioning delay is not a
frontend permission to create membership locally. Never persist invitation or auth
secrets in knowledge docs or screenshots intended for sharing.

A rejected, expired or revoked invitation can return 401 even after the account's
refresh succeeds. Keep the authenticated session, show the invitation failure and
allow another link to be submitted. Rejected refresh credentials still end the
session; this invitation exception does not change other protected operations.

## Verification

- Unit checks cover request-pointer ownership and status polling.
- Onboarding browser flow covers a real request, responsive bounds and the game.
- Auth/onboarding tests cover pointers, unavailable requests and return paths.
- Invitation tests cover joining and limits.

Additional browser journeys now exercise approval/rejection in an independent
administrative context and confirm provisioned membership for the applicant. See [acceptance scenarios](../e2e/onboarding-and-schools.md).

## When changing this feature

Recheck [auth return paths](auth-session.md), [invitations](students-invitations.md),
[school selection](schools-access.md) and the administrator's request contract.
