import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ApiFile, filesEndpoints } from '@/Endpoints';
import FileSelectorModal from '@/Services/Chat/components/FileSelectorModal/FileSelectorModal';

const endpoints = vi.hoisted(() => ({ listFiles: vi.fn(), uploadFileDirectPipeline: vi.fn<typeof filesEndpoints.uploadFileDirectPipeline>() }));
vi.mock('@/Endpoints', () => ({ filesEndpoints: endpoints }));
const clients = new Set<QueryClient>();

function file(fileName: string, sizeBytes = 2048): ApiFile {
  return { publicId: fileName, fileName, sizeBytes, storageKey: `files/${fileName}`, uploadedAt: '2026-11-14T10:00:00Z' };
}

function renderSelector() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.add(client);
  const onSelectFiles = vi.fn();
  const onClose = vi.fn();
  render(createElement(QueryClientProvider, { client }, createElement(FileSelectorModal, {
    open: true, schoolPublicId: 'school', onSelectFiles, onClose,
  })));
  return { onSelectFiles, onClose };
}

function uploadInput(): HTMLInputElement {
  const input = screen.getByRole('dialog').querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('The file selection input is missing');
  }
  return input;
}

beforeEach(() => {
  endpoints.listFiles.mockReset();
  endpoints.uploadFileDirectPipeline.mockReset();
  endpoints.listFiles.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  clients.forEach(client => client.clear());
  clients.clear();
});

it('filters documents, searches filenames and attaches only the selected stable file identities', async () => {
  const fixtures = ['photo.png', 'paper.pdf', 'notes.md', 'sheet.docx', 'pack.zip', 'song.mp3', 'clip.mp4', 'opaque.bin'];
  endpoints.listFiles.mockResolvedValue(fixtures.map(name => file(name, name === 'opaque.bin' ? 0 : 2048)));
  const callbacks = renderSelector();
  await screen.findByText('paper.pdf');
  expect(endpoints.listFiles).toHaveBeenCalledWith('school', 'files,chats');
  expect(screen.getByText('0 Б')).toBeTruthy();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Тип файла' }));
  fireEvent.click(screen.getByRole('option', { name: 'Документы' }));
  expect(screen.getByText('paper.pdf')).toBeTruthy();
  expect(screen.getByText('notes.md')).toBeTruthy();
  expect(screen.getByText('sheet.docx')).toBeTruthy();
  expect(screen.queryByText('photo.png')).toBeNull();
  fireEvent.change(screen.getByPlaceholderText('Поиск файлов...'), { target: { value: 'PAPER' } });
  expect(screen.queryByText('notes.md')).toBeNull();
  fireEvent.click(screen.getByText('paper.pdf'));
  fireEvent.click(screen.getByText('paper.pdf'));
  expect(screen.getByRole('button', { name: 'Прикрепить (0)' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByText('paper.pdf'));
  fireEvent.click(screen.getByRole('button', { name: 'Прикрепить (1)' }));
  expect(callbacks.onSelectFiles).toHaveBeenCalledWith([{ publicId: 'paper.pdf', fileName: 'paper.pdf' }]);
  expect(callbacks.onClose).toHaveBeenCalledOnce();
  expect(screen.getByPlaceholderText('Поиск файлов...')).toHaveProperty('value', '');
  fireEvent.change(screen.getByPlaceholderText('Поиск файлов...'), { target: { value: 'missing-file' } });
  expect(screen.getByText('Файлы по вашему запросу не найдены.')).toBeTruthy();
});

it('distinguishes an empty school from an unmatched search and ignores empty upload input', async () => {
  const view = renderSelector();
  await screen.findByText('Файлы еще не загружены.');
  fireEvent.change(uploadInput(), { target: { files: [] } });
  expect(endpoints.uploadFileDirectPipeline).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
  expect(view.onClose).toHaveBeenCalledOnce();
});

it('keeps an upload pending through publication and automatically selects its confirmed file', async () => {
  let finish: () => void = () => undefined;
  endpoints.uploadFileDirectPipeline.mockImplementation((_school, selected, _name, _bucket, _users, _groups, progress) => new Promise<ApiFile>(resolve => {
    if (!(selected instanceof File)) {
      throw new Error('The file selector must upload the selected File');
    }
    progress?.(40);
    finish = () => resolve(file(selected.name));
  }));
  const callbacks = renderSelector();
  await screen.findByText('Файлы еще не загружены.');
  const input = uploadInput();
  fireEvent.change(input, { target: { files: [new File(['image'], 'new.png', { type: 'image/png' })] } });
  await screen.findByRole('button', { name: 'Отменить' });
  expect(input.hasAttribute('disabled')).toBe(true);
  expect(screen.getByText(/40%/)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Прикрепить (0)' }).hasAttribute('disabled')).toBe(true);
  await act(async () => finish());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Прикрепить (1)' }).hasAttribute('disabled')).toBe(false));
  expect(input.hasAttribute('disabled')).toBe(false);
  expect(endpoints.uploadFileDirectPipeline.mock.calls[0]?.[3]).toBe('chats');
  fireEvent.click(screen.getByRole('button', { name: 'Прикрепить (1)' }));
  expect(callbacks.onSelectFiles).toHaveBeenCalledWith([{ publicId: 'new.png', fileName: 'new.png' }]);
});

it('cancels the actual upload request without publishing or selecting a failed attachment', async () => {
  let uploadSignal: AbortSignal | undefined;
  endpoints.uploadFileDirectPipeline.mockImplementation((_school, _file, _name, _bucket, _users, _groups, _progress, signal) => new Promise<ApiFile>((_resolve, reject) => {
    uploadSignal = signal;
    signal?.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true });
  }));
  const callbacks = renderSelector();
  await screen.findByText('Файлы еще не загружены.');
  fireEvent.change(uploadInput(), { target: { files: [new File(['data'], 'cancelled.txt')] } });
  fireEvent.click(await screen.findByRole('button', { name: 'Отменить' }));
  await screen.findByText('Загрузка отменена');
  expect(uploadSignal?.aborted).toBe(true);
  expect(screen.getByRole('button', { name: 'Прикрепить (0)' }).hasAttribute('disabled')).toBe(true);
  expect(callbacks.onSelectFiles).not.toHaveBeenCalled();
});

it('keeps a failed upload visible and lets the user close without attaching it', async () => {
  endpoints.uploadFileDirectPipeline.mockRejectedValue(new Error('Storage unavailable'));
  const callbacks = renderSelector();
  await screen.findByText('Файлы еще не загружены.');
  fireEvent.change(uploadInput(), { target: { files: [new File(['data'], 'failed.txt')] } });
  await screen.findByText('Ошибка загрузки файла');
  expect(uploadInput().hasAttribute('disabled')).toBe(false);
  expect(screen.getByRole('button', { name: 'Прикрепить (0)' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
  expect(callbacks.onClose).toHaveBeenCalledOnce();
  expect(callbacks.onSelectFiles).not.toHaveBeenCalled();
});
