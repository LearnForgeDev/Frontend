import type { HomeworkAnswer, HomeworkAnswerInput, HomeworkQuestion } from '@/Endpoints/Homework/homework.type';

export interface HomeworkStudentAnswerProps {
  question: HomeworkQuestion;
  answer?: HomeworkAnswer;
  draft?: HomeworkAnswerInput;
  schoolPublicId: string;
  homeworkPublicId: string;
  attemptPublicId: string;
  disabled: boolean;
  busy: boolean;
  onChange: (answer: HomeworkAnswerInput) => void;
  onUpload: (file: File) => void;
  onRemoveFile: (fileId: string) => void;
}
