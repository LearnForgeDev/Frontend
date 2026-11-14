import type { LessonFolder } from '../FileManager/FileManager.type';

export interface FileManagerToolbarProps {
  folders: LessonFolder[];
  onNewFolder: () => void;
  onNewLesson: () => void;
}
