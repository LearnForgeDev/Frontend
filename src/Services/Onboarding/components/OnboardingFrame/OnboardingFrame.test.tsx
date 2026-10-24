import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import OnboardingFrame from './OnboardingFrame';

const initialState = useGlobalContext.getState();

afterEach(() => {
  cleanup();
  useGlobalContext.setState(initialState, true);
  localStorage.clear();
});

describe('Аккаунт и прогресс онбординга', () => {
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
    if (label) {
      expect(container.querySelector('[aria-current="step"]')?.textContent).toContain(label);
    } else {
      expect(container.querySelector('[aria-current="step"]')).toBeNull();
    }
  });
});
