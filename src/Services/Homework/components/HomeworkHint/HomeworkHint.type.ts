export interface HomeworkHintProps {
  studentHint: string | null;
  teacherHint?: string | null;
  editing?: boolean;
  teacher?: boolean;
  disabled?: boolean;
  onChange?: (studentHint: string, teacherHint: string) => void;
}
