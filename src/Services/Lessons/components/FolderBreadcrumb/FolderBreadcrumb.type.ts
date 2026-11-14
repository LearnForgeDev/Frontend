import type { LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.type';

export interface FolderBreadcrumbProps {
  folders: LessonFolder[];
  currentFolderId: string | null;
  onNavigate: (id: string | null) => void;
}
