import { useEffect, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { serializedDocumentFromEditorState } from '@lexical/file';
import { writeLessonDraft } from '@/Services/Lessons/hooks/useLessonEditor/useLessonEditor.utils';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
import { LOCAL_DRAFT_AUTOSAVE_INTERVAL_MS } from './AutoSavePlugin.const';

const logger = createDebugger('AutoSavePlugin');

export default function AutoSavePlugin({
  lessonId,
}: {
  lessonId: number | string;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const saveDraft = () => {
      try {
        writeLessonDraft(
          lessonId,
          serializedDocumentFromEditorState(editor.getEditorState()),
        );
      } catch (error) {
        logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to save local draft', error);
      }
    };

    const intervalId = window.setInterval(saveDraft, LOCAL_DRAFT_AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [editor, lessonId]);

  return null;
}
