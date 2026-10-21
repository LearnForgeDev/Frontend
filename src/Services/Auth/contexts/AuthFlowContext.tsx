import type { ReactNode } from 'react';
import { useAuthForm } from '../hooks/useAuthForm/useAuthForm';
import { AuthFlowContext } from './AuthFlow.context';

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const form = useAuthForm();
  return <AuthFlowContext.Provider value={form}>{children}</AuthFlowContext.Provider>;
}
