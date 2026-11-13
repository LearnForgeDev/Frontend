import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NextRouterBridge from './NextRouterBridge';

const router = vi.hoisted(() => {
  const listeners = new Map<string, Set<() => void>>();
  return {
    asPath: '/app/schools/school/today?view=day#now',
    events: {
      on: (name: string, callback: () => void) => {
        const handlers = listeners.get(name) ?? new Set();
        handlers.add(callback);
        listeners.set(name, handlers);
      },
      off: (name: string, callback: () => void) => listeners.get(name)?.delete(callback),
      emit: (name: string) => listeners.get(name)?.forEach(callback => callback()),
    },
    push: vi.fn(),
    replace: vi.fn(),
  };
});

vi.mock('next/router', () => ({ useRouter: () => router }));

function CurrentRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  return <>
    <output data-testid="location">{JSON.stringify(location)}</output>
    <button onClick={() => navigate('../schedule?event=one#details', {
      relative: 'path',
      state: { lessonId: 'lesson' },
      preventScrollReset: true,
    })}>schedule</button>
    <button onClick={() => navigate('/auth/register', { replace: true })}>register</button>
    <button onClick={() => navigate(-1)}>back</button>
  </>;
}

function TestApplication({ initialPath = router.asPath }: { initialPath?: string }) {
  return <NextRouterBridge initialPath={initialPath}>
    <Routes><Route path="*" element={<CurrentRoute />} /></Routes>
  </NextRouterBridge>;
}

describe('NextRouterBridge', () => {
  afterEach(cleanup);
  beforeEach(() => {
    router.asPath = '/app/schools/school/today?view=day#now';
    window.history.replaceState({ key: 'first', options: { learnForgeState: { from: 'home' } } }, '', router.asPath);
    router.push.mockReset();
    router.replace.mockReset();
  });

  it('keeps the server request URL deterministic before browser hash and history are available', () => {
    const html = renderToString(<TestApplication initialPath="/auth/login?returnTo=%2Fapp" />);
    expect(html).toContain('/auth/login');
    expect(html).toContain('returnTo=%2Fapp');
    expect(html).not.toContain('#now');
    expect(html).not.toContain('home');
  });

  it('uses Next navigation for relative paths, query, fragment, state and scroll options', () => {
    render(<TestApplication />);
    expect(screen.getByTestId('location').textContent).toContain('"from":"home"');
    fireEvent.click(screen.getByRole('button', { name: 'schedule' }));
    expect(router.push).toHaveBeenCalledWith('/app/schools/school/schedule?event=one#details', undefined, {
      learnForgeState: { lessonId: 'lesson' },
      scroll: false,
      shallow: true,
    });
    fireEvent.click(screen.getByRole('button', { name: 'register' }));
    expect(router.replace).toHaveBeenCalledWith('/auth/register', undefined, { learnForgeState: undefined, scroll: false, shallow: true });
    const go = vi.spyOn(window.history, 'go').mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(go).toHaveBeenCalledWith(-1);
  });

  it('restores the Next history entry state on back, forward and fragment navigation', () => {
    render(<TestApplication />);
    act(() => {
      router.asPath = '/app/schools/school/schedule?event=two#event';
      window.history.replaceState({ key: 'restored', options: { learnForgeState: { lessonId: 'restored' } } }, '', router.asPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      router.events.emit('routeChangeComplete');
      router.events.emit('hashChangeComplete');
    });
    expect(screen.getByTestId('location').textContent).toContain('"lessonId":"restored"');
    expect(screen.getByTestId('location').textContent).toContain('"search":"?event=two"');
    expect(screen.getByTestId('location').textContent).toContain('"hash":"#event"');
    expect(screen.getByTestId('location').textContent).toContain('"key":"restored"');
  });
});
