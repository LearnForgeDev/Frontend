import { afterEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { createApiClient, createQueryFn } from './factory';
import { getRequestErrorMessage } from './factory.utils';
import { REQUEST_ERROR_MESSAGES } from './factory.const';

function networkError(method: string) {
  return new AxiosError('Network Error', 'ERR_NETWORK', { method, headers: new AxiosHeaders() });
}

afterEach(() => vi.useRealTimers());

describe('обработка недоступного сервера', () => {
  it('не повторяет POST, даже если разрешены повторы чтения', async () => {
    const client = createApiClient({ retryCount: 1 });
    const request = vi.fn().mockRejectedValue(networkError('post'));

    await expect(client.fetchQuery({ queryKey: ['create'], queryFn: request })).rejects.toBeInstanceOf(AxiosError);
    expect(request).toHaveBeenCalledTimes(1);
    client.clear();
  });

  it('повторяет GET не больше одного раза', async () => {
    vi.useFakeTimers();
    const client = createApiClient({ retryCount: 1 });
    const error = networkError('get');
    const request = vi.fn().mockRejectedValue(error);
    const result = client.fetchQuery({ queryKey: ['list'], queryFn: request }).catch((failure) => failure);

    await vi.runAllTimersAsync();
    expect(await result).toBe(error);
    expect(request).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it('не повторяет запрос внутри endpoint-клиента', async () => {
    const client = createApiClient({});
    const request = vi.fn().mockRejectedValue(networkError('get'));

    await expect(client.fetchQuery({ queryKey: ['endpoint'], queryFn: request })).rejects.toBeInstanceOf(AxiosError);
    expect(request).toHaveBeenCalledTimes(1);
    client.clear();
  });

  it('заменяет техническую ошибку таймаута понятным сообщением', async () => {
    const client = createQueryFn();
    const error = new AxiosError('timeout of 15000ms exceeded', 'ECONNABORTED');

    await expect(client.get('/health', { adapter: () => Promise.reject(error) })).rejects.toMatchObject({
      message: REQUEST_ERROR_MESSAGES.unavailable,
      code: 'ECONNABORTED',
    });
  });

  it('не показывает внутренний текст неизвестной ошибки', () => {
    expect(getRequestErrorMessage(new Error('Internal database failure'))).toBe(REQUEST_ERROR_MESSAGES.generic);
  });
});
