import type { HomeworkAnswerInput } from '@/Endpoints/Homework/homework.type';

export interface HomeworkAudienceOption {
  publicId: string;
  name: string;
}
export interface HomeworkFileSource {
  schoolPublicId: string;
  homeworkPublicId: string;
  attemptPublicId?: string;
  questionId: number;
  filePublicId: string;
  isImage: boolean;
}
export interface StoredAnswerDraft {
  key: string;
  updatedAt: number;
  answer: HomeworkAnswerInput;
}
export interface HomeworkClockSample {
  serverTime: number;
  receivedAt: number;
}
