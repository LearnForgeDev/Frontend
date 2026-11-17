import { describe, expect, it } from 'vitest';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { homeworkActions } from './homework.slice';
import { homeworkAttempt, homeworkDefinition, homeworkQuestion } from '@/Services/Homework/homework.testUtils';
import type { HomeworkAttemptDto } from '@/Endpoints/Homework/homework.type';

describe('Homework domain ownership', () => {
  it('isolates scopes and applies confirmed lists, definitions, attempts and roster identities', () => {
    const store = createApplicationStore();
    store.dispatch(homeworkActions.scopeStarted('one'));
    store.dispatch(homeworkActions.scopeStarted('two'));
    store.dispatch(homeworkActions.listRequested('one'));
    expect(store.getState().homework.scopes.one.status).toBe('loading');
    store.dispatch(homeworkActions.listReceived({ scope: 'one', homeworks: [homeworkDefinition()] }));
    store.dispatch(homeworkActions.definitionReceived({ scope: 'one', definition: homeworkDefinition(), draft: true }));
    store.dispatch(homeworkActions.historyReceived({ scope: 'one', id: 'homework-1', mine: true, attempts: [homeworkAttempt()] }));
    expect(store.getState().homework.scopes.one.definitions['homework-1:draft'].version).toBe(1);
    expect(store.getState().homework.scopes.one.histories['homework-1:true']).toEqual(['attempt-1']);
    expect(store.getState().homework.scopes.two.homeworks).toEqual([]);
    store.dispatch(homeworkActions.definitionReceived({ scope: 'one', definition: homeworkDefinition() }));
    expect(store.getState().homework.scopes.one.definitions['homework-1:active']).toBeTruthy();
  });

  it('rejects old attempt responses and clears only the exact saved snapshot', () => {
    const store = createApplicationStore();
    store.dispatch(homeworkActions.scopeStarted('one'));
    store.dispatch(homeworkActions.attemptReceived({ scope: 'one', attempt: homeworkAttempt({ status: 1, serverTimeUtc: '2026-11-17T12:01:00Z' }) }));
    store.dispatch(homeworkActions.attemptReceived({ scope: 'one', attempt: homeworkAttempt() }));
    expect(store.getState().homework.scopes.one.attempts['attempt-1'].status).toBe(1);
    const answer = { questionId: 11, revision: 0, textValue: 'Первый' };
    store.dispatch(homeworkActions.answerDraftChanged({ scope: 'one', key: 'draft', answer }));
    store.dispatch(homeworkActions.answerDraftChanged({ scope: 'one', key: 'draft', answer: { ...answer, textValue: 'Новый' } }));
    store.dispatch(homeworkActions.answerDraftSaved({ scope: 'one', key: 'draft', answer, revision: 1 }));
    expect(store.getState().homework.scopes.one.answerDrafts.draft).toEqual({ ...answer, revision: 1, textValue: 'Новый' });
    store.dispatch(homeworkActions.answerDraftSaved({ scope: 'one', key: 'draft', answer: { ...answer, revision: 1, textValue: 'Новый' }, revision: 2 }));
    expect(store.getState().homework.scopes.one.answerDrafts.draft).toBeUndefined();
  });

  it('keeps a fresh pinned attempt and private review when an older roster response arrives later', () => {
    const store = createApplicationStore();
    store.dispatch(homeworkActions.scopeStarted('one'));
    const reviewDraft = { submissionNumber: 2, revision: 4, returnForRevision: false, reviewComment: 'Новая проверка', answers: [] };
    const fresh = homeworkAttempt({ version: 2, submissionNumber: 2, status: 2, reviewDraft,
      homework: homeworkDefinition({ version: 2, activeVersion: 3 }), serverTimeUtc: '2026-11-17T12:02:00Z' });
    store.dispatch(homeworkActions.attemptReceived({ scope: 'one', attempt: fresh }));
    const stale: HomeworkAttemptDto = { ...fresh, submissionNumber: 1, status: 1, reviewDraft: null, serverTimeUtc: '2026-11-17T12:01:00Z' };
    const other = homeworkAttempt({ publicId: 'attempt-2' });
    store.dispatch(homeworkActions.historyReceived({ scope: 'one', id: 'homework-1', mine: false, attempts: [stale, other] }));
    const scope = store.getState().homework.scopes.one;
    expect(scope.attempts['attempt-1']).toEqual(fresh);
    expect(scope.attempts['attempt-1'].homework.version).toBe(2);
    expect(scope.attempts['attempt-1'].reviewDraft?.revision).toBe(4);
    expect(scope.attempts['attempt-2']).toEqual(other);
    expect(scope.histories['homework-1:false']).toEqual(['attempt-1', 'attempt-2']);
    const checked: HomeworkAttemptDto = { ...fresh, status: 3, score: 0.5, reviewDraft: null, serverTimeUtc: '2026-11-17T12:03:00Z' };
    store.dispatch(homeworkActions.historyReceived({ scope: 'one', id: 'homework-1', mine: false, attempts: [checked] }));
    expect(store.getState().homework.scopes.one.attempts['attempt-1']).toEqual(checked);
    expect(store.getState().homework.scopes.one.attempts['attempt-1'].reviewDraft).toBeNull();
  });

  it('owns question/review drafts and errors without mutating another scope', () => {
    const store = createApplicationStore();
    store.dispatch(homeworkActions.scopeStarted('one'));
    const question = { ...homeworkQuestion(), options: [] };
    store.dispatch(homeworkActions.questionDraftChanged({ scope: 'one', key: 'question', question }));
    expect(store.getState().homework.scopes.one.questionDrafts.question.points).toBe(1);
    const review = { submissionNumber: 1, revision: 0, returnForRevision: false, reviewComment: 'Приватно', answers: [] };
    store.dispatch(homeworkActions.reviewDraftChanged({ scope: 'one', key: 'review', review }));
    expect(store.getState().homework.scopes.one.reviewDrafts.review.reviewComment).toBe('Приватно');
    store.dispatch(homeworkActions.requestFailed({ scope: 'one', error: 'Нет доступа' }));
    expect(store.getState().homework.scopes.one.error).toBe('Нет доступа');
    store.dispatch(homeworkActions.errorCleared('one'));
    store.dispatch(homeworkActions.questionDraftChanged({ scope: 'one', key: 'question', question: null }));
    store.dispatch(homeworkActions.reviewDraftChanged({ scope: 'one', key: 'review', review: null }));
    store.dispatch(homeworkActions.answerDraftChanged({ scope: 'one', key: 'draft', answer: null }));
    expect(store.getState().homework.scopes.one.error).toBeNull();
    expect(store.getState().homework.scopes.one.questionDrafts).toEqual({});
    expect(store.getState().homework.scopes.one.reviewDrafts).toEqual({});
    store.dispatch(homeworkActions.requestFailed({ scope: 'missing', error: 'Ignored' }));
    expect(store.getState().homework.scopes.missing).toBeUndefined();
  });
});
