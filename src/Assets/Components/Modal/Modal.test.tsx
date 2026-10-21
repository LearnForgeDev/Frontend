import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

afterEach(cleanup);

describe('Все способы закрытия модального окна', () => {
  it('направляет крестик, Escape и фон в единый обработчик', () => {
    const requestClose = vi.fn();
    render(<Modal title="Курс" onClose={vi.fn()} onRequestClose={requestClose}>Форма</Modal>);
    fireEvent.click(screen.getByRole('button', { name: 'закрыть' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    const backdropTarget = document.querySelector('.MuiDialog-container')!;
    fireEvent.mouseDown(backdropTarget);
    fireEvent.click(backdropTarget);
    expect(requestClose).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('блокирует все способы закрытия при сохранении', () => {
    const requestClose = vi.fn();
    render(<Modal title="Курс" onClose={vi.fn()} onRequestClose={requestClose} disableClose>Форма</Modal>);
    fireEvent.click(screen.getByRole('button', { name: 'закрыть' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    const backdropTarget = document.querySelector('.MuiDialog-container')!;
    fireEvent.mouseDown(backdropTarget);
    fireEvent.click(backdropTarget);
    expect(requestClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
