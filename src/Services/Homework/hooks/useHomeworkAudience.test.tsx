import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { useHomeworkAudience } from './useHomeworkAudience';

const mocks = vi.hoisted(() => ({ getStudentsSimple: vi.fn(), getStudentGroups: vi.fn() }));
vi.mock('@/Endpoints/students/students.endpoints', () => ({ studentsEndpoints: mocks }));
vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => ({ user: { userPublicId: 'teacher' } }) }));
afterEach(cleanup);

describe('Homework public audience choices', () => {
  it('loads school roster and groups into the owning Redux scope and omits unresolved identities', async () => {
    mocks.getStudentsSimple.mockResolvedValue([{ publicId: 'one', fullName: 'Анна' }, { userPublicId: 'two', userName: 'Иван' }, { name: 'Без идентификатора' }]);
    mocks.getStudentGroups.mockResolvedValue([{ id: 3, name: 'Группа' }]);
    const store = createApplicationStore();
    const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}><MemoryRouter initialEntries={['/school']}><Routes><Route path="/:schoolPublicId" element={children} /></Routes></MemoryRouter></Provider>;
    const { result } = renderHook(useHomeworkAudience, { wrapper });
    await waitFor(() => expect(result.current.students).toHaveLength(2));
    expect(result.current.students).toEqual([{ publicId: 'one', name: 'Анна' }, { publicId: 'two', name: 'Иван' }]);
    expect(store.getState().homework.scopes['teacher:school'].audience?.groups).toEqual([{ id: 3, name: 'Группа' }]);
  });
});
