import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const session = useQuery<UserIdentity | null>({
    queryKey: SESSION_QUERY_KEY,
    networkMode: 'always',
    queryFn: async () => {
      const stored = getSessionStorageSnapshot();
      const clearInvalidSession = () => {
        useGlobalContext.getState().auth.logout();
        return null;
      };
      if (!stored) return clearInvalidSession();
      const identity = readStoredSession(stored);
      if (!identity) return clearInvalidSession();
      const currentSession = () => queryClient.getQueryData<UserIdentity | null>(SESSION_QUERY_KEY) ?? null;
      try {
        const response = await authEndpoints.refreshToken({ refreshToken: identity.refreshToken });
        if (getSessionStorageSnapshot() !== stored) return currentSession();
        const restoredUser = normalizeRestoredSession(response);
        if (!restoredUser) return clearInvalidSession();
        const user = { ...restoredUser, activeSchoolPublicId: identity.activeSchoolPublicId };
        useGlobalContext.getState().auth.setUser(user);
        return user;
      } catch (error) {
        if (getSessionStorageSnapshot() !== stored) return currentSession();
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

  const setUser = (user: UserIdentity) => {
    useGlobalContext.getState().auth.setUser(user);
    queryClient.setQueryData(SESSION_QUERY_KEY, user);
  };
  const clearUser = () => {
    useGlobalContext.getState().auth.logout();
    queryClient.setQueryData(SESSION_QUERY_KEY, null);
  };

  return {
    user: session.data ?? null,
    setUser,
    clearUser,
    isPending: session.isPending || session.isFetching,
    isError: session.isError,
    retry: () => void session.refetch(),
  };
}
