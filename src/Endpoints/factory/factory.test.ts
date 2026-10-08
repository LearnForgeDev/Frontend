import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { createUnauthenticatedError, getRequestErrorMessage, shouldRetryRequest } from './factory.utils';
import { HTTP_STATUS, REQUEST_ERROR_MESSAGES } from './factory.const';

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
