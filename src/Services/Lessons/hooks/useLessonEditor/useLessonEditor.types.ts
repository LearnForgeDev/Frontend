import type { lessonObject } from '@/Services/Lessons/lessonTypes';

export interface UseLessonEditorProps {
  lessonId: string | number;
}

export interface UseLessonEditorReturn {
  editorState: lessonObject | undefined;
  isLoading: boolean;
  isError: boolean;
  saveEditorState: (serializedState: unknown) => Promise<void>;
  isSaving: boolean;
}
