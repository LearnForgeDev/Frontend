import type { SerializedDocument } from '@lexical/file';
import { normalizeLessonDocument } from '@/Services/Lessons/hooks/useLessonEditor/useLessonEditor.utils';

export function parseLessonContent(content: unknown): SerializedDocument {
  const data: unknown = typeof content === 'string' ? JSON.parse(content) : content;
  const document = normalizeLessonDocument(data);
  if (!document || document.editorState.root.type !== 'root' || !Array.isArray(document.editorState.root.children)) {
    throw new Error('Не удалось прочитать урок');
  }
  return document;
}
