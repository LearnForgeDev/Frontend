# Lessons and rich-text editor

The lesson editor and homework share a domain-neutral Lexical composition core.
Lesson-specific media, publication controls, source-version checks and draft recovery
remain owned by Lessons. Homework uses its own compact rich-text toolbar and owns
its uploads, answers and save lifecycle. Each editor has its own identity and focus;
mounting a homework question does not steal focus from another input.

Article back navigation is an arrow-only circular control in the local page header.
Its accessible name and title describe the existing catalogue destination.

## Status and scope

Implemented: school lesson catalogue, creation/deletion, server-backed rename,
document viewing, publishing and local drafts. Routes are `lessons` and
`lessons/:lessonId`. Desktop editing requires `?edit=true` and teaching capability;
mobile document editing is disabled by the current device check.

## Behavior and rules

Article content uses the same product name in the catalogue, editor and course reader.

The product calls lesson resources articles (`Статьи`). Creation, rename, search,
empty states and accessibility labels use article terminology; existing lesson
identifiers, API contracts, routes and draft storage keys remain unchanged.

The equation editor follows its explicit inline flag: inline equations use a
single-line input and block equations use a textarea. Forwarded object/callback
refs attach to the chosen field; inspecting the ref container is not a DOM-type test.
Image uploads remain pending through URL validation and insertion, and failures use
the existing insertion error message before the upload action finishes.

Lesson metadata and its referenced JSON file are loaded before mounting the editor.
Missing metadata/content must not become a successful empty editable document.
Rich document content supports formatting and custom media/math/graph nodes.

Document changes can be retained as local drafts. Explicit saving publishes a
serialized document through the lesson update endpoint; renaming uses the same
server-backed update path for metadata. A successful publication is different from
a local autosave and is expected to be visible to an authorized second user.

The edit session carries the source file's `storageKey`. Saving sends
`expectedStorageKey`; a different current version blocks overwriting from a stale
draft. A conflict response refreshes metadata. Loading the current version discards
the local draft explicitly, rather than silently replacing user input.

## Document workspace

Article editing and viewing fill the available workspace width and height. The
page owns the available height; the document scrolls within the remaining space
while its toolbar, title and publication controls remain reachable. The editor has
no centered sheet width cap. Course article readers use the same full-width,
scrollable document area. This sizing does not make embedded homework editors
full-screen or change draft, publication or mobile-editing rules.

## Data and dependencies

The backend owns lesson metadata and published content. Local draft keys include
user, school and lesson IDs. Drafts retain their base storage key, and clearing a
saved draft checks its document so a newer local edit is not removed by an old save.

Successful saving updates lesson metadata/content caches and invalidates lesson
lists, courses and course lesson-content queries. Content and file ownership are
separate: a shared file must not permit overwriting another lesson's material.
The existing file-manager folder/move code is not a complete connected catalogue workflow.

## Failure handling and limitations

Keep drafts after publication errors and show storage failures separately. Do not
claim publication from a toast alone. Preserve concurrent-save/version protection.
Catalogue deletion now offers confirmation/cancel. External media and graph-service
availability are separate from document persistence.
Mobile viewing does not imply mobile editing support.

## Verification

- Draft rules and file/content helpers.
- Editor browser tests cover publication/rename visible to a student, offline draft recovery, shared-file protection, concurrent-browser conflicts, metadata errors and invalid document rejection.
- Browser flows also cover keyboard opening, confirmation/cancel deletion, inline/block formatting, undo/redo, published attachments and selected media insertion.
- [Editor acceptance scenarios](../e2e/lessons-and-editor.md) include additional formatting/media checks.

## When changing this feature

Recheck [course lesson consumption](courses.md), [file contracts](files.md), account
isolation and editor chunk deferral. Preserve the distinction between local draft,
published version and server-confirmed rename.

Editor code loads in the browser after session confirmation. A failed editor import
must reach the page recovery controls rather than leave an indefinite spinner.
