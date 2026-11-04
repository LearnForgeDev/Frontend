# Schools, access and navigation

## Status and scope

Implemented: school selection, `/app` entry, the shared app shell and school route
guards. Roles belong to each membership, not one global role for the whole account.

## Behavior and rules

`/app` loads memberships and selects the stored active school if it remains available,
otherwise the first school. No schools leads to onboarding. A loading/error response
is not treated as an authoritative empty membership list.

| Membership | Access school | Teach | Manage school |
| --- | --- | --- | --- |
| Student | Yes | No | No |
| Teacher | Yes | Yes | No |
| Owner | Yes | Yes | Yes |

Multiple roles combine capabilities. The school guard checks the route's public ID
against confirmed memberships. Missing/unauthorized schools redirect to the school
list; membership-load failures show retry. The student-management route requires
`canTeach`. Other domain actions may use narrower backend permissions, such as
course-specific `canManage`.

## Data and dependencies

The school route identifies the resource scope. Memberships and the selected school
belong to school domain state, exposed through its public hook. The existing auth
persistence still includes selected school; moving that out is a required migration,
not the desired ownership. Preserve school identity in reads, links and writes.
UI capability checks guide navigation; backend authorization remains authoritative.

Legacy admin-school URLs redirect through the existing adapter. Do not add routes
to disconnected old layouts merely because their files remain in the repository.

## Failure handling and limitations

Handle revoked membership, stale selected school and failed membership loads explicitly.
Do not fall back to a different school's data when a resource cannot be loaded.
School settings/structure management is not a complete connected workflow.

## Verification

Unit checks cover role capabilities. Browser checks cover school roles, section
loading and a foreign school ID. Additional browser journeys now use a real second school to check switching roles,
foreign resource denial and navigation. This is not a guarantee of every isolation path. [Navigation scenarios](../e2e/navigation-and-access.md)
describe additional desired checks.

## When changing this feature

Review every affected [module](README.md), especially [session isolation](auth-session.md),
[students](students-invitations.md) and [course access](courses.md).
