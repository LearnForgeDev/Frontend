import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { UserIdentity } from '../types/commonTypes';

type UserContextValue = {
    user: UserIdentity | null;
    setUser: (user: UserIdentity) => void;
    clearUser: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<UserIdentity | null>(null);

    const setUser = useCallback((nextUser: UserIdentity) => {
        setUserState(nextUser);
    }, []);

    const clearUser = useCallback(() => {
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

