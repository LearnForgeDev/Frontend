import type {SerializedEditor} from "lexical";
import type {lessonCompactObject, lessonObject} from "../types/lessonTypes.ts";

export async function sendEditorStateAsJson(
  id: string | number,
  serializedEditor: SerializedEditor,
) {
  const res = await fetch(`${import.meta.env.VITE_SERVER_LINK}/lessons/${id}/editor-state`, {
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
  const res = await fetch(`${import.meta.env.VITE_SERVER_LINK}/lessons/${id}`, {
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
  const res = await fetch(`${import.meta.env.VITE_SERVER_LINK}/lessons`, {
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