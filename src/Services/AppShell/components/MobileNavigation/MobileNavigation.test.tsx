import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ProfileButtonProps } from '@/Services/Profile/components/ProfileButton/ProfileButton.type';
import MobileNavigation from './MobileNavigation';

vi.mock('@/Services/Profile/components/ProfileButton/ProfileButton', () => ({
  default: ({ onNavigate }: ProfileButtonProps) => <button aria-label="Открыть профиль" onClick={onNavigate}>Профиль</button>,
}));
vi.mock('../SchoolSwitcher/SchoolSwitcher', () => ({ default: () => null }));
afterEach(cleanup);

it('connects More to its labelled dialog and clears expanded state when opening profile', async () => {
  render(<MobileNavigation items={[]} schools={[]} currentSchool={undefined} onSelect={vi.fn()} onSelectSchool={vi.fn()} onOpenSchoolList={vi.fn()} />);
  const more = screen.getByTestId('nav-mobile-more');
  expect(more.getAttribute('aria-expanded')).toBe('false');
  expect(more.getAttribute('aria-haspopup')).toBe('dialog');
  fireEvent.click(more);
  expect(more.getAttribute('aria-expanded')).toBe('true');
  const drawer = screen.getByRole('dialog', { name: 'Разделы' });
  expect(drawer.id).toBe(more.getAttribute('aria-controls'));
  fireEvent.click(within(drawer).getByRole('button', { name: 'Открыть профиль' }));
  expect(more.getAttribute('aria-expanded')).toBe('false');
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Разделы' })).toBeNull());
});
