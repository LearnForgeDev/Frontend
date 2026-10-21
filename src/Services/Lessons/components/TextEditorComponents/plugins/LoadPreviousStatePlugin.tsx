import { useEffect, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { editorStateFromSerializedDocument, type SerializedDocument } from '@lexical/file';

export default function LoadPreviousStatePlugin({
  editorState,
  onError,
}: {
  editorState?: SerializedDocument;
  onError: (failed: boolean) => void;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editorState) {
      return;
    }

    try {
      editor.setEditorState(editorStateFromSerializedDocument(editor, editorState));
    } catch {
      onError(true);
    }
  }, [editor, editorState, onError]);

  return null;
}
