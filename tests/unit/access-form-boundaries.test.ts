import { createElement, Fragment } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import SchoolAccessGuard from '@/Router/SchoolAccessGuard';
import AppEntryPage from '@/Services/AppShell/AppEntryPage';
import PasswordField from '@/Services/Auth/Components/PasswordField';

const schools = vi.hoisted(() => vi.fn());
vi.mock('@/Services/Schools/hooks/useMySchools', () => ({ useMySchools: schools }));

afterEach(() => cleanup());

function CurrentPath() {
  return createElement('output', { 'data-testid': 'current-path' }, useLocation().pathname);
}

it.each([
  { Page: SchoolAccessGuard, error: 'Не удалось проверить доступ к школе.', target: '/app/schools' },
  { Page: AppEntryPage, error: 'Не удалось загрузить список школ.', target: '/onboarding' },
])('keeps access failures retryable before deciding where to navigate: $target', async ({ Page, error, target }) => {
  const refetch = vi.fn().mockResolvedValue({ data: [] });
  schools.mockReturnValue({ isLoading: false, isError: true, refetch });
  const view = () => createElement(MemoryRouter, { initialEntries: ['/app'] },
    createElement(Fragment, null, createElement(Page), createElement(CurrentPath)));
  const { rerender } = render(view());
  expect(screen.getByText(error)).toBeTruthy();
  expect(screen.getByTestId('current-path').textContent).toBe('/app');
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  await waitFor(() => expect(refetch).toHaveBeenCalledOnce());
  schools.mockReturnValue({ isLoading: false, isError: false, data: [], refetch });
  rerender(view());
  await waitFor(() => expect(screen.getByTestId('current-path').textContent).toBe(target));
});

it('preserves an input-slot callback adornment when password visibility changes', () => {
  const adornment = createElement('span', null, 'Подсказка пароля');
  const slot = vi.fn(() => ({ endAdornment: adornment }));
  render(createElement(PasswordField, { label: 'Пароль', slotProps: { input: slot } }));
  expect(slot).toHaveBeenCalled();
  expect(screen.getByText('Подсказка пароля')).toBeTruthy();
  const input = screen.getByLabelText(/^Пароль/);
  expect(input.getAttribute('type')).toBe('password');
  fireEvent.click(screen.getByRole('button', { name: 'Показать пароль' }));
  expect(input.getAttribute('type')).toBe('text');
  expect(screen.getByText('Подсказка пароля')).toBeTruthy();
});
