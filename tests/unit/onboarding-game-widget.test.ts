import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Game404 from '404game';
import type { Game404Instance } from '404game';

let instance: Game404Instance | undefined;

beforeEach(() => {
  const context = new Proxy({}, { get: () => vi.fn() }) as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  instance?.destroy();
  instance = undefined;
  document.body.replaceChildren();
  document.getElementById('g404-styles')?.remove();
  vi.unstubAllGlobals();
});

describe('патч готового виджета', () => {
  it('локализует интерфейс и использует переданную тему', () => {
    const container = document.createElement('div');
    document.body.append(container);
    instance = Game404.mount(container, {
      game: 'dino', message: 'Динозаврик', subMessage: 'Пробел — прыжок',
      theme: { bg: '#fffdf9', fg: '#111111', accent: '#2859d8', danger: '#b44444', muted: '#555555', font: 'Manrope' },
    });
    expect(container.textContent).toContain('Начать');
    expect(container.textContent).toContain('Игра окончена');
    expect(container.textContent).toContain('Ещё раз');
    expect(container.textContent).toContain('Счёт: 0');
    expect(container.textContent).not.toMatch(/Score|Best|READY|START|GAME OVER/);
    expect(document.getElementById('g404-styles')?.textContent).toContain('Manrope');
  });

  it('обрабатывает клавиши только на поле и очищает обработчики старта и игры', () => {
    const container = document.createElement('div');
    const input = document.createElement('input');
    document.body.append(container, input);
    const onStart = vi.fn();
    instance = Game404.mount(container, { game: 'dino', onStart });
    input.focus();
    const outside = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    input.dispatchEvent(outside);
    expect(outside.defaultPrevented).toBe(false);
    expect(onStart).not.toHaveBeenCalled();
    const canvas = container.querySelector('canvas')!;
    expect(canvas.tabIndex).toBe(0);
    const inside = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    canvas.dispatchEvent(inside);
    expect(inside.defaultPrevented).toBe(true);
    expect(onStart).toHaveBeenCalledOnce();
    instance.destroy();
    instance = undefined;
    const after = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    canvas.dispatchEvent(after);
    canvas.click();
    expect(after.defaultPrevented).toBe(false);
    expect(onStart).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
