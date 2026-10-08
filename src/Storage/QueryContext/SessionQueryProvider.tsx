import type { ReactNode } from 'react';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import QuerySession from './QuerySession';

export default function SessionQueryProvider({ children }: { children: ReactNode }) {
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId);
  return <QuerySession key={userPublicId ?? ''}>{children}</QuerySession>;
}
