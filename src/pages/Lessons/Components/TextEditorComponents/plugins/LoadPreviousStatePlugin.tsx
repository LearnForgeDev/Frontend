import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {type JSX, use, useEffect} from "react";
import type {lessonObject} from "../../../../../types/lessonTypes.ts";
import type {SerializedDocument} from "@lexical/file";
import type {LexicalEditor} from "lexical";

// Plugin to load previous editor state from a promise or session storage
export default function LoadPreviousStatePlugin(
  {
    lessonId,
    editorStatePromise,
  }: {
    lessonId: string | number,
    editorStatePromise?: Promise<lessonObject | undefined | null>
  }): JSX.Element | null{
  const [editor] = useLexicalComposerContext();

  setEditorStateFromLocalStorage(lessonId, editor);

  const editorData = editorStatePromise
      ? use(editorStatePromise)
      : undefined;

  useEffect(() => {
    // Fetch data from the provided promise
    if (!editorData?.content) return;
    try {
      const parsedState = editor.parseEditorState(editorData.content);

      editor.update(() => {
        editor.setEditorState(parsedState);
      });
    } catch (error) {
      console.error('Error loading editor state:', error);
    }
  }, [editorData, editor, lessonId]);

  return null;
}

// Utils

const getAutoSavedData =
    (lessonId: number | string): string | null => {
  return sessionStorage.getItem(`lesson-draft-${lessonId}`);
}

const setEditorStateFromLocalStorage = (
    lessonId: number | string,
    editor: LexicalEditor,
): void => {
  const autoSavedData = getAutoSavedData(lessonId);
  if (!autoSavedData) return;

  const MAX_AUTO_SAVED_TIME = 1000 * 60 * 60;
  const currentTime = new Date().getTime();
  const data = JSON.parse(autoSavedData) as SerializedDocument;

  if (data.lastSaved - currentTime < MAX_AUTO_SAVED_TIME) {
    try {
      const parsedState = editor.parseEditorState(data.editorState);

      editor.update(() => {
        editor.setEditorState(parsedState);
      });
      return;
    } catch (error) {
      console.error('Error loading auto-saved editor state:', error);
    }
  }
}