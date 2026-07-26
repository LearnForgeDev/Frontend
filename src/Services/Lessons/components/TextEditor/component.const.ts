import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import { ImageNode } from '../TextEditorComponents/nodes/ImageNode.tsx';
import { GraphNode } from '../TextEditorComponents/nodes/graphNode.tsx';
import { YouTubeNode } from '../TextEditorComponents/nodes/YoutubeNode.tsx';
import { RutubeNode } from '../TextEditorComponents/nodes/RutubeNode.tsx';
import { EquationNode } from '../TextEditorComponents/nodes/EquationNode.tsx';
import { FileNode } from '../TextEditorComponents/nodes/FileNode.tsx';
import lexicalEditorTheme from '../TextEditorComponents/utils/lexicalEditorTheme.ts';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('component.const');


export const EDITOR_NAMESPACE = 'PostEditor';

export const INITIAL_EDITOR_CONFIG = {
  namespace: EDITOR_NAMESPACE,
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
    FileNode,
  ],
  onError: (error: Error) => logger.logEventForDebug(DebugSeverity.WARNING, 'Log:', error),
};
