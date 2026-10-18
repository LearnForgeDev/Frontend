import { createContext, useContext, type ReactNode } from 'react';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import RouteLoadingFallback from '@/Router/RouteLoadingFallback';
import SessionRestoreError from '@/Services/Auth/Components/SessionRestoreError/SessionRestoreError';
import { useRestoreSession } from '@/Services/Auth/hooks/useRestoreSession/useRestoreSession';

export { USER_STORAGE_KEY } from './UserContext.const';

type UserContextValue = {
    user: UserIdentity | null;
    setUser: (user: UserIdentity) => void;
    clearUser: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { user, setUser, clearUser, isPending, isError, retry } = useRestoreSession();

    if (isPending) return <RouteLoadingFallback />;
    if (isError) return <SessionRestoreError onRetry={retry} />;

    return <UserContext.Provider value={{ user, setUser, clearUser }}>{children}</UserContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser(): UserContextValue {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }

    return context;
}

