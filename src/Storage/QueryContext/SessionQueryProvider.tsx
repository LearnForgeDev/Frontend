import type { ReactNode } from 'react';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import QuerySession from './QuerySession';
import ApplicationProvider from '@/Assets/Components/ApplicationProvider/ApplicationProvider';

export default function SessionQueryProvider({ children }: { children: ReactNode }) {
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId);
  return <QuerySession key={userPublicId ?? ''}><ApplicationProvider>{children}</ApplicationProvider></QuerySession>;
}
