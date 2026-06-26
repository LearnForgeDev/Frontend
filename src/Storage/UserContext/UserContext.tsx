import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { UserIdentity } from '@/Assets/Types/commonTypes.ts';

export const USER_STORAGE_KEY = 'user_identity';

type UserContextValue = {
    user: UserIdentity | null;
    setUser: (user: UserIdentity) => void;
    clearUser: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<UserIdentity | null>(() => {
        try {
            const stored = localStorage.getItem(USER_STORAGE_KEY);
            return stored ? (JSON.parse(stored) as UserIdentity) : null;
        } catch (err) {
            console.error('Failed to parse stored user identity:', err);
            return null;
        }
    });

    const setUser = useCallback((nextUser: UserIdentity) => {
        try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        } catch (err) {
            console.error('Failed to persist user identity to localStorage:', err);
        }
        setUserState(nextUser);
    }, []);

    const clearUser = useCallback(() => {
        try {
            localStorage.removeItem(USER_STORAGE_KEY);
        } catch (err) {
            console.error('Failed to remove user identity from localStorage:', err);
        }
        setUserState(null);
    }, []);

    const value = useMemo<UserContextValue>(
        () => ({
            user,
            setUser,
            clearUser,
        }),
        [user, setUser, clearUser],
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser(): UserContextValue {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }

    return context;
}

