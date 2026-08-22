import type { SerializedDocument } from '@lexical/file';

export interface TextEditorProps {
  isEditMode: boolean;
  id: number | string;
  editorState?: SerializedDocument;
}
