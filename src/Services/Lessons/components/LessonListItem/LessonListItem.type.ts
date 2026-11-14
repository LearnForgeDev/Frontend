import type { MouseEvent } from 'react';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.type';

export interface LessonListItemProps {
  lesson: Lesson;
  selected: boolean;
  onClick: (e: MouseEvent) => void;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}
