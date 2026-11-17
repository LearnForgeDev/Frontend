import { useState } from 'react';
import { Alert } from '@mui/material';
import RichEditorCore from '@/Assets/Components/RichEditorCore/RichEditorCore';
import LinkPlugin from '../TextEditorComponents/plugins/LinkPlugin.tsx';
import ImagesPlugin from '../TextEditorComponents/plugins/ImagesPlugin.tsx';
import GraphPlugin from '../TextEditorComponents/plugins/GraphPlugin.tsx';
import YouTubePlugin from '../TextEditorComponents/plugins/YoutubePlugin.tsx';
import RutubePlugin from '../TextEditorComponents/plugins/RutubePlugin.tsx';
import EquationsPlugin from '../TextEditorComponents/plugins/EquationsPlugin.tsx';
import FilesPlugin from '../TextEditorComponents/plugins/FilesPlugin.tsx';
import ToggleIsEditable from '../TextEditorComponents/plugins/ToggleIsEditable.tsx';
import ControlsPlugin from '../TextEditorComponents/plugins/ControlsPlugin.tsx';
import LoadPreviousStatePlugin from '../TextEditorComponents/plugins/LoadPreviousStatePlugin.tsx';
import AutoSavePlugin from '../TextEditorComponents/plugins/AutoSavePlugin.tsx';
import Toolbar from '../TextEditorComponents/ui/Toolbar.tsx';


import type { TextEditorProps } from './TextEditor.type';
import { INITIAL_EDITOR_CONFIG } from './component.const';

export default function TextEditor({
  isEditMode,
  editorState,
  isSaving = false,
  isSaveBlocked = false,
  saveStatus = 'saved',
  onDraft,
  onSave,
}: TextEditorProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  if (hasLoadError) {
    return <Alert severity="error">Не удалось прочитать содержимое статьи. Обратитесь к преподавателю.</Alert>;
  }
  return (
    <RichEditorCore configuration={INITIAL_EDITOR_CONFIG} editable={isEditMode} label="Содержимое статьи" testId="lesson-editor" className="editor-input" autoFocus toolbar={<Toolbar />}>
      <LinkPlugin />
      <ImagesPlugin />
      <GraphPlugin />
      <YouTubePlugin />
      <RutubePlugin />
      <EquationsPlugin />
      <FilesPlugin />
      <ToggleIsEditable isEditable={isEditMode && !isSaving} />
      <LoadPreviousStatePlugin
        editorState={editorState}
        onError={setHasLoadError}
        initializeOnce={isEditMode}
      />
      {isEditMode && onDraft && <AutoSavePlugin onDraft={onDraft} initialDocument={editorState} />}

      {isEditMode && onSave && <ControlsPlugin onSave={onSave} isSaving={isSaving} isSaveBlocked={isSaveBlocked} status={saveStatus} />}
    </RichEditorCore>
  );
}
