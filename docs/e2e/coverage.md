# Existing browser coverage and gaps

This summary reflects code inspection on the current PR base, not a fresh browser
run. Discover implementation through [naming](../guides/naming.md).
[Feature docs](../features/README.md) distinguish existing behavior from requirements.

| Area | Existing assertions | Important gaps |
| --- | --- | --- |
| Public/auth forms | Validation, visibility, guest redirects, return paths and form failures | New auth-hook/Redux ownership and a complete field boundary matrix |
| Sessions | Invalid records, protected-UI gating, expired credentials, shared refresh, backend 401 recovery and late responses after logout | Persisted-JWT-first startup sequence, required full-page logout and wider account races |
| Roles/navigation | Real second-school switching, role changes, foreign resource denial, legacy links and mobile navigation | Every revocation/isolation path and the required store boundary |
| Onboarding/admin | Real requests, approval/rejection, applicant provisioning, separate backend admin login/API, removed frontend admin route, waiting recovery and profile access | Broader provisioning failure/retry combinations |
| Lessons | Creation, keyboard/direct entry, publish/rename, learner permissions, deletion confirmation, drafts/conflicts, formatting, selected media and attachments | Complete external-media and editor interoperability coverage |
| Files | Real byte storage, valid text/image preview, UI download/delete, same-name identity, multiple/drop uploads, cancellation and access denial | Successful valid PDF rendering and wider preview formats |
| Chat | Independent group/direct delivery, attachments, images/download, call links, reload, mobile navigation and draft handling | Durable account-scoped local fallback, backend-confirmed retention and update-only UI |
| Invitations | Creation, limits, rotation/revocation, concurrent consumption, role restrictions, joining and additional UI journeys | Full lifecycle/revocation combinations across devices |
| Today/profile | Identity/roles, nearest-event/lesson links, empty schools and isolated read failure | Boundary timing and required full-page logout |
| Scheduling | Explicit attendees visible to learner, calendar/mobile navigation, slot creation and update/delete/error journeys | Full timezone/DST and participation-window matrix |
| Courses | Unit mapping/audience/recovery and real-backend unavailable-API handling | Successful course creation, program/access/progress browser workflows; design discussion deferred |
| Calls | Client-load recovery, routing, tokens and invitations delivered to another participant | Working media and complete participant-access matrix; design discussion deferred |

CI separates real-backend journeys from deliberately intercepted request failures.
An intercepted failure validates UI recovery, not the backend operation being mocked.
Use [executable configuration](../../.github/workflows/test.yml) for the actual selection.

Local-first chat and some auth ownership/logout requirements remain unimplemented.
Screenshots are diagnostics, not image-baseline comparisons. A test file or scenario
ID does not prove a passing run. The required browser runs belong in CI.

Disconnected settings/dashboard code, homework references and meeting helpers do not
establish complete product workflows. Define their lifecycle before treating them
as supported modules.
