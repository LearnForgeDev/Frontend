import type { SerializedDocument } from '@lexical/file';

export interface TextEditorProps {
  isEditMode: boolean;
  id: number | string;
  editorState?: SerializedDocument;
  isSaving?: boolean;
  saveStatus?: 'saved' | 'draft' | 'error';
  onDraft?: (document: SerializedDocument) => void;
  onSave?: (document: SerializedDocument) => Promise<void>;
}
