import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { homeworkEndpoints } from '@/Endpoints/Homework/homework';
import { homeworkActions } from '@/Storage/Homework/homework.slice';
import { useHomeworkScope } from './useHomeworkScope';

export function useHomeworkAttempts(mine = false) {
  const context = useHomeworkScope();
  const { homeworkPublicId = '' } = useParams<{ homeworkPublicId: string }>();
  const { schoolPublicId, dispatch, scope, state, run } = context;
  const [busy, setBusy] = useState(false);
  const key = useRef<string | null>(null);
  const refresh = useCallback(() => run(async () => {
    const attempts = await homeworkEndpoints.attempts(schoolPublicId, homeworkPublicId, mine);
    dispatch(homeworkActions.historyReceived({ scope, id: homeworkPublicId, attempts, mine }));
    return attempts;
  }), [run, dispatch, schoolPublicId, homeworkPublicId, scope, mine]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const start = async () => {
    if (busy) {
      return null;
    }
    setBusy(true);
    key.current ??= crypto.randomUUID();
    const result = await run(async () => {
      const attempt = await homeworkEndpoints.start(schoolPublicId, homeworkPublicId, key.current ?? crypto.randomUUID());
      dispatch(homeworkActions.attemptReceived({ scope, attempt }));
      return attempt;
    });
    setBusy(false);
    if (result) {
      key.current = null;
      await refresh();
    }
    return result;
  };
  const ids = state.histories[`${homeworkPublicId}:${mine}`];
  return { ...context, attempts: (ids ?? []).flatMap(id => state.attempts[id] ? [state.attempts[id]] : []), isLoaded: Boolean(ids), busy, refresh, start };
}
