import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHomeworkRealtime } from './useHomeworkRealtime';

const mocks = vi.hoisted(() => ({
  withUrl: vi.fn(), start: vi.fn(), stop: vi.fn(), callbacks: new Map<string, () => void>(), reconnect: vi.fn(),
}));
vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => ({ user: { jwtToken: 'current-token' } }) }));
vi.mock('@microsoft/signalr', () => ({ HubConnectionBuilder: class {
  withUrl(...args: unknown[]) {
    mocks.withUrl(...args);
    return this;
  }
  withAutomaticReconnect() {
    return this;
  }
  build() {
    return { start: mocks.start, stop: mocks.stop, on: (event: string, callback: () => void) => mocks.callbacks.set(event, callback), onreconnected: mocks.reconnect };
  }
} }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  mocks.callbacks.clear();
  mocks.start.mockResolvedValue(undefined);
  mocks.stop.mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Homework realtime invalidation with REST fallback', () => {
  it('refreshes on notifications, reconnect, periodic reads and browser recovery', () => {
    const refresh = vi.fn(async () => undefined);
    const { unmount } = renderHook(() => useHomeworkRealtime('school', 'homework', refresh));
    expect(mocks.withUrl).toHaveBeenCalledWith(expect.stringContaining('/homeworkHub?schoolPublicId=school&homeworkPublicId=homework'), expect.objectContaining({ accessTokenFactory: expect.any(Function) }));
    expect(mocks.start).toHaveBeenCalledOnce();
    mocks.callbacks.get('HomeworkChanged')?.();
    vi.advanceTimersByTime(15000);
    window.dispatchEvent(new Event('online'));
    window.dispatchEvent(new Event('focus'));
    const reconnected: (() => void) | undefined = mocks.reconnect.mock.calls[0]?.[0];
    reconnected?.();
    expect(refresh).toHaveBeenCalledTimes(5);
    unmount();
    window.dispatchEvent(new Event('online'));
    vi.advanceTimersByTime(15000);
    expect(refresh).toHaveBeenCalledTimes(5);
    expect(mocks.stop).toHaveBeenCalledOnce();
  });

  it('does not subscribe without school and homework scope', () => {
    renderHook(() => useHomeworkRealtime('', 'homework', async () => undefined));
    expect(mocks.start).not.toHaveBeenCalled();
  });
});
