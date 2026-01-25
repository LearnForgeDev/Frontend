import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {type JSX, use, useEffect} from "react";
import type {lessonObject} from "../../../../../types/lessonTypes.ts";
import { editorStateFromSerializedDocument, type SerializedDocument } from "@lexical/file";
import type { SerializedEditorState } from "lexical";

// Plugin to load previous editor state from a promise or session storage
export default function LoadPreviousStatePlugin(
  {
    lessonId,
    editorStatePromise,
    isEditMode,
  }: {
    lessonId: string | number,
    editorStatePromise: Promise<lessonObject>,
    isEditMode: boolean,
  }): JSX.Element | null{
  const [editor] = useLexicalComposerContext();
  const editorData = use(editorStatePromise);

  useEffect(() => {
    // Check if data exists in session storage
    const autoSavedData = getAutoSavedData(lessonId);
    if (autoSavedData && isEditMode) {
      const MAX_AUTO_SAVED_TIME = 1000 * 60 * 60; 
      const currentTime = new Date().getTime();
      const data = JSON.parse(autoSavedData) as SerializedDocument;

      if (typeof data.lastSaved === 'number' && currentTime - data.lastSaved < MAX_AUTO_SAVED_TIME) {
        if (import.meta.env.DEV) {
          console.info('[Lessons:LoadPreviousStatePlugin] using autosave', {
            lessonId,
            lastSaved: data.lastSaved,
          });
        }
        try {
          const parsedState = editorStateFromSerializedDocument(editor, data);

          editor.update(() => {
            editor.setEditorState(parsedState);
          });
          return;
        } catch (error) {
          console.error('Error loading auto-saved editor state:', error);
        }
      }
    }

    // Fetch data from the provided promise
    if (import.meta.env.DEV) {
      console.info('[Lessons:LoadPreviousStatePlugin] server payload', {
        lessonId,
        hasContent: Boolean(editorData?.content),
        contentLength: typeof editorData?.content === 'string' ? editorData.content.length : null,
        contentType: typeof editorData?.content,
        contentKeys: editorData?.content && typeof editorData.content === 'object'
          ? Object.keys(editorData.content as Record<string, unknown>)
          : null,
      });
    }
    if (!editorData.content) return;
    try {
      const serverContent = editorData.content as unknown;
      const parsedState = isSerializedDocument(serverContent)
        ? editorStateFromSerializedDocument(editor, serverContent)
        : editor.parseEditorState(serverContent as SerializedEditorState | string);

      editor.update(() => {
        editor.setEditorState(parsedState);
      });
    } catch (error) {
      console.error('Error loading editor state:', error);
    }
  }, [editorData, editor, lessonId]);

  return null;
}

const getAutoSavedData = (lessonId: number | string): string | null => {
  return sessionStorage.getItem(`lesson-draft-${lessonId}`);
}

const isSerializedDocument = (value: unknown): value is SerializedDocument => {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'editorState' in value &&
    'lastSaved' in value
  );
};
