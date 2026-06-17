import { create } from 'zustand';

export interface User {
  userPublicId: string;
  userName: string;
  roles: Array<{ role: 0 | 1 | 2; schoolId: number; schoolPublicId?: string }>;
  activeSchoolId: number;
  activeSchoolPublicId?: string | null;
}

export interface LoginResponseDto {
  jwtToken: string;
  refreshToken: string;
  userName: string;
  userPublicId: string;
  userRoles: Array<{ role: number; schoolId: number; userId: number; schoolPublicId?: string }>;
}

interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  setActiveSchool: (schoolId: number) => void;
  setUser: (loginResponse: LoginResponseDto) => void;
  logout: () => void;
}

export interface GlobalState {
  auth: AuthSlice;
}

export const useGlobalContext = create<GlobalState>((set) => ({
  auth: {
    user: null,
    isAuthenticated: false,
    // TODO: add school switcher UI when needed
    setActiveSchool: (schoolId: number) =>
      set((state) => {
        if (!state.auth.user) return state;
        const newUser: User = { ...state.auth.user, activeSchoolId: schoolId };

        const matchedRole = newUser.roles.find((r) => r.schoolId === schoolId && 'schoolPublicId' in r && r.schoolPublicId);
        const publicId = matchedRole && matchedRole.schoolPublicId ? matchedRole.schoolPublicId : null;

        newUser.activeSchoolPublicId = publicId;

        try {
          if (newUser) {
            localStorage.setItem('user_identity', JSON.stringify(newUser));
          }
          if (publicId) {
            sessionStorage.setItem('currentSchoolPublicId', publicId);
          } else {
            sessionStorage.removeItem('currentSchoolPublicId');
          }
        } catch {
            console.error('Unable to retrieve currentSchoolPublicId');
        }

        return {
          auth: {
            ...state.auth,
            user: newUser,
          },
        };
      }),
    setUser: (res: LoginResponseDto) =>
      set((state) => {
        let activeSchoolId = 0;
        let activeSchoolPublicId: string | null = null;
        if (res.userRoles && res.userRoles.length > 0) {
          const teacherOrOwner = res.userRoles.find((r) => r.role >= 1);
          const chosen = teacherOrOwner ? teacherOrOwner : res.userRoles[0];
          activeSchoolId = chosen.schoolId;
          // if server provided public id for the chosen role - use it
          activeSchoolPublicId = chosen.schoolPublicId ?? null;
        }

        const user: User = {
          userPublicId: res.userPublicId,
          userName: res.userName,
          roles: res.userRoles as Array<{ role: 0 | 1 | 2; schoolId: number; schoolPublicId?: string }>,
          activeSchoolId,
          activeSchoolPublicId,
        };

        // persist user to localStorage and current school publicId to sessionStorage
        try {
          localStorage.setItem('user_identity', JSON.stringify(user));
          if (activeSchoolPublicId) {
            sessionStorage.setItem('currentSchoolPublicId', activeSchoolPublicId);
          } else {
            sessionStorage.removeItem('currentSchoolPublicId');
          }
        } catch {
          // ignore storage errors
        }

        return {
          auth: {
            ...state.auth,
            user,
            isAuthenticated: true,
          },
        };
      }),
    logout: () =>
      set((state) => {
        try {
          localStorage.removeItem('user_identity');
          sessionStorage.removeItem('currentSchoolPublicId');
        } catch {
          // ignore storage errors
        }

        return {
          auth: {
            ...state.auth,
            user: null,
            isAuthenticated: false,
          },
        };
      }),
  },
}));
