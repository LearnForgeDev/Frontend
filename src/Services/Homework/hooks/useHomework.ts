import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApplicationStore } from '@/Assets/Hooks/useApplicationStore';
import { homeworkEndpoints } from '@/Endpoints/Homework/homework';
import type { HomeworkAccessInput, HomeworkDto, HomeworkMetadataInput, HomeworkQuestionInput } from '@/Endpoints/Homework/homework.type';
import { homeworkActions } from '@/Storage/Homework/homework.slice';
import { filesEndpoints } from '@/Endpoints/files/files.endpoints';
import { MAX_QUESTION_FILE_BYTES } from '../homework.const';
import { validateQuestion } from '../homework.validation';
import { useHomeworkScope } from './useHomeworkScope';

export function useHomework({ draft = false } = {}) {
  const context = useHomeworkScope();
  const { homeworkPublicId = '' } = useParams<{ homeworkPublicId: string }>();
  const { schoolPublicId, dispatch, scope, state, run } = context;
  const [busy, setBusy] = useState(false);
  const store = useApplicationStore();
  const pending = useRef(false);
  const refresh = useCallback(async () => {
    if (!schoolPublicId || store.getState().homework.scopes[scope]?.status === 'loading') {
      return;
    }
    dispatch(homeworkActions.scopeStarted(scope));
    dispatch(homeworkActions.listRequested(scope));
    await run(async () => {
      const homeworks = await homeworkEndpoints.list(schoolPublicId);
      dispatch(homeworkActions.listReceived({ scope, homeworks }));
    });
  }, [schoolPublicId, dispatch, scope, run, store]);
  const load = useCallback(async () => {
    if (!schoolPublicId || !homeworkPublicId) {
      return null;
    }
    return run(async () => {
      const definition = await homeworkEndpoints.get(schoolPublicId, homeworkPublicId, draft);
      dispatch(homeworkActions.definitionReceived({ scope, definition, draft }));
      return definition;
    });
  }, [schoolPublicId, homeworkPublicId, draft, run, dispatch, scope]);
  useEffect(() => {
    void refresh();
    const update = () => {
      void refresh();
    };
    window.addEventListener('focus', update);
    window.addEventListener('online', update);
    return () => {
      window.removeEventListener('focus', update);
      window.removeEventListener('online', update);
    };
  }, [refresh]);
  useEffect(() => {
    void load();
  }, [load]);
  const mutate = async <T,>(operation: () => Promise<T>) => {
    if (pending.current) {
      return null;
    }
    pending.current = true;
    setBusy(true);
    const result = await run(operation);
    if (result !== null) {
      await Promise.all([refresh(), load()]);
    }
    setBusy(false);
    pending.current = false;
    return result;
  };
  const metadata = (input: HomeworkMetadataInput) => mutate(() => homeworkEndpoints.update(schoolPublicId, homeworkPublicId, input));
  const access = (input: HomeworkAccessInput) => mutate(() => homeworkEndpoints.access(schoolPublicId, homeworkPublicId, input));
  const saveQuestion = (id: number | null, input: HomeworkQuestionInput) => mutate(async () => {
    const error = validateQuestion(input);
    if (error) {
      throw new Error(error);
    }
    return homeworkEndpoints.saveQuestion(schoolPublicId, homeworkPublicId, id, input);
  });
  const uploadQuestionImage = (questionId: number, file: File, position: number) => mutate(async () => {
    if (!file.type.startsWith('image/') || !file.size || file.size > MAX_QUESTION_FILE_BYTES) {
      throw new Error('Выберите изображение до 10 МБ.');
    }
    const uploaded = await filesEndpoints.uploadFileDirectPipeline(schoolPublicId, file, file.name, 'homework');
    await homeworkEndpoints.attachQuestionFile(schoolPublicId, homeworkPublicId, questionId, uploaded.publicId, position, file.name);
    return true;
  });
  const applyDefinition = (definition: HomeworkDto) => dispatch(homeworkActions.definitionReceived({ scope, definition, draft }));
  return {
    ...context,
    homeworks: state.homeworks,
    status: state.status,
    error: state.error,
    definition: state.definitions[`${homeworkPublicId}:${draft ? 'draft' : 'active'}`],
    busy,
    refresh,
    load,
    metadata,
    access,
    saveQuestion,
    uploadQuestionImage,
    create: (input: HomeworkMetadataInput & HomeworkAccessInput) => mutate(() => homeworkEndpoints.create(schoolPublicId, input)),
    remove: (id: string) => mutate(async () => {
      await homeworkEndpoints.remove(schoolPublicId, id);
      return true;
    }),
    beginDraft: () => mutate(async () => {
      const result = await homeworkEndpoints.draft(schoolPublicId, homeworkPublicId);
      applyDefinition(result);
      return result;
    }),
    publish: () => mutate(() => homeworkEndpoints.publish(schoolPublicId, homeworkPublicId)),
    cancelQueue: () => mutate(() => homeworkEndpoints.cancelQueue(schoolPublicId, homeworkPublicId)),
    removeQuestion: (id: number) => mutate(async () => {
      await homeworkEndpoints.removeQuestion(schoolPublicId, homeworkPublicId, id);
      return true;
    }),
    reorder: (ids: number[]) => mutate(() => homeworkEndpoints.order(schoolPublicId, homeworkPublicId, ids)),
    removeQuestionImage: (questionId: number, id: string) => mutate(async () => {
      await homeworkEndpoints.removeQuestionFile(schoolPublicId, homeworkPublicId, questionId, id);
      return true;
    }),
    forceFinish: (id: string) => mutate(() => homeworkEndpoints.forceFinish(schoolPublicId, id)),
  };
}
