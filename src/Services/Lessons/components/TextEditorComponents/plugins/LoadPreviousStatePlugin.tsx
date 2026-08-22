import { useEffect, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { editorStateFromSerializedDocument, type SerializedDocument } from '@lexical/file';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';

const logger = createDebugger('LoadPreviousStatePlugin');

export default function LoadPreviousStatePlugin({
  editorState,
}: {
  editorState?: SerializedDocument;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editorState) {
      return;
    }

    try {
      editor.setEditorState(editorStateFromSerializedDocument(editor, editorState));
    } catch (error) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Error loading editor state:', error);
    }
  }, [editor, editorState]);

  return null;
}
