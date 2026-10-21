import { useEffect, useRef, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { editorStateFromSerializedDocument, type SerializedDocument } from '@lexical/file';

export default function LoadPreviousStatePlugin({
  editorState,
  onError,
  initializeOnce,
}: {
  editorState?: SerializedDocument;
  onError: (failed: boolean) => void;
  initializeOnce: boolean;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!editorState || (initializeOnce && hasLoaded.current)) {
      return;
    }

    try {
      editor.setEditorState(editorStateFromSerializedDocument(editor, editorState));
      hasLoaded.current = true;
    } catch {
      onError(true);
    }
  }, [editor, editorState, onError, initializeOnce]);

  return null;
}
