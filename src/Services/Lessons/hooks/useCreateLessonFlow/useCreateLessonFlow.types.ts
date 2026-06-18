export interface UseCreateLessonFlowReturn {
  handleCreateLesson: (title?: string, description?: string) => Promise<void>;
  isCreating: boolean;
}
