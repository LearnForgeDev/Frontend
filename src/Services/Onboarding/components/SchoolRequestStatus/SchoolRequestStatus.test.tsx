import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SchoolRequestStatus from './SchoolRequestStatus';

afterEach(cleanup);

describe('статус заявки', () => {
  it('собирает пояснения и часы в карточке ожидания', () => {
    const { container } = render(<SchoolRequestStatus schoolName="Школа" viewState="pending" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Заявка на рассмотрении');
    expect(screen.getByText(/текущая заявка останется активной/)).toBeTruthy();
    expect(container.querySelector('[data-testid="AccessTimeRoundedIcon"]')).toBeTruthy();
    expect(screen.getByText('Школа')).toBeTruthy();
  });

  it.each([
    ['approved', 'Школа готова'],
    ['provisioning', 'Готовим школу'],
    ['rejected', 'Заявку не удалось подтвердить'],
  ] as const)('не обещает активную заявку в состоянии %s', (viewState, title) => {
    render(<SchoolRequestStatus schoolName="Школа" viewState={viewState} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(title);
    expect(screen.queryByText(/текущая заявка останется активной/)).toBeNull();
  });
});
