import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { filesEndpoints } from '@/Endpoints';
import AuthenticatedImage from '@/Assets/Components/AuthenticatedImage/AuthenticatedImage';
import ChatMessageAttachments from '@/Services/Chat/components/ChatThreadView/ChatMessageAttachments';
import ChatInput from '@/Services/Chat/components/ChatThreadView/ChatInput';

const endpoints = vi.hoisted(() => ({ blob: vi.fn<typeof filesEndpoints.getFileBlob>(), list: vi.fn<typeof filesEndpoints.listFiles>(), error: vi.fn() }));
vi.mock('@/Endpoints', () => ({ filesEndpoints: { getFileBlob: endpoints.blob, listFiles: endpoints.list } }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: endpoints.error }) }));
const clients = new Set<QueryClient>();

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('URL', class extends URL {
    static override createObjectURL = vi.fn(() => 'blob:protected');
    static override revokeObjectURL = vi.fn();
  });
  endpoints.list.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  clients.forEach(client => client.clear());
  clients.clear();
  vi.unstubAllGlobals();
});

it('loads a protected image with school credentials and revokes its blob URL on unmount', async () => {
  endpoints.blob.mockResolvedValue(new Blob(['image']));
  const click = vi.fn();
  const view = render(createElement(AuthenticatedImage, { schoolPublicId: 'school', filePublicId: 'image', alt: 'Задание', onClick: click }));
  expect(screen.queryByRole('img')).toBeNull();
  const image = await screen.findByRole('img', { name: 'Задание' });
  expect(endpoints.blob).toHaveBeenCalledWith('school', 'image');
  expect(image.getAttribute('src')).toBe('blob:protected');
  fireEvent.click(image);
  expect(click).toHaveBeenCalledOnce();
  view.unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:protected');
});

it('ignores a protected image response that arrives after unmount', async () => {
  let complete: (blob: Blob) => void = () => {
    throw new Error('The image request has not started');
  };
  endpoints.blob.mockImplementation(() => new Promise(resolve => {
    complete = resolve;
  }));
  const view = render(createElement(AuthenticatedImage, { schoolPublicId: 'school', filePublicId: 'image' }));
  view.unmount();
  await act(async () => {
    complete(new Blob(['late image']));
  });
  expect(URL.createObjectURL).not.toHaveBeenCalled();
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
});

it('shows an unavailable image for missing authorization context or a rejected download', async () => {
  const view = render(createElement(AuthenticatedImage, { schoolPublicId: '', filePublicId: 'image' }));
  expect(screen.getByTestId('BrokenImageIcon')).toBeTruthy();
  expect(endpoints.blob).not.toHaveBeenCalled();
  view.unmount();
  endpoints.blob.mockRejectedValueOnce(new Error('forbidden'));
  render(createElement(AuthenticatedImage, { schoolPublicId: 'school', filePublicId: 'image' }));
  expect(await screen.findByTestId('BrokenImageIcon')).toBeTruthy();
  expect(screen.queryByRole('img')).toBeNull();
});

it('previews image attachments and downloads document attachments using confirmed IDs', async () => {
  endpoints.blob.mockResolvedValue(new Blob(['image']));
  const onPreview = vi.fn();
  const onDownload = vi.fn();
  const props = { schoolPublicId: 'school', onPreview, onDownload };
  const view = render(createElement(ChatMessageAttachments, { ...props, files: [] }));
  expect(screen.queryByRole('button')).toBeNull();
  view.rerender(createElement(ChatMessageAttachments, { ...props, compact: true, files: [
    { publicId: 'image', fileName: 'photo.PNG' }, { publicId: 'document', fileName: 'Задание.pdf' },
  ] }));
  fireEvent.click(await screen.findByRole('img', { name: 'photo.PNG' }));
  expect(onPreview).toHaveBeenCalledWith('image');
  fireEvent.click(screen.getByRole('button', { name: 'Задание.pdf' }));
  expect(onDownload).toHaveBeenCalledWith('document', 'Задание.pdf');
});

it('keeps a failed chat draft editable, retries it and preserves Shift+Enter and composition', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.add(client);
  const onSendMessage = vi.fn<(text: string, ids?: string[]) => Promise<void>>().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
  render(createElement(QueryClientProvider, { client }, createElement(ChatInput, { schoolPublicId: '', draftKey: 'chat', onSendMessage })));
  const input = screen.getByTestId('chat-message-input');
  fireEvent.change(input, { target: { value: '  Привет  ' } });
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
  expect(onSendMessage).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(input).toHaveProperty('value', '  Привет  ');
  expect(onSendMessage).toHaveBeenCalledWith('Привет', []);
  fireEvent.click(screen.getByTestId('chat-send-retry'));
  await waitFor(() => expect(input).toHaveProperty('value', ''));
  expect(onSendMessage).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('alert')).toBeNull();
});
