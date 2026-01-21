import {type JSX, useEffect} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";


export default function ToggleIsEditable({isEditable}: { isEditable?: boolean }): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;
    const shouldBeEditable = Boolean(isEditable);
    if (editor.isEditable() !== shouldBeEditable) {
      editor.setEditable(shouldBeEditable);
    }
  }, [editor, isEditable]);

  return null;
}