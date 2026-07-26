import './Controls.css';
import { serializedDocumentFromEditorState } from '@lexical/file';
import type { LexicalEditor } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { BeatLoader } from 'react-spinners';

export default function ControlsPlugin({ lessonId }: { lessonId: string | number }) {
  const [editor] = useLexicalComposerContext();

  return (
    <div
      className={'lesson-id-page-controls'}
    >
      <SaveButton
        editor={editor}
        lessonId={lessonId}
      />
    </div>
  );
}

import { useLessonEditor } from '@/Services/Lessons/hooks/useLessonEditor/useLessonEditor';

import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('ControlsPlugin');


function SaveButton({ lessonId, editor }: { lessonId: string | number, editor: LexicalEditor }) {
  const { saveEditorState, isSaving } = useLessonEditor({ lessonId: String(lessonId) });
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);

  const serializeEditor = async (editor: LexicalEditor) => {
    return serializedDocumentFromEditorState(editor.getEditorState());
  }

  const handleSave = (id: number | string) => {
    serializeEditor(editor)
      .then((serializedEditor) => saveEditorState(serializedEditor))
      .then(() => {
        showNotification({
          id: `lesson-saved-${Date.now()}`,
          title: 'Урок сохранён',
          subtitle: `Урок успешно сохранён! (id: ${id})`,
          priority: 'low',
          time: 3000,
        });
      })
      .catch((error) => {
        logger.logEventForDebug(DebugSeverity.DANGER, 'Save failed:', error);
        showNotification({
          id: `lesson-save-failed-${Date.now()}`,
          title: 'Ошибка сохранения',
          subtitle: 'Не удалось сохранить урок.',
          priority: 'high',
          time: 4000,
        });
      });
  };

  return (
    <button
      onClick={() => handleSave(lessonId)}
      disabled={isSaving}
    >
      {isSaving ? <BeatLoader size={8} color="#ffffff" /> : 'Сохранить'}
    </button>
  );
}