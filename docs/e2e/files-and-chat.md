# File and chat acceptance

Use isolated users/schools and real backend records. These are acceptance goals;
[coverage](coverage.md) distinguishes existing checks. See [files](../features/files.md)
and the updated [chat requirements](../features/chat.md).

## Files

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| FILE-01 | P0 | Open populated and empty materials. | Names/types/sizes match the current school; failure is not an empty result. |
| FILE-02 | P0 | Upload a small text file and reload. | Authorization, byte transfer and completion succeed; one usable record references the original bytes. |
| FILE-03 | P1 | Upload several files, including one failure; use supported drop input separately. | Each result/progress is independent and completion counts are truthful. |
| FILE-04 | P1 | Cancel a delayed upload, then retry the file. | Cancellation is not success and a new upload can complete correctly. |
| FILE-05 | P1 | Search/filter, switch supported views and clear. | Results match criteria; view mode does not change business records. |
| FILE-06 | P0 | Preview supported text/image/PDF and unsupported data; quickly change file. | Correct content appears where supported and stale responses cannot replace the active preview. |
| FILE-07 | P0 | Download through the UI with a Russian/spaced filename. | The browser download has the correct name and bytes; API content-read alone is insufficient. |
| FILE-08 | P0 | Cancel deletion, then confirm and reload. | Only the chosen file identity is removed; another file with the same name remains. |
| FILE-09 | P1 | Fail list, preview, download and deletion; recover. | Useful errors/retry appear without false empty or successful results. |
| FILE-10 | P0 | Use distinct files in two schools and directly request foreign metadata/content. | No cross-school list/preview leakage or authorization bypass occurs. |
| FILE-11 | P1 | Use a mobile capture-input fixture. | It follows the shared upload pipeline; a physical camera remains a separate device check. |
| FILE-12 | P1 | Create same-name files, operate on one and cancel a later system picker. | Operations use file identity; the other file stays intact and cancel creates no upload. |

## Chat

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| CHAT-01 | P0 | Open a conversation with remote data, with local data only, and with no available data. | Relevant history appears; unavailable information differs from a confirmed empty conversation. |
| CHAT-02 | P0 | Send by Enter and button in separate checks; inspect a second user and reload both. | Real delivery and persisted history contain one correctly attributed message. |
| CHAT-03 | P1 | Submit empty/whitespace text, then interrupt delivery for a real draft. | Empty text without attachments is blocked; failed sending retains input and never claims delivery or silently sends later. |
| CHAT-04 | P1 | Create a branch/group; test invalid name, cancel and backend failure. | Only confirmed creation appears; backend rights and input validation hold. |
| CHAT-05 | P0 | Select a direct-chat participant, send and select them again. | The correct recipient gets the message and local navigation does not duplicate the conversation. |
| CHAT-06 | P1 | Open chat from a student row and a requested-user link; try a foreign identity. | Only the intended authorized conversation opens. |
| CHAT-07 | P0 | Attach existing/new files, remove one selection and send an attachment-only message. | Only selected file identities are sent and authorized recipients can read them after reload. |
| CHAT-08 | P1 | Search/select/cancel attachments and close during upload. | Cancellation does not attach stale selections; already persisted files are not falsely reported deleted. |
| CHAT-09 | P0 | Receive image/document attachments, preview/download and request them as outsider. | Authorized bytes are correct and direct links do not bypass rights. |
| CHAT-10 | P1 | Switch conversations quickly and interrupt/resume backend updates. | Histories do not mix; retained data stays visible and the UI shows updating information rather than connection states. |
| CHAT-11 | P0 | Create a call invitation and open it as another permitted user. | Backend authorization precedes claimed creation and the reference targets the intended room; redesign remains deferred. |
| CHAT-12 | P1 | Use mobile list/detail navigation and any connected floating chat UI. | Input and navigation remain accessible without mixing schools or blocking primary actions. |
| CHAT-13 | P0 | Persist history, restart with backend unavailable, wait beyond previous cache timers, then receive a newer snapshot. | Authorized local records remain until confirmed replacement information arrives; failed/partial responses do not erase unrelated history. |
| CHAT-14 | P0 | Apply server edits/deletions/access revocation and switch accounts. | Confirmed changes reconcile correctly and another account cannot see the retained local records. |

Local persistence/update-state criteria are required changes and are not established
by the existing send/history tests. SQL is only a persistence option under consideration.
