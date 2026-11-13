import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { $createParagraphNode, $createTextNode, $getRoot, $nodesOfType, createEditor } from 'lexical';
import { LexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FileNode } from '@/Services/Lessons/components/TextEditorComponents/nodes/FileNode';
import { YouTubeNode } from '@/Services/Lessons/components/TextEditorComponents/nodes/YoutubeNode';
import { RutubeNode } from '@/Services/Lessons/components/TextEditorComponents/nodes/RutubeNode';
import InsertFileModal from '@/Services/Lessons/components/TextEditorComponents/ui/modals/InsertFileModal';
import InsertVideoModal from '@/Services/Lessons/components/TextEditorComponents/ui/modals/InsertVideoModal';
import type { filesEndpoints } from '@/Endpoints';

const endpoints = vi.hoisted(() => ({ upload: vi.fn<typeof filesEndpoints.uploadFileMultipart>(), getFileUrl: vi.fn<typeof filesEndpoints.getFileUrl>() }));
vi.mock('@/Endpoints', () => ({ filesEndpoints: { uploadFileMultipart: endpoints.upload, getFileUrl: endpoints.getFileUrl } }));
let editor: ReturnType<typeof createEditor>;

beforeEach(() => {
  vi.resetAllMocks();
  editor = createEditor({ namespace: 'attachment-test', nodes: [FileNode, YouTubeNode, RutubeNode], onError: error => {
    throw error;
  } });
  editor.update(() => {
    const paragraph = $createParagraphNode().append($createTextNode('Урок'));
    $getRoot().append(paragraph);
    paragraph.selectEnd();
  }, { discrete: true });
  endpoints.getFileUrl.mockReturnValue('/protected/uploaded');
});

afterEach(() => cleanup());

function renderFileModal(path = '/app/schools/school/lessons') {
  const onClose = vi.fn();
  render(createElement(LexicalComposerContext.Provider, { value: [editor, { getTheme: () => null }] },
    createElement(MemoryRouter, { initialEntries: [path] }, createElement(Routes, null,
      createElement(Route, { path: '/app/schools/:schoolPublicId/lessons', element: createElement(InsertFileModal, { onClose }) }),
      createElement(Route, { path: '/missing', element: createElement(InsertFileModal, { onClose }) }),
    )),
  ));
  const input = document.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('The attachment input is missing');
  }
  return { onClose, input };
}

it('uploads a lesson attachment before inserting its confirmed identity and closing', async () => {
  let completeUpload: (file: Awaited<ReturnType<typeof filesEndpoints.uploadFileMultipart>>) => void = () => {
    throw new Error('Upload has not started');
  };
  endpoints.upload.mockImplementation(() => new Promise(resolve => {
    completeUpload = resolve;
  }));
  const { onClose, input } = renderFileModal();
  const file = new File(['document'], 'Урок.pdf', { type: 'application/pdf' });
  fireEvent.change(input, { target: { files: [file] } });
  expect(await screen.findByText('Загрузка...')).toBeTruthy();
  expect(input.disabled).toBe(true);
  expect(onClose).not.toHaveBeenCalled();
  expect(endpoints.upload).toHaveBeenCalledWith('school', file, undefined, undefined, 'lessons');
  await act(async () => {
    completeUpload({ publicId: 'confirmed', fileName: file.name, sizeBytes: file.size, storageKey: 'files/confirmed', uploadedAt: '2026-11-14T10:00:00Z' });
  });
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(endpoints.getFileUrl).toHaveBeenCalledWith('school', 'confirmed');
  editor.getEditorState().read(() => {
    expect($nodesOfType(FileNode).map(node => node.exportJSON())).toEqual([
      { type: 'file', version: 1, fileName: file.name, url: '/protected/uploaded', sizeBytes: file.size },
    ]);
  });
});

it('retains the attachment modal on upload failure and retries through drag and drop', async () => {
  endpoints.upload.mockRejectedValueOnce(new Error('storage offline'));
  const { input, onClose } = renderFileModal();
  fireEvent.change(input, { target: { files: [] } });
  expect(endpoints.upload).not.toHaveBeenCalled();
  const file = new File(['data'], 'lesson.txt');
  fireEvent.change(input, { target: { files: [file] } });
  expect(await screen.findByText('Ошибка при загрузке файла')).toBeTruthy();
  expect(input.disabled).toBe(false);
  expect(onClose).not.toHaveBeenCalled();
  endpoints.upload.mockResolvedValueOnce({ publicId: 'confirmed', fileName: file.name, sizeBytes: file.size, storageKey: 'files/confirmed', uploadedAt: '2026-11-14T10:00:00Z' });
  const area = screen.getByText('Перетащите или нажмите').parentElement;
  if (!area) {
    throw new Error('The attachment drop target is missing');
  }
  fireEvent.dragOver(area);
  expect(area.classList.contains('dragging')).toBe(true);
  fireEvent.dragLeave(area);
  expect(area.classList.contains('dragging')).toBe(false);
  fireEvent.drop(area, { dataTransfer: { files: [file] } });
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(screen.queryByText('Ошибка при загрузке файла')).toBeNull();
});

it('rejects an attachment when no school is selected', async () => {
  const { input, onClose } = renderFileModal('/missing');
  fireEvent.change(input, { target: { files: [new File(['data'], 'lesson.pdf')] } });
  expect(await screen.findByText('Не удалось определить ID школы для загрузки')).toBeTruthy();
  expect(endpoints.upload).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it.each([
  ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
  ['https://rutube.ru/video/1234567890abcdef1234567890abcdef/', 'rutube', '1234567890abcdef1234567890abcdef'],
])('inserts a supported video from %s using Enter', async (url, type, videoID) => {
  const onClose = vi.fn();
  render(createElement(InsertVideoModal, { editor, onClose }));
  const input = screen.getByPlaceholderText('https://');
  fireEvent.change(input, { target: { value: `  ${url}  ` } });
  await act(async () => {
    fireEvent.keyDown(input, { key: 'Enter' });
  });
  expect(onClose).toHaveBeenCalledOnce();
  const content = JSON.stringify(editor.getEditorState().toJSON());
  expect(content).toContain(`"type":"${type}"`);
  expect(content).toContain(`"videoID":"${videoID}"`);
});

it('keeps an unsupported video URL editable and displays the validation error', () => {
  const onClose = vi.fn();
  render(createElement(InsertVideoModal, { editor, onClose }));
  const input = screen.getByPlaceholderText('https://');
  fireEvent.change(input, { target: { value: 'https://example.com/video' } });
  fireEvent.click(screen.getByRole('button', { name: 'Вставить' }));
  expect(screen.getByText('Данный формат видео не поддерживается')).toBeTruthy();
  expect(input).toHaveProperty('value', 'https://example.com/video');
  expect(onClose).not.toHaveBeenCalled();
});
