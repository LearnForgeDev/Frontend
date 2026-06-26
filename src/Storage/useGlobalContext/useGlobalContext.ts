import { create } from 'zustand';

export interface User {
    userPublicId: string;
    userName: string;
    roles: Array<{ role: 0 | 1 | 2; schoolId: number }>;
    activeSchoolId: number;
}

import type { UserIdentity } from '@/Assets/Types/commonTypes.ts';

interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
    setActiveSchool: (schoolId: number) => void;
    setUser: (userIdentity: UserIdentity) => void;
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

                try {
                    localStorage.setItem('user_identity', JSON.stringify(newUser));
                } catch {
                    console.error('Failed to persist user to localStorage');
                }

                return {
                    auth: {
                        ...state.auth,
                        user: newUser,
                    },
                };
            }),
        setUser: (res: UserIdentity) =>
            set((state) => {
                let activeSchoolId = 0;
                if (res.userRoles && res.userRoles.length > 0) {
                    const teacherOrOwner = res.userRoles.find((r) => r.role >= 1);
                    const chosen = teacherOrOwner ? teacherOrOwner : res.userRoles[0];
                    activeSchoolId = chosen.schoolId;
                }

                const user: User = {
                    userPublicId: res.userPublicId,
                    userName: res.userName,
                    roles: res.userRoles as Array<{ role: 0 | 1 | 2; schoolId: number }>,
                    activeSchoolId,
                };

                // persist user to localStorage
                try {
                    localStorage.setItem('user_identity', JSON.stringify(user));
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
