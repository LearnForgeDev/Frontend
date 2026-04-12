import type {SerializedEditor} from "lexical";
import type {lessonCompactObject, lessonObject} from "../types/lessonTypes.ts";
import config from "../config.ts";

/**
 * Пока нет связи с бэкендом, поэтому эти функции лежат,
 * как пример связи с бэкендом
 * */

export async function sendEditorStateAsJson(
  id: string | number,
  serializedEditor: SerializedEditor,
) {
  const res = await fetch(`${config.endpointUrl}/lessons/${id}/editor-state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serializedEditor),
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }
  return res;
}

export async function getEditorStateAsJson(
  id: string | number,
): Promise<lessonObject> {
  const res = await fetch(`${config.endpointUrl}/lessons/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as lessonObject;
}

export async function getCompactLessons(): Promise<lessonCompactObject[]> {
  const res = await fetch(`${config.endpointUrl}/lessons`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as lessonCompactObject[];
}