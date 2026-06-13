import { create } from 'zustand';

export interface User {
  userPublicId: string;
  userName: string;
  roles: Array<{ role: 0 | 1 | 2; schoolId: number }>;
  activeSchoolId: number;
}

export interface LoginResponseDto {
  jwtToken: string;
  refreshToken: string;
  userName: string;
  userPublicId: string;
  userRoles: Array<{ role: number; schoolId: number; userId: number }>;
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
        return {
          auth: {
            ...state.auth,
            user: { ...state.auth.user, activeSchoolId: schoolId },
          },
        };
      }),
    setUser: (res: LoginResponseDto) =>
      set((state) => {
        let activeSchoolId = 0;
        if (res.userRoles && res.userRoles.length > 0) {
          const teacherOrOwner = res.userRoles.find((r) => r.role >= 1);
          activeSchoolId = teacherOrOwner ? teacherOrOwner.schoolId : res.userRoles[0].schoolId;
        }

        const user: User = {
          userPublicId: res.userPublicId,
          userName: res.userName,
          roles: res.userRoles as Array<{ role: 0 | 1 | 2; schoolId: number }>,
          activeSchoolId,
        };
        return {
          auth: {
            ...state.auth,
            user,
            isAuthenticated: true,
          },
        };
      }),
    logout: () =>
      set((state) => ({
        auth: {
          ...state.auth,
          user: null,
          isAuthenticated: false,
        },
      })),
  },
}));
