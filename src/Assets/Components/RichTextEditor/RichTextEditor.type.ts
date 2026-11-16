import type { SerializedEditorState } from 'lexical';

export interface RichTextDocument {
  format: 'lexical';
  version: 1;
  state: SerializedEditorState;
}

export interface RichTextEditorProps {
  value: RichTextDocument | null;
  onChange?: (document: RichTextDocument, text: string) => void;
  readOnly?: boolean;
  label: string;
}
