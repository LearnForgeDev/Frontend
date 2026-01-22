import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {type JSX, use, useEffect} from "react";
import type {lessonObject} from "../../../../../types/lessonTypes.ts";

export default function LoadPreviousStatePlugin({editorStatePromise}: {editorStatePromise: Promise<lessonObject>}): JSX.Element | null{
  const [editor] = useLexicalComposerContext();
  const editorData = use(editorStatePromise);

  useEffect(() => {
    if (!editorData.content) return;

    try {
      const parsedState = editor.parseEditorState(editorData.content);

      editor.update(() => {
        editor.setEditorState(parsedState);
      });
    } catch (error) {
      console.error('Error loading editor state:', error);
    }
  }, [editorData, editor]);

  return null;
}