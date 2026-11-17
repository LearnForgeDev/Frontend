import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HomeworkAnswerInput, HomeworkAttemptDto, HomeworkDto, HomeworkQuestionInput, HomeworkReviewInput } from '@/Endpoints/Homework/homework.type';
import type { HomeworkScopeState, HomeworkState } from './homework.type';

export const emptyHomeworkScope: HomeworkScopeState = { homeworks: [], definitions: {}, attempts: {}, histories: {}, answerDrafts: {}, questionDrafts: {}, reviewDrafts: {}, audience: null, status: 'idle', error: null };
const initialState: HomeworkState = { scopes: {} };

function applyAttempt(scope: HomeworkScopeState, attempt: HomeworkAttemptDto) {
  const current = scope.attempts[attempt.publicId];
  if (current && Date.parse(current.serverTimeUtc) > Date.parse(attempt.serverTimeUtc)) {
    return;
  }
  scope.attempts[attempt.publicId] = attempt;
}

const homeworkSlice = createSlice({
  name: 'homework',
  initialState,
  reducers: {
    scopeStarted(state, { payload }: PayloadAction<string>) {
      state.scopes[payload] ??= { ...emptyHomeworkScope };
    },
    listReceived(state, { payload }: PayloadAction<{ scope: string; homeworks: HomeworkDto[] }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        scope.homeworks = payload.homeworks;
        scope.status = 'ready';
        scope.error = null;
      }
    },
    listRequested(state, { payload }: PayloadAction<string>) {
      const scope = state.scopes[payload];
      if (scope) {
        scope.status = 'loading';
      }
    },
    audienceReceived(state, { payload }: PayloadAction<{ scope: string; audience: NonNullable<HomeworkScopeState['audience']> }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        scope.audience = payload.audience;
      }
    },
    definitionReceived(state, { payload }: PayloadAction<{ scope: string; definition: HomeworkDto; draft?: boolean }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        scope.definitions[`${payload.definition.publicId}:${payload.draft ? 'draft' : 'active'}`] = payload.definition;
      }
    },
    attemptReceived(state, { payload }: PayloadAction<{ scope: string; attempt: HomeworkAttemptDto }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        applyAttempt(scope, payload.attempt);
      }
    },
    historyReceived(state, { payload }: PayloadAction<{ scope: string; id: string; attempts: HomeworkAttemptDto[]; mine: boolean }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        scope.histories[`${payload.id}:${payload.mine}`] = payload.attempts.map(attempt => attempt.publicId);
        for (const attempt of payload.attempts) {
          applyAttempt(scope, attempt);
        }
      }
    },
    answerDraftChanged(state, { payload }: PayloadAction<{ scope: string; key: string; answer: HomeworkAnswerInput | null }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        if (payload.answer) {
          scope.answerDrafts[payload.key] = payload.answer;
        } else {
          delete scope.answerDrafts[payload.key];
        }
      }
    },
    answerDraftSaved(state, { payload }: PayloadAction<{ scope: string; key: string; answer: HomeworkAnswerInput; revision: number }>) {
      const scope = state.scopes[payload.scope];
      if (scope && JSON.stringify(scope.answerDrafts[payload.key]) === JSON.stringify(payload.answer)) {
        delete scope.answerDrafts[payload.key];
      } else if (scope?.answerDrafts[payload.key]?.revision === payload.answer.revision) {
        scope.answerDrafts[payload.key].revision = payload.revision;
      }
    },
    questionDraftChanged(state, { payload }: PayloadAction<{ scope: string; key: string; question: HomeworkQuestionInput | null }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        if (payload.question) {
          scope.questionDrafts[payload.key] = payload.question;
        } else {
          delete scope.questionDrafts[payload.key];
        }
      }
    },
    reviewDraftChanged(state, { payload }: PayloadAction<{ scope: string; key: string; review: HomeworkReviewInput | null }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        if (payload.review) {
          scope.reviewDrafts[payload.key] = payload.review;
        } else {
          delete scope.reviewDrafts[payload.key];
        }
      }
    },
    requestFailed(state, { payload }: PayloadAction<{ scope: string; error: string }>) {
      const scope = state.scopes[payload.scope];
      if (scope) {
        scope.error = payload.error;
        scope.status = 'error';
      }
    },
    errorCleared(state, { payload }: PayloadAction<string>) {
      const scope = state.scopes[payload];
      if (scope) {
        scope.error = null;
      }
    },
  },
});

export const homeworkActions = homeworkSlice.actions;
export default homeworkSlice.reducer;
