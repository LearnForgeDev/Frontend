export interface UseCreateLessonFlowReturn {
  handleCreateLesson: (folderId?: string | null, title?: string) => Promise<void>;
  isCreating: boolean;
}
