import type { SerializedDocument } from '@lexical/file';
import type { Lesson } from '../FileManager/FileManager.type';

export interface LessonEditorContainerProps {
  schoolPublicId: string;
  lesson: Lesson;
  document: SerializedDocument;
  isEditMode: boolean;
}
