import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
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

import './lexicalEditorTheme.css';

import type { TextEditorProps } from './component.types';
import { INITIAL_EDITOR_CONFIG } from './component.const';

export default function TextEditor({
  isEditMode,
  id,
  editorState,
}: TextEditorProps) {
  return (
    <LexicalComposer initialConfig={INITIAL_EDITOR_CONFIG}>
      {isEditMode && <Toolbar />}

      <RichTextPlugin
        contentEditable={<ContentEditable className="editor-input" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <AutoFocusPlugin />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ImagesPlugin />
      <GraphPlugin />
      <YouTubePlugin />
      <RutubePlugin />
      <EquationsPlugin />
      <FilesPlugin />
      <ToggleIsEditable isEditable={isEditMode} />
      <LoadPreviousStatePlugin
        editorState={editorState}
      />
      <AutoSavePlugin lessonId={id} />

      {isEditMode && <ControlsPlugin lessonId={id} />}
    </LexicalComposer>
  );
}
