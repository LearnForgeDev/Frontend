import type { Lesson } from '../FileManager/FileManager.type';

export interface RenameLessonDialogProps {
  schoolPublicId: string;
  lesson: Lesson;
  onClose: () => void;
}
