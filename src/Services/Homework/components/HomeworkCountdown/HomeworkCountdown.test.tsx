import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomeworkCountdown from './HomeworkCountdown';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Teacher server deadline countdown', () => {
  it('applies fresh server time immediately and wakes at a deadline between display ticks', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'performance', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const deadline = '2026-11-17T12:01:00.000Z';
    const { rerender } = render(<HomeworkCountdown deadline={deadline} serverTimeUtc="2026-11-17T12:00:00.000Z" />);
    expect(screen.getByRole('status').textContent).toBe('Автосдача через 60 сек.');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    rerender(<HomeworkCountdown deadline={deadline} serverTimeUtc="2026-11-17T12:00:10.500Z" />);
    expect(screen.getByRole('status').textContent).toBe('Автосдача через 50 сек.');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(49500);
    });
    expect(screen.getByRole('status').textContent).toBe('Завершаем попытку…');
    rerender(<HomeworkCountdown deadline={deadline} serverTimeUtc="2026-11-17T12:00:10.600Z" />);
    expect(screen.getByRole('status').textContent).toBe('Завершаем попытку…');
  });

  it('does not increase remaining time when a newer server sample was delayed in transit', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'performance', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const deadline = '2026-11-17T12:01:00.000Z';
    const { rerender } = render(<HomeworkCountdown deadline={deadline} serverTimeUtc="2026-11-17T12:00:00.000Z" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5500);
    });
    expect(screen.getByRole('status').textContent).toBe('Автосдача через 55 сек.');
    rerender(<HomeworkCountdown deadline={deadline} serverTimeUtc="2026-11-17T12:00:00.080Z" />);
    expect(screen.getByRole('status').textContent).toBe('Автосдача через 55 сек.');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole('status').textContent).toBe('Автосдача через 55 сек.');
  });
});
