import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import OnboardingFrame from './OnboardingFrame';

const initialState = useGlobalContext.getState();
const logout = vi.hoisted(() => vi.fn());
vi.mock('@/Services/Auth/hooks/useLogout/useLogout', () => ({ useLogout: () => logout }));

afterEach(() => {
  cleanup();
  useGlobalContext.setState(initialState, true);
  localStorage.clear();
  logout.mockClear();
});

describe('Аккаунт и прогресс онбординга', () => {
  it('позволяет выйти сразу из онбординга без открытия профиля', () => {
    render(<MemoryRouter><OnboardingFrame stage="pending">Настройка</OnboardingFrame></MemoryRouter>);

    fireEvent.click(screen.getByTestId('onboarding-logout'));

    expect(logout).toHaveBeenCalledOnce();
  });

  it('открывает существующий профиль общей кнопкой из шапки', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<OnboardingFrame stage="selection">Выбор школы</OnboardingFrame>} />
          <Route path="/app/profile" element={<h1>Мой профиль</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Открыть профиль' }));
    expect(screen.getByRole('heading', { name: 'Мой профиль' })).toBeTruthy();
  });

  it.each([
    ['selection', 'Школа'],
    ['pending', 'Доступ'],
    ['provisioning', 'Доступ'],
    ['rejected', 'Школа'],
    ['approved', undefined],
  ] as const)('показывает текущий этап для состояния %s', (stage, label) => {
    const { container } = render(<MemoryRouter><OnboardingFrame stage={stage}>Настройка</OnboardingFrame></MemoryRouter>);
    const mainStyle = window.getComputedStyle(screen.getByRole('main'));
    expect(mainStyle.marginTop).toBe('0px');
    expect(mainStyle.marginBottom).toBe('0px');
    if (label) {
      expect(container.querySelector('[aria-current="step"]')?.textContent).toContain(label);
    } else {
      expect(container.querySelector('[aria-current="step"]')).toBeNull();
    }
  });
});
