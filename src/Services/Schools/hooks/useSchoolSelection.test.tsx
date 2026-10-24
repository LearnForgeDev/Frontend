import { act, cleanup, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserSchoolInfo } from '@/Endpoints/schools/types';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { resolveSchoolSelection } from '../schools.selection';
import { useSchoolSelection } from './useSchoolSelection';

const mocks = vi.hoisted(() => ({ schools: vi.fn() }));
vi.mock('./useMySchools', () => ({ useMySchools: mocks.schools }));
const teacher: UserSchoolInfo = { schoolPublicId: 'teacher-school', schoolName: 'Школа преподавателя', roles: ['Teacher'] };
const student: UserSchoolInfo = { schoolPublicId: 'student-school', schoolName: 'Школа ученика', roles: ['Student'] };

function renderSelection(path: string) {
  const wrapper = ({ children }: PropsWithChildren) => <MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/app/schools/:schoolPublicId/*" element={children} />
    <Route path="*" element={children} />
  </Routes></MemoryRouter>;
  return renderHook(() => ({ selection: useSchoolSelection(), location: useLocation() }), { wrapper });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.schools.mockReturnValue({ data: [teacher, student] });
  useGlobalContext.getState().auth.setUser({
    userPublicId: 'user', userName: 'Пользователь', jwtToken: 'token', refreshToken: 'refresh', exp: 0, userRoles: [],
    activeSchoolPublicId: student.schoolPublicId,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Confirmed school selection and document navigation', () => {
  it('lets the confirmed route school override a stale stored selection and remembers it', () => {
    const { result } = renderSelection('/app/schools/teacher-school/lessons');
    expect(result.current.selection.school).toEqual(teacher);
    act(() => result.current.selection.rememberCurrentSchool());
    expect(useGlobalContext.getState().auth.user?.activeSchoolPublicId).toBe(teacher.schoolPublicId);
  });

  it('retains the stored school outside a school route and rejects an unknown route without fallback', () => {
    const profile = renderSelection('/app/profile');
    expect(profile.result.current.selection.school).toEqual(student);
    profile.unmount();
    const unknown = renderSelection('/app/schools/unknown/lessons');
    expect(unknown.result.current.selection.school).toBeUndefined();
    act(() => unknown.result.current.selection.rememberCurrentSchool());
    expect(useGlobalContext.getState().auth.user?.activeSchoolPublicId).toBe(student.schoolPublicId);
  });

  it('persists a different confirmed school before assigning a full-document URL', () => {
    const { result } = renderSelection('/app/schools/teacher-school/lessons');
    const browserWindow = window;
    const assign = vi.fn(() => expect(useGlobalContext.getState().auth.user?.activeSchoolPublicId).toBe(student.schoolPublicId));
    act(() => {
      vi.stubGlobal('window', { location: { assign } });
      result.current.selection.selectSchool(student);
      vi.stubGlobal('window', browserWindow);
    });
    expect(assign).toHaveBeenCalledWith('/app/schools/student-school/today');
    expect(result.current.location.pathname).toBe('/app/schools/teacher-school/lessons');
  });

  it('keeps same-school entry inside the app and rejects forged or roleless membership', () => {
    const { result } = renderSelection('/app/schools/teacher-school/lessons');
    act(() => result.current.selection.selectSchool({ ...teacher, schoolPublicId: 'forged' }));
    expect(result.current.location.pathname).toBe('/app/schools/teacher-school/lessons');
    act(() => result.current.selection.selectSchool(teacher));
    expect(result.current.location.pathname).toBe('/app/schools/teacher-school/today');
    const roleless = { ...teacher, roles: [] };
    mocks.schools.mockReturnValue({ data: [roleless] });
    const denied = renderSelection('/app/profile');
    act(() => denied.result.current.selection.selectSchool(roleless));
    expect(denied.result.current.selection.school).toBeUndefined();
    expect(denied.result.current.location.pathname).toBe('/app/profile');
    expect(resolveSchoolSelection({ schools: [] })).toBeUndefined();
  });
});
