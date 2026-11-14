import { createContext } from 'react';
import type { UserContextValue } from '@/Storage/UserContext/UserContext.type';

export const UserContext = createContext<UserContextValue | undefined>(undefined);
