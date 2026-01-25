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
  const url = `${import.meta.env.VITE_SERVER_LINK}/lessons/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (import.meta.env.DEV) {
    console.info('[Lessons:getEditorStateAsJson] response', {
      url,
      status: res.status,
      ok: res.ok,
    });
  }
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (import.meta.env.DEV) {
    console.info('[Lessons:getEditorStateAsJson] payload', {
      id,
      hasContent: Boolean(data?.content),
      contentLength: typeof data?.content === 'string' ? data.content.length : null,
    });
  }
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
