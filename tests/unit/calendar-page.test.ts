import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { theme } from '@/Assets/theme';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';
import { SchedulingProvider } from '@/Services/Scheduling/components/SchedulingProvider/SchedulingProvider';
import { SchedulePageContent } from '@/Services/Scheduling/SchedulePageContent';
import { getWeekDays } from '@/Services/Scheduling/utils/layout.utils';
import { formatAgendaDate } from '@/Services/Scheduling/utils/agenda.utils';

const data = vi.hoisted(() => {
  const events: ScheduleEvent[] = [];
  const mutation = () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, reset: vi.fn() });
  return { events, canManage: true, loading: false, error: false, retry: vi.fn(), create: mutation(), update: mutation(), remove: mutation() };
});
vi.mock('@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents', () => ({ useScheduleEvents: () => ({ events: data.events, isLoading: data.loading, isError: data.error, isSuccess: !data.loading && !data.error, refetch: data.retry }) }));
vi.mock('@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations', () => ({ useScheduleMutations: () => ({ createEvent: data.create, updateEvent: data.update, deleteEvent: data.remove }) }));
vi.mock('@/Services/Scheduling/hooks/useIsTeacherOrOwner/useIsTeacherOrOwner', () => ({ useIsTeacherOrOwner: () => data.canManage }));
vi.mock('@/Services/Scheduling/hooks/useSchoolStudents/useSchoolStudents', () => ({ useSchoolStudents: () => ({ students: [], studentIds: [], isLoading: false, isError: false, refetch: vi.fn() }) }));
const clients = new Set<QueryClient>();
const today = new Date(2026, 10, 18, 12);

function setWidth(width: number) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('max-width') ? width <= Number(query.match(/max-width:\s*([\d.]+)/)?.[1]) : false,
    media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(() => false),
  })));
}

