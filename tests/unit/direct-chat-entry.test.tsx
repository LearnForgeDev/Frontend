import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type * as Endpoints from '@/Endpoints';
import SchoolAccessGuard from '@/Router/SchoolAccessGuard';
import ChatsPage from '@/Services/Schools/ChatsPage/ChatsPage';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

const endpoints = vi.hoisted(() => ({
  listMembers: vi.fn(),
  getBranches: vi.fn(),
  getDirectHistory: vi.fn(),
}));

vi.mock('@/Endpoints', async (importOriginal) => ({
  ...await importOriginal<typeof Endpoints>(),
  schoolsEndpoints: { listMembers: endpoints.listMembers },
  branchesEndpoints: { getBranches: endpoints.getBranches },
  chatEndpoints: { getDirectHistory: endpoints.getDirectHistory },
}));
vi.mock('@/Assets/Hooks/useSignalR/chatHub', () => ({
  useChatHubConnection: () => ({ connection: null, status: 'disconnected' }),
}));
vi.mock('@/Services/Schools/hooks/useMySchools', () => ({
  useMySchools: () => ({ data: [{ schoolPublicId: 'school', roles: ['Student'] }] }),
}));

const schoolPath = '/app/schools/school';
const clients: QueryClient[] = [];

function Today() {
  return <h1>Сегодня</h1>;
}

function SearchParams() {
  return <output>{useLocation().search}</output>;
}

function openPage(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <SearchParams />
        <Routes>
          <Route path="/app/schools/:schoolPublicId" element={<SchoolAccessGuard />}>
            <Route path="today" element={<Today />} />
            <Route path="chats" element={<ChatsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  endpoints.listMembers.mockResolvedValue([
    { userPublicId: 'self', displayName: 'Текущий пользователь' },
    { userPublicId: 'other', displayName: 'Собеседник' },
  ]);
  endpoints.getBranches.mockResolvedValue([]);
  endpoints.getDirectHistory.mockResolvedValue([{
    publicId: 'message', text: 'Уже полученное сообщение', senderPublicId: 'other',
    senderName: 'Собеседник', receiverPublicId: 'self', files: [],
    sentAt: '2026-11-20T09:00:00Z',
  }]);
  useGlobalContext.getState().auth.setUser({
    userPublicId: 'self', userName: 'Текущий пользователь', jwtToken: 'unused',
    refreshToken: 'unused', userRoles: [], exp: 4_000_000_000,
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
});

afterEach(() => {
  cleanup();
  for (const client of clients.splice(0)) {
    client.clear();
  }
  useGlobalContext.getState().auth.logout();
});

it('opens existing direct history from the contact list without a saved shortcut', async () => {
  openPage(`${schoolPath}/chats`);
  fireEvent.click(screen.getByRole('tab', { name: 'Личные' }));
  const contact = await screen.findByTestId('chat-direct-other');
  expect(within(contact).getByText('Напишите первым')).toBeTruthy();
  expect(screen.queryByText('Текущий пользователь')).toBeNull();
  fireEvent.click(contact);
  expect(await screen.findByText('Уже полученное сообщение')).toBeTruthy();
  expect(endpoints.getDirectHistory).toHaveBeenCalledWith('school', 'other');
  expect(screen.queryByRole('button', { name: 'Открыть быстрый чат' })).toBeNull();
});

it('keeps a roster link working and only consumes its recipient parameter', async () => {
  openPage(`${schoolPath}/chats?user=other&source=students`);
  expect(await screen.findByText('Уже полученное сообщение')).toBeTruthy();
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('?source=students'));
});

it('retries the quick chat member list and opens the same direct history', async () => {
  endpoints.listMembers.mockRejectedValueOnce(new Error('offline'));
  openPage(`${schoolPath}/today`);
  const launcher = await screen.findByRole('button', { name: 'Открыть быстрый чат' });
  expect(endpoints.listMembers).not.toHaveBeenCalled();
  fireEvent.click(launcher);
  const panel = screen.getByRole('region', { name: 'Быстрый чат' });
  expect(within(panel).getByRole('tab', { name: 'Личные', selected: true })).toBeTruthy();
  fireEvent.click(await within(panel).findByRole('button', { name: 'Повторить' }));
  fireEvent.click(await within(panel).findByRole('button', { name: /Собеседник/ }));
  expect(await within(panel).findByText('Уже полученное сообщение')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть быстрый чат' }));
  expect(screen.getByRole('button', { name: 'Открыть быстрый чат', expanded: false })).toBeTruthy();
});
