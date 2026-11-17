import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useUser } from '@/Services/Auth/hooks/useUser';
import { useApplicationDispatch, useApplicationSelector } from '@/Assets/Hooks/useApplicationStore';
import { emptyHomeworkScope, homeworkActions } from '@/Storage/Homework/homework.slice';

export function useHomeworkScope() {
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  const { user } = useUser();
  const userPublicId = user?.userPublicId ?? '';
  const scope = `${userPublicId}:${schoolPublicId}`;
  const dispatch = useApplicationDispatch();
  const state = useApplicationSelector(application => application.homework.scopes[scope] ?? emptyHomeworkScope);
  useEffect(() => {
    dispatch(homeworkActions.scopeStarted(scope));
  }, [dispatch, scope]);
  const run = useCallback(async <T,>(operation: () => Promise<T>, clearError = true): Promise<T | null> => {
    dispatch(homeworkActions.scopeStarted(scope));
    if (clearError) {
      dispatch(homeworkActions.errorCleared(scope));
    }
    try {
      return await operation();
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : null;
      const messages: Record<number, string> = {
        400: 'Проверьте заполненные поля и допустимые форматы файлов.',
        401: 'Сессия завершилась. Войдите в аккаунт снова.',
        403: 'У вас нет доступа к этому заданию или действию.',
        404: 'Задание или работа недоступны. Обновите страницу.',
        409: 'Данные изменились или действие сейчас недоступно. Сохраните нужный текст и обновите работу.',
      };
      const message = status && messages[status] ? messages[status] : error instanceof Error && /[А-Яа-яЁё]/.test(error.message)
        ? error.message : 'Не удалось выполнить действие. Повторите попытку.';
      dispatch(homeworkActions.requestFailed({ scope, error: message }));
      return null;
    }
  }, [dispatch, scope]);
  return { schoolPublicId, userPublicId, scope, dispatch, state, run };
}
