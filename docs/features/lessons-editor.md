# Lessons and rich-text editor

## Status and scope

Implemented: school lesson catalogue, creation/deletion, server-backed rename,
document viewing, publishing and local drafts. Routes are `lessons` and
`lessons/:lessonId`. Desktop editing requires `?edit=true` and teaching capability;
mobile document editing is disabled by the current device check.

## Behavior and rules

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
