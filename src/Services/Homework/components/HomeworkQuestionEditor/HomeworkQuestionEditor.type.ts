import type { HomeworkQuestion, HomeworkQuestionInput } from '@/Endpoints/Homework/homework.type';

export interface HomeworkQuestionEditorProps {
  homeworkId: string;
  version: number;
  question: HomeworkQuestion | null;
  position: number;
  busy: boolean;
  onSave: (question: HomeworkQuestionInput) => Promise<boolean>;
  onCancel: () => void;
}
