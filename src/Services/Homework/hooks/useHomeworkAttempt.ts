import { useCallback, useEffect, useRef, useState } from 'react';
import { useApplicationStore } from '@/Assets/Hooks/useApplicationStore';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { homeworkEndpoints } from '@/Endpoints/Homework/homework';
import type { HomeworkAnswerInput, HomeworkAttemptDto } from '@/Endpoints/Homework/homework.type';
import { filesEndpoints } from '@/Endpoints/files/files.endpoints';
import { calculateContentMd5Base64 } from '@/Endpoints/files/md5.utils';
import { homeworkActions } from '@/Storage/Homework/homework.slice';
import { HEARTBEAT_MS, MAX_ANSWER_FILE_BYTES } from '../homework.const';
import { answerDraftKey, listAnswerDrafts, persistAnswerDraft, readAnswerDraft, sameAnswerDraft } from '../homework.drafts';
import { isAttemptEditable, remainingSeconds } from '../homework.validation';
import { advanceHomeworkClock, sampleHomeworkClock } from '../homework.clock';
import type { HomeworkClockSample } from '../homework.type';
import { useHomeworkScope } from './useHomeworkScope';
import { useHomeworkRealtime } from './useHomeworkRealtime';

export function useHomeworkAttempt() {
  const context = useHomeworkScope();
  const { attemptPublicId = '' } = useParams<{ attemptPublicId: string }>();
  const { schoolPublicId, userPublicId, scope, state, dispatch, run } = context;
  const attempt = state.attempts[attemptPublicId];
  const store = useApplicationStore();
  const [tabId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submissionPending = useRef(false);
  const pending = useRef(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [hasOtherDrafts, setHasOtherDrafts] = useState(false);
  const [conflicted, setConflicted] = useState<number[]>([]);
  const [clock, setClock] = useState(() => ({ now: Date.now(), offset: 0 }));
  const clockAnchor = useRef<HomeworkClockSample | null>(null);
  const { offset } = clock;
  const queue = useRef(Promise.resolve(true));
  const restoredScope = useRef('');
  const ownAttempt = attempt?.student.publicId === userPublicId;
  const editable = Boolean(attempt && ownAttempt && isAttemptEditable(attempt, clock.now + offset));
  const prefix = `${attemptPublicId}:${attempt?.version ?? 0}:`;
  const currentServerTime = useCallback(() => {
    const sample = clockAnchor.current;
    return sample ? advanceHomeworkClock(sample, performance.now()) : Date.now();
  }, []);
  const updateClock = useCallback(() => {
    const now = Date.now();
    setClock({ now, offset: currentServerTime() - now });
  }, [currentServerTime]);
  const receive = useCallback((value: HomeworkAttemptDto) => {
    const current = store.getState().homework.scopes[scope]?.attempts[value.publicId];
    if (current && Date.parse(current.serverTimeUtc) > Date.parse(value.serverTimeUtc)) {
      return current;
    }
    const now = Date.now();
    const receivedAt = performance.now();
    const sample = sampleHomeworkClock(clockAnchor.current, value.serverTimeUtc, receivedAt);
    clockAnchor.current = sample;
    setClock({ now, offset: sample.serverTime - now });
    dispatch(homeworkActions.attemptReceived({ scope, attempt: value }));
    return value;
  }, [dispatch, scope, store]);
  const refresh = useCallback(() => run(async () => receive(await homeworkEndpoints.getAttempt(schoolPublicId, attemptPublicId)), false), [run, receive, schoolPublicId, attemptPublicId]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useHomeworkRealtime(schoolPublicId, attempt?.homeworkPublicId ?? '', refresh);
  useEffect(() => {
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, [updateClock]);
  useEffect(() => {
    if (!attempt?.forceSubmitAtUtc || !ownAttempt || (attempt.status !== 0 && attempt.status !== 4)) {
      return;
    }
    const remaining = Date.parse(attempt.forceSubmitAtUtc) - currentServerTime();
    if (remaining <= 0) {
      return;
    }
    const timer = window.setTimeout(updateClock, remaining);
    return () => window.clearTimeout(timer);
  }, [attempt?.forceSubmitAtUtc, attempt?.status, ownAttempt, offset, currentServerTime, updateClock]);
  useEffect(() => {
    if (!attempt || !ownAttempt) {
      return;
    }
    const restoreKey = `${scope}:${attempt.publicId}:${attempt.version}`;
    if (restoredScope.current === restoreKey) {
      return;
    }
    restoredScope.current = restoreKey;
    for (const question of attempt.homework.questions) {
      const key = `${attempt.publicId}:${attempt.version}:${question.id}`;
      const snapshots = listAnswerDrafts(answerDraftKey(scope, attempt.publicId, attempt.version, question.id));
      const restored = snapshots[0]?.answer;
      if (restored && !store.getState().homework.scopes[scope]?.answerDrafts[key]) {
        dispatch(homeworkActions.answerDraftChanged({ scope, key, answer: restored }));
      }
      if (snapshots.some(snapshot => !sameAnswerDraft(snapshot.answer, restored))) {
        window.setTimeout(() => setHasOtherDrafts(true), 0);
      }
    }
  }, [attemptPublicId, attempt, ownAttempt, scope, dispatch, store]);
  useEffect(() => {
    if (!editable) {
      return;
    }
    const heartbeat = () => {
      if (navigator.onLine) {
        void run(async () => receive(await homeworkEndpoints.presence(schoolPublicId, attemptPublicId, tabId)), false);
      }
    };
    heartbeat();
    const timer = window.setInterval(heartbeat, HEARTBEAT_MS);
    window.addEventListener('online', heartbeat);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', heartbeat);
      void homeworkEndpoints.leave(schoolPublicId, attemptPublicId, tabId).catch(() => undefined);
    };
  }, [editable, schoolPublicId, attemptPublicId, tabId, receive, run]);
  const recordAnswer = (answer: HomeworkAnswerInput) => {
    const currentAttempt = store.getState().homework.scopes[scope]?.attempts[attemptPublicId];
    if (!currentAttempt || currentAttempt.student.publicId !== userPublicId || submissionPending.current || !isAttemptEditable(currentAttempt, currentServerTime())) {
      return;
    }
    const key = `${prefix}${answer.questionId}`;
    const current = store.getState().homework.scopes[scope]?.answerDrafts[key];
    const server = currentAttempt.answers.find(item => item.questionId === answer.questionId);
    const draft = { questionId: answer.questionId, textValue: answer.textValue ?? null, richText: answer.richText ?? null, selectedOptionIds: answer.selectedOptionIds ?? [], revision: current?.revision ?? server?.revision ?? 0 };
    dispatch(homeworkActions.answerDraftChanged({ scope, key, answer: draft }));
    setStorageFailed(!persistAnswerDraft(`${answerDraftKey(scope, attemptPublicId, currentAttempt.version, answer.questionId)}:${tabId}`, draft));
  };
  const savePending = useCallback(async () => {
    const currentState = store.getState().homework.scopes[scope];
    const currentAttempt = currentState?.attempts[attemptPublicId];
    if (!currentAttempt || !isAttemptEditable(currentAttempt, currentServerTime())) {
      return false;
    }
    const drafts = Object.entries(currentState?.answerDrafts ?? {}).filter(([key]) => key.startsWith(`${attemptPublicId}:${currentAttempt.version}:`));
    for (const [key, answer] of drafts) {
      if (conflicted.includes(answer.questionId)) {
        return false;
      }
      const saved = await run(async () => {
        try {
          return receive(await homeworkEndpoints.saveAnswer(schoolPublicId, attemptPublicId, { ...answer, tabId }));
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 409) {
            setConflicted(previous => [...new Set([...previous, answer.questionId])]);
          }
          throw error;
        }
      });
      if (!saved) {
        return false;
      }
      const revision = saved.answers.find(item => item.questionId === answer.questionId)?.revision ?? (answer.revision ?? 0) + 1;
      dispatch(homeworkActions.answerDraftSaved({ scope, key, answer, revision }));
      const storageBase = answerDraftKey(scope, attemptPublicId, currentAttempt.version, answer.questionId);
      for (const snapshot of listAnswerDrafts(storageBase)) {
        if (sameAnswerDraft(snapshot.answer, answer)) {
          persistAnswerDraft(snapshot.key, null);
        } else if (snapshot.key === `${storageBase}:${tabId}`) {
          const newer = readAnswerDraft(snapshot.key);
          if (newer && newer.revision === answer.revision) {
            persistAnswerDraft(snapshot.key, { ...newer, revision });
          }
        }
      }
    }
    return true;
  }, [attemptPublicId, schoolPublicId, scope, tabId, dispatch, receive, run, currentServerTime, conflicted, store]);
  const save = useCallback(() => {
    queue.current = queue.current.then(savePending, savePending);
    return queue.current;
  }, [savePending]);
  const dirty = Object.keys(state.answerDrafts).some(key => key.startsWith(prefix));
  useEffect(() => {
    if (!editable || !dirty || conflicted.length) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (navigator.onLine) {
        void save();
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [editable, dirty, state.answerDrafts, conflicted.length, save]);
  useEffect(() => {
    const resume = () => {
      void save();
    };
    window.addEventListener('online', resume);
    return () => window.removeEventListener('online', resume);
  }, [save]);
  const seconds = remainingSeconds(attempt?.status === 0 || attempt?.status === 4 ? attempt.forceSubmitAtUtc : null, offset, clock.now);
  useEffect(() => {
    if (seconds === 0 && ownAttempt && (attempt?.status === 0 || attempt?.status === 4)) {
      void refresh();
    }
  }, [seconds, ownAttempt, attempt?.status, refresh]);
  const submit = async () => {
    if (pending.current) {
      return null;
    }
    pending.current = true;
    submissionPending.current = true;
    setSubmitting(true);
    setBusy(true);
    const submissionNumber = store.getState().homework.scopes[scope]?.attempts[attemptPublicId]?.submissionNumber ?? 0;
    const result = await save() ? await run(async () => receive(await homeworkEndpoints.submit(schoolPublicId, attemptPublicId, submissionNumber))) : null;
    setBusy(false);
    setSubmitting(false);
    submissionPending.current = false;
    pending.current = false;
    return result;
  };
  const upload = async (questionId: number, file: File) => {
    if (!editable || pending.current) {
      return;
    }
    pending.current = true;
    setBusy(true);
    await run(async () => {
      if (!file.size || file.size > MAX_ANSWER_FILE_BYTES) {
        throw new Error('Файл должен быть не больше 20 МБ.');
      }
      const contentMd5 = await calculateContentMd5Base64(file);
      const presign = await homeworkEndpoints.presign(schoolPublicId, attemptPublicId, questionId, file.name, contentMd5);
      await filesEndpoints.uploadFileDirect(presign.uploadUrl, file, file.type, contentMd5);
      receive(await homeworkEndpoints.completeUpload(schoolPublicId, attemptPublicId, { questionId, fileName: file.name, storageKey: presign.storageKey, mimeType: file.type || 'application/octet-stream', sizeBytes: file.size, tabId }));
    });
    setBusy(false);
    pending.current = false;
  };
  const discardConflict = (questionId: number) => {
    if (attempt) {
      const current = store.getState().homework.scopes[scope]?.answerDrafts[`${prefix}${questionId}`];
      dispatch(homeworkActions.answerDraftChanged({ scope, key: `${prefix}${questionId}`, answer: null }));
      const base = answerDraftKey(scope, attemptPublicId, attempt.version, questionId);
      for (const snapshot of listAnswerDrafts(base)) {
        if (snapshot.key === `${base}:${tabId}` || sameAnswerDraft(snapshot.answer, current)) {
          persistAnswerDraft(snapshot.key, null);
        }
      }
      setConflicted(previous => previous.filter(id => id !== questionId));
      void refresh();
    }
  };
  const downloadDrafts = () => {
    if (!attempt) {
      return;
    }
    const text = attempt.homework.questions.flatMap(question => listAnswerDrafts(answerDraftKey(scope, attemptPublicId, attempt.version, question.id)).map(snapshot => `${question.position + 1}. ${question.text}\n${new Date(snapshot.updatedAt).toLocaleString('ru-RU')}\n${snapshot.answer.textValue ?? ''}\n${question.options.filter(option => snapshot.answer.selectedOptionIds?.includes(option.id)).map(option => option.text).join('\n')}`)).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attempt.homework.title}-черновики.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return { ...context, attempt, attemptPublicId, editable, busy, submitting, dirty, seconds, storageFailed, hasOtherDrafts, downloadDrafts, conflicted, refresh, recordAnswer, save, submit, upload, discardConflict,
    answerDraft: (questionId: number) => state.answerDrafts[`${prefix}${questionId}`],
    removeFile: (questionId: number, fileId: string) => {
      if (!editable || pending.current) {
        return Promise.resolve(null);
      }
      return run(async () => {
        await homeworkEndpoints.removeAnswerFile(schoolPublicId, attemptPublicId, questionId, fileId);
        await refresh();
      });
    },
  };
}
