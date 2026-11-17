import type { CourseProgramItem } from '../../Courses.type';

export interface CourseProgramPanelProps {
  items: CourseProgramItem[];
  focusItemPublicId?: string;
  canManage: boolean;
  openingItemPublicId: string | null;
  onOpen: (item: CourseProgramItem) => void;
  onEdit: () => void;
}
