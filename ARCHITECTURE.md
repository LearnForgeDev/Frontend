# LearnForge system architecture

LearnForge is a school workspace for teachers, students, and school owners.
One frontend application connects teaching content, scheduling, messages, and
meetings to backend services. The frontend contains both server rendering and
browser interaction. The backend owns durable records and authorization.

## System context

| Component | Responsibility |
| --- | --- |
| Browser application | Forms, navigation, session restoration, local drafts, and interaction with school resources |
| Frontend server | Initial HTML, route redirects and HTTP status, browser assets, and configured backend forwarding |
| Application backend | Accounts, memberships, school resources, accepted writes, provisioning, and meeting access |
| Object storage | Uploaded file bytes, separate from backend metadata and access rules |
| Chat hubs | Realtime message delivery and change notifications |
| Conference service | Conference rooms and media through an embedded browser client |

The frontend is one deployable application with shared infrastructure and product
modules. Pages compose feature interfaces, hooks coordinate operations, and endpoint
modules describe backend contracts. Shared UI and themes support the product modules.

## Product modules

| Module | Responsibility and dependencies |
| --- | --- |
| Identity and school access | Login, restoration, memberships, school selection, onboarding, and the school workspace |
| Students and invitations | School rosters and invitation entry, subject to membership capabilities |
| Lessons | Lesson metadata, rich documents, publication, and local draft recovery |
| Courses | Programs, audiences, and progress, with references to source lessons |
| Scheduling | Events, participants, and meeting entry; Today and Profile derive their event summaries from this data |
| Files | Authorized upload, listing, preview, download, and deletion for lessons and attachments |
| Chat | Group and direct conversations, history, drafts, attachments, and call invitations |
| Calls | Backend-authorized entry into the embedded conference service |
| Platform administration | School provisioning decisions through a separate administrative session |

The [feature map](docs/features/README.md) describes connected workflows and gaps.
Courses and calls have existing integrations while their broader design remains
under discussion. A course references lessons; deleting a course does not imply
deleting its source teaching material.

## Rendering and navigation

Next.js renders public login, registration, and error pages as HTML. Protected
routes initially render a session-check screen with an account-exit action. Private
school records load in the browser after session confirmation.

The server starts with no browser identity. It neither reads browser storage nor
restores credentials during rendering. Each render has its own query client and
Emotion style cache, so requests share neither account query data nor style state.
The browser's first render matches that initial state before restoration starts.

Product URLs share one catch-all Next.js page. Next.js owns browser history;
React Router matches the nested product routes and layouts. Internal transitions
within that page are shallow and retain client state without fetching server props.
Choosing a different school is an explicit exception: the school-selection hook
persists the confirmed membership and starts full-page navigation, replacing the
running browser application's transient scope.
Full document requests still receive server redirects and HTTP status. Route state,
query parameters, fragments, and relative navigation pass through the routing bridge.

The school identifier in the route selects the resource scope. Membership guards
control entry into that school's workspace, and capability guards limit teaching
screens. Failed membership reads remain distinct from a confirmed empty school list.
Browser-only editors and external clients load when their owning feature is active.

## State ownership

| State | Current owner |
| --- | --- |
| Durable accounts, memberships, and business records | Backend services |
| Browser identity, roles, decoded token expiry, and selected school | Global auth store |
| Session restoration, current credentials, and recovery status | Session query and user context, backed by the persisted browser session |
| Loaded lessons, courses, events, files, and conversations | Query caches observed through feature hooks |
| Unsaved lesson documents | Browser storage, scoped by account, school, and lesson |
| Conversation drafts | In-memory chat state scoped to the conversation |
| Forms, open dialogs, focus, and view selection | Local component and hook state |
| Navigation and history | Next.js, with nested route matching through React Router |

The current implementation combines query caches, global state, contexts, and local
persistence. Selected school is still stored alongside auth identity. Session query
scope is replaced when the account changes, and session-aware endpoint caches clear
on identity changes. Local lesson drafts remain associated with their original owner.

## State migration boundary

Consolidation behind public feature hooks with Redux is a requested future design.
Redux domain state is not implemented in the current runtime. The ownership table
above describes the existing application rather than that proposed replacement.

## API and authentication

Feature hooks coordinate reads and writes through endpoint modules. Shared HTTP
clients apply the backend origin, cookies, timeouts, error handling, and credential
refresh. Browser requests use a configured backend origin or the frontend's
same-origin forwarding paths. The backend decides whether a write is accepted.

The persisted browser session contains access and refresh credentials. Cold-start
restoration confirms saved credentials with the backend after browser mount.
Public forms remain available during pending or failed restoration. Invalid or
rejected credentials lead to a signed-out state; temporary failures retain retry
and account-exit actions.

Protected requests check the decoded JWT expiry, share pending refresh work, and
retry a rejected request once after refresh. Decoding an expiry does not establish
signature validity, membership, or backend permission. Responses associated with a
previous account cannot install that account's identity into a replacement session.

Logout clears credentials and the active account scope, then opens login through
full-page navigation. School capabilities derive from memberships, while individual
domains can apply narrower rights. Platform administration uses separate backend
administrative authentication rather than the ordinary user's school role.

Account-level pages must choose school-scoped reads from confirmed memberships.
Shared schedule reads accept an explicit school, including an empty value that
disables fetching; school-route callers retain their route scope. Profile event
creation installs the chosen school before reusing the existing scheduling form.

## Lessons, files, and drafts

A lesson combines backend metadata with a stored JSON document. The browser loads
both before mounting its Lexical editor. Editor extensions handle formatting,
media, formulas, and graphs. External graph and media services have availability
separate from document persistence.

Local drafts are recovery snapshots, separate from published lesson content. A draft
retains the source storage key. Publication supplies that expected key, allowing the
backend to reject an overwrite when the source changed. A completed save clears only
the corresponding draft snapshot, preserving newer edits.

File upload separates authorization, byte transfer, and registration. The backend
issues a presigned storage URL, the browser transfers bytes, and backend completion
establishes the usable file record. Metadata and access remain with the backend;
object storage owns the bytes. Previews and downloads obtain authorized content.

## Realtime and meetings

Chat history comes from backend endpoints. SignalR hubs deliver messages and notify
the browser when history needs refreshing. Connections follow the selected school
and conversation. Direct-conversation shortcuts persist by school, but conversation
drafts are in memory. Durable account-scoped offline history is not implemented.

Schedule and chat links carry room references to the calls module. The backend
returns meeting access before the browser creates an embedded conference client.
A room reference or invitation alone does not grant access. The conference service
handles media; the frontend owns the embedded client's lifecycle and navigation.

## Deployment boundaries

The deployable artifact contains a Next.js server, browser assets, and public files.
A static file host alone cannot provide the server-rendered application. The server is
configured for a process manager behind a reverse proxy. Backend, object
storage, chat transport, and conference services remain external to that artifact.

Configured backend rewrites are fixed at build time. They forward API, administrative,
and realtime traffic to the selected backend; changing that target requires a new
artifact. Browser-visible configuration contains public service addresses, while
server deployment settings identify the frontend process and proxy upstream.
