import type { HomeworkAttemptDto, HomeworkDto, HomeworkQuestion } from '@/Endpoints/Homework/homework.type';

export const HOMEWORK_TEST_TIME = '2026-11-17T12:00:00.000Z';

export function homeworkQuestion(overrides: Partial<HomeworkQuestion> = {}): HomeworkQuestion {
  return { id: 11, position: 0, text: 'Объясните решение', richText: null, questionType: 3, isRequired: true, points: 1, studentHint: 'Проверьте вычисления', teacherHint: 'Обратите внимание на единицы', validationJson: null, options: [], files: [], ...overrides };
}

export function homeworkDefinition(overrides: Partial<HomeworkDto> = {}): HomeworkDto {
  return {
    id: 1, publicId: 'homework-1', title: 'Домашняя работа', description: 'Практика', authorId: 2,
    passingScore: 1, useTotalPassingScore: false, maxAttempts: null, deadlineUtc: null, createdAt: HOMEWORK_TEST_TIME, updatedAt: HOMEWORK_TEST_TIME,
    serverTimeUtc: HOMEWORK_TEST_TIME, version: 1, activeVersion: 1, draftVersion: null, queuedVersion: null,
    publicationState: 'Published', canManage: false, canEditDefinition: false,
    allowedUserIds: [], allowedGroupIds: [], allowedUserPublicIds: null, blockers: [], questions: [homeworkQuestion()], ...overrides,
  };
}

export function homeworkAttempt(overrides: Partial<HomeworkAttemptDto> = {}): HomeworkAttemptDto {
  return {
    publicId: 'attempt-1', homeworkPublicId: 'homework-1', attemptNumber: 1, status: 0,
    startedAt: HOMEWORK_TEST_TIME, submittedAt: null, score: null, maxScore: null, passed: null, reviewComment: null,
    serverTimeUtc: HOMEWORK_TEST_TIME, version: 1, submissionNumber: 0, forceSubmitAtUtc: null, wasForced: false,
    student: { publicId: 'student-1', name: 'Анна', avatarUrl: null }, homework: homeworkDefinition(), answers: [], submissions: [], ...overrides,
  };
}
