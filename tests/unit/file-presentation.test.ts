import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import SharedUploadProgress from '@/Assets/Components/FileUploadProgress/FileUploadProgress';
import type { UploadItemProgress } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.type';
import { formatFileSize, getUploadStatusText, isUploadAbortError } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.utils';
import LegacyUploadProgress from '@/Components/FileUploadProgress/FileUploadProgress';
import FileIcon from '@/Services/Schools/FilesPage/components/FileIcon';
import { formatChatMessageTime, isImageFile, parseChatCallInvite, splitChatMessageText } from '@/Services/Chat/components/ChatThreadView/ChatThreadView.utils';
import { formatRelativeTime } from '@/Services/Lessons/components/LessonCard/utils';
import LessonEditorStatus from '@/Services/Lessons/components/LessonEditorStatus/LessonEditorStatus';
import { formatFileDate, formatFileSize as formatStoredFileSize, getFileCategory } from '@/Services/Schools/FilesPage/FilesPage.utils';
import LessonCard from '@/Services/Lessons/components/LessonCard/LessonCard';
import LessonListItem from '@/Services/Lessons/components/LessonListItem/LessonListItem';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const uploading = { id: 'upload', fileName: 'lesson.pdf', sizeBytes: 1536, progress: 25, status: 'uploading' } satisfies UploadItemProgress;

it('describes upload sizes and distinct terminal outcomes without treating failures as complete', () => {
  expect([undefined, 0, 512, 1536, 1048576].map(formatFileSize)).toEqual(['', '', '512 Б', '1.5 КБ', '1.0 МБ']);
  expect(getUploadStatusText(uploading)).toBe('1.5 КБ • 25%');
  expect(getUploadStatusText({ ...uploading, status: 'completed' })).toBe('Загружено');
  expect(getUploadStatusText({ ...uploading, status: 'cancelled' })).toBe('Загрузка отменена');
  expect(getUploadStatusText({ ...uploading, status: 'error' })).toBe('Ошибка загрузки');
  expect(getUploadStatusText({ ...uploading, status: 'error', errorMessage: 'Сохраните копию' })).toBe('Сохраните копию');
  expect(isUploadAbortError(new DOMException('cancelled', 'AbortError'))).toBe(true);
  expect(isUploadAbortError(new DOMException('denied', 'SecurityError'))).toBe(false);
  expect(isUploadAbortError(new Error('AbortError'))).toBe(false);
});

