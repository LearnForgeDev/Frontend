import type { Page } from '@playwright/test';
import { expect } from './fixtures';
import { SCHOOL_ID } from './core.const';
import { INITIAL_LESSON_CONTENT } from './lesson-editor.const';

export function createLessonDocument(text = INITIAL_LESSON_CONTENT) {
  return {
    editorState: {
    root: {
      children: [{ children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'paragraph', version: 1 }],
      direction: null, format: '', indent: 0, type: 'root', version: 1,
    },
    },
    lastSaved: Date.now(), source: 'LearnForge', version: '1',
  };
}

export async function createEditableLesson(page: Page, allowedUserPublicIds?: string[]) {
  const document = createLessonDocument().editorState;
  const fileResponse = await page.request.post(`/api/ApiFiles/${SCHOOL_ID}`, {
    multipart: {
      File: { name: 'lesson-editor.lesson', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(document)) },
      FileName: 'lesson-editor.lesson',
      BucketType: 'lessons',
    },
  });
  expect(fileResponse.ok(), await fileResponse.text()).toBe(true);
  const file = await fileResponse.json();
  const lessonResponse = await page.request.post(`/api/ApiLessons/${SCHOOL_ID}`, {
    data: { title: `Урок проверки ${Date.now()}`, description: '', lessonJsonFilePublicId: file.publicId, allowedUserPublicIds },
  });
  expect(lessonResponse.ok(), await lessonResponse.text()).toBe(true);
  return lessonResponse.json();
}
