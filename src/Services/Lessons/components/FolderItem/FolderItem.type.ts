import type { MouseEvent } from 'react';
import type { LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.type';

export interface FolderItemProps {
  folder: LessonFolder;
  view: 'grid' | 'list';
  selected: boolean;
  onClick: (e: MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: MouseEvent) => void;
}
