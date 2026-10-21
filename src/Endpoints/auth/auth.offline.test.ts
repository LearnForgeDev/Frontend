import { onlineManager } from '@tanstack/react-query';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authEndpoints } from './auth.endpoints';

const mocks = vi.hoisted(() => ({ adapter: vi.fn() }));
vi.mock('axios', (importOriginal) => importOriginal<typeof import('axios')>().then((original) => {
  return Object.assign({}, original, {
    default: Object.assign({}, original.default, {
      create: (config: Parameters<typeof original.default.create>[0]) => {
        const client = original.default.create(config);
        client.defaults.adapter = mocks.adapter;
        return client;
      },
    }),
  });
}));

beforeEach(() => {
  onlineManager.setOnline(false);
  mocks.adapter.mockReset().mockImplementation((config: InternalAxiosRequestConfig) =>
    Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config)));
});

afterEach(() => onlineManager.setOnline(true));

describe('HTTP-слой авторизации оффлайн', () => {
  it('внутренний fetchQuery входа возвращает сетевую ошибку без зависания', async () => {
    await expect(authEndpoints.login({ name: 'Ученик', password: 'Пароль' })).rejects.toBeInstanceOf(AxiosError);
    expect(mocks.adapter).toHaveBeenCalledOnce();
  });

  it('внутренний fetchQuery статуса заявки возвращает сетевую ошибку', async () => {
    await expect(authEndpoints.getSchoolRequestStatus('request')).rejects.toBeInstanceOf(AxiosError);
    expect(mocks.adapter).toHaveBeenCalledOnce();
  });
});
