import { Button, Typography } from '@mui/material';
import { serializedDocumentFromEditorState, type SerializedDocument } from '@lexical/file';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ClipLoader } from 'react-spinners';
import './Controls.css';

interface ControlsPluginProps {
  onSave: (document: SerializedDocument) => Promise<void>;
  isSaving: boolean;
  status: 'saved' | 'draft' | 'error';
}

export default function ControlsPlugin({ onSave, isSaving, status }: ControlsPluginProps) {
  const [editor] = useLexicalComposerContext();
  return <div className="lesson-id-page-controls">
    <Typography role={status === 'error' ? 'alert' : 'status'} color={status === 'error' ? 'error' : 'text.secondary'}>
      {isSaving ? 'Сохраняем на сервере…' : status === 'error' ? 'Не удалось сохранить. Черновик остаётся в редакторе.' : status === 'draft' ? 'Есть несохранённые изменения' : 'Сохранено на сервере'}
    </Typography>
    <Button variant="contained" onClick={() => void onSave(serializedDocumentFromEditorState(editor.getEditorState()))} disabled={isSaving} startIcon={isSaving ? <ClipLoader size={16} color="currentColor" /> : undefined}>
      {status === 'error' ? 'Повторить сохранение' : 'Сохранить'}
    </Button>
  </div>;
}
