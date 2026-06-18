import type { lessonObject } from '@/Services/Lessons/lessonTypes';

export interface TextEditorProps {
  isEditMode: boolean;
  id: number | string;
  editorStatePromise?: Promise<lessonObject | undefined | null>;
}