it('offers cancellation only for an active upload and preserves each file outcome', () => {
  const cancel = vi.fn();
  const items: UploadItemProgress[] = [
    uploading,
    { ...uploading, id: 'done', fileName: 'done.pdf', progress: 100, status: 'completed' },
    { ...uploading, id: 'cancelled', fileName: 'cancelled.pdf', status: 'cancelled' },
    { ...uploading, id: 'failed', fileName: 'failed.pdf', status: 'error', errorMessage: 'Нет доступа' },
  ];
  const view = render(createElement(SharedUploadProgress, { items: [], onCancel: cancel }));
  expect(screen.queryByRole('progressbar')).toBeNull();
  view.rerender(createElement(SharedUploadProgress, { items, onCancel: cancel }));
  expect(screen.getAllByRole('progressbar')).toHaveLength(4);
  expect(screen.getByText('Загрузка отменена')).toBeTruthy();
  expect(screen.getByText('Нет доступа')).toBeTruthy();
  expect(screen.getByText('Загружено')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
  expect(cancel).toHaveBeenCalledWith('upload');
  expect(screen.getAllByRole('button')).toHaveLength(1);
});

it('keeps the older upload view informative for unknown, byte, kilobyte and megabyte sizes', () => {
  const view = render(createElement(LegacyUploadProgress, { items: [] }));
  expect(screen.queryByRole('progressbar')).toBeNull();
  view.rerender(createElement(LegacyUploadProgress, { items: [
    { ...uploading, sizeBytes: undefined },
    { ...uploading, id: 'bytes', sizeBytes: 500 },
    { ...uploading, id: 'kilobytes' },
    { ...uploading, id: 'megabytes', sizeBytes: 1048576 },
    { ...uploading, id: 'completed', status: 'completed', progress: 100 },
    { ...uploading, id: 'failed', status: 'error', errorMessage: 'Ошибка сети' },
  ] }));
  expect(screen.getByText('500 B • 25%')).toBeTruthy();
  expect(screen.getByText('1.5 KB • 25%')).toBeTruthy();
  expect(screen.getByText('1.0 MB • 25%')).toBeTruthy();
  expect(screen.getByText('Загружено в S3 облако')).toBeTruthy();
  expect(screen.getByText('Ошибка сети')).toBeTruthy();
  expect(screen.getAllByRole('progressbar')).toHaveLength(6);
});

it.each([
  ['photo.PNG', 'ImageIcon'], ['lesson.pdf', 'PictureAsPdfIcon'], ['notes.txt', 'ArticleIcon'],
  ['lesson.docx', 'ArticleIcon'], ['source.zip', 'FolderZipIcon'], ['voice.mp3', 'AudioFileIcon'],
  ['lesson.mp4', 'VideoFileIcon'], ['unknown.bin', 'InsertDriveFileIcon'],
])('represents %s with its recognizable file-type icon', (filename, icon) => {
  render(createElement(FileIcon, { filename }));
  expect(screen.getByTestId(icon)).toBeTruthy();
});

it('preserves chat text around HTTP links and recognizes complete call invitations', () => {
  expect(splitChatMessageText('До https://example.test/a после http://example.test/b')).toEqual([
    { type: 'text', value: 'До ' }, { type: 'link', value: 'https://example.test/a' },
    { type: 'text', value: ' после ' }, { type: 'link', value: 'http://example.test/b' },
  ]);
  expect(splitChatMessageText('Обычный текст')).toEqual([{ type: 'text', value: 'Обычный текст' }]);
  expect(splitChatMessageText('')).toEqual([]);
  expect(parseChatCallInvite('Приглашение в звонок: Алгебра\nhttps://example.test/call')).toEqual({ title: 'Алгебра', url: 'https://example.test/call' });
  expect(parseChatCallInvite('Создан звонок\nhttps://example.test/call')).toEqual({ title: 'Создан звонок', url: 'https://example.test/call' });
  expect(parseChatCallInvite('Приглашение в звонок: Алгебра')).toBeNull();
  expect(parseChatCallInvite('Обычный текст https://example.test/call')).toBeNull();
});

it('does not invent dates or image previews for invalid attachment metadata', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 14, 12));
  expect(formatChatMessageTime('')).toBe('');
  expect(formatChatMessageTime('not-a-date')).toBe('');
  const current = formatChatMessageTime(new Date(2026, 10, 14, 10, 30).toISOString());
  const previous = formatChatMessageTime(new Date(2026, 10, 13, 10, 30).toISOString());
  expect(current).toContain('10:30');
  expect(previous).toContain('10:30');
  expect(previous.length).toBeGreaterThan(current.length);
  expect(isImageFile()).toBe(false);
  expect(isImageFile('PHOTO.JPEG')).toBe(true);
  expect(isImageFile('notes.pdf')).toBe(false);
});

it('keeps lesson timestamps meaningful at minute, hour, day and invalid boundaries', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-14T12:00:00Z'));
  const ago = (milliseconds: number) => new Date(Date.now() - milliseconds).toISOString();
  expect(formatRelativeTime('')).toBe('');
  expect(formatRelativeTime('invalid')).toBe('');
  expect(formatRelativeTime(ago(30000))).toBe('just now');
  expect(formatRelativeTime(ago(5 * 60000))).toBe('5 min. ago');
  expect(formatRelativeTime(ago(3 * 3600000))).toBe('3 hr. ago');
  expect(formatRelativeTime(ago(86400000))).toBe('yesterday');
  expect(formatRelativeTime(ago(3 * 86400000))).toBe('3 days ago');
  expect(formatRelativeTime(ago(8 * 86400000))).toBe(new Date(ago(8 * 86400000)).toLocaleDateString());
});

