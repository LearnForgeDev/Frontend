import { type ReactNode } from 'react';

import { useRestoreSession } from '@/Services/Auth/hooks/useRestoreSession/useRestoreSession';

import { UserContext } from '@/Services/Auth/UserContext.context';

export function UserProvider({ children }: { children: ReactNode }) {
    const { user, setUser, clearUser, isPending, isError, retry } = useRestoreSession();

    return <UserContext.Provider value={{ user, setUser, clearUser, isRestoring: isPending, isRestoreError: isError, retryRestore: retry }}>{children}</UserContext.Provider>;
}
