import type { ReactNode } from 'react';
import type { HomeworkQuestion } from '@/Endpoints/Homework/homework.type';

export interface HomeworkQuestionViewProps {
  question: HomeworkQuestion;
  schoolPublicId: string;
  homeworkPublicId: string;
  teacher?: boolean;
  children?: ReactNode;
}
