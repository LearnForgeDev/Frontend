

export interface CourseStateProps {
  kind: 'loading' | 'error' | 'empty';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
