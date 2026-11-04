import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { createPath, parsePath, Router, type Navigator } from 'react-router-dom';
import { useRouter } from 'next/router';

function getHistorySnapshot(): unknown {
  return window.history.state;
}

function getServerHistorySnapshot(): null {
  return null;
}

function getLocationState(history: unknown): unknown {
  if (!history || typeof history !== 'object' || !('options' in history)) return null;
  const options = history.options;
  return options && typeof options === 'object' && 'learnForgeState' in options
    ? options.learnForgeState
    : null;
}

export default function NextRouterBridge({ children, initialPath }: { children: ReactNode; initialPath: string }) {
  const router = useRouter();
  const subscribe = useMemo(() => (onChange: () => void) => {
    router.events.on('routeChangeComplete', onChange);
    router.events.on('hashChangeComplete', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      router.events.off('routeChangeComplete', onChange);
      router.events.off('hashChangeComplete', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, [router.events]);
  const path = useSyncExternalStore(subscribe, () => router.asPath, () => initialPath);
  const history = useSyncExternalStore(subscribe, getHistorySnapshot, getServerHistorySnapshot);
  const navigator = useMemo<Navigator>(() => ({
    createHref: (to) => typeof to === 'string' ? to : createPath(to),
    go: (delta) => window.history.go(delta),
    push: (to, state) => {
      const navigation = { learnForgeState: state, scroll: false, shallow: true };
      void router.push(typeof to === 'string' ? to : createPath(to), undefined, navigation);
    },
    replace: (to, state) => {
      const navigation = { learnForgeState: state, scroll: false, shallow: true };
      void router.replace(typeof to === 'string' ? to : createPath(to), undefined, navigation);
    },
  }), [router]);
  const key = history && typeof history === 'object' && 'key' in history && typeof history.key === 'string'
    ? history.key
    : 'default';

  return <Router location={{ ...parsePath(path), state: getLocationState(history), key }} navigator={navigator}>{children}</Router>;
}
