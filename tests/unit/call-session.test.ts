import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { JitsiApi, JitsiMeetExternalAPIOptions, JitsiToolbarButtonClickEvent } from '@/Services/Schools/CallsPage/CallsPage.type';
import { useCallSession } from '@/Services/Schools/CallsPage/hooks/useCallSession';
import { CUSTOM_INVITE_BUTTON_ID } from '@/Services/Schools/CallsPage/CallsPage.constants';
import { CALL_CONNECTION_ERROR, CALL_FULLSCREEN_ERROR } from '@/Services/Schools/CallsPage/hooks/useCallSession.const';

const mocks = vi.hoisted(() => ({ token: vi.fn(), load: vi.fn(), toast: vi.fn(), invite: vi.fn(), config: { meetServerUrl: '' } }));
vi.mock('@/Endpoints', () => ({ meetEndpoints: { getMeetToken: mocks.token } }));
vi.mock('@/config', () => ({ default: mocks.config }));
vi.mock('@/Services/Schools/CallsPage/utils/loadJitsiScript', () => ({ loadJitsiScript: mocks.load }));
vi.mock('@/Services/Schools/CallsPage/hooks/useBroadcastCallInvite/useBroadcastCallInvite', () => ({
  useBroadcastCallInvite: () => ({ broadcastInvite: mocks.invite }),
}));
vi.mock('@/Storage/useToastStore', () => ({
  ToastSeverity: { ERROR: 'error' },
  useToastStore: (selector: (state: { addToast: typeof mocks.toast }) => unknown) => selector({ addToast: mocks.toast }),
}));

const api = {
  dispose: vi.fn(), executeCommand: vi.fn(),
  addEventListener: vi.fn<(event: string, listener: (event: JitsiToolbarButtonClickEvent) => void) => void>(),
  registerCustomToolbarButton: vi.fn(),
} satisfies JitsiApi;
const constructor = vi.fn<(domain: string, options: JitsiMeetExternalAPIOptions) => JitsiApi>(function () {
  return api;
});
const clients = new Set<QueryClient>();
let fullscreenElement: Element | null = null;
const exitFullscreen = vi.fn();
const fullscreenDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenElement');
const exitDescriptor = Object.getOwnPropertyDescriptor(document, 'exitFullscreen');

function emit(name: string, payload: JitsiToolbarButtonClickEvent = { id: '' }) {
  const registration = api.addEventListener.mock.calls.find(([event]) => event === name);
  if (!registration) {
    throw new Error(`Listener not registered: ${name}`);
  }
  registration[1](payload);
}

function renderCall(room = 'room-one', school = 'school') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.add(client);
  const wrapper = ({ children }: PropsWithChildren) => createElement(QueryClientProvider, { client },
    createElement(MemoryRouter, { initialEntries: [`/app/schools/${school}/calls?room=${room}&title=Lesson`] }, children));
  const hook = renderHook(({ schoolId }) => ({ ...useCallSession(schoolId), location: useLocation() }), { wrapper, initialProps: { schoolId: school } });
  hook.result.current.containerRef.current = document.createElement('div');
  hook.result.current.pageRef.current = document.createElement('div');
  return hook;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.config.meetServerUrl = '';
  mocks.token.mockResolvedValue({ roomUrl: 'https://conference.invalid/room-one?jwt=meeting-token' });
  mocks.load.mockResolvedValue(undefined);
  constructor.mockImplementation(function (_domain: string, options: JitsiMeetExternalAPIOptions) {
    options.parentNode.append(document.createElement('iframe'));
    return api;
  });
  vi.stubGlobal('JitsiMeetExternalAPI', constructor);
  fullscreenElement = null;
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fullscreenElement });
  exitFullscreen.mockImplementation(() => {
    fullscreenElement = null;
    document.dispatchEvent(new Event('fullscreenchange'));
    return Promise.resolve();
  });
  Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exitFullscreen });
});

afterEach(() => {
  cleanup();
  for (const client of clients) {
    client.clear();
  }
  clients.clear();
  vi.unstubAllGlobals();
  if (fullscreenDescriptor) {
    Object.defineProperty(document, 'fullscreenElement', fullscreenDescriptor);
  } else {
    Reflect.deleteProperty(document, 'fullscreenElement');
  }
  if (exitDescriptor) {
    Object.defineProperty(document, 'exitFullscreen', exitDescriptor);
  } else {
    Reflect.deleteProperty(document, 'exitFullscreen');
  }
});

