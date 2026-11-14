import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserSchoolInfo } from '@/Endpoints/schools/schools.contract.type';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { resolveSchoolSelection } from '@/Services/Schools/schools.selection';
import ProfilePage from './ProfilePage';

const mocks = vi.hoisted(() => ({ schools: vi.fn(), listEvents: vi.fn(), logout: vi.fn() }));
vi.mock('@/Endpoints', () => ({
  scheduleEndpoints: { listEvents: mocks.listEvents },
  scheduleEventDtoToEvent: (value: ScheduleEvent) => value,
}));
vi.mock('@/Services/Schools/hooks/useMySchools', () => ({ useMySchools: mocks.schools }));
vi.mock('@/Services/Auth/hooks/useLogout/useLogout', () => ({ useLogout: () => mocks.logout }));
vi.mock('@/Services/Scheduling/components/CreateEventModal/CreateEventModal', () => ({
  CreateEventModal: ({ onClose }: { onClose: () => void }) => <div role="dialog"><button onClick={onClose}>Отмена</button></div>,
}));

const student: UserSchoolInfo = { schoolPublicId: 'student-school', schoolName: 'Школа ученика', roles: ['Student'] };
const teacher: UserSchoolInfo = { schoolPublicId: 'teacher-school', schoolName: 'Школа преподавателя', roles: ['Teacher'] };
const event: ScheduleEvent = {
  id: 'event', title: 'Ближайшая встреча', description: null,
  start: '2099-01-01T10:00:00Z', end: '2099-01-01T11:00:00Z', room: 'room',
  hostUserPublicId: 'teacher', attendees: [],
};

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}{location.search}{location.hash}</output>;
}

function renderProfile(profileReturnTo?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>
    <MemoryRouter initialEntries={[{ pathname: '/app/profile', state: { profileReturnTo } }]}>
      <CurrentPath /><ProfilePage />
    </MemoryRouter>
  </QueryClientProvider>);
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.schools.mockReturnValue({ data: [student, teacher], isLoading: false, isError: false });
  mocks.listEvents.mockResolvedValue([event]);
  useGlobalContext.getState().auth.setUser({
    userPublicId: 'user', userName: 'Ученик', jwtToken: 'token', refreshToken: 'refresh', exp: 0, userRoles: [],
  });
});

afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Profile actions and school scope', () => {
  it('uses the teaching fallback for event reads, calendar navigation and event creation', async () => {
    renderProfile();
    await waitFor(() => expect(screen.getByText(event.title)).toBeTruthy());
    expect(mocks.listEvents).toHaveBeenCalledWith(teacher.schoolPublicId);
    fireEvent.click(screen.getByRole('button', { name: 'Открыть в календаре' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/app/schools/teacher-school/schedule?eventId=event');
    fireEvent.click(screen.getByRole('button', { name: 'Создать занятие' }));
    expect(useGlobalContext.getState().auth.user?.activeSchoolPublicId).toBe(teacher.schoolPublicId);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Добавить школу' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/onboarding');
    fireEvent.click(screen.getByTestId('profile-logout'));
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it('honors an available student school and hides creation', async () => {
    useGlobalContext.getState().auth.setActiveSchoolPublicId(student.schoolPublicId);
    renderProfile();
    await waitFor(() => expect(screen.getByText(event.title)).toBeTruthy());
    expect(mocks.listEvents).toHaveBeenCalledWith(student.schoolPublicId);
    expect(screen.queryByRole('button', { name: 'Создать занятие' })).toBeNull();
  });

  it('does not fetch a schedule or offer creation when there are no memberships', () => {
    mocks.schools.mockReturnValue({ data: [], isLoading: false, isError: false });
    renderProfile();
    expect(screen.getByText('Вы пока не состоите ни в одной школе.')).toBeTruthy();
    expect(screen.getByText('Ближайших занятий пока нет.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Создать занятие' })).toBeNull();
    expect(mocks.listEvents).not.toHaveBeenCalled();
  });

  it('keeps school loading and schedule errors distinct from empty data', async () => {
    mocks.schools.mockReturnValue({ data: [teacher], isLoading: true, isError: false });
    mocks.listEvents.mockRejectedValue(new Error('offline'));
    renderProfile();
    expect(within(screen.getByRole('region', { name: 'Мои школы' })).getByRole('status')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Не удалось загрузить ближайшее занятие.')).toBeTruthy());
    expect(screen.queryByText('Ближайших занятий пока нет.')).toBeNull();
  });

  it('shows a school error independently and withholds another user’s identity', () => {
    mocks.schools.mockReturnValue({ data: [], isLoading: false, isError: true });
    const view = renderProfile();
    expect(screen.getByText('Не удалось загрузить список школ.')).toBeTruthy();
    view.unmount();
    useGlobalContext.getState().auth.logout();
    renderProfile();
    expect(screen.getByText('Пользователь не авторизован.')).toBeTruthy();
    expect(screen.queryByText('Ученик')).toBeNull();
  });

  it('falls back from an unavailable selection to a teacher, then the first school', () => {
    expect(resolveSchoolSelection({ schools: [student, teacher], activeSchoolPublicId: 'removed' })).toEqual(teacher);
    expect(resolveSchoolSelection({ schools: [student], activeSchoolPublicId: 'removed' })).toEqual(student);
    expect(resolveSchoolSelection({ schools: [], activeSchoolPublicId: 'removed' })).toBeUndefined();
  });

  it('returns to the saved in-app page including its query and fragment', () => {
    renderProfile('/app/schools/student-school/lessons?view=recent#lesson');
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/app/schools/student-school/lessons?view=recent#lesson');
  });

  it.each([undefined, 'https://outside.invalid', '//outside.invalid/app', '/app/profile?view=private'])('uses a confirmed school fallback for direct or invalid return entry %s', (returnPath) => {
    useGlobalContext.getState().auth.setActiveSchoolPublicId(student.schoolPublicId);
    renderProfile(returnPath);
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/app/schools/student-school/today');
  });

  it('returns a user without schools through the app entry route', () => {
    mocks.schools.mockReturnValue({ data: [], isLoading: false, isError: false });
    renderProfile();
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/app');
  });
});
