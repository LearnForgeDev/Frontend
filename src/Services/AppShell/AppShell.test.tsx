import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserSchoolInfo } from '@/Endpoints/schools/types';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import AppShell from './AppShell';

const mocks = vi.hoisted(() => ({ schools: vi.fn() }));
vi.mock('@/Services/Schools/hooks/useMySchools', () => ({ useMySchools: mocks.schools }));

const school: UserSchoolInfo = { schoolPublicId: 'school', schoolName: 'Тестовая школа', roles: ['Teacher'] };

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}{location.search}{location.hash}</output>;
}

function renderShell(path = '/app/schools/school/today') {
  return render(<MemoryRouter initialEntries={[path]}><CurrentPath /><Routes>
    <Route path="/app/schools/:schoolPublicId/*" element={<AppShell />} />
    <Route path="*" element={<AppShell />} />
  </Routes></MemoryRouter>);
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.schools.mockReturnValue({ data: [school] });
  useGlobalContext.getState().auth.setUser({
    userPublicId: 'user', userName: 'Учитель', jwtToken: 'token', refreshToken: 'refresh', exp: 0, userRoles: [],
  });
});

afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Collapsible desktop navigation', () => {
  it('keeps named navigation and school selection available after collapsing', async () => {
    renderShell();
    const sidebar = screen.getByRole('complementary');
    const navigation = within(sidebar).getByRole('navigation', { name: 'Разделы школы' });
    fireEvent.click(screen.getByRole('button', { name: 'Свернуть меню', hidden: true }));
    expect(screen.getByRole('button', { name: 'Развернуть меню', hidden: true }).getAttribute('aria-expanded')).toBe('false');
    expect(navigation.textContent).toBe('');
    fireEvent.click(within(navigation).getByRole('button', { name: 'Расписание', hidden: true }));
    expect(screen.getByTestId('current-path').textContent).toBe('/app/schools/school/schedule');
    fireEvent.click(within(sidebar).getByRole('button', { name: school.schoolName, hidden: true }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Тестовая школа/ })).toBeTruthy());
    fireEvent.click(screen.getByRole('menuitem', { name: /Тестовая школа/ }));
    expect(useGlobalContext.getState().auth.user?.activeSchoolPublicId).toBe(school.schoolPublicId);
    expect(screen.getByTestId('current-path').textContent).toBe('/app/schools/school/today');
    fireEvent.click(screen.getByRole('button', { name: 'Развернуть меню', hidden: true }));
    expect(within(navigation).getByText('Расписание')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Свернуть меню', hidden: true }).getAttribute('aria-expanded')).toBe('true');
  });

  it('opens the school list from the switcher', async () => {
    renderShell();
    const sidebar = screen.getByRole('complementary');
    fireEvent.click(within(sidebar).getByRole('button', { name: /Тестовая школа/, hidden: true }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Все школы' })).toBeTruthy());
    fireEvent.click(screen.getByRole('menuitem', { name: 'Все школы' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/app/schools');
  });

  it('hides empty school switchers on an account page', () => {
    mocks.schools.mockReturnValue({ data: [] });
    renderShell('/app/profile');
    expect(screen.queryByRole('button', { name: 'Выберите школу', hidden: true })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeTruthy();
  });

  it('retains the confirmed route school when opening profile from a direct school URL', () => {
    useGlobalContext.getState().auth.setActiveSchoolPublicId('previous-school');
    renderShell('/app/schools/school/lessons?view=recent#lesson');
    fireEvent.click(screen.getByRole('button', { name: 'Открыть профиль' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/app/profile');
    expect(useGlobalContext.getState().auth.user?.activeSchoolPublicId).toBe(school.schoolPublicId);
    expect(within(screen.getByRole('complementary')).getByRole('button', { name: /Тестовая школа/, hidden: true })).toBeTruthy();
    expect(within(screen.getByRole('navigation', { name: 'Разделы школы' })).getByRole('button', { name: 'Расписание', hidden: true })).toBeTruthy();
  });
});
