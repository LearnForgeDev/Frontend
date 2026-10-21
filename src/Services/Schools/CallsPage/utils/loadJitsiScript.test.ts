import { afterEach, describe, expect, it, vi } from 'vitest';
import { JITSI_SCRIPT_ID } from '../CallsPage.constants';
import type { JitsiMeetExternalAPIConstructor } from '../typings';
import { loadJitsiScript } from './loadJitsiScript';
import { JITSI_SCRIPT_TIMEOUT_MS } from './loadJitsiScript.const';

afterEach(() => {
  document.getElementById(JITSI_SCRIPT_ID)?.remove();
  delete window.JitsiMeetExternalAPI;
  vi.useRealTimers();
});

describe('Восстановление клиента видеозвонка', () => {
  it('после сетевой ошибки создаёт новый запрос и завершает повтор', async () => {
    const first = loadJitsiScript('meet.test');
    const rejection = expect(first).rejects.toThrow();
    document.getElementById(JITSI_SCRIPT_ID)!.dispatchEvent(new Event('error'));
    await rejection;
    expect(document.getElementById(JITSI_SCRIPT_ID)).toBeNull();
    const retry = loadJitsiScript('meet.test');
    window.JitsiMeetExternalAPI = vi.fn() as unknown as JitsiMeetExternalAPIConstructor;
    document.getElementById(JITSI_SCRIPT_ID)!.dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBeUndefined();
  });

  it('одновременные вызовы получают одну попытку и одну ошибку', async () => {
    const first = loadJitsiScript('meet.test');
    const second = loadJitsiScript('meet.test');
    expect(second).toBe(first);
    const result = Promise.allSettled([first, second]);
    document.getElementById(JITSI_SCRIPT_ID)!.dispatchEvent(new Event('error'));
    expect((await result).map(item => item.status)).toEqual(['rejected', 'rejected']);
  });

  it('зависшая загрузка завершается ошибкой и допускает новую попытку', async () => {
    vi.useFakeTimers();
    const pending = loadJitsiScript('meet.test');
    const rejection = expect(pending).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(JITSI_SCRIPT_TIMEOUT_MS);
    await rejection;
    const retry = loadJitsiScript('meet.test');
    const retryRejection = expect(retry).rejects.toThrow();
    document.getElementById(JITSI_SCRIPT_ID)!.dispatchEvent(new Event('error'));
    await retryRejection;
  });

  it('не считает загруженный файл без API успешным подключением', async () => {
    const pending = loadJitsiScript('meet.test');
    const rejection = expect(pending).rejects.toThrow();
    document.getElementById(JITSI_SCRIPT_ID)!.dispatchEvent(new Event('load'));
    await rejection;
    expect(document.getElementById(JITSI_SCRIPT_ID)).toBeNull();
  });
});
