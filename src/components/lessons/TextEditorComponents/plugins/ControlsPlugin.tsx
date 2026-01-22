import '../../../../styles/pages/Lessons/components/Controls.css';
import {serializedDocumentFromEditorState} from "@lexical/file";
import type {LexicalEditor} from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {sendEditorStateAsJson} from "../../../../server/Lessons.ts";
import {BeatLoader} from "react-spinners";
import { useState } from 'react';

export default function ControlsPlugin() {
  const [editor] = useLexicalComposerContext();

  return (
    <div
      className={'lesson-id-page-controls'}
    >
      <SaveButton
        editor={editor}
      />
    </div>
  );
}

function SaveButton({editor}: {editor: LexicalEditor}) {
  const [isLoading, setIsLoading] = useState(false);

  const serializeEditor = async (editor: LexicalEditor) => {
    return serializedDocumentFromEditorState(editor.getEditorState(),);
  }

  const handleSave = () => {
    setIsLoading(true);
    serializeEditor(editor)
      .then((serializedEditor) => sendEditorStateAsJson(serializedEditor))
      .then(() => {
        alert('Урок успешно сохранён');
      })
      .catch(() => {
        alert('Не удалось сохранить урок');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
    >
      {isLoading ? <BeatLoader size={8} color="#ffffff" /> : 'Сохранить'}
    </button>
  );
}