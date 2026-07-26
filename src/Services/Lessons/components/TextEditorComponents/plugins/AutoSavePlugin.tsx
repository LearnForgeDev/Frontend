import {type JSX, useEffect} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {serializedDocumentFromEditorState} from '@lexical/file';
import { useLessonEditor } from '../../../hooks/useLessonEditor/useLessonEditor';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('AutoSavePlugin');


export default function AutoSavePlugin({lessonId}: {lessonId: number | string}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const { saveEditorState } = useLessonEditor({ lessonId });

  const SAVE_LOCALLY_INTERVAL_MS = 30_000;
  const SAVE_TO_SERVER_INTERVAL_MS = 15 * 60_000;

  useEffect(() => {
    const saveEditor = setInterval(() => {
      const savedEditorState =
        JSON.stringify(serializedDocumentFromEditorState(editor.getEditorState()));

      sessionStorage.setItem(`lesson-draft-${lessonId}`, savedEditorState);
    }, SAVE_LOCALLY_INTERVAL_MS)

    return () => clearInterval(saveEditor);
  }, [editor, lessonId]);

  useEffect(() => {
    const saveEditorToServer = setInterval(() => {
      const editorState = editor.getEditorState();
      saveEditorState(editorState.toJSON())
        .catch(err => logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to save to server', err));
    }, SAVE_TO_SERVER_INTERVAL_MS);

    return () => clearInterval(saveEditorToServer);
  }, [SAVE_TO_SERVER_INTERVAL_MS, editor, saveEditorState]);

  return null;
}