import { create } from 'zustand';
import { AuthRole, type UserIdentity } from '@/Assets/Types/commonTypes.ts';

export interface User {
    userPublicId: string;
    userName: string;
    roles: Array<{ role: AuthRole; schoolId: number }>;
    activeSchoolPublicId?: string;
    email?: string;
    phone?: string;
}

import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('useGlobalContext');


interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
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
        const activeSchoolPublicId = data.activeSchoolPublicId || undefined;

        return {
            userPublicId,
            userName,
            roles: roles.map((r) => ({ role: r.role as AuthRole, schoolId: r.schoolId })),
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
                const activeSchoolPublicId = (res as unknown as { activeSchoolPublicId?: string }).activeSchoolPublicId || undefined;

                const user: User = {
                    userPublicId: res.userPublicId,
                    userName: res.userName,
                    roles: res.userRoles as Array<{ role: AuthRole; schoolId: number }>,
                    activeSchoolPublicId,
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

