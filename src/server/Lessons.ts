import type {SerializedEditor} from "lexical";

export async function sendEditorStateAsJson(
  serializedEditor: SerializedEditor,
) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  if (serializedEditor) {
    console.log(serializedEditor)
    return true;
  }

  // const res = await fetch('example.com', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     // Add auth header if needed:
  //     // 'Authorization': `Bearer ${token}`,
  //   },
  //   credentials: 'same-origin', // or 'include' if you rely on cookies
  //   body: JSON.stringify(serializedEditor),
  // });
  // if (!res.ok) {
  //   throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  // }
  // return res;
}