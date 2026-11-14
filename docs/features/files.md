# Files and materials

## Status and scope

Implemented at `files`: listing/filtering, direct upload, download, preview and
confirmed deletion. File storage is also used by lessons and chat attachments.

## Behavior and rules

Direct upload has three stages: request a presigned URL from the backend, transfer
bytes to storage, then complete the upload with the backend. Only completion
establishes the usable file record. Preserve checksum, progress and cancellation
handling in the existing transport; do not replace it with a component-level request.

Lists use a school and category/bucket scope. Download obtains authorized file bytes.
An absent school disables listing without showing an error or a confirmed empty list.
Errors describe the HTTP outcome: denied access is not presented as a connection
failure. Explicit retry keeps the same school/category; cached failures are replaced
by a loading state while that retry is actually in flight. Empty results appear only
after successful loading.
Membership visibility does not replace backend authorization: file access also
requires the member's tenant identity. A denial stays a denial until a real retry
succeeds; the frontend does not refresh credentials or invent access after HTTP 403.
Preview fetches supported text/image/PDF content; unsupported formats do not trigger
a preview download. PDF data is checked for its signature, and media rendering
failure is distinct from successful HTTP delivery.

## Data and dependencies

The backend owns metadata/access and object storage owns bytes. File public IDs,
storage keys and filenames have different purposes; never identify a record by its
display name alone. Lists are scoped by school and file category.

Preview queries include school, file ID and category, accept cancellation and are
not retained after use. Created object URLs must be revoked on replacement/unmount,
including StrictMode cleanup. Late responses for file A must not replace file B.

## Failure handling and limitations

Keep upload/storage/registration failures distinct; do not claim success after only
the storage transfer. Preview errors provide retry; invalid media must not leave an
endless loading state. The current format detector is extension-based, not a complete
content-safety validator. Access to lesson/chat files still requires their domain rules.

## Verification

- Preview hook tests cover cancellation/races, offline retry, unsupported types, PDF validation and object-URL cleanup.
- File helpers cover checksums/content utilities.
- File-list checks cover disabled/idle scope, cached failure while retrying, access-denied versus transport errors, explicit retry and confirmed empty results.
- Core browser tests cover real object-storage upload/content/deletion.
- Browser flows also cover valid image/text preview, UI download/delete, cancellation, multiple/drop uploads and access refusal. Deliberately invalid PNG/PDF cases establish error/retry; they do not prove valid PDF rendering.

## When changing this feature

Review [lessons](lessons-editor.md), [chat attachments](chat.md), resource cleanup and
storage access. See [file/chat acceptance scenarios](../e2e/files-and-chat.md).