describe('Meeting authorization, recovery and client disposal', () => {
  it('creates the authorized room, sends selected invitations and disposes listeners on leave', async () => {
    const hook = renderCall();
    await waitFor(() => expect(constructor).toHaveBeenCalledOnce());
    expect(mocks.token).toHaveBeenCalledWith({ schoolPublicId: 'school', room: 'room-one' });
    expect(constructor).toHaveBeenCalledWith('conference.invalid', expect.objectContaining({ roomName: 'room-one', jwt: 'meeting-token', lang: 'ru' }));
    act(() => emit('videoConferenceJoined'));
    expect(api.registerCustomToolbarButton).toHaveBeenCalledWith(expect.objectContaining({ id: CUSTOM_INVITE_BUTTON_ID }));
    act(() => emit('customToolbarButtonClicked', { id: 'unrelated' }));
    expect(hook.result.current.isInviteDialogOpen).toBe(false);
    act(() => emit('customToolbarButtonClicked', { id: CUSTOM_INVITE_BUTTON_ID }));
    expect(hook.result.current.isInviteDialogOpen).toBe(true);
    act(() => hook.result.current.sendInvite(['student']));
    expect(mocks.invite).toHaveBeenCalledWith({ room: 'room-one', title: 'Lesson', recipientUserPublicIds: ['student'] });
    expect(hook.result.current.isInviteDialogOpen).toBe(false);
    const container = hook.result.current.containerRef.current;
    act(() => emit('videoConferenceLeft'));
    expect(hook.result.current.location.pathname).toBe('/app/schools/school/today');
    expect(api.dispose).toHaveBeenCalledOnce();
    expect(container?.childNodes.length).toBe(0);
    act(() => emit('customToolbarButtonClicked', { id: CUSTOM_INVITE_BUTTON_ID }));
    expect(hook.result.current.isInviteDialogOpen).toBe(false);
  });

  it('does not request access for an empty room and closes only its call query parameters', () => {
    const { result } = renderCall('');
    act(() => result.current.openInvite());
    act(() => result.current.sendInvite(['student']));
    expect(mocks.token).not.toHaveBeenCalled();
    expect(mocks.invite).not.toHaveBeenCalled();
    act(() => result.current.closeInvite());
    act(() => result.current.close());
    expect(result.current.location.search).toBe('');
    expect(result.current.location.pathname).toBe('/app/schools/school/calls');
  });

  it('retries failed authorization and rejects a response without a room name', async () => {
    mocks.token.mockResolvedValueOnce({ roomUrl: 'https://conference.invalid/' });
    const { result } = renderCall();
    await waitFor(() => expect(result.current.callError).toBe(CALL_CONNECTION_ERROR));
    expect(constructor).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(CALL_CONNECTION_ERROR, 'error');
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isConnected).toBe(true));
    expect(constructor).toHaveBeenCalledOnce();
  });

  it('cleans up a partially initialized client and recovers after setup failure', async () => {
    api.addEventListener.mockImplementationOnce(() => {
      throw new Error('client failed');
    });
    const { result } = renderCall();
    await waitFor(() => expect(result.current.callError).toBe(CALL_CONNECTION_ERROR));
    expect(api.dispose).toHaveBeenCalledOnce();
    expect(result.current.containerRef.current?.childNodes.length).toBe(0);
    act(() => result.current.retry());
    await waitFor(() => expect(constructor).toHaveBeenCalledTimes(2));
    expect(result.current.isConnected).toBe(true);
  });

  it('disposes the previous school session and prevents stale authorization from mounting a client', async () => {
    const hook = renderCall();
    await waitFor(() => expect(constructor).toHaveBeenCalledOnce());
    hook.rerender({ schoolId: 'other-school' });
    await waitFor(() => expect(mocks.token).toHaveBeenCalledWith({ schoolPublicId: 'other-school', room: 'room-one' }));
    expect(api.dispose).toHaveBeenCalledOnce();
    await waitFor(() => expect(constructor).toHaveBeenCalledTimes(2));
    hook.unmount();
    expect(api.dispose).toHaveBeenCalledTimes(2);
    let resolveToken: (value: { roomUrl: string }) => void = () => undefined;
    mocks.token.mockImplementationOnce(() => new Promise(resolve => {
      resolveToken = resolve;
    }));
    const pending = renderCall('late-room');
    pending.unmount();
    await act(async () => {
      resolveToken({ roomUrl: 'https://conference.invalid/late-room' });
      await Promise.resolve();
    });
    expect(constructor).toHaveBeenCalledTimes(2);
    expect(mocks.toast).not.toHaveBeenCalled();
  });

  it('tracks fullscreen changes and reports a rejected fullscreen operation without losing the meeting', async () => {
    const { result } = renderCall();
    await waitFor(() => expect(constructor).toHaveBeenCalledOnce());
    const page = result.current.pageRef.current;
    Object.defineProperty(page, 'requestFullscreen', { configurable: true, value: vi.fn(() => {
      fullscreenElement = page;
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    }) });
    await act(async () => {
      await result.current.toggleFullscreen();
    });
    expect(result.current.isFullscreen).toBe(true);
    await act(async () => {
      await result.current.toggleFullscreen();
    });
    expect(result.current.isFullscreen).toBe(false);
    exitFullscreen.mockRejectedValueOnce(new Error('denied'));
    fullscreenElement = page;
    await act(async () => {
      await result.current.toggleFullscreen();
    });
    expect(mocks.toast).toHaveBeenCalledWith(CALL_FULLSCREEN_ERROR, 'error');
    expect(result.current.isConnected).toBe(true);
    act(() => emit('videoConferenceLeft'));
    await waitFor(() => expect(result.current.location.pathname).toBe('/app/schools/school/today'));
  });
});
