import type { RichTextDocument } from '@/Assets/Components/RichTextEditor/RichTextEditor.type';
import type { ImageAnnotation } from '@/Assets/Components/ImageAnnotations/ImageAnnotations.type';

export type HomeworkQuestionType = 0 | 1 | 2 | 3 | 4;
export type HomeworkAttemptStatus = 0 | 1 | 2 | 3 | 4;
export interface HomeworkFile {
  publicId: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string | null;
  position?: number;
  altText?: string | null;
}
export interface HomeworkOption {
  id: number;
  position: number;
  text: string;
  value: string | null;
  isCorrect?: boolean;
}
export interface HomeworkQuestion {
  id: number;
  position: number;
  text: string;
  richText: RichTextDocument | null;
  questionType: HomeworkQuestionType;
  isRequired: boolean;
  points: number;
  studentHint: string | null;
  teacherHint?: string | null;
  validationJson: string | null;
  options: HomeworkOption[];
  files: HomeworkFile[];
}
export interface HomeworkBlocker {
  attemptPublicId: string;
  studentPublicId: string;
  studentName: string;
  leaseExpiresAtUtc: string;
  forceSubmitAtUtc: string | null;
}
export interface HomeworkDto {
  id: number;
  publicId: string;
  title: string;
  description: string | null;
  authorId: number;
  passingScore: number;
  useTotalPassingScore: boolean;
  maxAttempts: number | null;
  deadlineUtc: string | null;
  createdAt: string;
  updatedAt: string;
  serverTimeUtc: string;
  version: number;
  activeVersion: number | null;
  draftVersion: number | null;
  queuedVersion: number | null;
  publicationState: 'Draft' | 'Published' | 'Queued';
  canManage: boolean;
  canEditDefinition: boolean;
  allowedUserIds: number[];
  allowedGroupIds: number[];
  allowedUserPublicIds: string[] | null;
  blockers: HomeworkBlocker[];
  questions: HomeworkQuestion[];
}
export interface HomeworkAnswer {
  questionId: number;
  revision: number;
  textValue: string | null;
  richText: RichTextDocument | null;
  selectedOptionIds: number[];
  score: number | null;
  isCorrect: boolean | null;
  teacherComment: string | null;
  files: HomeworkFile[];
  annotations: ImageAnnotation[];
}
export interface HomeworkSubmission {
  submissionNumber: number;
  submittedAt: string;
  checkedAt: string | null;
  status: HomeworkAttemptStatus;
  score: number | null;
  maxScore: number;
  passed: boolean | null;
  reviewComment: string | null;
  wasForced: boolean;
  answers: HomeworkAnswer[];
}
export interface HomeworkReviewAnswer {
  questionId: number;
  score: number | null;
  teacherComment: string | null;
  annotations: ImageAnnotation[];
}
export interface HomeworkReviewInput {
  submissionNumber: number;
  revision: number;
  returnForRevision: boolean;
  reviewComment: string | null;
  answers: HomeworkReviewAnswer[];
}
export interface HomeworkAttemptDto {
  publicId: string;
  homeworkPublicId: string;
  attemptNumber: number;
  status: HomeworkAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  passed: boolean | null;
  reviewComment: string | null;
  serverTimeUtc: string;
  version: number;
  submissionNumber: number;
  forceSubmitAtUtc: string | null;
  wasForced: boolean;
  student: { publicId: string; name: string; avatarUrl: string | null };
  homework: HomeworkDto;
  answers: HomeworkAnswer[];
  submissions: HomeworkSubmission[];
  reviewDraft?: HomeworkReviewInput | null;
}
export interface HomeworkMetadataInput {
  title: string;
  description: string | null;
  passingScore: number;
  useTotalPassingScore?: boolean;
  maxAttempts: number | null;
  deadlineUtc: string | null;
}
export interface HomeworkAccessInput {
  allowedUserPublicIds: string[];
  allowedGroupIds: number[];
}
export type HomeworkOptionInput = Omit<HomeworkOption, 'id' | 'isCorrect'> & { id?: number; isCorrect: boolean };
export type HomeworkQuestionInput = Omit<HomeworkQuestion, 'id' | 'files' | 'options'> & { options: HomeworkOptionInput[] };
export interface HomeworkAnswerInput {
  questionId: number;
  revision?: number;
  textValue?: string | null;
  richText?: RichTextDocument | null;
  selectedOptionIds?: number[];
  tabId?: string;
}
export interface HomeworkUploadInput {
  questionId: number;
  storageKey: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  tabId: string;
}
