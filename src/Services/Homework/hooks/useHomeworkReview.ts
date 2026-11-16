import { useMemo, useRef, useState } from 'react';
import { useApplicationStore } from '@/Assets/Hooks/useApplicationStore';
import { homeworkEndpoints } from '@/Endpoints/Homework/homework';
import type { HomeworkAttemptDto, HomeworkReviewInput } from '@/Endpoints/Homework/homework.type';
import { homeworkActions } from '@/Storage/Homework/homework.slice';
import { validateReview } from '../homework.validation';
import { useHomeworkScope } from './useHomeworkScope';

export function useHomeworkReview(attempt: HomeworkAttemptDto | undefined) {
  const { state, run, dispatch, scope, schoolPublicId } = useHomeworkScope();
  const store = useApplicationStore();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const key = `${attempt?.publicId}:${attempt?.version}:${attempt?.submissionNumber}`;
  const initial = useMemo<HomeworkReviewInput>(() => attempt?.reviewDraft ?? {
    submissionNumber: attempt?.submissionNumber ?? 0,
    revision: 0,
    returnForRevision: false,
    reviewComment: attempt?.reviewComment ?? null,
    answers: attempt?.homework.questions.map(question => {
      const answer = attempt.answers.find(item => item.questionId === question.id);
      return { questionId: question.id, score: answer?.score ?? null, teacherComment: answer?.teacherComment ?? null, annotations: answer?.annotations ?? [] };
    }) ?? [],
  }, [attempt]);
  const review = state.reviewDrafts[key] ?? initial;
  const change = (value: HomeworkReviewInput) => dispatch(homeworkActions.reviewDraftChanged({ scope, key, review: value }));
  const save = async (finish = false) => {
    if (!attempt || pending.current) {
      return null;
    }
    pending.current = true;
    setBusy(true);
    const current = store.getState().homework.scopes[scope]?.reviewDrafts[key] ?? initial;
    const result = await run(async () => {
      const error = validateReview(current, attempt.homework.questions, finish);
      if (error) {
        throw new Error(error);
      }
      const saved = await homeworkEndpoints.review(schoolPublicId, attempt.publicId, current, finish);
      dispatch(homeworkActions.attemptReceived({ scope, attempt: saved }));
      const newer = store.getState().homework.scopes[scope]?.reviewDrafts[key];
      const next = newer && JSON.stringify(newer) !== JSON.stringify(current)
        ? { ...newer, revision: saved.reviewDraft?.revision ?? newer.revision } : null;
      dispatch(homeworkActions.reviewDraftChanged({ scope, key, review: finish ? null : next }));
      return saved;
    });
    setBusy(false);
    pending.current = false;
    return result;
  };
  return { review, change, busy, save, error: state.error, hasChanges: Boolean(state.reviewDrafts[key]), discard: () => dispatch(homeworkActions.reviewDraftChanged({ scope, key, review: null })) };
}
