# Chat and message history

## Status and scope

Branch/group and direct conversations, history, messages, attachments and call
invitations are connected. Local-first retention and the update-only status UX below
are requirements; the current implementation does not fully provide them.

## Required data behavior

Keep chat information in its domain state and expose it through the public chat hook.
The hook owns reading local data, requesting backend updates, sending messages and
applying confirmed results. Components do not choose between store, local database
and network themselves.

When backend information is unavailable, show authorized locally available history
and conversations. Retain that snapshot until the backend supplies newer information;
elapsed time, a failed request or a transport interruption must not clear history or
make the UI treat it as unusable. This is independent of a cache library's internal
freshness terminology.

A confirmed server edit/deletion or loss of access must still be applied. A partial
response must not erase unrelated retained records. Scope persisted data by account,
school and conversation, and avoid displaying it to a different account after logout.
Local fallback does not authenticate an account. Cold-start offline session behavior
must be agreed with the auth contract rather than bypassing session verification.

## User-visible update states

Do not expose connected, disconnected or reconnecting transport statuses. The user
should know when chat information is updating. Keep existing information usable
while updating and show a useful retry/error state if new information cannot be read.
An empty server-confirmed conversation differs from unavailable history with no
local snapshot.

Transport details remain internal to synchronization. A failed send must not be
shown as delivered. Keep draft text/attachments, expose retry and prevent duplicate
submission. Do not automatically send an old failed draft on reconnect without an
agreed outbox policy.

## Drafts, attachments and calls

Drafts belong to their conversation. A completed send clears only the submitted
snapshot, preserving edits made while sending. Attachment access follows the
[file domain](files.md). A call invitation is a room reference, not authorization.
The [calls architecture discussion](calls.md) is deferred.

## Existing behavior and gaps

Currently, history is read from the backend and realtime notifications trigger
history refresh. Message sends use the realtime transport. Direct-conversation
shortcuts are persisted locally by school without the account in their key; they
are not a complete persisted inbox. Drafts are currently in-memory.

The required account-scoped local history fallback, backend-confirmed replacement
rules and update-oriented UI still need implementation. Existing tests cover draft
recovery and stale-send handling. Browser journeys now check independent participants,
group/direct delivery, attachments and reload. They still do not prove a durable
local-first inbox or the required update-only UI.

## Local database decision

A local SQL database is being considered for chat persistence. No storage engine,
schema, retention policy or migration approach has been selected. It would be a
persistence adapter behind the hook, not a second UI source of truth. Server update
identity/versioning, deletion reconciliation and access revocation need an agreed
contract before choosing that design.

See [chat acceptance scenarios](../e2e/files-and-chat.md) for existing and required checks.
