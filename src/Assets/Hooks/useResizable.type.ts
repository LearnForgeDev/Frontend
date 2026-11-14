import type { RefObject } from 'react';
import type { LexicalCommand, NodeKey } from 'lexical';

export interface UseResizableOptions {
  nodeKey: NodeKey;
  width?: number;
  height?: number;
  elementRef: RefObject<HTMLElement | null>;
  resizeCommand: LexicalCommand<{
    nodeKey: NodeKey;
    width: number;
    height: number;
  }>;
  maintainAspectRatio?: boolean;
  minWidth?: number;
  minHeight?: number;
}
