import { create } from 'zustand';
import { AuthRole, type UserIdentity } from '@/Assets/Types/commonTypes.ts';
import { persistActiveSchool, persistUserIdentity } from './useGlobalContext.utils';
import { USER_STORAGE_KEY } from '../UserContext/UserContext.const';

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

export const useGlobalContext = create<GlobalState>((set) => ({
    auth: {
        user: null,
        isAuthenticated: false,
        setActiveSchoolPublicId: (schoolPublicId: string) =>
            set((state) => {
                if (!state.auth.user) return state;
                const newUser: User = { ...state.auth.user, activeSchoolPublicId: schoolPublicId };

                try {
                    persistActiveSchool(newUser);
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
                const activeSchoolPublicId = res.activeSchoolPublicId || undefined;

                const user: User = {
                    userPublicId: res.userPublicId,
                    userName: res.userName,
                    roles: res.userRoles as Array<{ role: AuthRole; schoolId: number }>,
                    activeSchoolPublicId,
                    email: res.email,
                    phone: res.phone,
                };

                try {
                    persistUserIdentity(res, activeSchoolPublicId);
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
                    localStorage.removeItem(USER_STORAGE_KEY);
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
