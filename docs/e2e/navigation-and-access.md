# Navigation, access, Today and profile acceptance

Use real users with different roles in two schools, plus a user with no school.
The backend is authoritative for rights. See [school access](../features/schools-access.md),
[Today](../features/today.md) and [profile](../features/profile.md).

## Role boundary

Owner and Teacher can teach; only Owner has school-management capability. Student
has read/participation access according to the backend. Course management is
course-specific; platform administration requires a separate administrative session.
Do not copy lesson permissions into file/chat rules without checking their contracts.

## Navigation

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| NAV-01 | P0 | Open `/app` and the current school's root. | Use an available selected school or the first available; school root opens Today without loops. |
| NAV-02 | P0 | Choose a school from the list and header switcher; reload. | The selected school and its Today page remain consistent. |
| NAV-03 | P0 | Switch from Teacher in A to Student in B, visit each module and reload. | URLs, records and controls belong to B; A's data and rights do not remain. |
| NAV-04 | P1 | Add a school; separately test empty memberships and failed loading/retry. | Onboarding opens; empty and failed lists are distinct. |
| NAV-05 | P0 | Visit each desktop school navigation entry. | The expected authorized module opens, selection is clear and school scope is preserved. |
| NAV-06 | P1 | Use primary mobile navigation, overflow menu and profile. | All authorized destinations remain accessible and controls are not obscured. |
| NAV-07 | P1 | Open supported legacy app, profile, school and lesson URLs. | Their configured redirects reach valid destinations without inventing an old lesson target. |
| NAV-08 | P1 | Open an unknown URL and `/403`, then use the available return action. | Appropriate not-found/denied content appears and recovery reaches a valid page. |
| NAV-09 | P1 | Inspect students, groups, empty/error states, then open a student's chat. | Data belongs to the school; the correct person opens and a missing ID cannot create an arbitrary conversation. |

## Access

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| ACCESS-01 | P0 | From school A, request a real foreign school B and a random school ID through UI and API. | No foreign data is disclosed. A random nonexistent ID alone is insufficient isolation evidence. |
| ACCESS-02 | P0 | Open lessons/students with each role; manually request editing as a student. | Teaching actions follow school capability; students remain read-only and cannot open student management. |
| ACCESS-03 | P0 | Send forbidden lesson, course, event, invitation and admin writes directly. | Backend denies each operation and no state change persists. |
| ACCESS-04 | P1 | Reopen a stored URL after membership or role revocation. | Refreshed UI and backend rights reflect the change; old controls do not bypass authorization. |

## Today

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| TODAY-01 | P0 | Seed current, future and overlapping events plus recent lessons. | Date, upcoming event and daily summary match the correct school and local day. |
| TODAY-02 | P1 | Open an empty school. | Empty states do not invent events or unusable meeting links. |
| TODAY-03 | P0 | Use create/schedule shortcuts and open event/lesson cards. | The existing feature flow opens the correct entity; event links preserve its identity. |
| TODAY-04 | P1 | Compare owner, teacher and student views. | Creation follows teaching capability; owner-only summary uses the current school. |
| TODAY-05 | P1 | Fail schedule, lesson and summary reads independently. | The affected block explains failure without hiding unrelated useful data. |

## Profile

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| PROFILE-01 | P1 | Open a multi-school user's profile. | Identity, contacts and per-school roles belong to that user. |
| PROFILE-02 | P1 | Open the upcoming event from profile. | The correct school's calendar opens the correct event. |
| PROFILE-03 | P1 | Test empty schools/events and read failures. | Each block has distinct empty/error states and no invented data. |
| PROFILE-04 | P0 | Log out from profile and open protected history/links. | The required full-page logout clears account state; protected data cannot return. |
| PROFILE-05 | P0 | Open profile from school, onboarding and waiting/error states, including mobile. | Current-user profile and logout remain available even without a provisioned school. |
