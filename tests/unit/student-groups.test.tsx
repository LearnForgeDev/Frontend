import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import StudentGroups from '@/Services/Schools/components/StudentGroups/StudentGroups';
import { StudentsTable } from '@/Services/Schools/StudentsPage/Components/StudentsTable';
import { useStudentGroups } from '@/Services/Schools/hooks/useStudentGroups';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

const requests = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('@/Endpoints/factory/factory', () => ({
  createApiClient: () => ({}),
  createQueryFnWithRefresh: () => requests,
}));
vi.mock('@/Services/Schools/StudentsPage/hooks/useStudents', () => ({
  useStudents: () => ({ data: [{ publicId: 'member', displayName: 'Ирина' }] }),
}));

const path = '/api/ApiStudentGroups/school';
const student = { userPublicId: 'member', displayName: 'Ирина' };
const group = { publicId: 'group', name: 'Понедельник', memberPublicIds: [student.userPublicId] };
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

beforeEach(() => {
  requests.get.mockResolvedValue({ data: { groups: [group], members: [student] } });
  useGlobalContext.getState().auth.setUser({
    userPublicId: 'teacher', userName: 'Преподаватель', jwtToken: 'unused',
    refreshToken: 'unused', userRoles: [], exp: 4_000_000_000,
  });
});

afterEach(() => {
  cleanup();
  client.clear();
  useGlobalContext.getState().auth.logout();
});

function GroupRoster() {
  const directory = useStudentGroups('school');
  return <>
    <StudentGroups directory={directory} />
    <StudentsTable schoolPublicId="school" groups={directory.data?.groups} onOpenChat={vi.fn()} />
  </>;
}

function openGroups() {
  render(<QueryClientProvider client={client}><GroupRoster /></QueryClientProvider>);
}

it('retries loading and keeps the same group ID and selected members after a failed create', async () => {
  requests.get.mockRejectedValueOnce(new Error('offline'));
  requests.post.mockRejectedValueOnce(new Error('timeout'));
  requests.post.mockImplementation((url: string, input: { name: string; memberPublicIds: string[] }) =>
    Promise.resolve({ data: { publicId: url.split('/').at(-1), ...input } }));
  openGroups();
  fireEvent.click(await screen.findByRole('button', { name: 'Повторить' }));
  const add = await screen.findByRole('button', { name: 'Создать группу' });
  await waitFor(() => expect(add).toHaveProperty('disabled', false));
  fireEvent.click(add);

  const dialog = screen.getByRole('dialog', { name: 'Новая группа' });
  const save = within(dialog).getByRole('button', { name: 'Сохранить' });
  expect(save).toHaveProperty('disabled', true);
  fireEvent.change(within(dialog).getByLabelText('Название группы'), { target: { value: 'Вторник' } });
  fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: 'Участники' }));
  fireEvent.click(await screen.findByRole('option', { name: student.displayName }));
  fireEvent.click(save);
  expect(await within(dialog).findByRole('alert')).toBeTruthy();
  expect(within(dialog).getByLabelText('Название группы')).toHaveProperty('value', 'Вторник');
  fireEvent.click(save);
  expect(await screen.findByRole('button', { name: 'Изменить группу Вторник' })).toBeTruthy();
  expect(within(screen.getByRole('row', { name: /Ирина/ })).getByText(/Вторник/)).toBeTruthy();
  expect(requests.post).toHaveBeenCalledTimes(2);
  expect(requests.post.mock.calls[1]).toEqual(requests.post.mock.calls[0]);
  expect(requests.post.mock.calls[0][1]).toEqual({ name: 'Вторник', memberPublicIds: [student.userPublicId] });
});

it('updates an existing group and keeps it visible when the backend rejects deletion', async () => {
  requests.put.mockResolvedValue({ data: { ...group, name: 'Среда' } });
  requests.delete.mockRejectedValueOnce(new AxiosError('in use', undefined, undefined, undefined, {
    data: null, status: 409, statusText: 'Conflict', headers: {}, config: { headers: new AxiosHeaders() },
  }));
  requests.delete.mockResolvedValueOnce({ data: {} });
  openGroups();
  fireEvent.click(await screen.findByRole('button', { name: 'Изменить группу Понедельник' }));
  fireEvent.change(screen.getByLabelText('Название группы'), { target: { value: 'Среда' } });
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
  await waitFor(() => expect(requests.put).toHaveBeenCalledWith(
    `${path}/group`, { name: 'Среда', memberPublicIds: [student.userPublicId] },
  ));

  fireEvent.click(await screen.findByRole('button', { name: 'Удалить группу Среда' }));
  const dialog = screen.getByRole('dialog', { name: 'Удалить группу' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }));
  expect(await within(dialog).findByText(/Удалить можно только пустую группу/)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Изменить группу Среда' })).toBeNull());
  expect(requests.delete).toHaveBeenCalledWith(`${path}/group`);
});
