import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { UserIdentity } from '../types/commonTypes';

const storageKey = 'userIdentity';

function readStoredUser(): UserIdentity | null {
    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
            return null;
        }

        const parsed = JSON.parse(stored) as UserIdentity;
        if (!parsed?.jwtToken || !parsed?.refreshToken || !parsed?.userName || !parsed?.userPublicId) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function writeStoredUser(user: UserIdentity | null) {
    try {
        if (!user) {
            localStorage.removeItem(storageKey);
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify(user));
    } catch {
        // Ignore storage errors.
    }
}

type UserContextValue = {
    user: UserIdentity | null;
    setUser: (user: UserIdentity) => void;
    clearUser: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<UserIdentity | null>(() => readStoredUser());

    const setUser = useCallback((nextUser: UserIdentity) => {
        setUserState(nextUser);
        writeStoredUser(nextUser);
    }, []);

    const clearUser = useCallback(() => {
        setUserState(null);
        writeStoredUser(null);
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