it('offers retry only for a failed lesson and disables duplicate retry while pending', () => {
  const retry = vi.fn().mockResolvedValue(undefined);
  const view = render(createElement(LessonEditorStatus, { isLoading: true, isError: false, isRetrying: false, retry }));
  expect(screen.getByRole('status').textContent).toContain('Загрузка урока');
  expect(screen.queryByRole('button')).toBeNull();
  view.rerender(createElement(LessonEditorStatus, { isLoading: false, isError: false, isRetrying: false, retry }));
  expect(screen.getByText('Содержимое урока пока недоступно.')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
  view.rerender(createElement(LessonEditorStatus, { isLoading: false, isError: true, isRetrying: false, retry }));
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  expect(retry).toHaveBeenCalledOnce();
  view.rerender(createElement(LessonEditorStatus, { isLoading: false, isError: true, isRetrying: true, retry }));
  expect(screen.getByRole('button', { name: 'Повторить' })).toHaveProperty('disabled', true);
});

it('formats stored file metadata and groups documents without case-sensitive extensions', () => {
  expect(getFileCategory('LESSON.PDF')).toBe('pdf');
  expect(getFileCategory('notes')).toBe('other');
  expect([0, 512, 1536, 1048576].map(formatStoredFileSize)).toEqual(['0 Б', '512 Б', '1.5 КБ', '1 МБ']);
  const timestamp = '2026-11-14T10:00:00Z';
  expect(formatFileDate(timestamp)).toBe(new Date(timestamp).toLocaleDateString('ru'));
});

it('opens a lesson card from the keyboard and routes its management menu without selecting it', () => {
  const actions = { onClick: vi.fn(), onOpen: vi.fn(), onRename: vi.fn(), onMove: vi.fn(), onDelete: vi.fn() };
  render(createElement(LessonCard, { ...actions, lesson: { id: 'lesson', publicId: 'lesson', title: 'Алгебра' }, selected: true, canManage: true }));
  const card = screen.getByRole('button', { name: 'Урок: Алгебра' });
  fireEvent.keyDown(card, { key: ' ' });
  expect(actions.onOpen).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Опции урока' }));
  expect(actions.onClick).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('menuitem', { name: 'Переименовать' }));
  expect(actions.onRename).toHaveBeenCalledOnce();
  fireEvent.contextMenu(card);
  fireEvent.click(screen.getByRole('menuitem', { name: 'Удалить' }));
  expect(actions.onDelete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTestId('lesson-delete-confirm'));
  expect(actions.onDelete).toHaveBeenCalledOnce();
});

it('preserves keyboard and context actions for published lessons in list view', () => {
  const actions = { onClick: vi.fn(), onOpen: vi.fn(), onRename: vi.fn(), onMove: vi.fn(), onDelete: vi.fn() };
  render(createElement(LessonListItem, { ...actions, lesson: { id: 'lesson', publicId: 'lesson', title: 'Алгебра', status: 'published', updatedAt: '2026-11-14T10:00:00Z' }, selected: true }));
  const row = screen.getByRole('button', { name: 'Урок: Алгебра, статус: published' });
  expect(screen.getByText('Опубликован')).toBeTruthy();
  fireEvent.keyDown(row, { key: 'Enter' });
  expect(actions.onOpen).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Опции урока' }));
  expect(actions.onClick).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('menuitem', { name: 'Переместить' }));
  expect(actions.onMove).toHaveBeenCalledOnce();
  fireEvent.contextMenu(row);
  fireEvent.click(screen.getByRole('menuitem', { name: 'Переименовать' }));
  expect(actions.onRename).toHaveBeenCalledOnce();
});
