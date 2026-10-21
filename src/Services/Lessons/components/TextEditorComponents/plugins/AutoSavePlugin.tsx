import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { serializedDocumentFromEditorState, type SerializedDocument } from '@lexical/file';

interface AutoSavePluginProps {
  onDraft: (document: SerializedDocument) => void;
  initialDocument?: SerializedDocument;
}

export default function AutoSavePlugin({ onDraft, initialDocument }: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const previousContent = useRef(JSON.stringify(initialDocument?.editorState));

  useEffect(() => editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
    if (!dirtyElements.size && !dirtyLeaves.size) return;
    const document = serializedDocumentFromEditorState(editorState);
    const content = JSON.stringify(document.editorState);
    if (previousContent.current === content) return;
    previousContent.current = content;
    onDraft(document);
  }), [editor, onDraft]);

  return null;
}
