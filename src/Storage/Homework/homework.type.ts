import type { HomeworkAnswerInput, HomeworkAttemptDto, HomeworkDto, HomeworkQuestionInput, HomeworkReviewInput } from '@/Endpoints/Homework/homework.type';

export interface HomeworkScopeState {
  homeworks: HomeworkDto[];
  definitions: Record<string, HomeworkDto>;
  attempts: Record<string, HomeworkAttemptDto>;
  histories: Record<string, string[]>;
  answerDrafts: Record<string, HomeworkAnswerInput>;
  questionDrafts: Record<string, HomeworkQuestionInput>;
  reviewDrafts: Record<string, HomeworkReviewInput>;
  audience: { students: { publicId: string; name: string }[]; groups: { id: number; name: string }[] } | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}
export interface HomeworkState {
  scopes: Record<string, HomeworkScopeState>;
}
