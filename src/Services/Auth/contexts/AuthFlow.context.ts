import { createContext } from 'react';
import type { useAuthForm } from '../hooks/useAuthForm/useAuthForm';

export const AuthFlowContext = createContext<ReturnType<typeof useAuthForm> | null>(null);
