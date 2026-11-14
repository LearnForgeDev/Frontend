import type { SerializedDocument } from '@lexical/file';

export interface ControlsPluginProps {
  onSave: (document: SerializedDocument) => Promise<void>;
  isSaving: boolean;
  isSaveBlocked: boolean;
  status: 'saved' | 'draft' | 'error';
}
