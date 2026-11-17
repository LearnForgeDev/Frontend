import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomeworkHint from './HomeworkHint';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Nonmodal role-specific question hints', () => {
  it('does not expose teacher hints or empty icons in student view', () => {
    render(<HomeworkHint studentHint={null} teacherHint="Секрет учителя" />);
    expect(screen.queryByRole('button')).toBeNull();
    cleanup();
    render(<HomeworkHint studentHint="Проверьте знак" teacherHint="Секрет учителя" />);
    const trigger = screen.getByRole('button', { name: 'Показать подсказку' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Проверьте знак')).toBeTruthy();
    expect(screen.queryByText('Секрет учителя')).toBeNull();
    expect(document.querySelector('.MuiBackdrop-root')).toBeNull();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('edits independent teacher/student hints and restores trigger focus on Escape', () => {
    const change = vi.fn();
    render(<HomeworkHint editing studentHint="Ученику" teacherHint="Учителю" onChange={change} />);
    const trigger = screen.getByRole('button', { name: 'Настроить подсказки' });
    fireEvent.click(trigger);
    fireEvent.change(screen.getByRole('textbox', { name: 'Подсказка преподавателю' }), { target: { value: 'Секрет' } });
    expect(change).toHaveBeenLastCalledWith('Ученику', 'Секрет');
    fireEvent.change(screen.getByRole('textbox', { name: 'Подсказка ученику' }), { target: { value: 'Совет' } });
    expect(change).toHaveBeenLastCalledWith('Совет', 'Учителю');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('shows both audiences to a teacher and toggles the anchored panel', () => {
    render(<HomeworkHint teacher studentHint="Публичная" teacherHint="Приватная" />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(screen.getByText('Приватная')).toBeTruthy();
    expect(screen.getByText('Публичная')).toBeTruthy();
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('flips the arrow onto the lower edge when the panel opens above its icon', async () => {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.tagName === 'BUTTON') {
        return new DOMRect(300, 720, 40, 40);
      }
      if (this.hasAttribute('data-homework-hint-arrow')) {
        return new DOMRect(0, 0, 12, 12);
      }
      return new DOMRect(0, 0, 360, 120);
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.hasAttribute('data-homework-hint-arrow') ? 12 : 360;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.hasAttribute('data-homework-hint-arrow') ? 12 : 120;
    });
    render(<HomeworkHint studentHint="Подсказка у нижнего края" />);
    fireEvent.click(screen.getByRole('button', { name: 'Показать подсказку' }));
    await waitFor(() => expect(screen.getByRole('dialog').closest('[data-popper-placement]')?.getAttribute('data-popper-placement')).toMatch(/^top/));
    const arrow = screen.getByRole('dialog').querySelector('[data-homework-hint-arrow]');
    expect(arrow).toBeTruthy();
    if (arrow) {
      expect(getComputedStyle(arrow).bottom).toBe('-7px');
      expect(arrow.getAttribute('style')).toContain('translate');
    }
  });
});
