import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { calculateContentMd5Base64 } from '../../src/Endpoints/files/md5.utils';
import { apiFileToLesson, isLessonFile } from '../../src/Endpoints/lessons/types';
import { getBreadcrumbPath } from '../../src/Services/Lessons/components/FileManager/utils';
import { parseYoutubeId, sanitizeUrl } from '../../src/Services/Lessons/components/TextEditorComponents/utils/url';
import type { ApiFile } from '../../src/Endpoints/files/types';

const file: ApiFile = {
  publicId: 'file', fileName: 'lesson::%D0%A3%D1%80%D0%BE%D0%BA::lesson-id.lesson::published',
  sizeBytes: 0, uploadedAt: '2026-10-18T12:00:00Z', storageKey: 'key',
};

describe('Уроки и файлы', () => {
  it('восстанавливает название, идентификатор и статус урока', () => {
    expect(isLessonFile(file)).toBe(true);
    expect(isLessonFile({ ...file, fileName: 'document.pdf' })).toBe(false);
    expect(apiFileToLesson(file)).toMatchObject({
      id: 'lesson-id', publicId: 'lesson-id', title: 'Урок', status: 'published', updatedAt: file.uploadedAt,
    });
    expect(apiFileToLesson({ ...file, fileName: 'document.pdf' })).toMatchObject({
      id: 'file', title: 'document.pdf', status: 'draft',
    });
  });

  it.each(['', 'hello', 'Русский текст'])('считает Content-MD5 для загрузки: %j', async (content) => {
    expect(await calculateContentMd5Base64(content)).toBe(createHash('md5').update(content).digest('base64'));
  });

  it('считает одинаковый хеш для строки и бинарного файла', async () => {
    const content = 'Содержимое урока';
    const bytes = Uint8Array.from(Buffer.from(content)).buffer;
    expect(await calculateContentMd5Base64(bytes)).toBe(await calculateContentMd5Base64(content));
  });

  it('строит путь папок и останавливается при цикле', () => {
    const folders = [
      { id: 'root', name: 'Корень', parentId: null },
      { id: 'child', name: 'Папка', parentId: 'root' },
    ];
    expect(getBreadcrumbPath(folders, 'child')).toEqual(folders);
    expect(getBreadcrumbPath(folders, null)).toEqual([]);
    expect(getBreadcrumbPath(folders, 'missing')).toEqual([]);
    expect(getBreadcrumbPath([{ ...folders[0], parentId: 'child' }, folders[1]], 'child')).toHaveLength(2);
  });

  it.each(['javascript:alert(1)', 'data:text/html,hello', 'file:///etc/passwd'])('блокирует опасную ссылку %s', (url) => {
    expect(sanitizeUrl(url)).toBe('about:blank');
  });

  it.each(['https://example.com', 'mailto:test@example.com', 'tel:+79990000000'])('сохраняет ссылку %s', (url) => {
    expect(sanitizeUrl(url)).toBe(url);
  });

  it.each([
    ['https://www.youtube.com/watch?v=video-id', 'video-id'],
    ['https://youtu.be/video-id?t=10', 'video-id'],
    ['https://youtube.com/shorts/video-id?feature=share', 'video-id'],
    ['https://example.com/video', null],
  ])('разбирает встроенное видео %s', (url, id) => {
    expect(parseYoutubeId(url)).toBe(id);
  });
});
