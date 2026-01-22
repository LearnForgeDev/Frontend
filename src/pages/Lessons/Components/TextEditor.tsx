import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";
import LinkPlugin from "./TextEditorComponents/plugins/LinkPlugin.tsx";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import {ListNode, ListItemNode} from "@lexical/list";
import {LinkNode, AutoLinkNode} from "@lexical/link";
import {CodeNode} from "@lexical/code";
import Toolbar from "./TextEditorComponents/ui/Toolbar.tsx";
import lexicalEditorTheme from "./TextEditorComponents/utils/lexicalEditorTheme.ts";
import { ImageNode } from "./TextEditorComponents/nodes/ImageNode.tsx";
import ImagesPlugin from "./TextEditorComponents/plugins/ImagesPlugin.tsx";
import { GraphNode } from "./TextEditorComponents/nodes/graphNode.tsx";
import GraphPlugin from "./TextEditorComponents/plugins/GraphPlugin.tsx";
import { YouTubeNode } from "./TextEditorComponents/nodes/YoutubeNode.tsx";
import YouTubePlugin from "./TextEditorComponents/plugins/YoutubePlugin.tsx";
import { RutubeNode } from './TextEditorComponents/nodes/RutubeNode.tsx';
import RutubePlugin from './TextEditorComponents/plugins/RutubePlugin.tsx';
import EquationsPlugin from './TextEditorComponents/plugins/EquationsPlugin.tsx';

import '../../../styles/pages/Lessons/components/lexicalEditorTheme.css';
import {EquationNode} from "./TextEditorComponents/nodes/EquationNode.tsx";
import ToggleIsEditable from "./TextEditorComponents/plugins/ToggleIsEditable.tsx";
import ControlsPlugin from "./TextEditorComponents/plugins/ControlsPlugin.tsx";
import LoadPreviousStatePlugin from "./TextEditorComponents/plugins/LoadPreviousStatePlugin.tsx";
import type {lessonObject} from "../../../types/lessonTypes.ts";

export default function TextEditor ({
  isEditMode,
  id,
  editorStatePromise
}: {
  isEditMode: boolean,
  id: number | string,
  editorStatePromise: Promise<lessonObject>
}) {
  const initialConfig = {
    namespace: 'PostEditor',
    theme: lexicalEditorTheme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      ImageNode,
      GraphNode,
      YouTubeNode,
      RutubeNode,
      EquationNode,
    ],
    onError: (error: Error) => console.warn(error),
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {isEditMode && <Toolbar/>}

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
      <ToggleIsEditable isEditable={isEditMode} />
      <LoadPreviousStatePlugin editorStatePromise={editorStatePromise} />

      {isEditMode && <ControlsPlugin lessonId={id} />}
    </LexicalComposer>
  )
}
