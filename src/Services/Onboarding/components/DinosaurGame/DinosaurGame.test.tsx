import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '@/Storage/useToastStore';
import DinosaurGame from './DinosaurGame';
import { loadDinosaurGame } from './DinosaurGame.const';

vi.mock('./DinosaurGame.const', (original) =>
  original<typeof import('./DinosaurGame.const')>().then((module) => Object.assign({}, module, { loadDinosaurGame: vi.fn() })),
);

const destroy = vi.fn();
const mount = vi.fn(() => ({ destroy, restart: vi.fn(), getScore: () => 0 }));

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
  vi.mocked(loadDinosaurGame).mockResolvedValue({ default: { mount } } as unknown as Awaited<ReturnType<typeof loadDinosaurGame>>);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('подключение готовой игры', () => {
  it('монтирует виджет и уничтожает его при уходе', async () => {
    const { unmount } = render(<DinosaurGame />);
    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
    expect(mount.mock.calls[0]).toEqual([
      expect.any(HTMLElement),
      expect.objectContaining({ game: 'dino', theme: expect.objectContaining({ font: expect.any(String) }) }),
    ]);
    unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('показывает тост и повторяет неудачную загрузку', async () => {
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast').mockImplementation(() => {});
    vi.mocked(loadDinosaurGame).mockRejectedValueOnce(new Error('ошибка загрузки'));
    render(<DinosaurGame />);
    fireEvent.click(await screen.findByRole('button', { name: 'Повторить' }));
    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
    expect(addToast).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Повторить' })).toBeNull();
  });

  it('не запускает загрузку при отключённой анимации', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    render(<DinosaurGame />);
    expect(screen.getByText('Анимация отключена в настройках системы')).toBeTruthy();
    expect(loadDinosaurGame).not.toHaveBeenCalled();
  });

  it('не создаёт виджет, если страница закрылась во время загрузки', async () => {
    let resolve!: (value: Awaited<ReturnType<typeof loadDinosaurGame>>) => void;
    vi.mocked(loadDinosaurGame).mockReturnValue(new Promise((done) => { resolve = done; }));
    const { unmount } = render(<DinosaurGame />);
    unmount();
    await act(async () => resolve({ default: { mount } } as unknown as Awaited<ReturnType<typeof loadDinosaurGame>>));
    expect(mount).not.toHaveBeenCalled();
  });
});
