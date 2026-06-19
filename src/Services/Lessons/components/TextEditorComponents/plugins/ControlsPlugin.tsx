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

function SaveButton({ lessonId, editor }: { lessonId: string | number, editor: LexicalEditor }) {
  const { saveEditorState, isSaving } = useLessonEditor({ lessonId: String(lessonId) });

  const serializeEditor = async (editor: LexicalEditor) => {
    return serializedDocumentFromEditorState(editor.getEditorState());
  }

  const handleSave = (id: number | string) => {
    serializeEditor(editor)
      .then((serializedEditor) => saveEditorState(serializedEditor))
      .then(() => {
        alert(`Урок успешно сохранён! (id: ${id})`);
      })
      .catch((error) => {
        console.error('Save failed:', error);
        alert('Не удалось сохранить урок');
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