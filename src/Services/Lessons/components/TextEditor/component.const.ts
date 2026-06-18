import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import { ImageNode } from '../TextEditorComponents/nodes/ImageNode.tsx';
import { GraphNode } from '../TextEditorComponents/nodes/graphNode.tsx';
import { YouTubeNode } from '../TextEditorComponents/nodes/YoutubeNode.tsx';
import { RutubeNode } from '../TextEditorComponents/nodes/RutubeNode.tsx';
import { EquationNode } from '../TextEditorComponents/nodes/EquationNode.tsx';
import lexicalEditorTheme from '../TextEditorComponents/utils/lexicalEditorTheme.ts';

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
  ],
  onError: (error: Error) => console.warn(error),
};
