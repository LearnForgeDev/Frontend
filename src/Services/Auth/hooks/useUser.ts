import { UserContext } from '@/Services/Auth/UserContext.context';
import type { UserContextValue } from '@/Storage/UserContext/UserContext.type';
import { useContext } from 'react';

export function useUser(): UserContextValue {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }

    return context;
}
