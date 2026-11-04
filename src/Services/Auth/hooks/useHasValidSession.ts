import { useSyncExternalStore } from 'react';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

function getSessionValidity() {
  const auth = useGlobalContext.getState().auth;
  return auth.isAuthenticated && auth.jwtExpiresAt !== null && auth.jwtExpiresAt > Date.now();
}

function getServerValidity() {
  return false;
}

export function useHasValidSession() {
  return useSyncExternalStore(useGlobalContext.subscribe, getSessionValidity, getServerValidity);
}
