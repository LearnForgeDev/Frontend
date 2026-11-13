import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { createUnauthenticatedError, getRequestErrorMessage, shouldRetryRequest } from './factory.utils';
import { HTTP_STATUS, REQUEST_ERROR_MESSAGES } from './factory.const';
import { getRefreshRetryDelay, normalizeRestoredSession } from '@/Endpoints/auth/utils';
import { REFRESH_RETRY_DELAY_MS } from '@/Endpoints/auth/auth.const';
import { getAuthErrorMessage } from '@/Services/Auth/contexts/AuthFlowContext.utils';
import { AUTH_ERROR_MESSAGES } from '@/Services/Auth/contexts/AuthFlowContext.const';

function networkError(method: string) {
  return new AxiosError('Network Error', 'ERR_NETWORK', { method, headers: new AxiosHeaders() });
}

describe('Обработка недоступного сервера', () => {
  it('не повторяет запрос изменения данных', () => {
    expect(shouldRetryRequest(0, networkError('post'), 1)).toBe(false);
    expect(shouldRetryRequest(0, networkError('put'), 1)).toBe(false);
    expect(shouldRetryRequest(0, networkError('delete'), 1)).toBe(false);
  });

  it('ограничивает повторы чтения', () => {
    expect(shouldRetryRequest(0, networkError('get'), 1)).toBe(true);
    expect(shouldRetryRequest(1, networkError('get'), 1)).toBe(false);
    expect(shouldRetryRequest(0, networkError('get'), 0)).toBe(false);
  });

  it('не повторяет отменённое чтение и использует задержку восстановления для обычной ошибки', () => {
    const error = networkError('get');
    error.code = 'ERR_CANCELED';
    expect(shouldRetryRequest(0, error, 3)).toBe(false);
    expect(getRefreshRetryDelay(new Error('offline'))).toBe(REFRESH_RETRY_DELAY_MS);
  });

  it.each([null, undefined, false, 'token'])('не подтверждает скалярную identity: %s', value => {
    expect(normalizeRestoredSession(value)).toBeNull();
  });

  it('объясняет отказ входа без технического сообщения HTTP', () => {
    const error = createUnauthenticatedError();
    expect(getAuthErrorMessage(error, 'login')).toBe(AUTH_ERROR_MESSAGES.login);
    expect(getAuthErrorMessage(error, 'register')).toBe(REQUEST_ERROR_MESSAGES.unauthorized);
  });

  it('сохраняет статус ошибки истёкшей сессии', () => {
    const error = createUnauthenticatedError();
    expect(error.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(getRequestErrorMessage(error)).toBe(REQUEST_ERROR_MESSAGES.unauthorized);
  });

  it('заменяет техническую ошибку таймаута понятным сообщением', () => {
    const error = new AxiosError('timeout of 15000ms exceeded', 'ECONNABORTED');
    expect(getRequestErrorMessage(error)).toBe(REQUEST_ERROR_MESSAGES.unavailable);
  });

  it('не показывает внутренний текст неизвестной ошибки', () => {
    expect(getRequestErrorMessage(new Error('Internal database failure'))).toBe(REQUEST_ERROR_MESSAGES.generic);
  });
});