function renderCalendar(path = '/app/schools/school/schedule') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  clients.add(client);
  return render(createElement(ThemeProvider, { theme }, createElement(QueryClientProvider, { client },
    createElement(MemoryRouter, { initialEntries: [path] }, createElement(Routes, null, createElement(Route, {
      path: '/app/schools/:schoolPublicId/schedule', element: createElement(SchedulingProvider, null, createElement(SchedulePageContent)),
    }))),
  )));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(today);
  setWidth(1440);
  data.canManage = true;
  data.loading = false;
  data.error = false;
  data.remove.isPending = false;
  data.remove.isError = false;
  data.events = getWeekDays(today).map((day, index) => {
    day.setHours(index === 6 ? 22 : 6, 0, 0, 0);
    return { id: `event-${index}`, title: `Занятие ${index}`, start: day.toISOString(), end: new Date(day.getTime() + 3600000).toISOString(), description: 'Описание', room: 'room', hostUserPublicId: 'teacher', attendees: [] };
  });
});
afterEach(() => {
  cleanup();
  clients.forEach(client => client.clear());
  clients.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it.each([320, 444])('starts a %ipx calendar in Day and exposes all seven Week groups and controls', width => {
  setWidth(width);
  renderCalendar();
  const controls = screen.getByRole('group', { name: 'Вид расписания' });
  expect(within(controls).getByRole('button', { name: 'День' }).getAttribute('aria-pressed')).toBe('true');
  expect(within(controls).getAllByRole('button')).toHaveLength(3);
  fireEvent.click(within(controls).getByRole('button', { name: 'Неделя' }));
  const calendar = screen.getByTestId('schedule-calendar');
  for (const day of getWeekDays(today)) {
    expect(within(calendar).getByRole('region', { name: formatAgendaDate(day) })).toBeTruthy();
  }
  for (const event of data.events) {
    expect(within(calendar).getByRole('heading', { name: event.title })).toBeTruthy();
  }
  fireEvent.click(within(controls).getByRole('button', { name: 'События' }));
  expect(within(calendar).getByRole('heading', { name: 'Занятия на неделю' })).toBeTruthy();
  expect(within(calendar).getAllByRole('listitem')).toHaveLength(7);
});

it('retains all 168 desktop hour slots and selects an inline summary before explicitly opening details', async () => {
  renderCalendar();
  const calendar = screen.getByTestId('schedule-calendar');
  expect(calendar.querySelectorAll('[data-testid^="schedule-slot-"]')).toHaveLength(168);
  const event = data.events[6];
  fireEvent.click(within(calendar).getByRole('button', { name: new RegExp(event.title) }));
  expect(screen.queryByRole('dialog')).toBeNull();
  const summary = screen.getByTestId('schedule-selected-event');
  expect(within(summary).getByRole('heading', { name: event.title })).toBeTruthy();
  fireEvent.click(within(summary).getByRole('button', { name: 'Подробнее' }));
  expect(await screen.findByRole('dialog', { name: 'Детали занятия' })).toBeTruthy();
  fireEvent.click(screen.getByTestId('schedule-event-close'));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(within(summary).getByRole('heading', { name: event.title })).toBeTruthy();
  fireEvent.click(within(summary).getByRole('button', { name: 'Изменить' }));
  expect(await screen.findByTestId('schedule-form-title')).toHaveProperty('value', event.title);
  fireEvent.click(screen.getByTestId('schedule-form-cancel'));
  expect(within(summary).getByRole('heading', { name: event.title })).toBeTruthy();
});

it('defaults creation to the selected day and retains the full-day time inputs and attendee choice', () => {
  renderCalendar();
  fireEvent.click(screen.getByRole('button', { name: /^День$/ }));
  fireEvent.click(screen.getByTestId('schedule-previous'));
  fireEvent.click(screen.getByTestId('schedule-create'));
  expect(screen.getByTestId('schedule-form-date')).toHaveProperty('value', '2026-11-17');
  expect(screen.getByTestId('schedule-form-start-time').getAttribute('min')).toBeNull();
  expect(screen.getByTestId('schedule-form-end-time').getAttribute('max')).toBeNull();
  expect(screen.getByRole('checkbox', { name: 'Занятие без учеников' })).toHaveProperty('checked', false);
});

it('opens creation from the final desktop hour without restricting the full-day grid', () => {
  renderCalendar();
  fireEvent.click(screen.getByTestId('schedule-slot-2026-11-18-23'));
  expect(screen.getByTestId('schedule-form-date')).toHaveProperty('value', '2026-11-18');
  expect(screen.getByTestId('schedule-form-start-time')).toHaveProperty('value', '23:00');
  expect(screen.getByTestId('schedule-form-end-time')).toHaveProperty('value', '23:59');
});

it('keeps failure/loading/empty states distinct and leaves the explicit retry available', () => {
  data.loading = true;
  const view = renderCalendar();
  expect(screen.getByLabelText('Загрузка расписания')).toBeTruthy();
  expect(screen.queryByTestId('schedule-calendar')).toBeNull();
  view.unmount();
  data.loading = false;
  data.error = true;
  const failed = renderCalendar();
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  expect(data.retry).toHaveBeenCalledOnce();
  expect(screen.queryByText('На эту неделю занятий нет.')).toBeNull();
  failed.unmount();
  data.error = false;
  data.events = [];
  renderCalendar();
  fireEvent.click(screen.getByRole('button', { name: /^События$/ }));
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('На эту неделю занятий нет.');
});

it('keeps student selection readable while hiding management and creation shortcuts', () => {
  data.canManage = false;
  renderCalendar();
  expect(screen.queryByTestId('schedule-create')).toBeNull();
  const calendar = screen.getByTestId('schedule-calendar');
  const event = data.events[0];
  fireEvent.click(within(calendar).getByRole('button', { name: new RegExp(event.title) }));
  const summary = screen.getByTestId('schedule-selected-event');
  expect(within(summary).queryByRole('button', { name: 'Изменить' })).toBeNull();
  expect(within(summary).queryByRole('button', { name: 'Удалить' })).toBeNull();
  expect(within(summary).getByRole('button', { name: 'Подробнее' })).toBeTruthy();
});

it('opens deep-link details and retains selected information after explicit close', async () => {
  renderCalendar('/app/schools/school/schedule?eventId=event-2');
  const dialog = await screen.findByRole('dialog', { name: 'Детали занятия' });
  expect(within(dialog).getByTestId('schedule-event-title').textContent).toBe('Занятие 2');
  fireEvent.click(within(dialog).getByTestId('schedule-event-close'));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(within(screen.getByTestId('schedule-selected-event')).getByRole('heading', { name: 'Занятие 2' })).toBeTruthy();
});
