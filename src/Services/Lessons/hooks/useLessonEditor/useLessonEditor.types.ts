import type { SerializedDocument } from '@lexical/file';

export interface UseLessonEditorProps {
  lessonId: string | number;
}

export interface UseLessonEditorReturn {
  editorState: SerializedDocument | undefined;
  isLoading: boolean;
  isError: boolean;
  saveEditorState: (serializedState: SerializedDocument) => Promise<void>;
  isSaving: boolean;
}
