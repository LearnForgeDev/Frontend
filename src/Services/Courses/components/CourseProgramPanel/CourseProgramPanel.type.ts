import type { CourseProgramItem } from '../../Courses.type';

export interface CourseProgramPanelProps {
  items: CourseProgramItem[];
  focusItemPublicId?: string;
  canManage: boolean;
  isSavingProgress: boolean;
  openingItemPublicId: string | null;
  onOpen: (item: CourseProgramItem) => void;
  onToggleCompleted: (item: CourseProgramItem) => void;
  onEdit: () => void;
}
