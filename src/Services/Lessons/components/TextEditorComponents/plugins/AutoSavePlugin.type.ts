import type { SerializedDocument } from '@lexical/file';

export interface AutoSavePluginProps {
  onDraft: (document: SerializedDocument) => void;
  initialDocument?: SerializedDocument;
}
