# Schools, access and navigation

## Status and scope

Implemented: school selection, `/app` entry, the shared app shell and school route
guards. Roles belong to each membership, not one global role for the whole account.

## Behavior and rules

`/app` loads memberships and selects the stored active school if it remains available,
otherwise the first school. No schools leads to onboarding. A loading/error response
is not treated as an authoritative empty membership list.

Definitively rejected refresh credentials sign the user out and return protected
school routes to login. Failed refresh caused by a temporary service problem retains
retry and logout recovery; it does not confirm new membership or an empty school list.
Public login is outside the session restoration gate, so failed startup cannot trap
the user on the school list.
Client mutations start even when the browser reports offline and settle with the
transport result. They do not wait indefinitely in an offline queue with forms stuck
pending. Unknown accepted-write outcomes still require the owning feature's recovery.

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

The desktop sidebar can collapse to labeled icon actions while keeping navigation
and school switching available. Collapse state lasts while the app shell is mounted;
it is not persisted. The header and content follow the same sidebar width. Mobile
navigation remains independent. Accounts without memberships do not show an empty
school switcher and can add a school from [Profile](profile.md). In short desktop
windows, the navigation scrolls while school switching and the collapse toggle retain
their space; the sidebar can also scroll if those fixed controls exceed its height.

The school-selection hook resolves a school route only against confirmed accessible
memberships. An unknown route never falls back to another school's scope. Account
pages retain an available stored school, otherwise a teaching membership, otherwise
the first accessible membership. Profile entry remembers a confirmed route selection.

Both the switcher and school list use the same selection operation. Selecting a
different confirmed school persists its ID before full-page navigation to its Today
page, replacing the running application's transient state. Reopening the current
school uses ordinary internal navigation. Forged or roleless choices are ignored;
backend authorization remains authoritative after reload.

## Data and dependencies

The school route identifies the resource scope. Memberships and the selected school
belong to school domain state, exposed through its public hook. The existing auth
persistence still includes selected school; moving that out is a required migration,
not the desired ownership. Preserve school identity in reads, links and writes.
UI capability checks guide navigation; backend authorization remains authoritative.

Legacy admin-school URLs redirect through the existing adapter. Do not add routes
to disconnected old layouts merely because their files remain in the repository.
Platform provisioning is [backend administration](platform-administration.md); the
frontend school endpoint boundary contains only ordinary school operations.

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
