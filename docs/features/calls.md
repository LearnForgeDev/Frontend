# Calls

## Status and scope

Meeting entry is connected from scheduling/chat, with backend authorization and an
embedded conference client. The current architecture is not endorsed as the target.
Its redesign discussion is explicitly deferred.

## Existing behavior

A room reference leads to a backend request for meeting access. The screen prepares
an embedded client and offers retry/close on failure. Invitations reference a room;
they do not grant access. Leaving the conference returns to the school workflow.

Client instances, listeners and media resources need cleanup when the room or account
changes. Successful preparation is not proof of working media or participant delivery.

## Deferred decisions

Discuss the desired call lifecycle and integration boundaries with the project owner
before changing the architecture. This docs-only iteration selects no replacement,
creates no task and carries out no redesign.

## Verification boundary

Existing checks cover some client-load recovery, schedule routing and backend token
issuance. They do not establish working audio/video or complete participant-access
coverage. See [call scenarios](../e2e/schedule-and-calls.md).

Related modules: [chat](chat.md), [scheduling](scheduling.md), [school access](schools-access.md).
