import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { isAxiosError } from 'axios';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { ToastSeverity, useToastStore } from '@/Storage/useToastStore';
import { SESSION_QUERY_KEY, SESSION_RESTORE_ERROR } from './useRestoreSession.const';
import { getSessionStorageSnapshot, readStoredSession } from './useRestoreSession.utils';
import { normalizeRestoredSession } from '@/Endpoints/auth/utils';

export function useRestoreSession() {
  const queryClient = useQueryClient();
  const revision = useRef(0);
  const authenticatedUserPublicId = useGlobalContext((state) => state.auth.user?.userPublicId);
  const session = useQuery<UserIdentity | null>({
    queryKey: SESSION_QUERY_KEY,
    enabled: false,
    networkMode: 'always',
    queryFn: async () => {
      const stored = getSessionStorageSnapshot();
      const requestedRevision = revision.current;
      const clearInvalidSession = () => {
        useGlobalContext.getState().auth.logout();
        return null;
      };
      if (!stored) return clearInvalidSession();
      const identity = readStoredSession(stored);
      if (!identity) return clearInvalidSession();
      const confirmedIdentity = normalizeRestoredSession(JSON.parse(stored));
      const auth = useGlobalContext.getState().auth;
      if (auth.isAuthenticated && confirmedIdentity && confirmedIdentity.userPublicId === auth.user?.userPublicId) return confirmedIdentity;
      const currentSession = () => queryClient.getQueryData<UserIdentity | null>(SESSION_QUERY_KEY) ?? null;
      const isCurrent = () => revision.current === requestedRevision && getSessionStorageSnapshot() === stored;
      try {
        const response = await authEndpoints.refreshToken({ refreshToken: identity.refreshToken });
        if (!isCurrent()) return currentSession();
        const restoredUser = normalizeRestoredSession(response);
        if (!restoredUser) return clearInvalidSession();
        const user = { ...restoredUser, activeSchoolPublicId: identity.activeSchoolPublicId };
        useGlobalContext.getState().auth.setUser(user);
        return user;
      } catch (error) {
        if (!isCurrent()) return currentSession();
        if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          return clearInvalidSession();
        }
        useToastStore.getState().addToast(SESSION_RESTORE_ERROR, ToastSeverity.ERROR);
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const { refetch } = session;
  useEffect(() => { void refetch(); }, [refetch]);

  const setUser = (user: UserIdentity) => {
    revision.current += 1;
    void queryClient.cancelQueries({ queryKey: SESSION_QUERY_KEY });
    useGlobalContext.getState().auth.setUser(user);
    queryClient.setQueryData(SESSION_QUERY_KEY, user);
  };
  const clearUser = () => {
    revision.current += 1;
    void queryClient.cancelQueries({ queryKey: SESSION_QUERY_KEY });
    useGlobalContext.getState().auth.logout();
    queryClient.setQueryData(SESSION_QUERY_KEY, null);
  };

  return {
    user: session.data?.userPublicId === authenticatedUserPublicId ? session.data ?? null : null,
    setUser,
    clearUser,
    isPending: session.isPending || session.isFetching,
    isError: session.isError,
    retry: () => void session.refetch(),
  };
}
