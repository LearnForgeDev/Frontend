import { create } from 'zustand';

export interface User {
    userPublicId: string;
    userName: string;
    roles: Array<{ role: 0 | 1 | 2; schoolId: number }>;
    activeSchoolId: number;
    activeSchoolPublicId?: string;
    email?: string;
    phone?: string;
}

import type { UserIdentity } from '@/Assets/Types/commonTypes.ts';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('useGlobalContext');


interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
    setActiveSchool: (schoolId: number) => void;
    setActiveSchoolPublicId: (schoolPublicId: string) => void;
    setUser: (userIdentity: UserIdentity) => void;
    logout: () => void;
}

export interface GlobalState {
    auth: AuthSlice;
}

const getInitialUser = (): User | null => {
    try {
        const stored = localStorage.getItem('user_identity');
        if (!stored) return null;
        const data = JSON.parse(stored);
        const userPublicId = data.userPublicId;
        const userName = data.userName;
        if (!userPublicId || !userName) return null;

        const roles = (data.roles || data.userRoles || []) as Array<{ role: number; schoolId: number }>;
        let activeSchoolId = data.activeSchoolId || 0;
        const activeSchoolPublicId = data.activeSchoolPublicId || undefined;
        if (!activeSchoolId && roles.length > 0) {
            const teacherOrOwner = roles.find((r) => r.role >= 1);
            const chosen = teacherOrOwner ? teacherOrOwner : roles[0];
            activeSchoolId = chosen.schoolId;
        }

        return {
            userPublicId,
            userName,
            roles: roles.map((r) => ({ role: r.role as 0 | 1 | 2, schoolId: r.schoolId })),
            activeSchoolId,
            activeSchoolPublicId,
            email: data.email,
            phone: data.phone,
        };
    } catch {
        return null;
    }
};

const initialUser = getInitialUser();

export const useGlobalContext = create<GlobalState>((set) => ({
    auth: {
        user: initialUser,
        isAuthenticated: !!initialUser,
        // TODO: add school switcher UI when needed
        setActiveSchool: (schoolId: number) =>
            set((state) => {
                if (!state.auth.user) return state;
                const newUser: User = { ...state.auth.user, activeSchoolId: schoolId };

                try {
                    localStorage.setItem('user_identity', JSON.stringify(newUser));
                } catch {
                    logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to persist user to localStorage');
                }

                return {
                    auth: {
                        ...state.auth,
                        user: newUser,
                    },
                };
            }),
        setActiveSchoolPublicId: (schoolPublicId: string) =>
            set((state) => {
                if (!state.auth.user) return state;
                const newUser: User = { ...state.auth.user, activeSchoolPublicId: schoolPublicId };

                try {
                    localStorage.setItem('user_identity', JSON.stringify(newUser));
                } catch {
                    logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to persist user to localStorage');
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
                    email: res.email,
                    phone: res.phone,
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
