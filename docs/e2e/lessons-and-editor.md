# Lesson and editor acceptance

See [lesson behavior](../features/lessons-editor.md). Use a teacher/owner, a student,
isolated lessons and an independent browser context. Separate local draft recovery
from backend publication. These criteria are not a passed-run report.

## Catalogue and access

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| LESSON-01 | P0 | Open lessons with each role; repeat in an empty school. | Only accessible lessons appear; creation follows teaching rights; empty is distinct from failed. |
| LESSON-02 | P0 | Create a lesson and repeat the click while pending. | One real lesson opens in the appropriate mode and survives reload. |
| LESSON-03 | P0 | Open by mouse, keyboard and direct URL, then reload. | Correct content/metadata loads without relying on navigation state; students remain read-only. |
| LESSON-04 | P1 | Delete one lesson; separately fail the backend write. | Confirmation/cancel preserves the intended choice; confirmed deletion persists and failed optimistic removal is recoverable. |
| LESSON-05 | P1 | Fail list/create/delete and retry supported operations. | Errors are useful, no invented entity appears and failed deletion is recoverable. |
| LESSON-06 | P0 | As student request edit mode; request foreign or missing lessons. | No edit controls or foreign data appears; unavailable metadata cannot become an empty editable document. |

Folders and moving lessons are not complete connected workflows. Rename is
server-backed; do not infer unsupported operations from leftover UI code.

## Document lifecycle

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| EDITOR-01 | P0 | Open desktop edit mode as teacher; repeat in viewing mode. | Editing requires the explicit mode and rights; returning keeps school scope. |
| EDITOR-02 | P0 | Change text, save, inspect backend content and reload. | Explicit save publishes the document; a local draft or toast alone is insufficient evidence. |
| EDITOR-03 | P1 | Edit without explicit publication, wait for local draft retention and reload; also corrupt the draft. | A valid local draft restores; invalid local data does not break loading published content. |
| EDITOR-04 | P1 | Apply/remove each inline text format. | The intended selection changes and removing one format preserves others. |
| EDITOR-05 | P1 | Apply each supported block/list/alignment mode and restore the document. | Structure and alignment persist in the serialized document. |
| EDITOR-06 | P1 | Edit, undo and redo. | History restores the expected prior/next state and control availability. |
| EDITOR-07 | P1 | Create/change a link; test unsupported URL schemes and cancel. | Valid links target the intended text; unsafe schemes cannot execute; cancel preserves the document. |
| EDITOR-08 | P1 | Insert images by supported URL/upload paths; fail loading. | Correct images appear only after successful preparation; errors do not create a false attachment. |
| EDITOR-09 | P1 | Attach a file, retain/publish, reload and download. | Name, access and bytes are correct; a failed upload does not insert a broken reference. |
| EDITOR-10 | P1 | Insert supported video, formula and graph nodes; test invalid input/cancel. | Nodes survive serialization; invalid input is rejected; external playback is a separate environment dependency. |
| EDITOR-11 | P0 | Publish text and rename, then open as student in a clean context. | Both values come from the backend; the student can read but cannot write through UI or direct request. |
| EDITOR-12 | P1 | Open a lesson on a mobile device, including explicit edit mode. | Viewing works while the current mobile-edit restriction remains respected. |

Also verify scoped drafts, stale-save/version conflicts, shared-file protection and
recovery after network loss. A completed older save cannot clear newer local work.
