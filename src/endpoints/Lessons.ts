import type { SerializedEditor } from 'lexical';
import type { lessonCompactObject, lessonObject } from '@/Services/Lessons/lessonTypes';
import { createApiClient } from '@/Endpoints/factory';
import config from '../config.ts';

const client = createApiClient(config.endpointUrl);

/**
 * Пока нет связи с бэкендом, поэтому эти функции лежат,
 * как пример связи с бэкендом
 * */

export async function sendEditorStateAsJson(
  id: string | number,
  serializedEditor: SerializedEditor,
) {
  return client.post(`/lessons/${id}/editor-state`, serializedEditor);
}

export async function getEditorStateAsJson(
  id: string | number,
): Promise<lessonObject> {
  return client.get<lessonObject>(`/lessons/${id}`).then((res) => res.data);
}

export async function getCompactLessons(): Promise<lessonCompactObject[]> {
  return client.get<lessonCompactObject[]>('/lessons').then((res) => res.data);
}