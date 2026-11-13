

export interface LessonEditorStatusProps {
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  retry: () => unknown;
}
