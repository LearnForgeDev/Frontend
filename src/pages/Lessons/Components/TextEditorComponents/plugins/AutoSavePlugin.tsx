import {type JSX, useEffect} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {serializedDocumentFromEditorState} from "@lexical/file";

export default function AutoSavePlugin({lessonId}: {lessonId: number | string}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const SAVE_INTERVAL_MS = 30_000;

  useEffect(() => {
    const saveEditor = setInterval(() => {
      const savedEditorState =
        JSON.stringify(serializedDocumentFromEditorState(editor.getEditorState()));

      sessionStorage.setItem(`lesson-draft-${lessonId}`, savedEditorState);
    }, SAVE_INTERVAL_MS)

    return () => clearInterval(saveEditor);
  }, [editor, lessonId]);

  return null;
}